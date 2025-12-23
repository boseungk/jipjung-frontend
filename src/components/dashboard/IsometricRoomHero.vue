<template>
  <div class="gamified-hero">
    <div class="hero-card">

      <div class="scene-card">
        <ShowroomUnlockModal
          :is-open="isUnlockModalOpen"
          title="내 집 완공!"
          message="축하해요! 이제 방을 꾸밀 수 있어요."
          button-text="인테리어 시작하기"
          @confirm="handleUnlockConfirm"
        />
        <div class="scene-inner" :class="{ 'scene-inner--no-goal': !hasGoal }">
          <!-- WebP Stage -->
          <div v-if="isHouseTrack" ref="houseStageRef" class="stage-frame" aria-label="집 단계 애니메이션">
            <img
              v-if="houseIncomingUrl"
              ref="houseIncomingImgRef"
              :src="houseIncomingUrl"
              class="stage-img stage-img--base"
              :alt="`${resolvedThemeLabel} 집 ${activeStage}단계`"
              draggable="false"
            />
            <img
              v-if="houseOutgoingUrl"
              ref="houseOutgoingImgRef"
              :src="houseOutgoingUrl"
              class="stage-img stage-img--overlay"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>

          <div v-else ref="furnitureStageRef" class="stage-frame stage-frame--layers" aria-label="가구 단계 애니메이션">
            <img
              v-if="interiorBackgroundLayer"
              :src="interiorBackgroundLayer.url"
              class="stage-img stage-img--base"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
            <img
              v-for="layer in interiorOverlayLayers"
              :key="layer.id"
              :src="layer.url"
              class="layer-img"
              :class="interiorVisibleLayerIds.has(layer.id) ? 'layer-visible' : 'layer-hidden'"
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>

          <!-- Loading / Error States -->
          <div v-if="assetError" class="stage-fallback">{{ assetError }}</div>
          <div v-else-if="isLoading" class="stage-loader">
            게이미피케이션 일러스트를 불러오는 중...
          </div>

          <!-- Empty State: No Goal Overlay -->
          <transition name="fade-overlay">
            <div v-if="!hasGoal && !isLoading" class="no-goal-overlay">
              <div class="no-goal-card">
                <h3 class="no-goal-title">나만의 드림홈을 찾아보세요</h3>
                <p class="no-goal-desc">목표를 설정하면 집이 함께 성장해요</p>
              <button class="btn btn-primary no-goal-cta" @click="goToProperties">
                  <span>매물 둘러보기</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Stage Message -->
        <div class="stage-message">
          <p class="stage-eyebrow">{{ currentStep.label }} · Step {{ activeStage }}/{{ totalStages }}</p>
          <p class="stage-text">{{ currentStep.message }}</p>

        </div>

        <!-- Progress Dots with M-2 Tooltips -->
        <div class="progress-dots">
          <button
            v-for="dot in totalStages"
            :key="dot"
            type="button"
            :class="['dot', { completed: dot < activeStage, active: dot === activeStage }]"
            :aria-label="getStepLabel(dot)"
            :title="getStepLabel(dot)"
          ></button>
        </div>

        <!-- Particle Container for Level-Up Celebrations -->
        <div ref="particlesRef" class="particles-container" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import ShowroomUnlockModal from '../modals/ShowroomUnlockModal.vue'
import { useAuthStore } from '../../stores/authStore'
import {
  getExteriorStageUrl,
  getInteriorLayerUrls,
  getInteriorVisibleLayerIds,
  resolveThemeCode,
  SHOWROOM_TOTAL_STAGES
} from '../../constants/showroomWebp'
import { normalizeGoalProgress, getTrackFromPhase, getStageFromPhase } from '@/utils/goalProgress'

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TOTAL_STEPS = SHOWROOM_TOTAL_STAGES.house
const DEFAULT_FURNITURE_STEPS = SHOWROOM_TOTAL_STAGES.furniture

/** Phase 1 (집 건설) 단계 정의 - M-2 툴팁용 */
const HOUSE_STEPS = [
  { id: 1, label: '터 다지기' },
  { id: 2, label: '기초 공사' },
  { id: 3, label: '뼈대 세우기' },
  { id: 4, label: '벽체 완성' },
  { id: 5, label: '지붕 올리기' },
  { id: 6, label: '입주 준비' }
]

