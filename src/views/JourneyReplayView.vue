<template>
  <div class="journey-replay-view" ref="containerRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">저축 여정을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button class="back-btn" @click="goBack">← 컬렉션으로 돌아가기</button>
    </div>

    <!-- Journey Content -->
    <template v-else-if="normalizedJourney">
      <!-- Fixed Header -->
      <header class="journey-header">
        <button class="back-btn" @click="goBack" aria-label="뒤로 가기">
          ← 
        </button>
        <h1 class="journey-title">{{ journeyCollection.propertyName }}</h1>
        <span class="journey-subtitle">{{ journeyCollection.location }}</span>
      </header>

      <!-- Main Content: House Image (80% of viewport) -->
      <main class="journey-main">
        <!-- House Image Container -->
        <div class="house-image-container">
          <div
            v-if="isInteriorPhase"
            ref="interiorStackRef"
            class="interior-image-stack"
            aria-label="인테리어 단계 이미지"
          >
            <img
              v-if="interiorTransitionOverlayUrl"
              ref="interiorOverlayRef"
              :src="interiorTransitionOverlayUrl"
              class="interior-transition-overlay"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
            <img
              v-if="interiorBackgroundLayer"
              :src="interiorBackgroundLayer.url"
              class="interior-layer interior-layer--base"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
            <img
              v-for="layer in interiorOverlayLayers"
              :key="layer.id"
              :src="layer.url"
              class="interior-layer"
              :class="interiorVisibleLayerIds.has(layer.id) ? 'layer-visible' : 'layer-hidden'"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>
          <div v-else class="exterior-image-stack" aria-label="집 단계 이미지">
            <img
              v-if="houseIncomingUrl"
              ref="houseIncomingImgRef"
              :src="houseIncomingUrl"
              :alt="`Phase ${currentPhase} - ${currentPhaseName}`"
              class="house-image house-image--base"
              draggable="false"
              @error="handleImageError"
            />
            <img
              v-if="houseOutgoingUrl"
              ref="houseOutgoingImgRef"
              :src="houseOutgoingUrl"
              class="house-image house-image--overlay"
              alt=""
              aria-hidden="true"
              draggable="false"
              @error="handleImageError"
            />
          </div>
          <div
            v-if="interiorExitOverlayActive"
            ref="interiorExitOverlayRef"
            class="interior-exit-overlay"
            aria-hidden="true"
          >
            <img
              v-if="interiorExitBackgroundLayer"
              :src="interiorExitBackgroundLayer.url"
              class="interior-layer interior-layer--base"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
            <img
              v-for="layer in interiorExitOverlayLayers"
              :key="layer.id"
              :src="layer.url"
              class="interior-layer layer-visible"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>
          <!-- Phase Badge -->
          <div class="phase-badge">
            <span class="phase-number">{{ currentPhase }}/{{ totalPhases }}</span>
            <span class="phase-name">{{ currentPhaseName }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="journey-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
          <div class="progress-dots">
            <span 
              v-for="phase in totalPhases" 
              :key="phase"
              class="dot"
              :class="{
                active: phase <= currentPhase && (!isInProgress || phase <= maxUnlockedPhase),
                current: phase === currentPhase,
                locked: isInProgress && phase > maxUnlockedPhase
              }"
            ></span>
          </div>
        </div>

        <!-- Scroll Indicator (only if not at end) -->
        <div v-if="showScrollHint" class="scroll-indicator">
          <span>아래로 스크롤하여 여정 진행</span>
          <div class="scroll-arrow">↓</div>
        </div>
        <div v-else-if="showLockedHint" class="scroll-indicator locked-indicator">
          <span>🔒 아직 잠겨 있어요 · 저축을 더 하면 다음 단계가 열려요</span>
        </div>
      </main>

      <!-- Bottom Sheet -->
      <aside class="bottom-sheet" :class="{ expanded: isSheetExpanded }">
        <div class="sheet-handle" @click="toggleSheet">
          <div class="sheet-hint">
            <AppIcon 
              name="caretUp" 
              :size="24" 
              weight="bold" 
              :color="brandAccent"
              class="sheet-chevron"
              :class="{ flipped: isSheetExpanded }"
            />
            <span class="hint-text">{{ isSheetExpanded ? '닫기' : '저축 여정 상세보기' }}</span>
          </div>
        </div>

        <div class="sheet-content">
          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-card">
              <span class="summary-label">시작일</span>
              <span class="summary-value">{{ formatDate(journeySummary.startDate) }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">완료일</span>
              <span class="summary-value">{{ formatDate(journeySummary.completedDate) }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">소요 기간</span>
              <span class="summary-value">{{ journeySummary.totalDays }}일</span>
            </div>
            <div class="summary-card highlight">
              <span class="summary-label">총 저축</span>
              <span class="summary-value">{{ formatMoney(journeySummary.targetAmount) }}</span>
            </div>
          </div>

          <!-- Current Phase Details -->
          <div v-if="currentPhaseData" class="phase-details">
            <h3 class="phase-title">{{ currentPhaseName }} - 저축 기록</h3>
            <p class="phase-cumulative">
              누적 저축: <strong>{{ formatMoney(currentPhaseData.cumulativeAmount) }}</strong>
            </p>

            <!-- Events List -->
            <ul v-if="currentPhaseData.events?.length" class="events-list">
              <li v-for="event in currentPhaseData.events" :key="event.eventId" class="event-item">
                <span class="event-type" :class="event.eventType.toLowerCase()">
                  {{ event.eventType === 'DEPOSIT' ? '💰' : '📤' }}
                </span>
                <div class="event-details">
                  <span class="event-amount">{{ formatMoney(event.amount) }}</span>
                  <span v-if="event.memo" class="event-memo">{{ event.memo }}</span>
                </div>
                <span class="event-date">{{ formatShortDate(event.date) }}</span>
              </li>
            </ul>
            <p v-else class="no-events">이 단계에는 저축 기록이 없어요</p>
          </div>
        </div>
      </aside>

      <!-- Completion Celebration (when at 100%) -->
      <div v-if="isJourneyCompleted && currentPhase === totalPhases" class="completion-overlay">
        <div class="confetti-container"></div>
        <div class="completion-card">
          <h2 class="completion-title">🎉 축하해요!</h2>
          <p class="completion-message">
            {{ journeySummary.totalDays }}일간의 여정을 완주했어요!
          </p>
          <p class="completion-amount">
            총 {{ formatMoney(journeySummary.targetAmount) }} 저축 완료
          </p>
          <button class="share-btn" @click="shareJourney">📤 공유하기</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCollectionStore } from '@/stores/collectionStore'
import { BRAND_ACCENT } from '@/constants/colors'
import {
  getExteriorStageUrl,
  getInteriorLayerUrls,
  getInteriorVisibleLayerIds,
  SHOWROOM_TOTAL_STAGES
} from '@/constants/showroomWebp'
import gsap from 'gsap'
import AppIcon from '@/components/common/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const collectionStore = useCollectionStore()
const containerRef = ref(null)

// State
const isLoading = ref(true)
const error = ref(null)
const journeyData = ref(null)
const currentPhase = ref(1)
const isSheetExpanded = ref(false)
const houseIncomingUrl = ref('')
const houseOutgoingUrl = ref('')
const houseIncomingImgRef = ref(null)
const houseOutgoingImgRef = ref(null)
const interiorStackRef = ref(null)
const interiorOverlayRef = ref(null)
const interiorTransitionOverlayUrl = ref('')
const interiorExitOverlayRef = ref(null)
const interiorExitOverlayActive = ref(false)
const interiorExitVisibleLayerIds = ref([])
const lastInteriorStage = ref(1)

// Constants
const HOUSE_STAGE_COUNT = SHOWROOM_TOTAL_STAGES.house
const FURNITURE_STAGE_COUNT = SHOWROOM_TOTAL_STAGES.furniture
const totalPhases = HOUSE_STAGE_COUNT + FURNITURE_STAGE_COUNT
const brandAccent = BRAND_ACCENT

// Computed
// mode=active 쿼리 파라미터로 진행 중 여부 판단 (라우팅 단일화)
const isInProgress = computed(() => {
  return route.query.mode === 'active' || route.meta?.isInProgress === true
})

const toPhaseNumber = (value) => {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    const normalized = Math.trunc(numeric)
    if (normalized < 1) return 1
    return Math.min(totalPhases, normalized)
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+/)
    if (match) {
      const parsed = Number(match[0])
      if (Number.isFinite(parsed)) {
        const normalized = Math.trunc(parsed)
        if (normalized < 1) return 1
        return Math.min(totalPhases, normalized)
      }
    }
  }
  return null
}

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return numeric
}

