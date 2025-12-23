<template>
  <div class="journey-replay-view" ref="containerRef">
    <!-- Snow Effect (only in night mode at final phase) -->
    <SnowCanvas v-if="isNight && isAtFinalPhase" />

    <!-- Dark Mode Toggle Button (only at final phase) -->
    <transition name="fade-scale">
      <div 
        v-if="isAtFinalPhase && !isLoading && normalizedJourney" 
        class="dark-mode-toggle-btn"
        role="button"
        tabindex="0"
        @click="toggleTheme"
        @keydown.enter.space.prevent="toggleTheme"
        :aria-label="isNight ? '낮 모드로 전환' : '밤 모드로 전환'"
      >
        <!-- Sun Icon (Day Mode) -->
        <svg
          class="toggle-icon"
          :class="{ visible: !isNight, hidden: isNight }"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="5" stroke="#FFB300" stroke-width="2" fill="#FFD54F"/>
          <path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.5 3.5L19.07 4.93M4.93 19.07L3.5 20.5M20.5 20.5L19.07 19.07M4.93 4.93L3.5 3.5" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/>
        </svg>

        <!-- Moon Icon (Night Mode) -->
        <svg
          class="toggle-icon"
          :class="{ visible: isNight, hidden: !isNight }"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#5D4037" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </transition>

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
            <!-- Night Mode Image Overlay -->
            <transition name="night-fade">
              <img
                v-if="isNight && isAtFinalPhase"
                :src="interiorNightImageUrl"
                class="interior-layer interior-layer--night"
                alt="밤 모드 인테리어"
                draggable="false"
              />
            </transition>
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
          <p v-if="isInProgress" class="progress-status">
            진행 단계 {{ progressPhase }}/{{ totalPhases }}
          </p>
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
                active: phase <= progressPhase,
                current: phase === currentPhase,
                locked: isInProgress && phase > maxUnlockedPhase
              }"
            ></span>
          </div>
        </div>

        <!-- Scroll Indicator Arrow (right side of image) -->
        <div v-if="showScrollHint" class="scroll-arrow-indicator" aria-label="아래로 스크롤">
          <span class="arrow-icon">↓</span>
        </div>
        <div v-else-if="showLockedHint" class="scroll-arrow-indicator locked-arrow" aria-label="잠김">
          <span class="lock-icon">🔒</span>
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
            <div class="summary-card">
              <span class="summary-label">목표 XP</span>
              <span class="summary-value">{{ formatExp(journeySummary.targetExp) }}</span>
            </div>
            <div class="summary-card highlight">
              <span class="summary-label">누적 XP</span>
              <span class="summary-value">{{ formatExp(journeySummary.totalExp) }}</span>
            </div>
          </div>

          <!-- Current Phase Details -->
          <div v-if="currentPhaseData" class="phase-details">
            <h3 class="phase-title">{{ currentPhaseName }} - 활동 기록</h3>
            <p class="phase-cumulative">
              누적 XP: <strong>{{ formatExp(currentPhaseData.cumulativeExp ?? journeySummary.totalExp) }}</strong>
            </p>

            <!-- Events List -->
            <ul v-if="currentPhaseData.events?.length" class="events-list">
              <li v-for="event in currentPhaseData.events" :key="event.eventId" class="event-item">
                <span class="event-type" :class="event.eventType.toLowerCase()">
                  {{ formatEventSign(event.expChange) }}
                </span>
                <div class="event-details">
                  <span class="event-amount">{{ formatExpChange(event.expChange) }}</span>
                  <span class="event-memo">
                    {{ formatEventLabel(event) }}
                    <template v-if="event.memo"> · {{ event.memo }}</template>
                  </span>
                </div>
                <span class="event-date">{{ formatShortDate(event.date) }}</span>
              </li>
            </ul>
            <p v-else class="no-events">이 단계에는 활동 기록이 없어요</p>
          </div>
        </div>
      </aside>

      <!-- Completion Celebration (when at 100%) -->
      <div v-if="isJourneyCompleted && currentPhase === totalPhases && !isCompletionDismissed" class="completion-overlay">
        <div class="confetti-container"></div>
        <div class="completion-card">
          <button class="completion-close-btn" @click="dismissCompletion" aria-label="닫기">
            ✕
          </button>
          <h2 class="completion-title">🎉 축하해요!</h2>
          <p class="completion-message">
            {{ journeySummary.totalDays }}일간의 여정을 완주했어요!
          </p>
          <p class="completion-amount">
            총 {{ formatExp(journeySummary.totalExp) }} 달성
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
import { storeToRefs } from 'pinia'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { BRAND_ACCENT } from '@/constants/colors'
import {
  getExteriorStageUrl,
  getInteriorLayerUrls,
  getInteriorVisibleLayerIds,
  getInteriorNightUrl,
  SHOWROOM_TOTAL_STAGES
} from '@/constants/showroomWebp'
import {
  formatJourneyDate as formatDate,
  formatJourneyExp as formatExp,
  formatJourneyShortDate as formatShortDate,
  isPhaseUnlocked,
  normalizeJourneyData,
  toPhaseNumber
} from '@/utils/journeyReplay'
import { useTheme } from '@/composables/useTheme'
import gsap from 'gsap'
import AppIcon from '@/components/common/AppIcon.vue'
import SnowCanvas from '@/components/SnowCanvas.vue'

