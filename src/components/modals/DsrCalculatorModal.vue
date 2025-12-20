<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            <PhBank :size="24" weight="duotone" color="currentColor" />
            DSR 상세 계산기
          </h2>
          <button class="close-button" @click="closeModal" aria-label="닫기">
            <PhX :size="20" weight="bold" color="currentColor" />
          </button>
        </div>

        <!-- Form -->
        <form class="modal-form" @submit.prevent="handleCalculate">
          <!-- Annual Income -->
          <div class="form-group">
            <label for="annual-income" class="form-label">연소득</label>
            <div class="input-wrapper">
              <input
                id="annual-income"
                type="text"
                inputmode="numeric"
                class="form-input"
                placeholder="연소득을 입력하세요"
                :value="annualIncomeDisplay"
                @input="handleAnnualIncomeInput"
                @blur="handleAnnualIncomeBlur"
                @focus="handleAnnualIncomeFocus"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>

          <!-- Existing Loan Monthly -->
          <div class="form-group">
            <label for="existing-loan" class="form-label">기존 대출 월 상환액</label>
            <div class="input-wrapper">
              <input
                id="existing-loan"
                type="text"
                inputmode="numeric"
                class="form-input"
                placeholder="기존 대출 월 상환액"
                :value="existingLoanDisplay"
                @input="handleExistingLoanInput"
                @blur="handleExistingLoanBlur"
                @focus="handleExistingLoanFocus"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>

          <!-- New Loan Amount -->
          <div class="form-group">
            <label for="loan-amount" class="form-label">신규 대출 희망액</label>
            <div class="input-wrapper">
              <input
                id="loan-amount"
                type="text"
                inputmode="numeric"
                class="form-input"
                placeholder="대출 금액을 입력하세요"
                :value="loanAmountDisplay"
                @input="handleLoanAmountInput"
                @blur="handleLoanAmountBlur"
                @focus="handleLoanAmountFocus"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>

          <!-- Interest Rate -->
          <div class="form-group">
            <label for="interest-rate" class="form-label">금리</label>
            <div class="input-wrapper">
              <input
                id="interest-rate"
                v-model.number="formData.interestRate"
                type="number"
                class="form-input"
                placeholder="연 금리"
                min="0"
                max="30"
                step="0.1"
                required
              />
              <span class="input-suffix">%</span>
            </div>
          </div>

          <!-- Loan Period -->
          <div class="form-group">
            <label for="loan-period" class="form-label">대출 기간</label>
            <div class="input-wrapper">
              <input
                id="loan-period"
                v-model.number="formData.loanPeriodYears"
                type="number"
                class="form-input"
                placeholder="대출 기간"
                min="1"
                max="50"
                required
              />
              <span class="input-suffix">년</span>
            </div>
          </div>

          <!-- Region Type -->
          <div class="form-group">
            <label for="region" class="form-label">지역 구분</label>
            <select
              id="region"
              v-model="formData.isMetro"
              class="form-select"
              required
            >
              <option :value="true">수도권 (스트레스 금리 +1.5%)</option>
              <option :value="false">비수도권 (스트레스 금리 +0.75%)</option>
            </select>
          </div>

          <!-- Calculate Button -->
          <button type="submit" class="submit-button">
            <AppIcon name="calculator" :size="20" :active="true" :is-major-cta="true" aria-hidden="true" />
            DSR 계산하기
          </button>
        </form>

        <!-- Result Section -->
        <div v-if="result" class="result-section">
          <div class="result-header">
            <h3 class="result-title">
              <PhChartLine :size="20" weight="duotone" color="currentColor" />
              계산 결과
            </h3>
          </div>

          <div class="result-grid">
            <!-- Monthly Payment -->
            <div class="result-item">
              <span class="result-label">월 상환액</span>
              <span class="result-value">₩{{ formatNumber(result.monthlyPayment) }}만</span>
            </div>

            <!-- Total Monthly Debt -->
            <div class="result-item">
              <span class="result-label">총 월 부채 상환액</span>
              <span class="result-value">₩{{ formatNumber(result.totalMonthlyDebt) }}만</span>
            </div>

            <!-- DSR Ratio -->
            <div class="result-item highlight">
              <span class="result-label">DSR 비율</span>
              <span class="result-value" :class="{ warning: result.dsrRatio > 40 }">
                {{ result.dsrRatio.toFixed(1) }}%
              </span>
            </div>

            <!-- Approval Status -->
            <div class="result-item" :class="{ approved: result.isApproved, rejected: !result.isApproved }">
              <span class="result-label">승인 가능 여부</span>
              <span class="result-value">
                <PhCheckCircle v-if="result.isApproved" :size="18" weight="fill" color="#81C784" />
                <PhXCircle v-else :size="18" weight="fill" color="#F44336" />
                {{ result.isApproved ? '승인 가능' : '승인 불가' }}
              </span>
            </div>

            <!-- Stress Interest Rate -->
            <div class="result-item info">
              <span class="result-label">적용 스트레스 금리</span>
              <span class="result-value">{{ result.stressRate.toFixed(2) }}%</span>
            </div>
          </div>

          <div class="result-note">
            <p>
              <PhLightbulb :size="16" weight="duotone" color="currentColor" />
              DSR 40% 이하일 경우 대출 승인 가능합니다.
            </p>
            <p v-if="result.isApproved">추천 최대 대출액: ₩{{ formatNumber(result.maxLoanAmount) }}만</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhBank, PhX, PhChartLine, PhLightbulb, PhCheckCircle, PhXCircle } from '@phosphor-icons/vue'
