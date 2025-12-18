<template>
  <div class="dsr-card">
    <div class="card-header">
      <div class="card-icon"><PhChartLine :size="24" weight="duotone" /></div>
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
          <span class="stat-value">₩{{ formatWon(maxLoanAmount) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">승인 상태</span>
          <span class="stat-value" :class="{ approved: dsrRatio <= 40, rejected: dsrRatio > 40 }">
            <PhCheckCircle v-if="dsrRatio <= 40" :size="18" weight="fill" color="#81C784" /> <PhXCircle v-else :size="18" weight="fill" color="#F44336" /> {{ dsrRatio <= 40 ? '가능' : '불가' }}
          </span>
        </div>
      </div>

      <!-- CTA Button -->
      <button class="detail-button" @click="openCalculator">
        <span class="button-icon"><AppIcon name="calculator" :size="20" :active="true" :is-major-cta="true" aria-hidden="true" /></span>
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
import { formatWon } from '../../utils/formatters'
import DsrCalculatorModal from '../modals/DsrCalculatorModal.vue'
import { PhChartLine, PhCheckCircle, PhXCircle } from '@phosphor-icons/vue'

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

/* .detail-button visuals live in src/assets/css/components/buttons.css */


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