const normalizedJourney = computed(() => {
  const data = journeyData.value
  if (!data) return null

  const collection = data.collection ?? {}
  const summary = data.summary ?? {}

  const themeCode = String(
    collection.themeCode ?? data.themeCode ?? collection.theme ?? data.theme ?? 'CLASSIC'
  ).toUpperCase()

  const propertyName = collection.propertyName
    ?? collection.houseName
    ?? collection.name
    ?? data.propertyName
    ?? data.houseName
    ?? '드림홈'

  const location = collection.location ?? data.location ?? ''

  const phases = Array.isArray(data.phases) ? data.phases : []
  const normalizedPhases = phases.map((phase, index) => {
    const phaseNumber = toPhaseNumber(
      phase.phaseNumber ?? phase.phase ?? phase.stageNumber ?? phase.stage ?? index + 1
    ) ?? Math.min(totalPhases, index + 1)

    const rawEvents = Array.isArray(phase.events) ? phase.events : []
    const normalizedEvents = rawEvents.map((event) => {
      const eventType = String(event.eventType ?? event.type ?? 'DEPOSIT').toUpperCase()
      return {
        ...event,
        eventType,
        amount: toNumber(event.amount ?? event.value ?? 0),
        date: event.date ?? event.createdAt ?? event.recordedAt ?? null,
        memo: event.memo ?? event.note ?? ''
      }
    })

    return {
      ...phase,
      phaseNumber,
      phaseName: phase.phaseName ?? phase.name ?? `Phase ${phaseNumber}`,
      reachedAt: phase.reachedAt ?? phase.reachedDate ?? phase.completedAt ?? phase.date ?? null,
      cumulativeAmount: toNumber(phase.cumulativeAmount ?? phase.savedAmount ?? phase.amount ?? 0),
      events: normalizedEvents
    }
  })

  const summaryData = {
    startDate: summary.startDate ?? summary.startedAt ?? summary.start ?? null,
    completedDate: summary.completedDate ?? summary.completedAt ?? summary.completed ?? null,
    totalDays: toNumber(summary.totalDays ?? summary.durationDays ?? summary.days ?? 0),
    targetAmount: toNumber(summary.targetAmount ?? summary.totalSaved ?? summary.totalAmount ?? summary.savedAmount ?? 0)
  }

  const maxUnlockedPhase = toPhaseNumber(
    data.maxUnlockedPhase
    ?? summary.maxUnlockedPhase
    ?? data.currentPhase
    ?? summary.currentPhase
    ?? data.currentStep
    ?? summary.currentStep
    ?? collection.currentPhase
    ?? collection.currentStage
    ?? collection.currentStep
    ?? data.currentStage
    ?? summary.currentStage
    ?? collection.stage
    ?? data.stage
    ?? summary.stage
    ?? null
  )

  return {
    collection: {
      propertyName,
      location,
      themeCode: themeCode || 'CLASSIC'
    },
    summary: summaryData,
    phases: normalizedPhases,
    maxUnlockedPhase
  }
})

