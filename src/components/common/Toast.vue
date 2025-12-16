<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div 
        v-if="toastState.visible" 
        class="toast-container"
        :role="toastRole"
        :aria-live="toastAriaLive"
        @mouseenter="pauseToast"
        @mouseleave="resumeToast"
      >
        <div class="toast-content">
          <!-- Icon with gradient background -->
          <div class="toast-icon-wrapper" :class="`icon-${toastState.type}`">
            <AppIcon
              :name="toastIconName"
              :size="18"
              weight="fill"
              color="#fff"
              :active="true"
              customClass="toast-icon"
              aria-hidden="true"
            />
          </div>
          
          <!-- Message -->
          <div class="toast-body">
            <span class="toast-message">{{ toastState.message }}</span>
          </div>
          
          <!-- Close button -->
          <button 
            @click="hideToast" 
            class="toast-close"
            aria-label="닫기"
          >
            <AppIcon
              name="x"
              :size="14"
              weight="bold"
              color="currentColor"
              :active="true"
              aria-hidden="true"
            />
          </button>
          
          <!-- Progress bar -->
          <div v-if="toastState.duration > 0" class="toast-progress" :class="`progress-${toastState.type}`">
            <div
              :key="toastState.id"
              class="toast-progress-bar"
              :style="progressBarStyle"
            ></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { toastState, hideToast, pauseToast, resumeToast, isPaused } = useToast()

const toastIconName = computed(() => {
  switch (toastState.type) {
    case 'success':
      return 'checkCircle'
    case 'error':
      return 'warning'
    case 'warning':
      return 'warningCircle'
    case 'info':
    default:
      return 'info'
  }
})

const toastAriaLive = computed(() => (toastState.type === 'error' || toastState.type === 'warning' ? 'assertive' : 'polite'))
const toastRole = computed(() => (toastAriaLive.value === 'assertive' ? 'alert' : 'status'))

const progressBarStyle = computed(() => ({
  animationDuration: `${toastState.duration}ms`,
  animationPlayState: isPaused.value ? 'paused' : 'running'
}))
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  z-index: 9999;
  max-width: 400px;
  perspective: 1000px;
}

.toast-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  padding-right: 2.75rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-content:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Dark mode styles */
html[data-theme="night"] .toast-content {
  background: rgba(30, 32, 40, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

html[data-theme="night"] .toast-content:hover {
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Icon wrapper with gradient */
.toast-icon-wrapper {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-content:hover .toast-icon-wrapper {
  transform: scale(1.1) rotate(-3deg);
}

.icon-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.icon-error {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

.icon-warning {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.icon-info {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.toast-icon {
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Message body */
.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-message {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

html[data-theme="night"] .toast-message {
  color: #f3f4f6;
}

/* Close button */
.toast-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #6b7280;
  transform: scale(1.1);
}

.toast-close:active {
  transform: scale(0.95);
}

html[data-theme="night"] .toast-close {
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
}

html[data-theme="night"] .toast-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #d1d5db;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 0 0 16px 16px;
  overflow: hidden;
}

html[data-theme="night"] .toast-progress {
  background: rgba(255, 255, 255, 0.08);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: progress-shrink linear forwards;
  border-radius: 0 0 0 16px;
}

.progress-success .toast-progress-bar {
  background: linear-gradient(90deg, #10B981, #34D399);
}

.progress-error .toast-progress-bar {
  background: linear-gradient(90deg, #EF4444, #F87171);
}

.progress-warning .toast-progress-bar {
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.progress-info .toast-progress-bar {
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Slide-in animation - more elegant spring effect */
.toast-slide-enter-active {
  animation: toast-slide-in 0.5s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-slide-leave-active {
  animation: toast-slide-out 0.35s cubic-bezier(0.36, 0, 0.66, -0.56);
}

@keyframes toast-slide-in {
  0% {
    transform: translateX(calc(100% + 2rem)) scale(0.9) rotateY(-10deg);
    opacity: 0;
  }
  60% {
    transform: translateX(-8px) scale(1.02) rotateY(2deg);
    opacity: 1;
  }
  80% {
    transform: translateX(4px) scale(0.99);
  }
  100% {
    transform: translateX(0) scale(1) rotateY(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100% + 2rem)) scale(0.9);
    opacity: 0;
  }
}

/* Shimmer effect on enter */
.toast-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 0.8s ease-out 0.2s;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    left: -50%;
  }
  100% {
    left: 150%;
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
    padding-right: 2.5rem;
    border-radius: 14px;
  }
  
  .toast-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  
  .toast-icon-wrapper svg {
    width: 16px;
    height: 16px;
  }
  
  .toast-message {
    font-size: 0.875rem;
  }
  
  .toast-progress {
    border-radius: 0 0 14px 14px;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    animation-duration: 0.01ms;
  }
  
  .toast-progress-bar {
    animation: none;
  }
  
  .toast-content::before {
    animation: none;
  }
  
  .toast-content:hover {
    transform: none;
  }
  
  .toast-content:hover .toast-icon-wrapper {
    transform: none;
  }
}
</style>
