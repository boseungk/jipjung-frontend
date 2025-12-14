<template>
  <div class="gamified-hero">
    <div class="hero-card">
      <button class="reset-btn" type="button" @click="resetHouseProgress">
        진행 초기화
      </button>

      <div class="scene-card">
        <div class="scene-inner">
          <div
            v-if="isHouseTrack"
            ref="houseSvgRef"
            class="svg-stage"
            v-html="houseSvgMarkup"
            aria-label="집 단계 애니메이션"
          ></div>
          <div
            v-else
            ref="furnitureSvgRef"
            class="svg-stage"
            v-html="furnitureSvgMarkup"
            aria-label="가구 단계 애니메이션"
          ></div>

          <div v-if="svgError" class="svg-fallback">
            {{ svgError }}
          </div>
          <div v-else-if="isLoading" class="svg-loader">
            게이미피케이션 일러스트를 불러오는 중...
          </div>
        </div>

        <div class="stage-message">
          <p class="stage-eyebrow">{{ currentStep.label }} · Step {{ activeStage }}/{{ totalStages }}</p>
          <p class="stage-text">{{ currentStep.message }}</p>
          <p v-if="latestBadge" class="badge-inline">
            <AppIcon name="star" :size="16" :active="true" :is-major-cta="true" />
            <span>{{ latestBadge.label }} 획득</span>
          </p>
        </div>

        <div class="progress-dots">
          <span
            v-for="dot in totalStages"
            :key="dot"
            :class="['dot', { completed: dot < activeStage, active: dot === activeStage }]"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '../common/AppIcon.vue'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useDreamHomeStore } from '../../stores/dreamHomeStore'
import { useAuthStore } from '../../stores/authStore'

// ============================================================================
// Constants
// ============================================================================

/** 기본 단계 수 (백엔드 미응답 시 폴백) */
const DEFAULT_TOTAL_STEPS = 7

/** 기본 이미지 URL (로드 실패 시 폴백) */
const DEFAULT_IMAGE_URL = '/phase7.svg'

/**
 * Phase 2 (가구 배치) 단계 정의 - 향후 확장용
 * @deprecated Phase 2 구현 시 백엔드에서 동적 제공 예정
 */
const FURNITURE_STEPS = [
  { id: 1, title: '배경 준비', label: '바닥·벽 정돈', message: '배경과 바닥을 깔끔하게 준비했어요.' },
  { id: 2, title: '소파 배치', label: '휴식 공간', message: '소파가 들어와 거실이 만들어졌어요.' },
  { id: 3, title: '테이블 추가', label: '기능 더하기', message: '테이블과 수납이 배치됐어요.' },
  { id: 4, title: '조명 켜기', label: '분위기 완성', message: '램프로 공간이 따뜻해졌어요.' },
  { id: 5, title: '소품 마무리', label: '디테일', message: '소품까지 채워 완성했어요!' }
]

// ============================================================================
// Refs (SVG State)
// ============================================================================

const houseSvgMarkup = ref('')
const furnitureSvgMarkup = ref('')
const houseSvgRef = ref(null)
const furnitureSvgRef = ref(null)
const svgError = ref('')
const isLoading = ref(true)
let lastHouseSvgUrl = ''

// ============================================================================
// Stores
// ============================================================================

const gamificationStore = useGamificationStore()
const {
  buildTrack,
  houseStage,
  furnitureStage,
  latestBadge
} = storeToRefs(gamificationStore)
const { resetHouseProgress } = gamificationStore

const dreamHomeStore = useDreamHomeStore()
const { currentAmount, targetAmount, daysRemaining } = storeToRefs(dreamHomeStore)

const authStore = useAuthStore()

// ============================================================================
// Computed Properties (Showroom Data from Backend)
// ============================================================================

/**
 * 백엔드 대시보드 응답의 showroom 섹션
 * @see DashboardResponse.ShowroomSection
 */
const showroom = computed(() => authStore.user?.showroom || null)