const journeyCollection = computed(() => {
  return normalizedJourney.value?.collection ?? {
    propertyName: '드림홈',
    location: '',
    themeCode: 'CLASSIC'
  }
})

const journeySummary = computed(() => {
  return normalizedJourney.value?.summary ?? {
    startDate: null,
    completedDate: null,
    totalDays: 0,
    targetAmount: 0
  }
})

const journeyPhases = computed(() => normalizedJourney.value?.phases ?? [])

const isPhaseUnlocked = (phase) => {
  if (!phase) return false
  if (phase.reachedAt) return true
  if (Array.isArray(phase.events) && phase.events.length > 0) return true
  if (Number.isFinite(phase.cumulativeAmount) && phase.cumulativeAmount > 0) return true
  if (phase.isUnlocked || phase.unlocked || phase.isReached || phase.isCompleted) return true
  if (phase.status) {
    const status = String(phase.status).toUpperCase()
    if (['UNLOCKED', 'REACHED', 'COMPLETED', 'DONE', 'ACTIVE', 'CURRENT'].includes(status)) {
      return true
    }
  }
  return false
}

const maxUnlockedPhase = computed(() => {
  const explicit = normalizedJourney.value?.maxUnlockedPhase
  if (Number.isInteger(explicit)) {
    return Math.min(totalPhases, Math.max(1, explicit))
  }

  const reached = journeyPhases.value
    .filter(isPhaseUnlocked)
    .map(phase => phase.phaseNumber)
    .filter(number => Number.isInteger(number))

  if (reached.length > 0) {
    return Math.min(totalPhases, Math.max(...reached))
  }

  const phaseNumbers = journeyPhases.value
    .map(phase => phase?.phaseNumber)
    .filter(number => Number.isInteger(number))

  if (phaseNumbers.length > 0) {
    return Math.min(totalPhases, Math.max(...phaseNumbers))
  }

  return 1
})