/** Phase 2 (가구 배치) 단계 정의 - 향후 확장용 */
const FURNITURE_STEPS = [
  { id: 1, label: '바닥·벽 정돈', message: '배경과 바닥을 깔끔하게 준비했어요.' },
  { id: 2, label: '휴식 공간', message: '소파가 들어와 거실이 만들어졌어요.' },
  { id: 3, label: '기능 더하기', message: '테이블과 수납이 배치됐어요.' },
  { id: 4, label: '분위기 완성', message: '램프로 공간이 따뜻해졌어요.' },
  { id: 5, label: '디테일', message: '소품까지 채워 완성했어요!' }
]

/**
 * M-2: 단계별 라벨을 반환 (진행도 도트 툴팁용)
 */
function getStepLabel(step) {
  if (isHouseTrack.value) {
    const info = HOUSE_STEPS.find(s => s.id === step)
    return info ? `${step}단계: ${info.label}` : `${step}단계`
  }
  const info = FURNITURE_STEPS.find(s => s.id === step)
  return info ? `${step}단계: ${info.label}` : `${step}단계`
}

// ============================================================================
// Refs
// ============================================================================

const houseStageRef = ref(null)
const furnitureStageRef = ref(null)
const houseIncomingImgRef = ref(null)
const houseOutgoingImgRef = ref(null)
const houseIncomingUrl = ref('')
const houseOutgoingUrl = ref('')
const assetError = ref('')
const isLoading = ref(true)
const particlesRef = ref(null)

// ============================================================================
// Stores
// ============================================================================

const router = useRouter()
const authStore = useAuthStore()
const { hasDreamHomeGoal, user } = storeToRefs(authStore)

const displayTrack = ref('house')
const isUnlockModalOpen = ref(false)
const lastGoalPhase = ref(null)

// 목표 설정 여부
const hasGoal = computed(() => hasDreamHomeGoal.value)

// 매물 보러가기
function goToProperties() {
  router.push('/properties')
}

// ============================================================================
// Computed Properties
// ============================================================================

const showroom = computed(() => authStore.userShowroom || null)
const isHouseTrack = computed(() => displayTrack.value === 'house')

const showroomThemeCode = computed(() => resolveThemeCode(showroom.value?.themeCode))
const resolvedThemeLabel = computed(() => {
  const code = showroomThemeCode.value
  if (code === 'HANOK') return '한옥'
  if (code === 'SANTORINI') return '산토리니'
  return '클래식'
})

const goalSnapshot = computed(() => user.value?._raw?.goal || null)
const goalProgress = computed(() => normalizeGoalProgress(goalSnapshot.value))
const goalTargetExp = computed(() => Number(goalProgress.value.targetExp))
const goalPhase = computed(() => Number(goalProgress.value.currentPhase))
const useGoalPhase = computed(() => {
  if (!goalSnapshot.value?.dreamHomeId) return false
  if (!Number.isFinite(goalTargetExp.value) || goalTargetExp.value <= 0) return false
  return Number.isFinite(goalPhase.value) && goalPhase.value > 0
})

const effectiveTrack = computed(() => {
  if (useGoalPhase.value) {
    return getTrackFromPhase(goalPhase.value)
  }
  return 'house'
})

const activeStage = computed(() => {
  if (useGoalPhase.value) {
    const stageValue = Math.max(1, getStageFromPhase(goalPhase.value))
    if (getTrackFromPhase(goalPhase.value) === 'house') {
      return Math.min(stageValue, DEFAULT_TOTAL_STEPS)
    }
    return Math.min(stageValue, DEFAULT_FURNITURE_STEPS)
  }

  if (isHouseTrack.value) {
    const rawStage = showroom.value?.currentStep
    const parsed = Number(rawStage)
    const safe = Number.isFinite(parsed) ? Math.trunc(parsed) : 1
    return Math.min(Math.max(safe, 1), DEFAULT_TOTAL_STEPS)
  }

  const parsed = 1
  const safe = Number.isFinite(parsed) ? Math.trunc(parsed) : 1
  return Math.min(Math.max(safe, 1), DEFAULT_FURNITURE_STEPS)
})

