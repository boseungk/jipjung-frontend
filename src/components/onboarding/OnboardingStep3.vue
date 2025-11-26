<template>
  <div class="onboarding-step">
    <h2 class="step-title">기존 대출이 있으신가요?</h2>
    <p class="step-description">
      기존 대출의 월 상환액을 입력해주세요 (없으면 0 입력)
    </p>

    <div class="input-group">
      <input
        v-model.number="localLoan"
        type="number"
        placeholder="0"
        class="loan-input"
        min="0"
        max="1000"
        @keyup.enter="handleNext"
      />
      <span class="input-suffix">만원</span>
    </div>

    <div class="loan-examples">
      <button
        v-for="amount in quickAmounts"
        :key="amount"
        @click="localLoan = amount"
        class="quick-btn"
        :class="{ active: localLoan === amount }"
      >
        {{ amount === 0 ? '없음' : `${amount}만원` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const quickAmounts = [0, 30, 50, 100, 150]

const localLoan = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value || 0)
  }
})

function handleNext() {
  emit('next')
}
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

.input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 auto 2rem;
  max-width: 300px;
}

.loan-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  border: 2px solid rgba(93, 64, 55, 0.1);
  border-radius: 10px;
  background: #EEF0F2;
  color: var(--showroom-text-day, #5D4037);
  transition: all 0.25s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}

.loan-input:focus {
  outline: none;
  border-color: #FF7F50;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.15);
}

html[data-theme="night"] .loan-input {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  border-color: rgba(245, 237, 227, 0.2);
}

html[data-theme="night"] .loan-input:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.input-suffix {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .input-suffix {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.loan-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.quick-btn {
  padding: 0.625rem 1.25rem;
  border: 2px solid rgba(93, 64, 55, 0.15);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
  color: var(--showroom-text-day, #5D4037);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  border-color: var(--showroom-accent-day, #D4A574);
  background: rgba(255, 255, 255, 0.8);
}

.quick-btn.active {
  background: var(--showroom-accent-day, #D4A574);
  border-color: var(--showroom-accent-day, #D4A574);
  color: white;
}

html[data-theme="night"] .quick-btn {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  border-color: rgba(245, 237, 227, 0.2);
}

html[data-theme="night"] .quick-btn:hover {
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .quick-btn.active {
  background: var(--showroom-accent-night, #D4A574);
  border-color: var(--showroom-accent-night, #D4A574);
}

/* Remove number input arrows */
.loan-input::-webkit-inner-spin-button,
.loan-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.loan-input[type=number] {
  -moz-appearance: textfield;
}
</style>
