<template>
  <Teleport to="body">
    <transition name="modal">
      <div 
        v-if="isOpen" 
        class="modal-overlay" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-upgrade-title"
        @click.self="handleConfirm"
      >
        <div class="modal-container" @click.stop>
          <!-- Particle Effects Layer -->
          <div ref="effectsRef" class="effects-layer" aria-hidden="true"></div>
          
          <!-- Stage Transition Visual -->
          <div class="stage-transition">
            <div class="stage-card stage-card--previous">
              <img 
                :src="previousStageImageUrl" 
                :alt="`이전 단계: ${previousStage}`"
                class="stage-image"
                @error="handleImageError"
              />
              <span class="stage-label">{{ previousStage }}단계</span>
            </div>

            <div class="transition-arrow" aria-hidden="true">
              <PhArrowRight :size="28" weight="bold" />
            </div>

            <div class="stage-card stage-card--current">
              <img 
                :src="currentStageImageUrl" 
                :alt="`현재 단계: ${currentStage}`"
                class="stage-image"
                @error="handleImageError"
              />
              <span class="stage-label">{{ currentStage }}단계</span>
            </div>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <h2 id="stage-upgrade-title" class="modal-title">
              🎉 {{ titleText }}
            </h2>
            <p class="modal-message">
              {{ levelLabel || defaultMessage }}
            </p>

            <!-- Next Goal Info -->
            <div v-if="showNextGoalInfo" class="next-goal-info">
              <span class="next-goal-label">다음 단계까지</span>
              <span class="next-goal-value">{{ remainingExpText }}</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <button 
            ref="confirmButtonRef"
            type="button"
            class="confirm-button"
            @click="handleConfirm"
          >
            확인
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
/**
 * StageUpgradeModal
 * 
 * 저축 후 단계(house/furniture)가 상승할 때 축하 모달을 표시합니다.
 * 
 * Features:
 * - Before/After 이미지 전환 애니메이션
 * - Confetti 파티클 효과
 * - 다음 목표까지 남은 정보 표시
 * - 확인 시 Hero Section으로 스크롤
 * 
 * @example
 * <StageUpgradeModal
 *   :is-open="isStageUpModalOpen"
 *   :previous-stage="upgradeInfo.previousStage"
 *   :current-stage="upgradeInfo.currentStage"
 *   track="house"
 *   level-label="2층 골조 공사"
 *   @confirm="handleStageUpConfirm"
 * />
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import { getExteriorStageUrl, getInteriorLayerUrls, SHOWROOM_TOTAL_STAGES } from '@/constants/showroomWebp'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '@/stores/gamificationStore'

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  /** 모달 열림 상태 */
  isOpen: {
    type: Boolean,
    default: false
  },
  /** 이전 단계 번호 */
  previousStage: {
    type: Number,
    required: true
  },
  /** 현재(새) 단계 번호 */
  currentStage: {
    type: Number,
    required: true
  },
  /** 트랙 타입: 'house' | 'furniture' */
  track: {
    type: String,
    default: 'house',
    validator: (v) => ['house', 'furniture'].includes(v)
  },
  /** 레벨 라벨 (백엔드에서 제공) */
  levelLabel: {
    type: String,
    default: ''
  },
  /** 다음 레벨까지 남은 경험치 */
  remainingExp: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['confirm'])

// ============================================================================
// Stores & Refs
// ============================================================================

const authStore = useAuthStore()
const gamificationStore = useGamificationStore()
const { remainingExp: storeRemainingExp } = storeToRefs(gamificationStore)

const confirmButtonRef = ref(null)
const effectsRef = ref(null)

// ============================================================================
// Computed Properties
// ============================================================================

/** 사용자 테마 코드 */
const themeCode = computed(() => authStore.userShowroom?.themeCode || 'CLASSIC')

/** 이전 단계 이미지 URL */
const previousStageImageUrl = computed(() => {
  if (props.track === 'furniture') {
    // 인테리어는 최종 외관 이미지 사용
    return getExteriorStageUrl(themeCode.value, SHOWROOM_TOTAL_STAGES.house)
  }
  return getExteriorStageUrl(themeCode.value, props.previousStage)
})

/** 현재 단계 이미지 URL */
const currentStageImageUrl = computed(() => {
  if (props.track === 'furniture') {
    // 인테리어도 외관 이미지 (실제로는 인테리어 레이어가 변경됨)
    return getExteriorStageUrl(themeCode.value, SHOWROOM_TOTAL_STAGES.house)
  }
  return getExteriorStageUrl(themeCode.value, props.currentStage)
})

/** 타이틀 텍스트 */
const titleText = computed(() => {
  if (props.track === 'furniture') {
    return '인테리어 업그레이드!'
  }
  const totalStages = SHOWROOM_TOTAL_STAGES.house
  if (props.currentStage >= totalStages) {
    return '집 완공!'
  }
  return '단계 상승!'
})

/** 기본 메시지 */
const defaultMessage = computed(() => {
  if (props.track === 'furniture') {
    return '집이 더 아늑해졌어요!'
  }
  return '집이 한 단계 성장했어요!'
})

/** 다음 목표 정보 표시 여부 */
const showNextGoalInfo = computed(() => {
  const totalStages = SHOWROOM_TOTAL_STAGES[props.track]
  return props.currentStage < totalStages
})