const route = useRoute()
const router = useRouter()
const collectionStore = useCollectionStore()
const { inProgress } = storeToRefs(collectionStore)
const gamificationStore = useGamificationStore()
const { buildTrack, houseStage, furnitureStage } = storeToRefs(gamificationStore)
const { isNight, toggleTheme } = useTheme()
const containerRef = ref(null)

// State
const isLoading = ref(true)
const error = ref(null)
const journeyData = ref(null)
const currentPhase = ref(1)
const isSheetExpanded = ref(false)
const isCompletionDismissed = ref(false)
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

const dashboardPhase = computed(() => {
  if (buildTrack.value === 'furniture') {
    const stage = Math.max(1, Number(furnitureStage.value || 1))
    return toPhaseNumber(HOUSE_STAGE_COUNT + stage, totalPhases) ?? HOUSE_STAGE_COUNT + 1
  }

  const stage = Math.max(1, Number(houseStage.value || 1))
  return toPhaseNumber(stage, totalPhases) ?? 1
})

const normalizedJourney = computed(() => {
  return normalizeJourneyData(journeyData.value, totalPhases)
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
    targetAmount: 0,
    targetExp: 0,
    totalExp: 0
  }
})

const journeyPhases = computed(() => normalizedJourney.value?.phases ?? [])

const maxUnlockedPhase = computed(() => {
  const explicit = normalizedJourney.value?.maxUnlockedPhase

  const reached = journeyPhases.value
    .filter(isPhaseUnlocked)
    .map(phase => phase.phaseNumber)
    .filter(number => Number.isInteger(number))

  if (!isInProgress.value) {
    if (Number.isInteger(explicit)) {
      return Math.min(totalPhases, Math.max(1, explicit))
    }

    if (reached.length > 0) {
      return Math.min(totalPhases, Math.max(1, Math.max(...reached)))
    }

    const phaseNumbers = journeyPhases.value
      .map(phase => phase?.phaseNumber)
      .filter(number => Number.isInteger(number))

    if (phaseNumbers.length > 0) {
      return Math.min(totalPhases, Math.max(1, Math.max(...phaseNumbers)))
    }

    return 1
  }

  const inProgressCandidates = []
  if (Number.isInteger(explicit)) {
    return Math.min(totalPhases, Math.max(1, explicit))
  }
  const inProgressPhase = toPhaseNumber(
    inProgress.value?.currentPhase
    ?? inProgress.value?.currentStage
    ?? inProgress.value?.currentStep
    ?? null,
    totalPhases
  )
  if (Number.isInteger(inProgressPhase)) inProgressCandidates.push(inProgressPhase)

  const fallbackPhase = toPhaseNumber(dashboardPhase.value, totalPhases)
  if (Number.isInteger(fallbackPhase)) inProgressCandidates.push(fallbackPhase)

  if (inProgressCandidates.length > 0) {
    return Math.min(totalPhases, Math.max(1, Math.max(...inProgressCandidates)))
  }

  if (reached.length > 0) {
    return Math.min(totalPhases, Math.max(1, Math.max(...reached)))
  }

  return 1
})

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

