<template>
  <div
    class="step-indicator"
    role="progressbar"
    :aria-valuenow="currentStep"
    aria-valuemin="1"
    :aria-valuemax="totalSteps"
    aria-label="온보딩 진행률"
  >
    <div
      v-for="step in totalSteps"
      :key="step"
      class="step-dot"
      :class="{
        active: step === currentStep,
        completed: step < currentStep
      }"
      role="presentation"
      :aria-label="`Step ${step} of ${totalSteps}`"
      :aria-current="step === currentStep ? 'step' : undefined"
    >
      <div class="dot-inner">
        <AppIcon
          v-if="step < currentStep"
          name="check"
          :size="18"
          weight="bold"
          color="currentColor"
          class="check-icon"
          aria-hidden="true"
        />
        <span v-else class="step-number">{{ step }}</span>
      </div>
    </div>
    <div class="step-label" aria-live="polite">
      {{ currentStep }} / {{ totalSteps }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true,
    validator: (value) => value >= 1
  },
  totalSteps: {
    type: Number,
    default: 4,
    validator: (value) => value >= 1
  }
})
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  position: relative;
}

.step-dot {
  position: relative;
  transition: var(--onboarding-transition-bounce);
}

.dot-inner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: var(--onboarding-transition-bounce);
  
  /* Default/Inactive state - Visible ring for progress visibility */
  background: var(--onboarding-surface);
  color: var(--onboarding-text-secondary); /* Darker for better visibility */
  border: 2px solid rgba(88, 60, 50, 0.15); /* Subtle brown ring */
  box-shadow: var(--onboarding-shadow-soft);
}

/* Completed state - Coral with pressed effect */
.step-dot.completed .dot-inner {
  background: var(--onboarding-primary);
  color: white;
  box-shadow: var(--onboarding-shadow-pressed);
  transform: scale(0.95);
}

/* Active state - Floating with glow */
.step-dot.active .dot-inner {
  background: var(--onboarding-surface);
  color: var(--onboarding-primary);
  border: 2px solid var(--onboarding-primary);
  box-shadow: 
    var(--onboarding-shadow-floating),
    0 0 0 4px rgba(var(--onboarding-primary-rgb), 0.15);
  transform: scale(1.1);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-number {
  font-variant-numeric: tabular-nums;
}

.step-label {
  position: absolute;
  bottom: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--onboarding-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* Accessibility - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .step-dot,
  .dot-inner {
    transition: none;
  }
  
  .step-dot.active .dot-inner {
    animation: none;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .dot-inner {
    width: 36px;
    height: 36px;
    font-size: 0.8125rem;
  }
  
  .step-label {
    bottom: -1.5rem;
    font-size: 0.8125rem;
  }
}
</style>
