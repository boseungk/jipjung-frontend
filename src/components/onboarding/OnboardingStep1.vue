<template>
  <div class="onboarding-step">
    <h2 class="step-title">출생연도를 입력해주세요</h2>
    <p class="step-description">
      연령대에 맞는 맞춤 정보를 제공해드립니다
    </p>

    <div class="input-group">
      <input
        v-model.number="localBirthYear"
        type="number"
        placeholder="1995"
        class="year-input"
        :min="1900"
        :max="currentYear"
        @keyup.enter="handleNext"
      />
      <span class="input-suffix">년</span>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const currentYear = new Date().getFullYear()
const errorMessage = ref('')

const localBirthYear = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

watch(localBirthYear, (newValue) => {
  if (newValue) {
    if (newValue < 1900 || newValue > currentYear) {
      errorMessage.value = `1900년부터 ${currentYear}년 사이의 연도를 입력해주세요`
    } else {
      errorMessage.value = ''
    }
  }
})

function handleNext() {
  if (localBirthYear.value && !errorMessage.value) {
    emit('next')
  }
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
  margin: 0 auto;
  max-width: 300px;
}

.year-input {
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

.year-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.15);
}

html[data-theme="night"] .year-input {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  border-color: rgba(245, 237, 227, 0.2);
}

html[data-theme="night"] .year-input:focus {
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

.error-message {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #D32F2F;
  font-weight: 500;
}

/* Remove number input arrows */
.year-input::-webkit-inner-spin-button,
.year-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.year-input[type=number] {
  -moz-appearance: textfield;
}
</style>
