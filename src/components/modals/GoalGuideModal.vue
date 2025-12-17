<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.stop>
      <div class="modal-container" @click.stop>
        <!-- Icon -->
        <div class="guide-icon">
          <AppIcon name="house" :size="64" weight="duotone" color="currentColor" />
        </div>

        <!-- Title -->
        <h2 class="modal-title">{{ title }}</h2>

        <!-- Message -->
        <p class="modal-message">{{ message }}</p>

        <!-- Buttons -->
        <div class="button-group">
          <button class="primary-button" @click="handlePrimary">
            {{ primaryButtonText }}
          </button>
          <button v-if="secondaryButtonText" class="secondary-button" @click="handleSecondary">
            {{ secondaryButtonText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '목표를 설정해주세요!'
  },
  message: {
    type: String,
    default: ''
  },
  primaryButtonText: {
    type: String,
    default: '매물 보러가기'
  },
  secondaryButtonText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['primary', 'secondary'])

const handlePrimary = () => {
  emit('primary')
}

const handleSecondary = () => {
  emit('secondary')
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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

/* Modal Container - Glassmorphism */
.modal-container {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.2);
}

/* Icon */
.guide-icon {
  margin-bottom: 1.5rem;
  color: var(--showroom-accent-day, #D4A574);
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

html[data-theme="night"] .guide-icon {
  color: var(--showroom-accent-night, #D4A574);
}

@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Title */
.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Message */
.modal-message {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .modal-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Button Group */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Primary Button */
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.95rem 1.6rem;
  min-height: 52px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: #ffffff;
  box-shadow: 0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.primary-button:active {
  transform: translateY(1px) scale(0.99);
  opacity: 0.9;
  box-shadow: inset 0 2px 6px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

/* Secondary Button */
.secondary-button {
  width: 100%;
  padding: 0.875rem 2rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

html[data-theme="day"] .secondary-button {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="day"] .secondary-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .secondary-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

html[data-theme="night"] .secondary-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }

  .modal-container {
    padding: 2rem 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }
}
</style>