const scrollPhases = computed(() => totalPhases)

const isJourneyCompleted = computed(() => {
  return Boolean(journeySummary.value?.completedDate)
})

const currentPhaseData = computed(() => {
  if (!journeyPhases.value.length) return null
  return journeyPhases.value.find(phase => phase.phaseNumber === currentPhase.value) || null
})

const currentPhaseName = computed(() => {
  return currentPhaseData.value?.phaseName || `Phase ${currentPhase.value}`
})

const currentPhaseImage = computed(() => {
  const themeCode = journeyCollection.value.themeCode || 'CLASSIC'
  // Exterior images only (interior stages handled separately)
  const stageNum = Math.min(currentPhase.value, HOUSE_STAGE_COUNT)
  return getExteriorStageUrl(themeCode, stageNum)
})

const isInteriorPhase = computed(() => currentPhase.value > HOUSE_STAGE_COUNT)
const interiorStage = computed(() => {
  if (!isInteriorPhase.value) return 1
  return Math.min(
    FURNITURE_STAGE_COUNT,
    Math.max(1, currentPhase.value - HOUSE_STAGE_COUNT)
  )
})

const interiorLayers = computed(() => getInteriorLayerUrls(journeyCollection.value.themeCode || 'CLASSIC'))
const interiorLayerIds = computed(() => interiorLayers.value.map(layer => layer.id))
const interiorVisibleLayerIds = computed(() => {
  if (!isInteriorPhase.value) return new Set()
  return getInteriorVisibleLayerIds(interiorLayerIds.value, interiorStage.value)
})
const interiorBackgroundLayer = computed(() => (
  interiorLayers.value.find(layer => layer.id === 'background') || null
))
const interiorOverlayLayers = computed(() => (
  interiorLayers.value.filter(layer => layer.id !== 'background')
))
const interiorExitBackgroundLayer = computed(() => {
  if (!interiorExitOverlayActive.value) return null
  return interiorLayers.value.find(layer => layer.id === 'background') || null
})
const interiorExitOverlayLayers = computed(() => {
  if (!interiorExitOverlayActive.value) return []
  const visible = new Set(interiorExitVisibleLayerIds.value)
  return interiorLayers.value.filter(layer => layer.id !== 'background' && visible.has(layer.id))
})

