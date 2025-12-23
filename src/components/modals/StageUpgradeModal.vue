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
          <div class="stage-showcase">
            <div ref="stageFrameRef" class="stage-frame">
              <!-- House Track: Single Image Transition -->
              <template v-if="track === 'house'">
                <img 
                  ref="previousImgRef"
                  :src="previousStageImageUrl" 
                  :alt="`이전 단계: ${previousStage}`"
                  class="stage-img stage-img--previous"
                  @error="handleImageError"
                />
                <img 
                  ref="currentImgRef"
                  :src="currentStageImageUrl" 
                  :alt="`현재 단계: ${currentStage}`"
                  class="stage-img stage-img--current"
                  @error="handleImageError"
                />
              </template>
              
              <!-- Furniture Track: Multi-Layer Interior -->
              <template v-else>
                <!-- Background layer (always visible) -->
                <img 
                  v-if="interiorBackground"
                  :src="interiorBackground.url"
                  class="stage-img stage-img--base"
                  alt="인테리어 배경"
                />
                <!-- Previous state overlay layers (will fade out) -->
                <div ref="previousImgRef" class="interior-layers interior-layers--previous">
                  <img 
                    v-for="layer in previousVisibleLayers"
                    :key="`prev-${layer.id}`"
                    :src="layer.url"
                    class="interior-layer"
                    :alt="layer.id"
                  />
                </div>
                <!-- Current state overlay layers (will animate in) -->
                <div ref="currentImgRef" class="interior-layers interior-layers--current">
                  <img 
                    v-for="layer in currentVisibleLayers"
                    :key="`curr-${layer.id}`"
                    :src="layer.url"
                    class="interior-layer"
                    :alt="layer.id"
                  />
                </div>
              </template>
            </div>
            <div class="stage-badge">
              <span class="badge-previous">{{ previousStage }}단계</span>
              <span class="badge-arrow">→</span>
              <span class="badge-current">{{ currentStage }}단계</span>
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
 * - House 트랙: 외관 이미지 전환
 * - Furniture 트랙: 인테리어 레이어 전환
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { 
  getExteriorStageUrl, 
  getInteriorLayerUrls, 
  getInteriorVisibleLayerIds,
  SHOWROOM_TOTAL_STAGES 
} from '@/constants/showroomWebp'
import { useAuthStore } from '@/stores/authStore'

// ============================================================================
// Animation Constants
// ============================================================================

const STAGE_TRANSITION = {
  recognitionDelay: 0.8,
  previousFadeOut: 0.7,
  currentPopIn: 1.2,
  currentDelay: 0.3
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  previousStage: { type: Number, required: true },
  currentStage: { type: Number, required: true },
  track: { type: String, default: 'house', validator: (v) => ['house', 'furniture'].includes(v) },
  levelLabel: { type: String, default: '' },
  remainingExp: { type: Number, default: 0 }
})

const emit = defineEmits(['confirm'])

// ============================================================================
// Stores & Refs
// ============================================================================

const authStore = useAuthStore()

const confirmButtonRef = ref(null)
const effectsRef = ref(null)
const stageFrameRef = ref(null)
const previousImgRef = ref(null)
const currentImgRef = ref(null)

// ============================================================================
// Computed Properties
// ============================================================================

const themeCode = computed(() => authStore.userShowroom?.themeCode || 'CLASSIC')

// ----- House Track Images -----
const previousStageImageUrl = computed(() => {
  if (props.track === 'furniture') return ''
  return getExteriorStageUrl(themeCode.value, props.previousStage)
})

const currentStageImageUrl = computed(() => {
  if (props.track === 'furniture') return ''
  return getExteriorStageUrl(themeCode.value, props.currentStage)
})

// ----- Furniture Track Layers -----
const interiorLayers = computed(() => getInteriorLayerUrls(themeCode.value))
const interiorLayerIds = computed(() => interiorLayers.value.map(l => l.id))

const interiorBackground = computed(() => 
  interiorLayers.value.find(l => l.id === 'background')
)

const interiorOverlayLayers = computed(() => 
  interiorLayers.value.filter(l => l.id !== 'background')
)

const previousVisibleLayerIds = computed(() => 
  getInteriorVisibleLayerIds(interiorLayerIds.value, props.previousStage)
)

const currentVisibleLayerIds = computed(() => 
  getInteriorVisibleLayerIds(interiorLayerIds.value, props.currentStage)
)

const previousVisibleLayers = computed(() => 
  interiorOverlayLayers.value.filter(l => previousVisibleLayerIds.value.has(l.id))
)

const currentVisibleLayers = computed(() => 
  interiorOverlayLayers.value.filter(l => currentVisibleLayerIds.value.has(l.id))
)

// ----- UI Text -----
const titleText = computed(() => {
  if (props.track === 'furniture') return '인테리어 업그레이드!'
  if (props.currentStage >= SHOWROOM_TOTAL_STAGES.house) return '집 완공!'
  return '단계 상승!'
})

