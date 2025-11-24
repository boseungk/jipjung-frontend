<template>
  <div class="dsr-summary-card">
    <h3 class="card-title">
      <span class="title-icon">💪</span>
      나의 구매력
    </h3>
    
    <!-- Hero Data: DSR Ratio -->
    <div class="dsr-hero">
      <div class="dsr-value">{{ dsrRatio }}%</div>
      <div class="dsr-badge" :class="dsrStatus.class">{{ dsrStatus.label }}</div>
    </div>
    
    <!-- Sub Data: Horizontal Layout -->
    <div class="info-row">
      <div class="info-item">
        <div class="info-label">월 상환 가능액</div>
        <div class="info-value">₩{{ formatNumber(monthlyRepaymentCapacity) }}만</div>
      </div>
      <div class="info-divider">|</div>
      <div class="info-item">
        <div class="info-label">최대 대출</div>
        <div class="info-value">{{ formatKoreanCurrency(maxLoanAmount) }}</div>
      </div>
      <div class="info-divider">|</div>
      <div class="info-item">
        <div class="info-label">필요 자기자본</div>
        <div class="info-value">{{ formatKoreanCurrency(requiredEquity) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useDsrStore } from '../../stores/dsrStore'
import { formatNumber, formatKoreanCurrency } from '../../utils/formatters'

const dsrStore = useDsrStore()
const { 
  dsrRatio, 
  dsrStatus, 
  monthlyRepaymentCapacity, 
  maxLoanAmount, 
  requiredEquity 
} = storeToRefs(dsrStore)
</script>

<style scoped>
.dsr-summary-card {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Remove card background - clean stream layout */
html[data-theme="day"] .dsr-summary-card {
  background: transparent;
}

html[data-theme="night"] .dsr-summary-card {
  background: transparent;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.title-icon {
  font-size: 1.5rem;
}

/* DSR Hero Section */
.dsr-hero {
  margin-bottom: 3rem;
}

.dsr-value {
  font-size: 5rem;
  font-weight: 800;
  color: var(--showroom-accent-day, #D4A574);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

html[data-theme="night"] .dsr-value {
  color: var(--showroom-accent-night, #D4A574);
}

.dsr-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 24px;
  font-size: 0.9375rem;
  font-weight: 700;
}

.dsr-badge.safe {
  background: rgba(129, 199, 132, 0.2);
  color: #43A047;
}

html[data-theme="night"] .dsr-badge.safe {
  background: rgba(129, 199, 132, 0.25);
  color: #81C784;
}

.dsr-badge.warning {
  background: rgba(255, 152, 0, 0.2);
  color: #F57C00;
}

html[data-theme="night"] .dsr-badge.warning {
  background: rgba(255, 152, 0, 0.25);
  color: #FFB74D;
}

.dsr-badge.danger {
  background: rgba(244, 67, 54, 0.2);
  color: #D32F2F;
}

html[data-theme="night"] .dsr-badge.danger {
  background: rgba(244, 67, 54, 0.25);
  color: #EF5350;
}

/* Info Row: Horizontal Layout */
.info-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6D4C41;
}

html[data-theme="night"] .info-label {
  color: #EFEBE9;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #4E342E;
}

html[data-theme="night"] .info-value {
  color: #FFFFFF;
}

.info-divider {
  font-size: 1.25rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.3;
}

html[data-theme="night"] .info-divider {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Responsive */
@media (max-width: 767px) {
  .dsr-summary-card {
    padding: 2rem 1.5rem;
  }
  
  .dsr-value {
    font-size: 3.5rem;
  }
  
  .info-row {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .info-divider {
    display: none;
  }
}
</style>
