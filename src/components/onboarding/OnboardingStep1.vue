<template>
  <div class="onboarding-step">
    <h2 class="step-title">{{ STEP_CONTENT[1].title }}</h2>
    <p class="step-description">
      {{ STEP_CONTENT[1].description }}
    </p>

    <div class="input-group">
      <input
        v-model.number="localBirthYear"
        type="number"
        placeholder="1995"
        class="year-input"
        :class="{ invalid: errorMessage }"
        :min="VALIDATION.BIRTH_YEAR.MIN"
        :max="VALIDATION.BIRTH_YEAR.MAX"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? 'birth-year-error' : undefined"
        aria-label="출생연도 입력"
        @keyup.enter="handleNext"
      />
      <span class="input-suffix">년</span>
    </div>

    <div 
      v-if="errorMessage" 
      id="birth-year-error"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { STEP_CONTENT, VALIDATION } from '@/constants/onboardingConstants'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const errorMessage = ref('')

const localBirthYear = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

watch(localBirthYear, (newValue) => {
  if (newValue) {
    if (newValue < VALIDATION.BIRTH_YEAR.MIN || newValue > VALIDATION.BIRTH_YEAR.MAX) {
      errorMessage.value = VALIDATION.BIRTH_YEAR.ERROR_MESSAGE
    } else {
      errorMessage.value = ''
    }
  } else {
    errorMessage.value = ''
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
  font-size: var(--onboarding-font-title-size);
  font-weight: var(--onboarding-font-title-weight);
  letter-spacing: var(--onboarding-font-title-spacing);
  color: var(--onboarding-text-primary);
  margin-bottom: 1rem;
}

.step-description {
  font-size: var(--onboarding-font-body-size);
  font-weight: var(--onboarding-font-body-weight);
  color: var(--onboarding-text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
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
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  border: none;
  border-radius: var(--onboarding-radius-md);
  
  /* Trench effect */
  background: var(--onboarding-input-bg);
  box-shadow: var(--onboarding-shadow-inset);
  color: var(--onboarding-text-primary);
  
  transition: var(--onboarding-transition-base);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
}

.year-input:focus {
  outline: none;
  
  /* Floating effect on focus */
  background: var(--onboarding-input-focus);
  box-shadow: var(--onboarding-shadow-floating);
  transform: translateY(-2px);
}

.year-input.invalid {
  box-shadow: 
    var(--onboarding-shadow-inset),
    0 0 0 2px var(--onboarding-error);
}

.year-input::-webkit-input-placeholder {
  color: var(--onboarding-text-muted);
}

.year-input::placeholder {
  color: var(--onboarding-text-muted);
}

.input-suffix {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--onboarding-text-secondary);
}

.error-message {
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--onboarding-error);
  animation: shake 0.3s ease-in-out;
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

/* Error shake animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .step-title {
    font-size: 1.625rem;
  }
  
  .step-description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .year-input {
    font-size: 1.375rem;
    padding: 0.625rem 0.875rem;
  }
}
</style>
