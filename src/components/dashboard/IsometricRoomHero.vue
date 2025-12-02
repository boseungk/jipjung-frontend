<template>
  <div class="gamified-hero">
    <div class="hero-card">
      <div class="floating-chip">
        <span class="chip-dot"></span>
        <span class="chip-text">Live Render</span>
      </div>

      <div class="hero-header">
        <div class="badge-chip">
          <div class="icon-circle">
            <AppIcon
              :name="isHouseTrack ? 'house' : 'armchair'"
              :size="24"
              :active="true"
              :is-major-cta="true"
            />
          </div>
          <div class="badge-text">
            <p class="eyebrow">{{ trackLabel }}</p>
            <p class="title">{{ currentStep.title }}</p>
            <p class="subtitle">스텝 {{ activeStage }} / {{ totalStages }}</p>
          </div>
        </div>

        <div class="hero-actions">
          <span class="dday-chip">D-{{ daysRemaining }}</span>
          <button class="reset-btn" type="button" @click="resetHouseProgress">
            진행 초기화
          </button>
        </div>
      </div>

      <div class="scene-card">
        <div class="ambient-glow"></div>
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
          <p class="stage-eyebrow">{{ currentStep.label }}</p>
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
import { formatNumber } from '../../utils/formatters'

const HOUSE_STEPS = [
  { id: 1, title: '기초 공사', label: '씨앗 심기', message: '토대를 다지고 집나무를 심었어요.' },
  { id: 2, title: '뼈대 세우기', label: '기둥 올리기', message: '튼튼한 골조가 올라가요.' },
  { id: 3, title: '벽 세우기', label: '벽체 완성', message: '방의 윤곽이 드러나고 있어요.' },
  { id: 4, title: '창문·문 달기', label: '개구부 완성', message: '빛과 바람이 드나드는 집이 되네요.' },
  { id: 5, title: '지붕 올리기', label: '지붕 마감', message: '집의 형태가 완성 단계예요.' },
  { id: 6, title: '인테리어 공정', label: '마감재 설치', message: '내부를 정돈하고 있어요.' },
  { id: 7, title: '입주 준비 완료', label: '완공', message: '집이 완성됐어요! 이제 가구를 채워요.' }
]

const FURNITURE_STEPS = [
  { id: 1, title: '배경 준비', label: '바닥·벽 정돈', message: '배경과 바닥을 깔끔하게 준비했어요.' },
  { id: 2, title: '소파 배치', label: '휴식 공간', message: '소파가 들어와 거실이 만들어졌어요.' },
  { id: 3, title: '테이블 추가', label: '기능 더하기', message: '테이블과 수납이 배치됐어요.' },
  { id: 4, title: '조명 켜기', label: '분위기 완성', message: '램프로 공간이 따뜻해졌어요.' },
  { id: 5, title: '소품 마무리', label: '디테일', message: '소품까지 채워 완성했어요!' }
]

const houseSvgMarkup = ref('')
const furnitureSvgMarkup = ref('')
const houseSvgRef = ref(null)
const furnitureSvgRef = ref(null)
const svgError = ref('')
const isLoading = ref(true)

const gamificationStore = useGamificationStore()
const {
  buildTrack,
  houseStage,
  furnitureStage,
  experiencePoints,
  nextLevelExp,
  expProgress,
  remainingExp,
  latestBadge
} = storeToRefs(gamificationStore)
const { resetHouseProgress } = gamificationStore

const dreamHomeStore = useDreamHomeStore()
const { currentAmount, targetAmount, daysRemaining } = storeToRefs(dreamHomeStore)

const isHouseTrack = computed(() => buildTrack.value === 'house')
const activeStage = computed(() =>
  isHouseTrack.value ? houseStage.value : Math.max(1, furnitureStage.value || 1)
)
const totalStages = computed(() => (isHouseTrack.value ? HOUSE_STEPS.length : FURNITURE_STEPS.length))
const stageList = computed(() => (isHouseTrack.value ? HOUSE_STEPS : FURNITURE_STEPS))
const currentStep = computed(
  () => stageList.value[Math.min(stageList.value.length - 1, activeStage.value - 1)] || stageList.value[0]
)
const trackLabel = computed(() => (isHouseTrack.value ? '집 짓기' : '가구 채우기'))

async function loadHouseSvg() {
  if (houseSvgMarkup.value || svgError.value) return
  try {
    const res = await fetch('/phase7.svg')
    if (!res.ok) throw new Error('집 SVG를 불러오지 못했습니다')
    houseSvgMarkup.value = await res.text()
    await nextTick()
    applyHouseStage()
  } catch (error) {
    svgError.value = '집 SVG를 불러오지 못했어요'
    console.error(error)
  }
}