const defaultMessage = computed(() => {
  if (props.track === 'furniture') return '집이 더 아늑해졌어요!'
  return '집이 한 단계 성장했어요!'
})

const showNextGoalInfo = computed(() => {
  const totalStages = SHOWROOM_TOTAL_STAGES[props.track]
  return props.currentStage < totalStages
})

const remainingExpText = computed(() => {
  const remaining = Number(props.remainingExp) || 0
  return `${remaining.toLocaleString()} XP`
})

// ============================================================================
// Animation Methods
// ============================================================================

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function playStageTransition() {
  const previousEl = previousImgRef.value
  const currentEl = currentImgRef.value

  if (!previousEl || !currentEl) return

  if (prefersReducedMotion()) {
    gsap.set(previousEl, { opacity: 0 })
    gsap.set(currentEl, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
    return
  }

  gsap.killTweensOf([previousEl, currentEl])

  // Initial state
  gsap.set(previousEl, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
  gsap.set(currentEl, { opacity: 0, y: 32, scale: 0.92, filter: 'blur(12px)' })

  const tl = gsap.timeline()

  // Phase 1: Recognition time
  tl.to({}, { duration: STAGE_TRANSITION.recognitionDelay })

  // Phase 2: Previous fadeout (up + blur)
  tl.to(previousEl, {
    duration: STAGE_TRANSITION.previousFadeOut,
    opacity: 0,
    y: -16,
    scale: 1.03,
    filter: 'blur(12px)',
    ease: 'power2.inOut'
  })

  // Phase 3: Current pop in (from below)
  tl.to(currentEl, {
    duration: STAGE_TRANSITION.currentPopIn,
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    ease: 'power3.out'
  }, `-=${STAGE_TRANSITION.currentDelay}`)

  // Phase 4: Enable idle float
  tl.call(() => {
    if (stageFrameRef.value) {
      stageFrameRef.value.classList.add('idle-float')
    }
  })
}

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
      top: `${40 + (Math.random() - 0.5) * 20}%`
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

// ============================================================================
// Event Handlers
// ============================================================================

function handleConfirm() {
  if (previousImgRef.value) gsap.killTweensOf(previousImgRef.value)
  if (currentImgRef.value) gsap.killTweensOf(currentImgRef.value)
  if (stageFrameRef.value) stageFrameRef.value.classList.remove('idle-float')

  emit('confirm')
  scrollToHeroSection()
}

function scrollToHeroSection() {
  nextTick(() => {
    const heroElement = document.querySelector('.gamified-hero')
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function handleImageError(event) {
  event.target.src = getExteriorStageUrl('CLASSIC', 1)
}

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
    playStageTransition()
    spawnCelebrationParticles()
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (previousImgRef.value) gsap.killTweensOf(previousImgRef.value)
  if (currentImgRef.value) gsap.killTweensOf(currentImgRef.value)
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
  max-width: 480px;
  border-radius: 28px;
  padding: 2.5rem 2rem;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
   Stage Showcase
   ============================================================================ */
.stage-showcase {
  position: relative;
  z-index: 2;
  margin-bottom: 1.25rem;
}

.stage-frame {
  position: relative;
  width: 240px;
  height: 240px;
  margin: 0 auto 1rem;
  will-change: transform;
  transform-origin: center bottom;
}

.stage-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}

.stage-img--previous {
  z-index: 1;
}

.stage-img--current {
  z-index: 2;
}

.stage-img--base {
  z-index: 0;
}

/* ============================================================================
   Interior Layers (Furniture Track)
   ============================================================================ */
.interior-layers {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.interior-layers--previous {
  z-index: 1;
}

.interior-layers--current {
  z-index: 2;
}

.interior-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ============================================================================
   Idle Float Animation
   ============================================================================ */
@keyframes idle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.stage-frame.idle-float {
  animation: idle-float 3s ease-in-out infinite;
}

/* ============================================================================
   Stage Badge
   ============================================================================ */
.stage-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-previous {
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.7;
}

html[data-theme="night"] .badge-previous {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.badge-arrow {
  color: var(--brand-accent, #ff6b3d);
}

.badge-current {
  color: var(--brand-accent, #ff6b3d);
  font-weight: 700;
}

html[data-theme="night"] .badge-current {
  color: var(--showroom-accent-night, #D4A574);
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
   Confirm Button
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
   Reduced Motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .stage-frame,
  .stage-frame.idle-float {
    animation: none !important;
  }
}

/* ============================================================================
   Responsive
   ============================================================================ */
@media (max-width: 480px) {
  .modal-container {
    padding: 2rem 1.5rem;
    max-width: 95%;
  }

  .stage-frame {
    width: 180px;
    height: 180px;
  }

  .modal-title {
    font-size: 1.35rem;
  }
}
</style>
