<template>
  <section class="landing-journey" ref="sectionRef">
    <div class="landing-journey__sticky" ref="stickyRef">
      <!-- Section Title -->
      <span class="landing-journey__tagline">저축할수록 집이 자라나요</span>

      <!-- Image Container -->
      <div
        class="landing-journey__image-container"
        :class="{ 'has-progress': currentPhase > 1 }"
      >
        <!-- Exterior Images (Phase 1-6) -->
        <template v-if="!isInteriorPhase">
          <img
            v-for="stage in 6"
            :key="`exterior-${stage}`"
            :src="getExteriorUrl(stage)"
            :class="[
              'landing-journey__image',
              { 'is-visible': currentPhase === stage }
            ]"
            :alt="`집 건설 ${stage}단계`"
            loading="lazy"
          />
        </template>

        <!-- Interior Layers (Phase 7-11) -->
        <template v-else>
          <img
            v-for="layer in interiorLayers"
            :key="layer.id"
            :src="layer.url"
            :class="[
              'landing-journey__layer',
              { 'is-visible': isLayerVisible(layer) }
            ]"
            :alt="layer.id"
            loading="lazy"
          />
          <!-- Night Overlay -->
          <transition name="night-fade">
            <img
              v-if="isAtFinalPhase"
              :src="nightImageUrl"
              class="landing-journey__night-overlay"
              alt="Night mode interior"
            />
          </transition>
        </template>
      </div>

      <!-- Progress UI -->
      <div class="landing-journey__progress">
        <div class="landing-journey__phase-badge">
          {{ currentPhase }}/{{ TOTAL_PHASES }} {{ phaseName }}
        </div>
        <div class="landing-journey__dots">
          <span
            v-for="phase in TOTAL_PHASES"
            :key="phase"
            class="landing-journey__dot"
            :class="{ 'is-active': currentPhase >= phase }"
          />
        </div>
      </div>

      <!-- Night Mode Toggle (shown at final phase) -->
      <transition name="fade-scale">
        <button
          v-if="showThemeToggle"
          class="landing-journey__theme-toggle"
          type="button"
          :aria-label="isNight ? 'Day 모드로 전환' : 'Night 모드로 전환'"
          :aria-pressed="isNight"
          @click="handleThemeToggle"
        >
          <!-- Sun Icon (Day) -->
          <svg v-if="isNight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <!-- Moon Icon (Night) -->
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </transition>
    </div>
  </section>
</template>

<script setup>
/**
 * LandingJourneyPreview.vue
 * 집 건설 과정 체험 + Day→Night 전환 데모
 * 
 * 기능:
 * - 스크롤 기반 11단계 Phase 전환
 * - Phase 1-6: 외관 이미지, Phase 7-11: 인테리어 레이어
 * - Phase 11 도달 시 Night 토글 버튼 표시
 * - ScrollTrigger pin/scrub 기반 스크롤 진행
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useTheme } from '@/composables/useTheme'
import {
  getExteriorStageUrl,
  getInteriorLayerUrls,
  getInteriorNightUrl,
  getInteriorVisibleLayerIds
} from '@/constants/showroomWebp'

// Constants
const TOTAL_PHASES = 11
const EXTERIOR_PHASES = 6
const DEMO_THEME = 'HANOK'
const FINAL_HOLD_RATIO = 0.65

const PHASE_NAMES = {
  1: '터 다지기',
  2: '기초 공사',
  3: '뼈대 세우기',
  4: '벽체 완성',
  5: '지붕 올리기',
  6: '입주 준비',
  7: '바닥·벽 정돈',
  8: '휴식 공간',
  9: '기능 더하기',
  10: '분위기 완성',
  11: '디테일 완성'
}

// Emits
const emit = defineEmits(['phase-change'])

// Composables
const { isNight, toggleTheme } = useTheme()

// Refs
const sectionRef = ref(null)
const stickyRef = ref(null)
const currentPhase = ref(1)
const hasPrefetchedInterior = ref(false)
const hasPrefetchedNight = ref(false)

// Computed
const isInteriorPhase = computed(() => currentPhase.value > EXTERIOR_PHASES)

const phaseName = computed(() => PHASE_NAMES[currentPhase.value] || '')

const isAtFinalPhase = computed(() => currentPhase.value >= TOTAL_PHASES)

const showThemeToggle = computed(() => isAtFinalPhase.value || isNight.value)

const interiorLayers = computed(() => getInteriorLayerUrls(DEMO_THEME))

const nightImageUrl = computed(() => getInteriorNightUrl(DEMO_THEME))

const visibleLayerIds = computed(() => {
  if (!isInteriorPhase.value) return new Set()
  const layerIds = interiorLayers.value.map((layer) => layer.id)
  const interiorStage = currentPhase.value - EXTERIOR_PHASES
  return getInteriorVisibleLayerIds(layerIds, interiorStage)
})

/**
 * 외관 이미지 URL 가져오기
 */