/**
 * 현재 트랙 (house / furniture)
 * - Phase 1: 항상 house
 * - Phase 2: buildTrack 값에 따라 전환
 */
const isHouseTrack = computed(() => buildTrack.value === 'house')

/**
 * 현재 단계 (1-based index)
 * - 백엔드 showroom.currentStep 우선
 * - 폴백: gamificationStore.houseStage
 */
const activeStage = computed(() => {
  // 백엔드 showroom 데이터가 있으면 우선 사용
  if (showroom.value?.currentStep) {
    return showroom.value.currentStep
  }
  // Phase 2 (가구 배치) 지원을 위한 폴백
  return isHouseTrack.value ? houseStage.value : Math.max(1, furnitureStage.value || 1)
})

/**
 * 총 단계 수
 * - 백엔드 showroom.totalSteps 우선
 * - 폴백: 기본값 7
 */
const totalStages = computed(() => {
  if (showroom.value?.totalSteps) {
    return showroom.value.totalSteps
  }
  return isHouseTrack.value ? DEFAULT_TOTAL_STEPS : FURNITURE_STEPS.length
})

/**
 * 현재 단계 정보 (label, message)
 * - 백엔드 showroom.stepTitle, stepDescription 우선
 * - Phase 2 폴백: FURNITURE_STEPS 배열 사용
 */
const currentStep = computed(() => {
  // 백엔드 데이터가 있고 집짓기(Phase 1)인 경우
  if (showroom.value && isHouseTrack.value) {
    return {
      label: showroom.value.stepTitle || '준비 중',
      message: showroom.value.stepDescription || ''
    }
  }
  // Phase 2 (가구 배치) 폴백
  if (!isHouseTrack.value) {
    const idx = Math.min(FURNITURE_STEPS.length - 1, Math.max(0, activeStage.value - 1))
    return FURNITURE_STEPS[idx]
  }
  // 최종 폴백 (showroom 데이터 없음)
  return { label: '준비 중', message: '집을 짓기 위한 준비를 하고 있어요.' }
})

/**
 * 테마 이미지 URL
 * - 백엔드 showroom.imageUrl 우선
 * - 폴백: 기본 완공 이미지
 */
const themeImageUrl = computed(() => showroom.value?.imageUrl || DEFAULT_IMAGE_URL)

// ============================================================================
// SVG Loading & Rendering
// ============================================================================

/**
 * SVG 마크업 유효성 검사
 */
function isSvgMarkup(text) {
  return typeof text === 'string' && text.toLowerCase().includes('<svg')
}

/**
 * 집 짓기 SVG 로드
 * - 테마 이미지 URL에서 SVG 가져오기
 * - 실패 시 기본 SVG로 폴백
 */
async function loadHouseSvg() {
  const imageUrl = themeImageUrl.value || DEFAULT_IMAGE_URL

  // 이미 로드된 경우 applyStage만 재실행 (URL이 동일할 때만)
  if (houseSvgMarkup.value && lastHouseSvgUrl === imageUrl) {
    await nextTick()
    retryApplyHouseStage()
    return
  }

  try {
    svgError.value = ''
    houseSvgMarkup.value = ''

    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error('집 SVG를 불러오지 못했습니다')
    const svgText = await res.text()
    if (!isSvgMarkup(svgText)) {
      throw new Error('Invalid SVG markup')
    }

    houseSvgMarkup.value = svgText
    lastHouseSvgUrl = imageUrl

    await nextTick()
    retryApplyHouseStage()
  } catch (error) {
    console.error(error)

    // 테마 URL 실패 시 기본 SVG로 폴백
    if (imageUrl !== DEFAULT_IMAGE_URL) {
      try {
        const fallbackRes = await fetch(DEFAULT_IMAGE_URL)
        if (fallbackRes.ok) {
          const fallbackText = await fallbackRes.text()
          if (isSvgMarkup(fallbackText)) {
            houseSvgMarkup.value = fallbackText
            lastHouseSvgUrl = DEFAULT_IMAGE_URL
            await nextTick()
            retryApplyHouseStage()
            return
          }
        }
      } catch (fallbackError) {
        console.error(fallbackError)
      }
    }

    svgError.value = '집 SVG를 불러오지 못했어요'
  }
}