import { useMoneyInput } from '@/composables/useMoneyInput'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'result'])

// Form data
const formData = ref({
  annualIncome: null,
  existingLoanMonthly: 0,
  loanAmount: null,
  interestRate: null,
  loanPeriodYears: 30,
  isMetro: true
})

// Result
const result = ref(null)

// Money input composables
const annualIncomeRef = computed({
  get: () => formData.value.annualIncome,
  set: (val) => { formData.value.annualIncome = val }
})
const existingLoanRef = computed({
  get: () => formData.value.existingLoanMonthly,
  set: (val) => { formData.value.existingLoanMonthly = val }
})
const loanAmountRef = computed({
  get: () => formData.value.loanAmount,
  set: (val) => { formData.value.loanAmount = val }
})

const { displayValue: annualIncomeDisplay, handleInput: handleAnnualIncomeInput, handleBlur: handleAnnualIncomeBlur, handleFocus: handleAnnualIncomeFocus } = useMoneyInput(annualIncomeRef)
const { displayValue: existingLoanDisplay, handleInput: handleExistingLoanInput, handleBlur: handleExistingLoanBlur, handleFocus: handleExistingLoanFocus } = useMoneyInput(existingLoanRef)
const { displayValue: loanAmountDisplay, handleInput: handleLoanAmountInput, handleBlur: handleLoanAmountBlur, handleFocus: handleLoanAmountFocus } = useMoneyInput(loanAmountRef)

const closeModal = () => {
  emit('close')
  result.value = null
}

const handleOverlayClick = () => {
  closeModal()
}

const formatNumber = (num) => {
  return Math.round(num).toLocaleString()
}

const calculateMonthlyPayment = (principal, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = years * 12
  
  if (monthlyRate === 0) return principal / numPayments
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1)
}

const handleCalculate = () => {
  const { annualIncome, existingLoanMonthly, loanAmount, interestRate, loanPeriodYears, isMetro } = formData.value
  
  // Stress DSR 계산
  const stressRate = interestRate + (isMetro ? 1.5 : 0.75)
  
  // 월 상환액 계산 (원리금균등상환)
  const monthlyPayment = calculateMonthlyPayment(loanAmount, stressRate, loanPeriodYears)
  
  // 총 월 부채 상환액
  const totalMonthlyDebt = monthlyPayment + existingLoanMonthly
  
  // DSR 비율
  const dsrRatio = (totalMonthlyDebt * 12) / annualIncome * 100
  
  // 승인 가능 여부
  const isApproved = dsrRatio <= 40
  
  // 최대 대출 가능액 (DSR 40% 기준)
  const maxMonthlyPayment = (annualIncome * 0.40 / 12) - existingLoanMonthly
  const maxLoanAmount = maxMonthlyPayment > 0 
    ? (maxMonthlyPayment * (Math.pow(1 + stressRate/100/12, loanPeriodYears*12) - 1)) / 
      (stressRate/100/12 * Math.pow(1 + stressRate/100/12, loanPeriodYears*12))
    : 0
  
  result.value = {
    monthlyPayment,
    totalMonthlyDebt,
    dsrRatio,
    isApproved,
    stressRate,
    maxLoanAmount
  }
  
  emit('result', result.value)
}
</script>

<style scoped>
/* Modal styles similar to SavingInputModal */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

html[data-theme="day"] .modal-overlay {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

html[data-theme="night"] .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .close-button {
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .close-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .form-label {
  color: var(--showroom-text-night, #F5EDE3);
}

.input-wrapper {
  position: relative;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
  pointer-events: none;
}

html[data-theme="night"] .input-suffix {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.3s ease;
  background: transparent;
}

/* Day Mode - Minimal Border */
html[data-theme="day"] .form-input,
html[data-theme="day"] .form-select {
  border: 1.5px solid rgba(93, 64, 55, 0.2);
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .form-input:focus,
html[data-theme="day"] .form-select:focus {
  outline: none;
  border-color: var(--showroom-accent-day, #D4A574);
  background: rgba(255, 255, 255, 0.5);
}

/* Night Mode - Minimal Border */
html[data-theme="night"] .form-input,
html[data-theme="night"] .form-select {
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .form-input:focus,
html[data-theme="night"] .form-select:focus {
  outline: none;
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(255, 255, 255, 0.05);
}

.form-input::placeholder {
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.5;
}

html[data-theme="night"] .form-input::placeholder {
  color: var(--showroom-text-secondary-night, #D7CCC8);
  opacity: 0.4;
}

.form-select {
  cursor: pointer;
}

/* Hide number input spinners (arrows) */
.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Submit Button styles live in src/assets/css/components/buttons.css */

/* Result Section */
.result-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .result-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.result-header {
  margin-bottom: 1.5rem;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="night"] .result-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-item {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: transparent;
}

.result-item.highlight {
  background: rgba(212, 165, 116, 0.1);
}

.result-item.approved {
  background: rgba(129, 199, 132, 0.1);
}

.result-item.rejected {
  background: rgba(244, 67, 54, 0.1);
}

.result-item.info {
  grid-column: 1 / -1;
}

.result-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .result-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.result-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

html[data-theme="night"] .result-value {
  color: var(--showroom-text-night, #F5EDE3);
}

.result-value.warning {
  color: #F44336;
}

.result-note {
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.6;
}

html[data-theme="day"] .result-note {
  background: rgba(129, 199, 132, 0.1);
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .result-note {
  background: rgba(129, 199, 132, 0.1);
  color: var(--showroom-text-night, #F5EDE3);
}

.result-note p {
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .result-item.info {
    grid-column: 1;
  }
}
</style>
