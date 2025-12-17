<template>
  <div class="onboarding-step">
    <h2 class="step-title">{{ STEP_CONTENT[3].title }}</h2>
    <p class="step-description">
      {{ STEP_CONTENT[3].description }}
    </p>

    <!-- Sections Container -->
    <div class="sections-container">
      <!-- Section 1: Current Assets -->
      <div class="section">
        <h3 class="section-title">현재 보유 자산</h3>
        <div class="selection-group">
          <div class="recommended-cards">
            <button
              v-for="amount in VALIDATION.CURRENT_ASSETS.QUICK_AMOUNTS"
              :key="`asset-${amount}`"
              @click="selectAssetAmount(amount)"
              type="button"
              class="amount-card"
              :class="{ selected: localAssets === amount && !isAssetCustom }"
            >
              <span class="amount-value">
                {{ VALIDATION.CURRENT_ASSETS.QUICK_LABELS[amount] || `${amount}만원` }}
              </span>
            </button>
          </div>

          <!-- Custom Input -->
          <div class="custom-input-card" :class="{ expanded: isAssetCustom }">
            <button
              v-if="!isAssetCustom"
              @click="enableAssetCustom"
              type="button"
              class="custom-trigger"
            >
              <AppIcon
                name="pencilLine"
                :size="18"
                weight="bold"
                color="currentColor"
                aria-hidden="true"
              />
              <span>직접 입력</span>
            </button>
            
            <div v-else class="custom-input-content">
              <input
                ref="assetCustomInput"
                v-model.number="localAssets"
                type="number"
                class="custom-amount-input"
                placeholder="금액 입력"
                :min="VALIDATION.CURRENT_ASSETS.MIN"
                :max="VALIDATION.CURRENT_ASSETS.MAX"
                aria-label="보유 자산 직접 입력"
                @blur="validateAssetInput"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Existing Loan -->
      <div class="section">
        <h3 class="section-title">월 대출 상환액</h3>
        <div class="selection-group">
          <div class="recommended-cards">
            <button
              v-for="amount in VALIDATION.EXISTING_LOAN.QUICK_AMOUNTS"
              :key="`loan-${amount}`"
              @click="selectLoanAmount(amount)"
              type="button"
              class="amount-card"
              :class="{ selected: localLoan === amount && !isLoanCustom }"
            >
              <span class="amount-value">
                {{ amount === 0 ? '없음' : amount }}
              </span>
              <span class="amount-unit" v-if="amount > 0">만원</span>
            </button>
          </div>

          <!-- Custom Input -->
          <div class="custom-input-card" :class="{ expanded: isLoanCustom }">
            <button
              v-if="!isLoanCustom"
              @click="enableLoanCustom"
              type="button"
              class="custom-trigger"
            >
              <AppIcon
                name="pencilLine"
                :size="18"
                weight="bold"
                color="currentColor"
                aria-hidden="true"
              />
              <span>직접 입력</span>
            </button>
            
            <div v-else class="custom-input-content">
              <input
                ref="loanCustomInput"
                v-model.number="localLoan"
                type="number"
                class="custom-amount-input"
                placeholder="금액 입력"
                :min="VALIDATION.EXISTING_LOAN.MIN"
                :max="VALIDATION.EXISTING_LOAN.MAX"
                aria-label="기존 대출 금액 직접 입력"
                @blur="validateLoanInput"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { STEP_CONTENT, VALIDATION } from '@/constants/onboardingConstants'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      existingLoanMonthly: VALIDATION.EXISTING_LOAN.DEFAULT,
      currentAssets: VALIDATION.CURRENT_ASSETS.DEFAULT
    })
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const isLoanCustom = ref(false)
const isAssetCustom = ref(false)
const loanCustomInput = ref(null)
const assetCustomInput = ref(null)

// Local reactive values
const localLoan = computed({
  get: () => props.modelValue?.existingLoanMonthly ?? VALIDATION.EXISTING_LOAN.DEFAULT,
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      existingLoanMonthly: value || 0
    })
  }
})

const localAssets = computed({
  get: () => props.modelValue?.currentAssets ?? VALIDATION.CURRENT_ASSETS.DEFAULT,
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      currentAssets: value || 0
    })
  }
})

// Loan selection
function selectLoanAmount(amount) {
  localLoan.value = amount
  isLoanCustom.value = false
}

function enableLoanCustom() {
  isLoanCustom.value = true
  nextTick(() => {
    loanCustomInput.value?.focus()
  })
}

function validateLoanInput() {
  if (localLoan.value < VALIDATION.EXISTING_LOAN.MIN) {
    localLoan.value = VALIDATION.EXISTING_LOAN.MIN
  }
  if (localLoan.value > VALIDATION.EXISTING_LOAN.MAX) {
    localLoan.value = VALIDATION.EXISTING_LOAN.MAX
  }
}

// Asset selection
function selectAssetAmount(amount) {
  localAssets.value = amount
  isAssetCustom.value = false
}

function enableAssetCustom() {
  isAssetCustom.value = true
  nextTick(() => {
    assetCustomInput.value?.focus()
  })
}

function validateAssetInput() {
  if (localAssets.value < VALIDATION.CURRENT_ASSETS.MIN) {
    localAssets.value = VALIDATION.CURRENT_ASSETS.MIN
  }
  if (localAssets.value > VALIDATION.CURRENT_ASSETS.MAX) {
    localAssets.value = VALIDATION.CURRENT_ASSETS.MAX
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
  margin-bottom: 0.75rem;
}

.step-description {
  font-size: var(--onboarding-font-body-size);
  font-weight: var(--onboarding-font-body-weight);
  color: var(--onboarding-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  text-align: left;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--onboarding-text-primary);
  margin-bottom: 1rem;
  padding-left: 0.25rem;
}

.selection-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommended-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
  gap: 0.5rem;
}

.amount-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  min-height: 65px;
  border: none;
  border-radius: var(--onboarding-radius-md);
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
  font-size: 1.125rem;
  font-weight: 700;
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  color: inherit;
}

.amount-card.selected .amount-value {
  color: white;
}

.amount-unit {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--onboarding-text-secondary);
  margin-top: 0.125rem;
}

.amount-card.selected .amount-unit {
  color: rgba(255, 255, 255, 0.9);
}

.custom-input-card {
  padding: 0.875rem 1rem;
  border-radius: var(--onboarding-radius-md);
  background: var(--onboarding-surface);
  box-shadow: var(--onboarding-shadow-soft);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
}

.custom-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--onboarding-text-secondary);
  font-size: 0.9375rem;
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
  gap: 0.5rem;
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
}

.custom-amount-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  border: none;
  border-radius: var(--onboarding-radius-md);
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

.custom-amount-input::placeholder {
  color: var(--onboarding-text-muted);
  font-size: 1rem;
}

.input-suffix {
  font-size: 1rem;
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
    font-size: 1.5rem;
  }
  
  .sections-container {
    gap: 1.5rem;
  }
  
  .recommended-cards {
    grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
  }
  
  .amount-card {
    padding: 0.875rem 0.375rem;
    min-height: 55px;
  }
  
  .amount-value {
    font-size: 1rem;
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