/**
 * DOM 준비 대기 후 단계 적용 (재시도 로직)
 */
function retryApplyHouseStage(attempts = 0) {
  const MAX_ATTEMPTS = 10
  const wrapper = houseSvgRef.value
  const svg = wrapper?.querySelector('svg')

  if (svg) {
    applyHouseStage()
  } else if (attempts < MAX_ATTEMPTS) {
    setTimeout(() => retryApplyHouseStage(attempts + 1), 50)
  }
}

/**
 * 가구 배치 SVG 로드 (Phase 2)
 */
async function loadFurnitureSvg() {
  if (furnitureSvgMarkup.value) {
    await nextTick()
    retryApplyFurnitureStage()
    return
  }

  try {
    svgError.value = ''
    const res = await fetch('/figure.svg')
    if (!res.ok) throw new Error('가구 SVG를 불러오지 못했습니다')
    const svgText = await res.text()
    if (!isSvgMarkup(svgText)) {
      throw new Error('Invalid SVG markup')
    }
    furnitureSvgMarkup.value = svgText
    await nextTick()
    retryApplyFurnitureStage()
  } catch (error) {
    svgError.value = '가구 SVG를 불러오지 못했어요'
    console.error(error)
  }
}

/**
 * DOM 준비 대기 후 가구 단계 적용
 */
function retryApplyFurnitureStage(attempts = 0) {
  const MAX_ATTEMPTS = 10
  const wrapper = furnitureSvgRef.value
  const svg = wrapper?.querySelector('svg')

  if (svg) {
    applyFurnitureStage()
  } else if (attempts < MAX_ATTEMPTS) {
    setTimeout(() => retryApplyFurnitureStage(attempts + 1), 50)
  }
}

/**
 * 집 짓기 단계 SVG 레이어 표시/숨김 적용
 */
function applyHouseStage() {
  const wrapper = houseSvgRef.value
  if (!wrapper) return
  const svg = wrapper.querySelector('svg')
  if (!svg) return

  const phases = Array.from(svg.querySelectorAll('[id^="phase"]'))
  phases.forEach((phase) => {
    const match = phase.id.match(/phase(\d+)/)
    const phaseNumber = Number(match?.[1] || 0)
    const visible = phaseNumber === activeStage.value
    phase.classList.toggle('phase-visible', visible)
    phase.classList.toggle('phase-hidden', !visible)
  })
}

/**
 * 가구 배치 단계 SVG 레이어 표시/숨김 적용 (Phase 2)
 */
function applyFurnitureStage() {
  const wrapper = furnitureSvgRef.value
  if (!wrapper) return
  const svg = wrapper.querySelector('svg')
  if (!svg) return

  // 야간 레이어 숨김
  const nightLayer = svg.querySelector('[id*="night"]')
  if (nightLayer) {
    nightLayer.style.opacity = '0'
    nightLayer.style.display = 'none'
    nightLayer.style.pointerEvents = 'none'
  }

  const layerIds = ['background', 'sofa', 'tables', 'lamp', 'reze']
  let anyVisible = false
  layerIds.forEach((key, index) => {
    const layer = svg.querySelector(`[id*="${key}"]`)
    if (!layer) return
    // 누적 레이어 표시 (stage 1 = background+sofa)
    const visible = index <= activeStage.value
    layer.classList.toggle('layer-visible', visible)
    layer.classList.toggle('layer-hidden', !visible)
    if (visible) anyVisible = true
  })

  // 안전망: 어떤 레이어도 보이지 않을 경우 모두 표시
  if (!anyVisible) {
    layerIds.forEach((key) => {
      const layer = svg.querySelector(`[id*="${key}"]`)
      if (!layer) return
      layer.classList.add('layer-visible')
      layer.classList.remove('layer-hidden')
    })
  }
}

