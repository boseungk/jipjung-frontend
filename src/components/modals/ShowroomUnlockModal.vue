<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="handleConfirm">
      <div class="modal-container" role="dialog" aria-modal="true" @click.stop>
        <div ref="effectsRef" class="effects-layer" aria-hidden="true"></div>

        <div class="icon-wrap">
          <AppIcon name="confetti" :size="56" :active="true" :is-major-cta="true" />
        </div>

        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>

        <button ref="confirmButtonRef" class="confirm-button" type="button" @click="handleConfirm">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '내 집 완공!'
  },
  message: {
    type: String,
    default: '축하해요! 이제 방을 꾸밀 수 있어요.'
  },
  buttonText: {
    type: String,
    default: '인테리어 시작하기'
  }
})

const emit = defineEmits(['confirm'])

const confirmButtonRef = ref(null)
const effectsRef = ref(null)

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function spawnCelebrationParticles() {
  const container = effectsRef.value
  if (!container || prefersReducedMotion()) return

  const colors = ['#ff6b3d', '#ff9a75', '#ffd700', '#22c55e', '#60a5fa', '#a78bfa']
  const count = 44

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    particle.className = 'effect-particle'

    const color = colors[Math.floor(Math.random() * colors.length)]
    particle.style.color = color
    particle.style.backgroundColor = color

    const startX = 50 + (Math.random() - 0.5) * 18
    const startY = 56 + (Math.random() - 0.5) * 14
    particle.style.left = `${startX}%`
    particle.style.top = `${startY}%`

    const angle = Math.random() * 360 * (Math.PI / 180)
    const distance = 90 + Math.random() * 120
    particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}%`)
    particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}%`)

    const size = 6 + Math.random() * 8
    particle.style.setProperty('--size', `${size}px`)

    const duration = 1400 + Math.random() * 700
    particle.style.setProperty('--duration', `${duration}ms`)

    container.appendChild(particle)
    setTimeout(() => particle.remove(), duration + 100)
  }
}

function handleConfirm() {
  emit('confirm')
}

function handleKeydown(event) {
  if (!props.isOpen) return
  if (event.key === 'Enter' || event.key === 'Escape') {
    event.preventDefault()
    handleConfirm()
  }
}

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
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

html[data-theme="day"] .modal-overlay {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

html[data-theme="night"] .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-container {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 2.4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.55);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.2);
}

.effects-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.icon-wrap,
.modal-title,
.modal-message,
.confirm-button {
  position: relative;
  z-index: 2;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 22px;
  margin-bottom: 1.15rem;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.14), rgba(255, 154, 117, 0.08));
  border: 1px solid rgba(255, 107, 61, 0.2);
  animation: pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  margin-bottom: 0.65rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.modal-message {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.85rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .modal-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.95rem 1.6rem;
  min-height: 52px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: #ffffff;
  box-shadow: 0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.confirm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.confirm-button:active {
  transform: translateY(1px) scale(0.99);
  opacity: 0.9;
}

.confirm-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.3),
    0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.effect-particle {
  position: absolute;
  width: var(--size, 10px);
  height: var(--size, 10px);
  border-radius: 999px;
  opacity: 0;
  filter: drop-shadow(0 0 10px currentColor);
  animation: modal-firework var(--duration, 1600ms) ease-out forwards;
}

@keyframes modal-firework {
  0% { transform: translate(0, 0) scale(0.9); opacity: 0; }
  10% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(var(--end-x, 80%), var(--end-y, -80%)) scale(0); opacity: 0; }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96);
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-overlay { padding: 1rem; }
  .modal-container { padding: 2.1rem 1.5rem; }
}
</style>

