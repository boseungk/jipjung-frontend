<template>
  <div class="onboarding-step">
    <h2 class="step-title">기존 대출이 있으신가요?</h2>
    <p class="step-description">
      기존 대출의 월 상환액을 입력해주세요
    </p>

    <!-- Card-Based Selection UI -->
    <div class="loan-selection">
      <!-- Recommended Amount Cards -->
      <div class="recommended-cards">
        <button
          v-for="amount in VALIDATION.EXISTING_LOAN.QUICK_AMOUNTS"
          :key="amount"
          @click="selectQuickAmount(amount)"
          type="button"
          class="amount-card"
          :class="{ selected: localLoan === amount && !isCustom }"
        >
          <span class="amount-value">
            {{ amount === 0 ? '없음' : amount }}
          </span>
          <span class="amount-unit" v-if="amount > 0">만원</span>
        </button>
      </div>

      <!-- Custom Input Card -->
      <div 
        class="custom-input-card"
        :class="{ expanded: isCustom }"
      >
        <button
          v-if="!isCustom"
          @click="enableCustomInput"
          type="button"
          class="custom-trigger"
        >
          <PhPencilLine :size="20" weight="bold" />
          <span>직접 입력하기</span>
        </button>
        
        <div v-else class="custom-input-content">
          <input
            ref="customInput"
            v-model.number="localLoan"
            type="number"
            class="custom-amount-input"
            placeholder="금액 입력"
            :min="VALIDATION.EXISTING_LOAN.MIN"
            :max="VALIDATION.EXISTING_LOAN.MAX"
            aria-label="기존 대출 금액 직접 입력"
            @blur="validateCustomInput"
            @keyup.enter="handleNext"
          />
          <span class="input-suffix">만원</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { PhPencilLine } from '@phosphor-icons/vue'
import { VALIDATION } from '@/constants/onboardingConstants'

const props = defineProps({
  modelValue: {
    type: Number,
    default: VALIDATION.EXISTING_LOAN.DEFAULT
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const isCustom = ref(false)
const customInput = ref(null)

const localLoan = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value || 0)
  }
})

function selectQuickAmount(amount) {
  localLoan.value = amount
  isCustom.value = false
}

function enableCustomInput() {
  isCustom.value = true
  nextTick(() => {
    customInput.value?.focus()
  })
}

function validateCustomInput() {
  // If input is invalid, don't close
  if (localLoan.value < VALIDATION.EXISTING_LOAN.MIN) {
    localLoan.value = VALIDATION.EXISTING_LOAN.MIN
  }
  if (localLoan.value > VALIDATION.EXISTING_LOAN.MAX) {
    localLoan.value = VALIDATION.EXISTING_LOAN.MAX
  }
}

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

.loan-selection {
  width: 100%;
}

/* Recommended Amount Cards */
.recommended-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amount-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  min-height: 90px;
  border: none;
  border-radius: var(--onboarding-radius-md);
  
  /* Card elevation */
  background: var(--onboarding-surface);
  box-shadow: var(--onboarding-shadow-soft);
  
  cursor: pointer;
  transition: var(--onboarding-transition-bounce);
}

.amount-card:hover:not(.selected) {
  transform: translateY(-2px);
  box-shadow: var(--onboarding-shadow-floating);
}

.amount-card.selected {
  background: var(--onboarding-primary);
  color: white;
  box-shadow: var(--onboarding-shadow-pressed);
  transform: scale(0.98);
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  color: inherit;
  margin-bottom: 0.25rem;
}

.amount-card.selected .amount-value {
  color: white;
}

.amount-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--onboarding-text-secondary);
}

.amount-card.selected .amount-unit {
  color: rgba(255, 255, 255, 0.9);
}

/* Custom Input Card */
.custom-input-card {
  padding: 1.25rem 1.5rem;
  border-radius: var(--onboarding-radius-md);
  background: var(--onboarding-surface);
  box-shadow: var(--onboarding-shadow-soft);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-input-card:hover:not(.expanded) {
  transform: translateY(-1px);
  box-shadow: var(--onboarding-shadow-floating);
}

.custom-input-card.expanded {
  background: var(--onboarding-primary-soft);
  box-shadow: var(--onboarding-shadow-pressed);
  transform: scale(0.98);
}

.custom-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--onboarding-text-secondary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--onboarding-transition-base);
}

.custom-trigger:hover {
  color: var(--onboarding-primary);
}

.custom-input-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.custom-amount-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  border: none;
  border-radius: var(--onboarding-radius-md);
  
  /* Trench style */
  background: var(--onboarding-surface);
  box-shadow: var(--onboarding-shadow-inset);
  color: var(--onboarding-primary);
  
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  transition: var(--onboarding-transition-base);
}

.custom-amount-input:focus {
  outline: none;
  box-shadow: var(--onboarding-shadow-floating);
  transform: translateY(-1px);
}

.custom-amount-input::-webkit-input-placeholder {
  color: var(--onboarding-text-muted);
  font-size: 1rem;
}

.custom-amount-input::placeholder {
  color: var(--onboarding-text-muted);
  font-size: 1rem;
}

.input-suffix {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--onboarding-primary);
}

/* Remove number input arrows */
.custom-amount-input::-webkit-inner-spin-button,
.custom-amount-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-amount-input[type=number] {
  -moz-appearance: textfield;
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
  
  .recommended-cards {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 0.5rem;
  }
  
  .amount-card {
    padding: 1.25rem 0.75rem;
    min-height: 80px;
  }
  
  .amount-value {
    font-size: 1.25rem;
  }
  
  .custom-input-card {
    padding: 1rem 1.25rem;
  }
  
  .custom-amount-input {
    font-size: 1.5rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .amount-card,
  .custom-input-card,
  .custom-trigger {
    transition: none;
  }
}
</style>