const totalStages = computed(() => {
  return isHouseTrack.value ? DEFAULT_TOTAL_STEPS : DEFAULT_FURNITURE_STEPS
})

const currentStep = computed(() => {
  if (isHouseTrack.value) {
    if (useGoalPhase.value) {
      const info = HOUSE_STEPS.find(s => s.id === activeStage.value)
      return {
        label: info ? info.label : '준비 중',
        message: '집을 짓는 여정이 이어지고 있어요.'
      }
    }
    if (showroom.value) {
      return {
        label: showroom.value.stepTitle || '준비 중',
        message: showroom.value.stepDescription || ''
      }
    }
    return { label: '준비 중', message: '집을 짓기 위한 준비를 하고 있어요.' }
  }

  const idx = Math.min(FURNITURE_STEPS.length - 1, Math.max(0, activeStage.value - 1))
  return FURNITURE_STEPS[idx]
})

const houseStageUrl = computed(() => {
  if (!isHouseTrack.value) return ''
  return getExteriorStageUrl(showroomThemeCode.value, activeStage.value)
})

const interiorLayers = computed(() => getInteriorLayerUrls(showroomThemeCode.value))
const interiorLayerIds = computed(() => interiorLayers.value.map((layer) => layer.id))
const interiorVisibleLayerIds = computed(() => {
  if (isHouseTrack.value) return new Set()
  return getInteriorVisibleLayerIds(interiorLayerIds.value, activeStage.value)
})
const interiorBackgroundLayer = computed(() => interiorLayers.value.find((layer) => layer.id === 'background') || null)
const interiorOverlayLayers = computed(() => interiorLayers.value.filter((layer) => layer.id !== 'background'))

// ============================================================================
// WebP Loading
// ============================================================================

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

// ============================================================================
// Stage Animation (GSAP)
// ============================================================================

const HOUSE_STAGE_TRANSITION = {
  outgoingDuration: 0.6,
  incomingDuration: 1.45,
  incomingDelay: 0.06,
  settleDelay: 0.25
}

const PARTICLE_LIFETIME_MS = 1800

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function transitionHouseStage(nextUrl, { isInitial = false } = {}) {
  if (!nextUrl) return

  try {
    assetError.value = ''
    await preloadImage(nextUrl)
  } catch (error) {
    console.error(error)
    assetError.value = '집 이미지를 불러오지 못했어요'
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
  if (incomingEl) gsap.set(incomingEl, { opacity: 0, y: 28, scale: 0.94, filter: 'blur(10px)' })
  if (outgoingEl) gsap.set(outgoingEl, { filter: 'blur(0px)' })

  const tl = gsap.timeline({
    onComplete: () => {
      houseOutgoingUrl.value = ''
      nextTick(() => startIdleAnimation(houseStageRef.value))
    }
  })

  if (outgoingEl) {
    tl.to(outgoingEl, {
      duration: HOUSE_STAGE_TRANSITION.outgoingDuration,
      opacity: 0,
      scale: 1.01,
      y: -10,
      filter: 'blur(10px)',
      ease: 'power2.inOut',
      clearProps: 'transform,filter'
    }, 0)
  }

  if (incomingEl) {
    tl.to(incomingEl, {
      duration: HOUSE_STAGE_TRANSITION.incomingDuration,
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      ease: 'power3.out',
      clearProps: 'transform,filter'
    }, HOUSE_STAGE_TRANSITION.incomingDelay)
  }

  tl.to({}, { duration: HOUSE_STAGE_TRANSITION.settleDelay })
}

// ============================================================================
// Idle & Entry Animation
// ============================================================================

function enableIdleAnimation(target) {
  if (!target) return
  target.classList.add('idle-float')
}

function playEntryAnimation(target) {
  if (!target) return

  gsap.killTweensOf(target)
  gsap.set(target, { opacity: 0, y: 45, scale: 0.75 })

  if (prefersReducedMotion()) {
    gsap.set(target, { opacity: 1, y: 0, scale: 1, clearProps: 'all' })
    enableIdleAnimation(target)
    return
  }

  gsap.to(target, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.25,
    ease: 'power3.out',
    onComplete: () => {
      gsap.set(target, { clearProps: 'all' })
      enableIdleAnimation(target)
    }
  })
}

