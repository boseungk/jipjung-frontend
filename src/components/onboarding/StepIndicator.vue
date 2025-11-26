<template>
  <div class="step-indicator">
    <div
      v-for="step in totalSteps"
      :key="step"
      class="step-dot"
      :class="{
        active: step === currentStep,
        completed: step < currentStep
      }"
    >
      <div class="dot-inner">
        <span v-if="step < currentStep" class="check-icon">✓</span>
        <span v-else class="step-number">{{ step }}</span>
      </div>
    </div>
    <div class="step-label">
      {{ currentStep }} / {{ totalSteps }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    default: 4
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  border: 2px solid rgba(93, 64, 55, 0.2);
  background: rgba(255, 255, 255, 0.5);
  color: rgba(93, 64, 55, 0.5);
}

html[data-theme="night"] .dot-inner {
  border-color: rgba(245, 237, 227, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(245, 237, 227, 0.5);
}

.step-dot.completed .dot-inner {
  background: var(--showroom-accent-day, #D4A574);
  border-color: var(--showroom-accent-day, #D4A574);
  color: white;
}

html[data-theme="night"] .step-dot.completed .dot-inner {
  background: var(--showroom-accent-night, #D4A574);
  border-color: var(--showroom-accent-night, #D4A574);
}

.step-dot.active .dot-inner {
  background: rgba(255, 255, 255, 1);
  border-color: var(--showroom-accent-day, #D4A574);
  color: var(--showroom-accent-day, #D4A574);
  box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.15);
  transform: scale(1.1);
}

html[data-theme="night"] .step-dot.active .dot-inner {
  background: rgba(0, 0, 0, 0.4);
  border-color: var(--showroom-accent-night, #D4A574);
  color: var(--showroom-accent-night, #D4A574);
}

.check-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.step-label {
  position: absolute;
  bottom: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--showroom-text-secondary-day, #8D6E63);
  white-space: nowrap;
}

html[data-theme="night"] .step-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}
</style>