const HOUSE_STAGE_TRANSITION = {
  outgoingDuration: 0.32,
  incomingDuration: 0.45,
  incomingDelay: 0,
  settleDelay: 0
}

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

const transitionExteriorImage = async (nextUrl, { isInitial = false } = {}) => {
  if (!nextUrl) return

  try {
    await preloadImage(nextUrl)
  } catch (error) {
    console.error(error)
    return
  }

  if (isInitial || !houseIncomingUrl.value) {
    houseOutgoingUrl.value = ''
    houseIncomingUrl.value = nextUrl
    await nextTick()
    return
  }

  if (houseIncomingUrl.value === nextUrl) return

  if (prefersReducedMotion()) {
    houseOutgoingUrl.value = ''
    houseIncomingUrl.value = nextUrl
    await nextTick()
    return
  }

  const prevUrl = houseIncomingUrl.value
  houseOutgoingUrl.value = prevUrl
  houseIncomingUrl.value = nextUrl

  await nextTick()
  const outgoingEl = houseOutgoingImgRef.value
  const incomingEl = houseIncomingImgRef.value

  gsap.killTweensOf([outgoingEl, incomingEl])
  if (incomingEl) gsap.set(incomingEl, { opacity: 0, scale: 0.985 })

  const tl = gsap.timeline({
    onComplete: () => {
      houseOutgoingUrl.value = ''
    }
  })

  if (outgoingEl) {
    tl.to(outgoingEl, {
      duration: HOUSE_STAGE_TRANSITION.outgoingDuration,
      opacity: 0,
      scale: 1,
      ease: 'power2.inOut',
      clearProps: 'transform'
    }, 0)
  }

  if (incomingEl) {
    tl.to(incomingEl, {
      duration: HOUSE_STAGE_TRANSITION.incomingDuration,
      opacity: 1,
      scale: 1,
      ease: 'power2.out',
      clearProps: 'transform'
    }, HOUSE_STAGE_TRANSITION.incomingDelay)
  }

  tl.to({}, { duration: HOUSE_STAGE_TRANSITION.settleDelay })
}

const transitionInteriorHandoff = async () => {
  if (prefersReducedMotion()) {
    interiorTransitionOverlayUrl.value = ''
    return
  }

  const overlayUrl = currentPhaseImage.value
  if (!overlayUrl) return

  interiorTransitionOverlayUrl.value = overlayUrl
  await nextTick()

  const stackEl = interiorStackRef.value
  const overlayEl = interiorOverlayRef.value

  if (!stackEl || !overlayEl) return

  gsap.killTweensOf([stackEl, overlayEl])
  gsap.set(stackEl, { opacity: 0 })
  gsap.set(overlayEl, { opacity: 1 })

  gsap.to(stackEl, {
    duration: 0.45,
    opacity: 1,
    ease: 'power2.out',
    clearProps: 'opacity'
  })

  gsap.to(overlayEl, {
    duration: 0.45,
    opacity: 0,
    ease: 'power2.out',
    onComplete: () => {
      interiorTransitionOverlayUrl.value = ''
    }
  })
}

const transitionInteriorExit = async () => {
  if (prefersReducedMotion()) {
    interiorExitOverlayActive.value = false
    return
  }

  const visibleIds = Array.from(
    getInteriorVisibleLayerIds(interiorLayerIds.value, lastInteriorStage.value)
  )
  if (!visibleIds.length) return

  interiorExitVisibleLayerIds.value = visibleIds
  interiorExitOverlayActive.value = true
  await nextTick()

  const overlayEl = interiorExitOverlayRef.value
  if (!overlayEl) return

  gsap.killTweensOf(overlayEl)
  gsap.set(overlayEl, { opacity: 1 })

  gsap.to(overlayEl, {
    duration: 0.45,
    opacity: 0,
    ease: 'power2.out',
    onComplete: () => {
      interiorExitOverlayActive.value = false
    }
  })
}