/**
 * 현재 트랙에 맞는 SVG 로드
 */
async function ensureActiveSvg(track) {
  isLoading.value = true
  svgError.value = ''
  try {
    if (track === 'house') {
      await loadHouseSvg()
    } else {
      await loadFurnitureSvg()
    }
  } finally {
    isLoading.value = false
  }
}

// ============================================================================
// Watchers
// ============================================================================

watch([buildTrack, activeStage], () => {
  nextTick(() => {
    if (isHouseTrack.value) {
      applyHouseStage()
    } else {
      applyFurnitureStage()
    }
  })
})

watch(houseSvgMarkup, () => {
  nextTick(() => {
    setTimeout(applyHouseStage, 50)
  })
})

watch(furnitureSvgMarkup, () => {
  nextTick(() => {
    setTimeout(applyFurnitureStage, 50)
  })
})

watch(buildTrack, async (track) => {
  await ensureActiveSvg(track)
})

// 테마 이미지 URL 변경 시 집 SVG 재로드 (테마 선택/대시보드 갱신 대응)
watch(themeImageUrl, async (newUrl, oldUrl) => {
  if (!isHouseTrack.value) return
  if (!newUrl || newUrl === oldUrl) return
  await ensureActiveSvg('house')
})

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  try {
    await gamificationStore.syncMilestones()
    await ensureActiveSvg(buildTrack.value)
  } catch (error) {
    console.error('Failed to load gamification SVGs', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.gamified-hero {
  width: 100%;
  padding: 0 0 1rem;
  display: flex;
  justify-content: center;
}

.hero-card {
  width: 100%;
  max-width: 920px;
  background: transparent;
  border-radius: 16px;
  padding: 0.5rem 0.5rem 0.5rem;
  box-shadow: none;
  border: none;
  position: relative;
  overflow: visible;
}

html[data-theme='night'] .hero-card {
  background: transparent;
  box-shadow: none;
  border: none;
}

.badge-chip {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.3rem 0.45rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-strong, #d1d5db);
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  box-shadow: 0 12px 24px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

.badge-text .title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0;
  letter-spacing: -0.01em;
}

html[data-theme='night'] .badge-text .title {
  color: var(--showroom-text-night, #f5f6f7);
}

.reset-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.4rem 0.7rem;
  border-radius: 10px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: #f7f8fa;
  color: var(--ink-base, #1f2937);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  z-index: 10;
}

html[data-theme='night'] .reset-btn {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: var(--showroom-text-night, #f5f6f7);
}

.reset-btn:hover {
  transform: translateY(-1px);
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 8px 18px -12px rgba(17, 24, 39, 0.25);
}

.scene-card {
  position: relative;
  border-radius: 16px;
  overflow: visible;
  margin-top: 0;
  padding: 0.1rem 0.5rem 0.75rem;
  background: transparent;
  border: none;
  backdrop-filter: none;
  box-shadow: none;
}

html[data-theme='night'] .scene-card {
  background: transparent;
  border: none;
  box-shadow: none;
}

.scene-inner {
  position: relative;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.svg-stage {
  width: 100%;
  max-width: 540px;
  filter: none;
}

html[data-theme='night'] .svg-stage {
  filter: none;
}

.svg-loader,
.svg-fallback {
  text-align: center;
  color: var(--showroom-text-secondary-day, #8d6e63);
  font-weight: 600;
}

html[data-theme='night'] .svg-loader,
html[data-theme='night'] .svg-fallback {
  color: var(--showroom-text-secondary-night, #d7ccc8);
}

.stage-message {
  margin-top: 0.75rem;
  text-align: center;
}

.stage-eyebrow {
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
  letter-spacing: 0.04em;
  font-weight: 600;
  text-transform: uppercase;
}

html[data-theme='night'] .stage-eyebrow {
  color: rgba(245, 246, 247, 0.7);
}

.stage-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin-top: 0.15rem;
}

html[data-theme='night'] .stage-text {
  color: var(--showroom-text-night, #f5f6f7);
}

.badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: var(--brand-accent, #ff6b3d);
}

html[data-theme='night'] .badge-inline {
  color: var(--showroom-accent-night, #ff8a5c);
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid var(--border-soft, #e5e7eb);
  box-shadow: 0 4px 10px -6px rgba(17, 24, 39, 0.24);
  transition: all 0.22s ease;
}

.dot.completed {
  background: #22c55e;
  border-color: #22c55e;
  box-shadow: 0 8px 16px -10px rgba(34, 197, 94, 0.4);
}

.dot.active {
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  border-color: transparent;
  transform: scale(1.12);
  box-shadow: 0 10px 18px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.5);
}

html[data-theme='night'] .dot {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

.footer {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
  align-items: center;
}

.dday-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dday-chip {
  padding: 0.35rem 0.85rem;
  background: #ffffff;
  color: var(--ink-base, #1f2937);
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid var(--border-soft, #e5e7eb);
  box-shadow: 0 8px 16px -12px rgba(17, 24, 39, 0.22);
}

html[data-theme='night'] .dday-chip {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-text-night, #f5f6f7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.amounts .main-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

html[data-theme='night'] .amounts .main-price {
  color: var(--showroom-text-night, #f5f6f7);
}

.amounts .sub-price {
  font-size: 0.95rem;
  color: var(--ink-muted, #6b7280);
}

html[data-theme='night'] .amounts .sub-price {
  color: rgba(245, 246, 247, 0.75);
}

.xp-progress {
  width: 100%;
}

.xp-bar {
  width: 100%;
  height: 14px;
  border-radius: 10px;
  background: var(--showroom-card-bg-day, #f5ede3);
  overflow: hidden;
  box-shadow:
    inset 2px 2px 4px var(--showroom-shadow-dark-day, #d4c8bd),
    inset -2px -2px 4px var(--showroom-shadow-light-day, #ffffff);
}

html[data-theme='night'] .xp-bar {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #81c784, #66bb6a);
  width: 0%;
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(129, 199, 132, 0.35);
}

.xp-meta {
  margin-top: 0.35rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--showroom-text-day, #5d4037);
}

html[data-theme='night'] .xp-meta {
  color: var(--showroom-text-night, #f5ede3);
}

.xp-meta .muted {
  color: var(--showroom-text-secondary-day, #8d6e63);
}

html[data-theme='night'] .xp-meta .muted {
  color: var(--showroom-text-secondary-night, #d7ccc8);
}

/* SVG tuning */
:deep(.svg-stage svg) {
  width: 100%;
  height: auto;
}

:deep([id^='phase']) {
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

:deep(.phase-visible) {
  opacity: 1;
  transform: translateY(0);
  filter: none;
}

:deep(.phase-hidden) {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

:deep([id*='background']),
:deep([id*='sofa']),
:deep([id*='tables']),
:deep([id*='lamp']),
:deep([id*='reze']) {
  opacity: 0;
  transition: opacity 0.45s ease, transform 0.45s ease;
  display: block;
}

:deep([id*='night']) {
  opacity: 0 !important;
  display: none !important;
  pointer-events: none !important;
}

:deep(.layer-visible) {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

:deep(.layer-hidden) {
  opacity: 0;
  transform: translateY(-12px);
  pointer-events: none;
}

:deep(.svg-stage > svg > rect:not([id])),
:deep(.svg-stage > svg > g > rect:not([id])) {
  display: none !important;
}

@media (max-width: 768px) {
  .hero-card {
    padding: 0.9rem;
    max-width: 100%;
  }

  .hero-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .xp-chip {
    width: 100%;
    text-align: left;
  }

  .scene-inner {
    min-height: 200px;
  }

  .footer {
    grid-template-columns: 1fr;
  }
}
</style>