async function loadFurnitureSvg() {
  if (furnitureSvgMarkup.value || svgError.value) return
  try {
    const res = await fetch('/figure.svg')
    if (!res.ok) throw new Error('가구 SVG를 불러오지 못했습니다')
    furnitureSvgMarkup.value = await res.text()
    await nextTick()
    applyFurnitureStage()
  } catch (error) {
    svgError.value = '가구 SVG를 불러오지 못했어요'
    console.error(error)
  }
}

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

function applyFurnitureStage() {
  const wrapper = furnitureSvgRef.value
  if (!wrapper) return
  const svg = wrapper.querySelector('svg')
  if (!svg) return

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
    // Show cumulative layers (stage 1 shows background+sofa)
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

async function ensureActiveSvg(track) {
  isLoading.value = true
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

watch([buildTrack, houseStage, furnitureStage], () => {
  nextTick(() => {
    if (isHouseTrack.value) {
      applyHouseStage()
    } else {
      applyFurnitureStage()
    }
  })
})

watch(houseSvgMarkup, () => nextTick(applyHouseStage))
watch(furnitureSvgMarkup, () => nextTick(applyFurnitureStage))

watch(buildTrack, async (track) => {
  await ensureActiveSvg(track)
})

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
  padding: 1rem 0 1.5rem;
  display: flex;
  justify-content: center;
}

.hero-card {
  width: 100%;
  max-width: 920px;
  background: linear-gradient(135deg, #ffffff, #f9fafb);
  border-radius: 16px;
  padding: 1.1rem 1.1rem 1rem;
  box-shadow: 0 18px 38px -24px rgba(17, 24, 39, 0.18);
  border: 1px solid #edf0f4;
  position: relative;
  overflow: hidden;
}

html[data-theme='night'] .hero-card {
  background: linear-gradient(135deg, rgba(32, 36, 42, 0.94), rgba(26, 28, 32, 0.92));
  box-shadow: 0 20px 48px -20px rgba(0, 0, 0, 0.62);
  border: 1.25px solid rgba(255, 255, 255, 0.08);
}

.floating-chip {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  box-shadow: 0 12px 24px -14px rgba(17, 24, 39, 0.22);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff6b3d;
  box-shadow: 0 0 0 6px rgba(255, 107, 61, 0.12);
}

.chip-text {
  letter-spacing: 0.02em;
}

.hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.badge-text .eyebrow {
  font-size: 0.82rem;
  color: var(--ink-muted, #6b7280);
  letter-spacing: 0.02em;
}

html[data-theme='night'] .badge-text .eyebrow {
  color: rgba(245, 246, 247, 0.8);
}

.badge-text .title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0.1rem 0;
  letter-spacing: -0.01em;
}

html[data-theme='night'] .badge-text .title {
  color: var(--showroom-text-night, #f5f6f7);
}

.badge-text .subtitle {
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

html[data-theme='night'] .badge-text .subtitle {
  color: rgba(245, 246, 247, 0.75);
}

.reset-btn {
  padding: 0.42rem 0.78rem;
  border-radius: 10px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: #f7f8fa;
  color: var(--ink-base, #1f2937);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
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
  overflow: hidden;
  margin-top: 0.55rem;
  padding: 1.05rem 0.95rem 0.9rem;
  background: #ffffff;
  border: 1px solid #edf0f4;
  backdrop-filter: blur(6px);
  box-shadow: 0 16px 32px -20px rgba(17, 24, 39, 0.18);
}

html[data-theme='night'] .scene-card {
  background: rgba(32, 36, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 32px -18px rgba(0, 0, 0, 0.65);
}

.ambient-glow {
  position: absolute;
  inset: 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
  filter: blur(42px);
  pointer-events: none;
  z-index: 0;
}

html[data-theme='night'] .ambient-glow {
  background: radial-gradient(circle, rgba(255, 138, 92, 0.2), rgba(255, 138, 92, 0));
  filter: blur(52px);
}

.scene-inner {
  position: relative;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.svg-stage {
  width: 100%;
  max-width: 540px;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.08));
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
  text-align: left;
}

.stage-eyebrow {
  font-size: 0.9rem;
  color: var(--ink-muted, #6b7280);
  letter-spacing: 0.02em;
}

html[data-theme='night'] .stage-eyebrow {
  color: rgba(245, 246, 247, 0.75);
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
  justify-content: flex-start;
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
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.12));
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