/**
 * 이미지 로드 실패 시 fallback
 */
function handleImageError(event) {
  event.target.src = getExteriorStageUrl('CLASSIC', 1)
}

const progressPercent = computed(() => {
  return ((currentPhase.value - 1) / (totalPhases - 1)) * 100
})

const isLockedPhase = computed(() => {
  if (!isInProgress.value) return false
  if (maxUnlockedPhase.value >= totalPhases) return false
  return currentPhase.value > maxUnlockedPhase.value
})

const showScrollHint = computed(() => {
  if (scrollPhases.value <= 1) return false
  if (currentPhase.value >= totalPhases) return false
  return !isLockedPhase.value
})

const showLockedHint = computed(() => {
  if (scrollPhases.value <= 1) return false
  return isLockedPhase.value
})

// Methods
const fetchJourney = async () => {
  const inProgressMode = isInProgress.value
  const collectionId = route.params.id

  // 진행 중 모드가 아닌데 collectionId도 없으면 에러
  if (!inProgressMode && !collectionId) {
    error.value = '잘못된 접근입니다'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null
    if (inProgressMode) {
      // 진행 중인 드림홈 여정 조회
      journeyData.value = await collectionStore.fetchInProgressJourney()
    } else {
      // 완성된 컬렉션 여정 조회
      journeyData.value = await collectionStore.fetchJourney(collectionId)
    }
    
    // 🔍 디버그 로깅
    console.log('[JourneyReplay] API Response:', journeyData.value)
    console.log('[JourneyReplay] phases:', journeyData.value?.phases)
    console.log('[JourneyReplay] maxUnlockedPhase from API:', journeyData.value?.maxUnlockedPhase)
    
    currentPhase.value = 1
  } catch (err) {
    console.error('여정 조회 실패:', err)
    error.value = err.response?.data?.message || '여정 데이터를 불러올 수 없습니다'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/collection')
}

const toggleSheet = () => {
  isSheetExpanded.value = !isSheetExpanded.value
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const formatShortDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatMoney = (amount) => {
  const numeric = toNumber(amount, 0)
  if (numeric <= 0) return '0원'
  if (numeric >= 100000000) {
    return `${(numeric / 100000000).toFixed(1)}억`
  }
  if (numeric >= 10000) {
    return `${Math.round(numeric / 10000).toLocaleString()}만원`
  }
  return `${numeric.toLocaleString()}원`
}

const shareJourney = async () => {
  try {
    const totalDays = journeySummary.value?.totalDays ?? 0
    const targetAmount = journeySummary.value?.targetAmount ?? 0
    if (navigator.share) {
      await navigator.share({
        title: isJourneyCompleted.value
          ? `${journeyCollection.value.propertyName} 저축 완료!`
          : `${journeyCollection.value.propertyName} 저축 여정`,
        text: isJourneyCompleted.value
          ? `${totalDays}일간 ${formatMoney(targetAmount)} 저축 완료!`
          : `${totalDays}일째 저축 여정 진행 중`,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  } catch (err) {
    console.log('공유 취소됨')
  }
}

// Scroll-based Phase Transition
let scrollHandler = null

const teardownScrollEffect = () => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
  document.body.style.height = ''
  document.documentElement.style.height = ''
}

const setupScrollListener = () => {
  if (!containerRef.value) return

  scrollHandler = () => {
    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight
    const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)

    // Calculate progress (0 to 1)
    const maxScroll = docHeight - windowHeight
    const scrollProgress = maxScroll <= 0 ? 0 : Math.min(1, scrollTop / maxScroll)
    
    // Map to phase (1 to 11)
    const phaseCount = Math.max(1, scrollPhases.value)
    const newPhase = Math.floor(scrollProgress * (phaseCount - 1)) + 1
    const clampedPhase = Math.max(1, Math.min(phaseCount, newPhase))
    
    if (clampedPhase !== currentPhase.value) {
      currentPhase.value = clampedPhase
    }
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
}

// Lifecycle
onMounted(() => {
  watch(
    () => route.fullPath,
    () => {
      teardownScrollEffect()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      fetchJourney()
    },
    { immediate: true }
  )

  watch(
    () => [currentPhaseImage.value, isInteriorPhase.value, normalizedJourney.value],
    async ([newUrl, interior, journey]) => {
      if (!journey || interior) return
      await transitionExteriorImage(newUrl, { isInitial: !houseIncomingUrl.value })
    },
    { immediate: true }
  )

  watch(
    () => interiorStage.value,
    (stage) => {
      if (isInteriorPhase.value) {
        lastInteriorStage.value = stage
      }
    }
  )

  watch(
    () => isInteriorPhase.value,
    async (interior, wasInterior) => {
      if (interior && !wasInterior) {
        await transitionInteriorHandoff()
      } else if (!interior && wasInterior) {
        interiorTransitionOverlayUrl.value = ''
        gsap.killTweensOf([interiorStackRef.value, interiorOverlayRef.value])
        await transitionInteriorExit()
      }
    }
  )

  watch([normalizedJourney, scrollPhases], ([newJourney]) => {
    if (!newJourney) return

    teardownScrollEffect()
    document.body.style.height = `${Math.max(1, scrollPhases.value) * 100}vh`
    document.documentElement.style.height = document.body.style.height
    setupScrollListener()
  })
})

onUnmounted(() => {
  teardownScrollEffect()
  gsap.killTweensOf([
    houseIncomingImgRef.value,
    houseOutgoingImgRef.value,
    interiorStackRef.value,
    interiorOverlayRef.value,
    interiorExitOverlayRef.value
  ])
})
</script>

<style scoped>
.journey-replay-view {
  width: 100%;
  min-height: 100vh;
  background: var(--showroom-bg-day);
  transition: background var(--theme-switch-duration, 0.45s) ease;
  position: relative;
}

html[data-theme="night"] .journey-replay-view {
  background: var(--showroom-bg-night);
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--showroom-accent-day, #D4A574);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text,
.error-text {
  color: var(--bento-text, #1f2937);
  font-size: 1rem;
  text-align: center;
}

/* Header */
.journey-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 1.5rem;
  background: var(--bento-card-bg, #ffffff);
  border-bottom: 1px solid var(--bento-card-border);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1rem;
}

html[data-theme="night"] .journey-header {
  background: var(--showroom-card-bg-night, #20242a);
  border-bottom: 1px solid var(--bento-card-border);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--bento-text, #1f2937);
  padding: 0.5rem;
}

.journey-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bento-card-title, #1f2937);
  flex: 1;
}

.journey-subtitle {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
}

/* Main Content */
.journey-main {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* House Image */
.house-image-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exterior-image-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.house-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  will-change: opacity, transform;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.house-image--base {
  position: absolute;
  inset: 0;
}

.house-image--overlay {
  position: absolute;
  inset: 0;
}

.interior-image-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.interior-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.interior-transition-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 3;
  will-change: opacity;
}

.interior-exit-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.interior-layer--base {
  opacity: 1;
  transform: scale(1);
}

.layer-visible {
  opacity: 1;
  transform: scale(1);
}

.layer-hidden {
  opacity: 0;
  transform: scale(0.98);
}

.phase-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bento-card-bg, #ffffff);
  color: var(--bento-text, #1f2937);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--bento-card-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
}

.phase-number {
  font-weight: 700;
  font-size: 1rem;
  color: var(--brand-accent, #ff6b3d);
}

.phase-name {
  color: var(--bento-text-muted, #6b7280);
}

/* Progress Bar */
.journey-progress {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bento-card-border, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d) 0%, var(--brand-accent-soft, #ff9a75) 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-dots {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bento-card-border, #e5e7eb);
  transition: all 0.3s ease;
}

.dot.locked {
  background: rgba(0, 0, 0, 0.12);
}

html[data-theme="night"] .dot.locked {
  background: rgba(255, 255, 255, 0.18);
}

.dot.active {
  background: var(--brand-accent, #ff6b3d);
}

.dot.current {
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.65);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 12rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--bento-text-muted, #6b7280);
  font-size: 0.875rem;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

.locked-indicator {
  animation: none;
  bottom: 14rem;
}

.scroll-arrow {
  font-size: 1.5rem;
}

/* Bottom Sheet - Hidden by default */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bento-card-bg, #ffffff);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(17, 24, 39, 0.12);
  border-top: 1px solid var(--bento-card-border);
  transform: translateY(calc(100% - 110px)); /* Show handle + padding */
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  max-height: 75vh;
  padding-bottom: env(safe-area-inset-bottom, 16px); /* iOS safe area */
}

.bottom-sheet.expanded {
  transform: translateY(0);
}

html[data-theme="night"] .bottom-sheet {
  background: var(--showroom-card-bg-night, #20242a);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  border-top: 1px solid var(--bento-card-border);
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem 2rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sheet-handle:hover {
  background: rgba(0, 0, 0, 0.02);
}

html[data-theme="night"] .sheet-handle:hover {
  background: rgba(255, 255, 255, 0.03);
}

.sheet-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Sheet Chevron (AppIcon) */
.sheet-chevron {
  animation: chevronBounce 2s ease-in-out infinite;
  transition: transform 0.3s ease;
}

.sheet-chevron.flipped {
  transform: rotate(180deg);
  animation: none;
}

@keyframes chevronBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.hint-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--brand-accent, #FF7F50);
  letter-spacing: 0.02em;
}

.sheet-content {
  padding: 0 1.5rem 2rem;
  overflow-y: auto;
  max-height: calc(70vh - 60px);
}

/* Summary Cards */
.summary-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: var(--showroom-card-bg-day, #ffffff);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--bento-card-border);
}

html[data-theme="night"] .summary-card {
  background: var(--showroom-card-bg-night, #20242a);
  border: 1px solid var(--bento-card-border);
}

.summary-card.highlight {
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d) 0%, var(--brand-accent-soft, #ff9a75) 100%);
  color: white;
}

.summary-label {
  display: block;
  font-size: 0.75rem;
  color: var(--bento-text-muted, #6b7280);
  margin-bottom: 0.25rem;
}

.summary-card.highlight .summary-label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--bento-text, #1f2937);
}

.summary-card.highlight .summary-value {
  color: white;
}

/* Phase Details */
.phase-details {
  margin-top: 1rem;
}

.phase-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--bento-text, #1f2937);
  margin-bottom: 0.5rem;
}

.phase-cumulative {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
  margin-bottom: 1rem;
}

.events-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .event-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.event-type {
  font-size: 1.25rem;
}

.event-details {
  flex: 1;
}

.event-amount {
  display: block;
  font-weight: 600;
  color: var(--bento-text, #1f2937);
}

.event-memo {
  display: block;
  font-size: 0.75rem;
  color: var(--bento-text-muted, #6b7280);
  margin-top: 0.125rem;
}

.event-date {
  font-size: 0.75rem;
  color: var(--bento-text-muted, #6b7280);
}

.no-events {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
  text-align: center;
  padding: 1rem;
}

/* Completion Overlay */
.completion-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.completion-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  text-align: center;
  max-width: 90%;
  animation: popIn 0.5s ease;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

html[data-theme="night"] .completion-card {
  background: var(--showroom-card-bg-night, #20242a);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  border-top: 1px solid var(--bento-card-border);
}

.completion-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.completion-message {
  font-size: 1rem;
  color: var(--bento-text, #1f2937);
  margin-bottom: 0.5rem;
}

.completion-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
  margin-bottom: 1.5rem;
}

.share-btn {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d) 0%, var(--brand-accent-soft, #ff9a75) 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 480px) {
  .journey-header {
    padding: 0.75rem 1rem;
  }

  .journey-title {
    font-size: 1rem;
  }

  .house-image-container {
    height: 50vh;
  }

  .summary-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
