<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div 
        v-if="toastState.visible" 
        class="toast-container"
        role="alert"
        :aria-live="toastState.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content" :class="`toast-${toastState.type}`">
          <!-- Icons -->
          <PhWarning 
            v-if="toastState.type === 'error'" 
            :size="20" 
            weight="fill" 
            class="toast-icon"
          />
          <PhCheckCircle 
            v-if="toastState.type === 'success'" 
            :size="20" 
            weight="fill" 
            class="toast-icon"
          />
          <PhInfo 
            v-if="toastState.type === 'info'" 
            :size="20" 
            weight="fill" 
            class="toast-icon"
          />
          <PhWarningCircle 
            v-if="toastState.type === 'warning'" 
            :size="20" 
            weight="fill" 
            class="toast-icon"
          />
          
          <!-- Message -->
          <span class="toast-message">{{ toastState.message }}</span>
          
          <!-- Close button -->
          <button 
            @click="hideToast" 
            class="toast-close"
            aria-label="닫기"
          >
            <PhX :size="18" weight="bold" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { 
  PhWarning, 
  PhCheckCircle, 
  PhInfo, 
  PhWarningCircle, 
  PhX 
} from '@phosphor-icons/vue'
import { useToast } from '@/composables/useToast'

const { toastState, hideToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  max-width: 420px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--onboarding-surface);
  border-radius: var(--onboarding-radius-md);
  box-shadow: 
    var(--onboarding-shadow-floating-strong),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: var(--onboarding-transition-base);
}

html[data-theme="night"] .toast-content {
  background: var(--onboarding-surface);
  box-shadow: 
    var(--onboarding-shadow-floating-strong),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--onboarding-text-primary);
  line-height: 1.5;
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--onboarding-text-secondary);
  cursor: pointer;
  transition: var(--onboarding-transition-fast);
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--onboarding-text-primary);
}

html[data-theme="night"] .toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Type-specific styles */
.toast-success {
  border-left: 4px solid var(--onboarding-success);
}

.toast-success .toast-icon {
  color: var(--onboarding-success);
}

.toast-error {
  border-left: 4px solid var(--onboarding-error);
}

.toast-error .toast-icon {
  color: var(--onboarding-error);
}

.toast-warning {
  border-left: 4px solid #FF9800;
}

.toast-warning .toast-icon {
  color: #FF9800;
}

.toast-info {
  border-left: 4px solid var(--onboarding-primary);
}

.toast-info .toast-icon {
  color: var(--onboarding-primary);
}

/* Slide-in animation */
.toast-slide-enter-active {
  animation: toast-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: toast-slide-out 0.2s ease-in;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
  
  .toast-content {
    padding: 0.875rem 1rem;
  }
  
  .toast-message {
    font-size: 0.875rem;
  }
}
</style>
