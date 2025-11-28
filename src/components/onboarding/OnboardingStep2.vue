<template>
  <div class="onboarding-step">
    <h2 class="step-title">연소득을 알려주세요</h2>
    <p class="step-description">
      정확한 대출 한도 계산을 위해 필요합니다
    </p>

    <div class="income-display">
      <span class="income-value">{{ formattedIncome }}</span>
    </div>

    <div class="slider-container">
      <input
        v-model.number="localIncome"
        type="range"
        min="2000"
        max="10000"
        step="100"
        class="income-slider"
      />
      <div class="slider-track"></div>
    </div>

    <div class="slider-labels">
      <span>2천만원</span>
      <span>1억원</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['update:modelValue'])

const localIncome = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

const formattedIncome = computed(() => {
  const incomeBillion = localIncome.value / 10000
  if (incomeBillion >= 1) {
    return `${incomeBillion.toFixed(2)}억원`
  } else {
    return `${localIncome.value}만원`
  }
})
</script>

<style scoped>
.onboarding-step {
  text-align: center;
  padding: 1rem 0;
  max-width: 600px;
  margin: 0 auto;
}



.step-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--showroom-text-day, #3E2723);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

html[data-theme="night"] .step-title {
  color: var(--showroom-text-night, #FFFFFF);
}

.step-description {
  font-size: 1.0625rem;
  color: var(--showroom-text-secondary-day, #6D4C41);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

html[data-theme="night"] .step-description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.income-display {
  margin-bottom: 2.5rem;
}

.income-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--showroom-text-day, #3E2723);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

html[data-theme="night"] .income-value {
  color: var(--showroom-text-night, #F5EDE3);
}

.slider-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto 1rem;
  padding: 0 0.5rem;
}

.income-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(
    to right,
    var(--showroom-accent-day, #D4A574) 0%,
    var(--showroom-accent-day, #D4A574) calc((var(--value) - 2000) / 80 * 100%),
    rgba(93, 64, 55, 0.15) calc((var(--value) - 2000) / 80 * 100%),
    rgba(93, 64, 55, 0.15) 100%
  );
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  --value: 5000;
}

.income-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--showroom-accent-day, #D4A574);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.income-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.income-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--showroom-accent-day, #D4A574);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.income-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

html[data-theme="night"] .income-slider {
  background: linear-gradient(
    to right,
    var(--showroom-accent-night, #D4A574) 0%,
    var(--showroom-accent-night, #D4A574) calc((var(--value) - 2000) / 80 * 100%),
    rgba(245, 237, 227, 0.2) calc((var(--value) - 2000) / 80 * 100%),
    rgba(245, 237, 227, 0.2) 100%
  );
}

html[data-theme="night"] .income-slider::-webkit-slider-thumb {
  background: rgba(0, 0, 0, 0.4);
  border-color: var(--showroom-accent-night, #D4A574);
}

html[data-theme="night"] .income-slider::-moz-range-thumb {
  background: rgba(0, 0, 0, 0.4);
  border-color: var(--showroom-accent-night, #D4A574);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .slider-labels {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}
</style>