function getExteriorUrl(stage) {
  return getExteriorStageUrl(DEMO_THEME, stage)
}

/**
 * 인테리어 레이어 가시성 확인
 */
function isLayerVisible(layer) {
  return visibleLayerIds.value.has(layer.id)
}

/**
 * 스크롤 진행률 기반 Phase 업데이트
 */
function updatePhase(progress) {
  const clamped = Math.min(1, Math.max(0, progress))
  const newPhase = Math.min(
    TOTAL_PHASES,
    Math.floor(clamped * (TOTAL_PHASES - 1)) + 1
  )

  if (newPhase !== currentPhase.value) {
    currentPhase.value = newPhase
    emit('phase-change', newPhase)
  }
}

/**
 * 테마 토글 핸들러
 */
function handleThemeToggle() {
  toggleTheme()
}

let scrollTrigger = null
let resizeTimer = null

function initScrollTrigger() {
  if (typeof window === 'undefined') return
  if (!sectionRef.value || !stickyRef.value) return

  if (!gsap.core.globals().ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger)
  }

  scrollTrigger?.kill()

  const baseLength = window.innerHeight * (TOTAL_PHASES - 1)
  const holdLength = window.innerHeight * FINAL_HOLD_RATIO
  const totalLength = baseLength + holdLength

  scrollTrigger = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: `+=${totalLength}`,
    pin: stickyRef.value,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const phaseProgress = Math.min(1, (self.progress * totalLength) / baseLength)
      updatePhase(phaseProgress)
    }
  })

  updatePhase(scrollTrigger.progress || 0)
  ScrollTrigger.refresh()
}

function handleResize() {
  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
  }

  resizeTimer = window.setTimeout(() => {
    initScrollTrigger()
  }, 150)
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  initScrollTrigger()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  scrollTrigger?.kill()
  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
  }
  window.removeEventListener('resize', handleResize)
})

// Watch for phase changes to preload images
watch(currentPhase, (newPhase) => {
  // 다음 Phase 이미지 프리로드
  if (newPhase < TOTAL_PHASES) {
    const nextPhase = newPhase + 1
    if (nextPhase <= EXTERIOR_PHASES) {
      const img = new Image()
      img.src = getExteriorUrl(nextPhase)
    }
  }

  if (newPhase >= EXTERIOR_PHASES && !hasPrefetchedInterior.value) {
    hasPrefetchedInterior.value = true
    interiorLayers.value.forEach((layer) => {
      const img = new Image()
      img.src = layer.url
    })
  }

  if (newPhase >= TOTAL_PHASES - 1 && !hasPrefetchedNight.value) {
    hasPrefetchedNight.value = true
    const img = new Image()
    img.src = nightImageUrl.value
  }
})
</script>

<style scoped>
/* Component-specific styles */
.landing-journey__image.is-visible,
.landing-journey__layer.is-visible {
  opacity: 1;
}
</style>
