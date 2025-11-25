<template>
  <div class="dsr-card">
    <div class="card-header">
      <div class="card-icon">📊</div>
      <h3 class="card-title">DSR 요약</h3>
    </div>

    <div class="card-content">
      <!-- DSR Ratio Display -->
      <div class="dsr-ratio">
        <span class="ratio-label">현재 DSR 비율</span>
        <span class="ratio-value" :class="{ warning: dsrRatio > 40 }">
          {{ dsrRatio.toFixed(1) }}%
        </span>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">최대 대출 가능액</span>
          <span class="stat-value">₩{{ formatNumber(maxLoanAmount) }}만</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">승인 상태</span>
          <span class="stat-value" :class="{ approved: dsrRatio <= 40, rejected: dsrRatio > 40 }">
            {{ dsrRatio <= 40 ? '✅ 가능' : '❌ 불가' }}
          </span>
        </div>
      </div>

      <!-- CTA Button -->
      <button class="detail-button" @click="openCalculator">
        <span class="button-icon">🧮</span>
        상세 계산하기
      </button>
    </div>
    
    <!-- DSR Calculator Modal -->
    <DsrCalculatorModal 
      :is-open="calculatorOpen" 
      @close="closeCalculator"
      @result="handleCalculatorResult"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '../../stores/dsrStore'
import { formatNumber } from '../../utils/formatters'
import DsrCalculatorModal from '../modals/DsrCalculatorModal.vue'

const dsrStore = useDsrStore()
const { dsrRatio, maxLoanAmount } = storeToRefs(dsrStore)

// Modal state
const calculatorOpen = ref(false)

const openCalculator = () => {
  calculatorOpen.value = true
}

const closeCalculator = () => {
  calculatorOpen.value = false
}

const handleCalculatorResult = (result) => {
  console.log('DSR 계산 결과:', result)
  // TODO: Update store with result
}
</script>

<style scoped>
.dsr-card {
  padding: 2rem;
  background: transparent;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.card-icon {
  font-size: 2rem;
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* DSR Ratio */
.dsr-ratio {
  text-align: center;
  padding: 1.5rem;
}

.ratio-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 1rem;
}

html[data-theme="night"] .ratio-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.ratio-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--showroom-accent-day, #D4A574);
  letter-spacing: -0.02em;
}

html[data-theme="night"] .ratio-value {
  color: var(--showroom-accent-night, #D4A574);
}

.ratio-value.warning {
  color: #F44336;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: transparent;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .stat-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .stat-value {
  color: var(--showroom-text-night, #F5EDE3);
}

.stat-value.approved {
  color: #43A047;
}

.stat-value.rejected {
  color: #F44336;
}

/* Detail Button */
.detail-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .detail-button {
  background: var(--showroom-card-bg-day, #F5EDE3);
  color: var(--showroom-text-day, #5D4037);
  box-shadow:
    4px 4px 12px var(--showroom-shadow-dark-day, #D4C8BD),
    -3px -3px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .detail-button:hover {
  transform: translateY(-3px);
  box-shadow:
    6px 6px 16px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 10px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .detail-button:active {
  transform: translateY(1px);
  box-shadow:
    inset 3px 3px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    inset -2px -2px 6px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="night"] .detail-button {
  background: rgba(255, 255, 255, 0.06);
  color: var(--showroom-text-night, #F5EDE3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .detail-button:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

html[data-theme="night"] .detail-button:active {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(1px);
  box-shadow: inset 3px 3px 8px rgba(0, 0, 0, 0.4);
}

.button-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 640px) {
  .dsr-card {
    padding: 1.5rem;
  }

  .ratio-value {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
