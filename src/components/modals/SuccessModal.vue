<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="handleConfirm">
      <div class="modal-container" @click.stop>
        <!-- Success Icon -->
        <div class="success-icon">
          <PhCheckCircle :size="64" weight="fill" color="currentColor" />
        </div>

        <!-- Title -->
        <h2 class="modal-title">{{ title }}</h2>

        <!-- Message -->
        <p class="modal-message">{{ message }}</p>

        <!-- Confirm Button -->
        <button
          ref="confirmButtonRef"
          class="confirm-button"
          @click="handleConfirm"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { PhCheckCircle } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '완료되었습니다!'
  },
  message: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: '확인'
  }
})

const emit = defineEmits(['confirm'])
const confirmButtonRef = ref(null)

const handleConfirm = () => {
  emit('confirm')
}

const handleKeydown = (event) => {
  if (!props.isOpen) return
  if (event.key === 'Enter') {
    event.preventDefault()
    handleConfirm()
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      confirmButtonRef.value?.focus()
    }
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
  max-width: 400px;
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

/* Success Icon */
.success-icon {
  margin-bottom: 1.5rem;
  color: #4CAF50;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

html[data-theme="night"] .success-icon {
  color: #81C784;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
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

/* Confirm Button styles live in src/assets/css/components/buttons.css */

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
