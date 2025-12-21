<template>
  <div class="section-header">
    <div>
      <InfoTooltip description="지역/대출 조건을 입력하면
내 소득으로 최대 얼마까지 대출받을 수 있는지 계산해드려요!" id="sim-usage-tip">
        <h2 class="section-title">시뮬레이션</h2>
      </InfoTooltip>
      <p class="section-description">입력값에 따라 최대 대출 가능액과 등급을 계산해요</p>
    </div>
  </div>

  <form @submit.prevent="runSimulation" class="form">
    <div class="form-group">
      <label class="form-label">지역</label>
      <div class="radio-group">
        <label class="radio-option" :class="{ selected: formData.region === 'SEOUL_METRO' }">
          <input type="radio" v-model="formData.region" value="SEOUL_METRO" name="region" />
          <span class="radio-text">수도권</span>
        </label>
        <label class="radio-option" :class="{ selected: formData.region === 'ETC' }">
          <input type="radio" v-model="formData.region" value="ETC" name="region" />
          <span class="radio-text">비수도권</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">대출 유형</label>
      <div class="radio-group loan-type">
        <label
          v-for="type in loanTypes"
          :key="type.value"
          class="radio-option"
          :class="{ selected: formData.targetLoanType === type.value }"
        >
          <input
            type="radio"
            v-model="formData.targetLoanType"
            :value="type.value"
            name="targetLoanType"
          />
          <div class="radio-content">
            <span class="radio-text">
              {{ type.label }}
              <span v-if="type.recommended" class="recommended-badge">추천</span>
            </span>
            <span class="radio-description">{{ type.description }}</span>
          </div>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">예상 대출 금리 (%)</label>
      <div class="input-row">
        <input
          type="number"
          v-model.number="formData.targetLoanRate"
          class="form-input"
          step="0.1"
          min="0"
          max="30"
          placeholder="4.0"
        />
        <span class="input-suffix">%</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">대출 만기 (년)</label>
      <div class="input-row">
        <input
          type="number"
          v-model.number="formData.maturityYears"
          class="form-input"
          min="1"
          max="50"
          placeholder="40"
        />
        <span class="input-suffix">년</span>
      </div>
    </div>

    <div class="form-group optional-section">
      <label class="form-label">
        전세대출 (선택)
      </label>
      <div class="inline-inputs">
        <input type="number" v-model.number="formData.jeonseLoanBalance" class="form-input" placeholder="잔액 (원)" />
        <input
          type="number"
          v-model.number="formData.jeonseLoanRate"
          class="form-input small"
          step="0.1"
          placeholder="금리 %"
        />
      </div>
      <label class="checkbox-label">
        <input type="checkbox" v-model="formData.jeonseIncludedInDsr" />
        <span>DSR에 포함</span>
      </label>
    </div>

    <button type="submit" class="submit-button" :disabled="isSimulating">
      <template v-if="isSimulating">
        <AppIcon name="spinnerGap" :size="20" weight="bold" class="spin" aria-hidden="true" />
        <span>실행 중...</span>
      </template>
      <span v-else>시뮬레이션 실행</span>
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '@/stores/dsrStore'
import { useAuthStore } from '@/stores/authStore'
import { toWonMaybe } from '@/utils/krwUnits'
import InfoTooltip from '@/components/common/InfoTooltip.vue'

const dsrStore = useDsrStore()
const authStore = useAuthStore()

const { isSimulating } = storeToRefs(dsrStore)

const loanTypes = [
  { value: 'FIXED', label: '고정', description: '금리 고정, 안정적', recommended: true },
  { value: 'PERIODIC', label: '주기형', description: '5년마다 재산정' },
  { value: 'MIXED', label: '혼합', description: '고정 후 변동 전환' },
  { value: 'VARIABLE', label: '변동', description: '시장 금리 연동' }
]

const formData = reactive({
  region: 'SEOUL_METRO',
  targetLoanType: 'PERIODIC',
  targetLoanRate: 4.0,
  maturityYears: 40,
  jeonseLoanBalance: null,
  jeonseLoanRate: null,
  jeonseIncludedInDsr: false,
  lenderType: 'BANK'
})

async function runSimulation() {
  const annualIncome = authStore.userAnnualIncome || 0
  const annualIncomeWon = toWonMaybe(annualIncome, 50000)
  const existingLoanMonthlyWon = toWonMaybe(authStore.userExistingLoanMonthly || 0, 1000)
  const existingAnnualDebtService = existingLoanMonthlyWon * 12

  try {
    await dsrStore.runSimulation({
      annualIncome: annualIncomeWon,
      existingAnnualDebtService,
      ...formData
    })
  } catch {
    // store의 simulationError로 노출되므로 뷰에서는 추가 처리하지 않음
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--dsr-ink);
  margin: 0 0 0.5rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--dsr-ink-muted);
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dsr-ink);
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.radio-group.loan-type {
  grid-template-columns: repeat(2, 1fr);
}

.radio-option {
  position: relative;
  padding: 1rem;
  border-radius: 14px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 2px solid transparent;
  cursor: pointer;
  text-align: center;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;
  user-select: none;
}

.radio-option::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.radio-option:hover::before {
  opacity: 1;
}

.radio-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.12);
}

.radio-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-option.selected {
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 107, 61, 0.06));
  border-color: var(--brand-accent, #ff6b3d);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px rgba(255, 107, 61, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.radio-option:focus-within {
  outline: none;
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 0 0 4px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.15);
}

.radio-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--dsr-ink);
}

.radio-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
}

.recommended-badge {
  display: inline-flex;
  padding: 0.125rem 0.375rem;
  margin-left: 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  background: var(--brand-accent);
  color: white;
  border-radius: 4px;
  vertical-align: middle;
}

.radio-description {
  font-size: 0.6875rem;
  color: var(--dsr-ink-muted);
  opacity: 0.85;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1.125rem;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  color: var(--dsr-ink);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.2s ease, transform 0.2s ease;
}

.form-input:hover {
  border-color: rgba(0, 0, 0, 0.15);
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-accent, #ff6b3d);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12), 0 4px 12px -4px rgba(255, 107, 61, 0.15);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--dsr-ink-muted);
  font-weight: 400;
}

html[data-theme='night'] .form-input {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

html[data-theme='night'] .form-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

html[data-theme='night'] .form-input:focus {
  background: rgba(255, 255, 255, 0.12);
}

.form-input.small {
  max-width: 110px;
}

.input-suffix {
  flex: 0 0 auto;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 2px solid rgba(0, 0, 0, 0.06);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--dsr-ink-muted);
}

.inline-inputs {
  display: flex;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--dsr-ink-muted);
  cursor: pointer;
}

.optional-section {
  padding: 1rem;
  background: var(--dsr-subcard-bg);
  border-radius: 12px;
  border: 1px solid var(--dsr-subcard-border);
}

/* Remove number input arrows */
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Submit Button styles live in src/assets/css/components/buttons.css */

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .radio-group {
    grid-template-columns: 1fr 1fr;
  }

  .radio-group.loan-type {
    grid-template-columns: 1fr 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