function startIdleAnimation(target) {
  if (!target) return
  gsap.killTweensOf(target)
  gsap.set(target, { clearProps: 'all' })
  enableIdleAnimation(target)
}

// ============================================================================
// Particle Effects
// ============================================================================

function spawnParticles() {
  const container = particlesRef.value
  if (!container) return

  const colors = ['#ff6b3d', '#ff9a75', '#ffd700', '#81c784', '#66bb6a']

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'

    const color = colors[Math.floor(Math.random() * colors.length)]
    particle.style.backgroundColor = color

    const startX = 50 + (Math.random() - 0.5) * 20
    const startY = 50 + (Math.random() - 0.5) * 20
    particle.style.left = `${startX}%`
    particle.style.top = `${startY}%`

    const angle = Math.random() * 360 * (Math.PI / 180)
    const distance = 100 + Math.random() * 100
    particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}%`)
    particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}%`)

    container.appendChild(particle)
    setTimeout(() => particle.remove(), PARTICLE_LIFETIME_MS)
  }
}

// ============================================================================
// Watchers
// ============================================================================

watch(activeStage, (newStage, oldStage) => {
  if (oldStage && newStage > oldStage) {
    spawnParticles()
  }
})

// 집 완공(레벨 6 도달) 시 인테리어 시작 모달 표시
watch(effectiveTrack, (track, prevTrack) => {
  if (track === prevTrack) return
  displayTrack.value = track
  if (track !== 'furniture') {
    isUnlockModalOpen.value = false
  }
}, { immediate: true })

watch(goalPhase, (nextPhase, prevPhase) => {
  if (!useGoalPhase.value) return
  const nextValue = Number(nextPhase)
  if (!Number.isFinite(nextValue) || nextValue <= 0) return

  const prevValue = Number.isFinite(prevPhase) && prevPhase > 0
    ? prevPhase
    : lastGoalPhase.value

  if (Number.isFinite(prevValue)
    && prevValue <= DEFAULT_TOTAL_STEPS
    && nextValue > DEFAULT_TOTAL_STEPS) {
    isUnlockModalOpen.value = true
  }

  lastGoalPhase.value = nextValue
})

watch(displayTrack, async (track) => {
  assetError.value = ''
  isLoading.value = true

  try {
    if (track === 'house') {
      await transitionHouseStage(houseStageUrl.value, { isInitial: !houseIncomingUrl.value })
      await nextTick()
      playEntryAnimation(houseStageRef.value)
    } else {
      const bg = interiorBackgroundLayer.value
      if (bg?.url) await preloadImage(bg.url)
      await nextTick()
      playEntryAnimation(furnitureStageRef.value)
    }
  } catch (error) {
    console.error(error)
    assetError.value = '게이미피케이션 이미지를 불러오지 못했어요'
  } finally {
    isLoading.value = false
  }
})

watch(houseStageUrl, async (newUrl, oldUrl) => {
  if (!isHouseTrack.value || !newUrl || newUrl === oldUrl) return
  await transitionHouseStage(newUrl)
})

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  try {
    isLoading.value = true
    if (isHouseTrack.value) {
      await transitionHouseStage(houseStageUrl.value, { isInitial: true })
      await nextTick()
      playEntryAnimation(houseStageRef.value)
    } else {
      const bg = interiorBackgroundLayer.value
      if (bg?.url) await preloadImage(bg.url)
      await nextTick()
      playEntryAnimation(furnitureStageRef.value)
    }
  } catch (error) {
    console.error('Failed to load gamification images', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Clean up GSAP animations
  if (houseStageRef.value) gsap.killTweensOf(houseStageRef.value)
  if (furnitureStageRef.value) gsap.killTweensOf(furnitureStageRef.value)
})