/** 남은 경험치 텍스트 */
const remainingExpText = computed(() => {
  const remaining = props.remainingExp || storeRemainingExp.value || 0
  return `${remaining.toLocaleString()} XP`
})

// ============================================================================
// Methods
// ============================================================================

/**
 * 시스템 설정에서 모션 감소 선호 여부 확인
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 축하 파티클 효과 생성
 * ShowroomUnlockModal.vue 패턴 재사용
 */
function spawnCelebrationParticles() {
  const container = effectsRef.value
  if (!container || prefersReducedMotion()) return

  const colors = ['#ff6b3d', '#ff9a75', '#ffd700', '#22c55e', '#60a5fa', '#a78bfa']
  const particleCount = 36

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'effect-particle'

    const color = colors[Math.floor(Math.random() * colors.length)]
    Object.assign(particle.style, {
      color,
      backgroundColor: color,
      left: `${50 + (Math.random() - 0.5) * 20}%`,
      top: `${50 + (Math.random() - 0.5) * 16}%`
    })

    const angle = Math.random() * 360 * (Math.PI / 180)
    const distance = 80 + Math.random() * 100
    particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}%`)
    particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}%`)

    const size = 5 + Math.random() * 7
    const duration = 1200 + Math.random() * 600
    particle.style.setProperty('--size', `${size}px`)
    particle.style.setProperty('--duration', `${duration}ms`)

    container.appendChild(particle)
    setTimeout(() => particle.remove(), duration + 100)
  }
}

/**
 * 확인 버튼 클릭 핸들러
 */
function handleConfirm() {
  emit('confirm')
  scrollToHeroSection()
}

/**
 * Hero Section으로 부드럽게 스크롤
 */
function scrollToHeroSection() {
  nextTick(() => {
    const heroElement = document.querySelector('.gamified-hero')
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

/**
 * 이미지 로드 실패 시 폴백 처리
 */
function handleImageError(event) {
  event.target.src = getExteriorStageUrl('CLASSIC', 1)
}

/**
 * 키보드 이벤트 핸들러 (ESC, Enter)
 */
function handleKeydown(event) {
  if (!props.isOpen) return
  if (event.key === 'Escape' || event.key === 'Enter') {
    event.preventDefault()
    handleConfirm()
  }
}

// ============================================================================
// Watchers & Lifecycle
// ============================================================================

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) return
    await nextTick()
    confirmButtonRef.value?.focus()
    spawnCelebrationParticles()
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* ============================================================================
   Modal Overlay
   ============================================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
}

html[data-theme="day"] .modal-overlay {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

html[data-theme="night"] .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* ============================================================================
   Modal Container
   ============================================================================ */
.modal-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  padding: 2rem 1.75rem;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.45),
    0 0 40px rgba(212, 165, 116, 0.15);
}

/* ============================================================================
   Effects Layer (Particles)
   ============================================================================ */
.effects-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.effect-particle {
  position: absolute;
  width: var(--size, 8px);
  height: var(--size, 8px);
  border-radius: 50%;
  opacity: 0;
  filter: drop-shadow(0 0 8px currentColor);
  animation: particle-burst var(--duration, 1400ms) ease-out forwards;
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(0.8);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  75% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--end-x, 70%), var(--end-y, -70%)) scale(0);
    opacity: 0;
  }
}

/* ============================================================================
   Stage Transition Visual
   ============================================================================ */
.stage-transition {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stage-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stage-card--previous {
  opacity: 0.65;
  transform: scale(0.9);
}

.stage-card--current {
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes pop-in {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.stage-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 16px;
  background: var(--surface-muted, rgba(0, 0, 0, 0.03));
}

html[data-theme="night"] .stage-image {
  background: rgba(255, 255, 255, 0.05);
}

.stage-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .stage-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.transition-arrow {
  color: var(--brand-accent, #ff6b3d);
  animation: arrow-pulse 1.2s ease-in-out infinite;
}

@keyframes arrow-pulse {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.7;
  }
  50% {
    transform: translateX(4px);
    opacity: 1;
  }
}

/* ============================================================================
   Content
   ============================================================================ */
.modal-content {
  position: relative;
  z-index: 2;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.modal-message {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .modal-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* ============================================================================
   Next Goal Info
   ============================================================================ */
.next-goal-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  margin-bottom: 1.25rem;
  background: rgba(255, 107, 61, 0.08);
  border-radius: 12px;
  font-size: 0.875rem;
}

html[data-theme="night"] .next-goal-info {
  background: rgba(212, 165, 116, 0.1);
}

.next-goal-label {
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .next-goal-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.next-goal-value {
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
}

html[data-theme="night"] .next-goal-value {
  color: var(--showroom-accent-night, #D4A574);
}

/* ============================================================================
   Confirm Button (extends global .confirm-button)
   ============================================================================ */
.confirm-button {
  position: relative;
  z-index: 2;
}

/* ============================================================================
   Modal Transitions
   ============================================================================ */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.28s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.94);
  opacity: 0;
}

/* ============================================================================
   Responsive
   ============================================================================ */
@media (max-width: 480px) {
  .modal-container {
    padding: 1.5rem 1.25rem;
  }

  .stage-image {
    width: 80px;
    height: 80px;
  }

  .modal-title {
    font-size: 1.25rem;
  }
}
</style>