const EVENT_LABELS = {
  SAVINGS_DEPOSIT: '저축',
  SAVINGS_WITHDRAW: '출금',
  AI_JUDGMENT: 'AI 판결',
  STREAK_DASHBOARD: '대시보드',
  STREAK_AI_ANALYSIS: 'AI 분석',
  STREAK_AI_JUDGMENT: 'AI 판결 스트릭',
  STREAK_SAVINGS: '저축 스트릭',
  STREAK_MILESTONE: '스트릭 마일스톤',
  LEVEL_UP: '레벨업',
  HOUSE_COMPLETE: '집 완공',
  FURNITURE_UNLOCKED: '가구 해금',
  JOURNEY_COMPLETE: '여정 완주'
}

// 마지막 단계 (인테리어 완성) 여부
const isAtFinalPhase = computed(() => currentPhase.value === totalPhases)

// 밤 모드 인테리어 이미지 URL
const interiorNightImageUrl = computed(() => {
  return getInteriorNightUrl(journeyCollection.value.themeCode || 'CLASSIC')
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

const formatEventLabel = (event) => {
  const rawType = String(event?.eventType ?? '').toUpperCase()
  if (!rawType) return '활동'
  if (EVENT_LABELS[rawType]) return EVENT_LABELS[rawType]
  if (rawType.startsWith('STREAK_')) {
    return `스트릭 ${rawType.replace('STREAK_', '').replace(/_/g, ' ')}`
  }
  return rawType.replace(/_/g, ' ')
}

const formatEventSign = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric === 0) return '•'
  return numeric > 0 ? '+' : '−'
}

const formatExpChange = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric === 0) {
    return formatExp(0)
  }
  const sign = numeric > 0 ? '+' : '-'
  return `${sign}${Math.abs(numeric).toLocaleString()} XP`
}

const progressPercent = computed(() => {
  const targetExp = Number(journeySummary.value?.targetExp)
  const totalExp = Number(journeySummary.value?.totalExp)
  if (Number.isFinite(targetExp) && targetExp > 0) {
    const percent = (totalExp / targetExp) * 100
    return Math.min(100, Math.max(0, percent))
  }
  const phaseValue = progressPhase.value || 1
  if (totalPhases <= 1) return 100
  return ((phaseValue - 1) / (totalPhases - 1)) * 100
})

const isLockedPhase = computed(() => {
  if (!isInProgress.value) return false
  if (maxUnlockedPhase.value >= totalPhases) return false
  return currentPhase.value > maxUnlockedPhase.value
})

const progressPhase = computed(() => {
  if (!isInProgress.value) return currentPhase.value
  return Math.min(totalPhases, Math.max(1, maxUnlockedPhase.value || 1))
})

const showScrollHint = computed(() => {
  if (totalPhases <= 1) return false
  if (currentPhase.value >= totalPhases) return false
  return !isLockedPhase.value
})

const showLockedHint = computed(() => {
  if (totalPhases <= 1) return false
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

const shareJourney = async () => {
  try {
    const totalDays = journeySummary.value?.totalDays ?? 0
    const totalExp = journeySummary.value?.totalExp ?? 0
    if (navigator.share) {
      await navigator.share({
        title: isJourneyCompleted.value
          ? `${journeyCollection.value.propertyName} 저축 완료!`
          : `${journeyCollection.value.propertyName} 저축 여정`,
        text: isJourneyCompleted.value
          ? `${totalDays}일간 ${formatExp(totalExp)} 달성!`
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

const dismissCompletion = () => {
  isCompletionDismissed.value = true
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
    const root = document.documentElement
    const scrollTop = window.scrollY || root.scrollTop || document.body.scrollTop || 0
    const viewportHeight = root.clientHeight || window.innerHeight || 0
    const docHeight = Math.max(root.scrollHeight, document.body.scrollHeight, viewportHeight)

    // Calculate progress (0 to 1)
    const maxScroll = Math.max(0, docHeight - viewportHeight)
    const isAtEnd = scrollTop + viewportHeight >= docHeight - 1
    const scrollProgress = maxScroll <= 0 ? 0 : isAtEnd ? 1 : Math.min(1, scrollTop / maxScroll)
    
    // Map to phase (1 to 11)
    const phaseCount = Math.max(1, totalPhases)
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

  watch(normalizedJourney, (newJourney) => {
    if (!newJourney) return

    teardownScrollEffect()
    const scrollHeight = `${Math.max(1, totalPhases) * 100}vh`
    document.body.style.height = scrollHeight
    document.documentElement.style.height = scrollHeight
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

<style scoped src="@/assets/css/components/journey-replay.css"></style>