async function handleUnlockConfirm() {
  isUnlockModalOpen.value = false

  if (useGoalPhase.value) {
    return
  }
}
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
  padding: 0.5rem;
  position: relative;
  overflow: visible;
}


.scene-card {
  position: relative;
  border-radius: 16px;
  overflow: visible;
  padding: 0.1rem 0.5rem 0.75rem;
}

.scene-inner {
  position: relative;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Stage */
.stage-frame {
  width: 100%;
  max-width: 540px;
  will-change: transform, opacity;
  transform-origin: center bottom;
  position: relative;
}

.stage-img {
  width: 100%;
  height: auto;
  display: block;
}

.stage-img--overlay,
.layer-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
}

.stage-img--overlay {
  z-index: 2;
}

.stage-img--base {
  position: relative;
  z-index: 1;
}

.stage-frame--layers {
  max-width: 520px;
}

/* Idle Float Animation */
@keyframes idle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.stage-frame.idle-float {
  animation: idle-float 3.5s ease-in-out infinite;
}

/* Loading & Error */
.stage-loader,
.stage-fallback {
  text-align: center;
  color: var(--showroom-text-secondary-day, #8d6e63);
  font-weight: 600;
}

html[data-theme='night'] .stage-loader,
html[data-theme='night'] .stage-fallback {
  color: var(--showroom-text-secondary-night, #d7ccc8);
}

/* Stage Message */
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



/* Progress Dots */
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
  animation: dot-pop 2.2s ease-in-out infinite;
}

@keyframes dot-pop {
  0%, 100% { transform: scale(1.12); }
  50% { transform: scale(1.22); }
}

html[data-theme='night'] .dot {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

/* Particles */
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 10;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  animation: particle-fly 1.8s ease-out forwards;
  box-shadow: 0 0 8px currentColor;
}

@keyframes particle-fly {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { transform: translate(var(--end-x, 100%), var(--end-y, -100%)) scale(0); opacity: 0; }
}

/* Furniture Layers */
.layer-img {
  opacity: 0;
  transition: opacity 0.45s ease, transform 0.45s ease;
  z-index: 3;
}

.layer-visible {
  opacity: 1;
  transform: translateY(0);
}

.layer-hidden {
  opacity: 0;
  transform: translateY(-12px);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .stage-frame,
  .stage-frame.idle-float,
  .dot.active {
    animation: none !important;
  }
}

/* ============================================
   No Goal Empty State
   ============================================ */

/* Blur effect on images when no goal */
.scene-inner--no-goal .stage-frame {
  filter: blur(8px);
  opacity: 0.5;
  pointer-events: none;
}

/* Overlay container */
.no-goal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* CTA Card */
.no-goal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 1.75rem 2rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  max-width: 280px;
}

html[data-theme='night'] .no-goal-card {
  background: rgba(40, 42, 48, 0.92);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.no-goal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 107, 61, 0.15), 
    rgba(255, 154, 117, 0.1)
  );
  color: var(--brand-accent, #ff6b3d);
}

html[data-theme='night'] .no-goal-icon {
  background: linear-gradient(135deg,
    rgba(255, 107, 61, 0.25),
    rgba(255, 154, 117, 0.15)
  );
}

.no-goal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

html[data-theme='night'] .no-goal-title {
  color: var(--showroom-text-night, #f5f6f7);
}

.no-goal-desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ink-muted, #6b7280);
  line-height: 1.5;
}

html[data-theme='night'] .no-goal-desc {
  color: rgba(245, 246, 247, 0.7);
}

/* CTA Button - 전역 btn btn-primary 사용, 최소한의 로컬 조정만 */
.no-goal-cta {
  margin-top: 0.5rem;
}

/* Fade transition for overlay */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .hero-card {
    padding: 0.9rem;
    max-width: 100%;
  }

  .scene-inner {
    min-height: 200px;
  }

  .no-goal-card {
    padding: 1.25rem 1.5rem;
    max-width: 260px;
  }

  .no-goal-icon {
    width: 56px;
    height: 56px;
  }

  .no-goal-title {
    font-size: 1rem;
  }
}
</style>
