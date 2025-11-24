<template>
  <div class="dsr-summary-card">
    <h3 class="card-title">
      <span class="title-icon">💪</span>
      나의 구매력
    </h3>
    
    <div class="summary-grid">
      <!-- DSR 비율 -->
      <div class="summary-item highlight">
        <div class="item-label">DSR 비율</div>
        <div class="item-value dsr-value">35%</div>
        <div class="item-badge safe">안전</div>
      </div>
      
      <!-- 월 상환 가능액 -->
      <div class="summary-item">
        <div class="item-label">월 상환 가능액</div>
        <div class="item-value">₩150만</div>
      </div>
      
      <!-- 최대 대출 -->
      <div class="summary-item">
        <div class="item-label">최대 대출</div>
        <div class="item-value">₩4.2억</div>
      </div>
      
      <!-- 필요 자기자본 -->
      <div class="summary-item">
        <div class="item-label">필요 자기자본</div>
        <div class="item-value">₩1.3억</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Mock data - will be replaced with real store data later
</script>

<style scoped>
.dsr-summary-card {
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode - Glassmorphism (info display) */
html[data-theme="day"] .dsr-summary-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.06),
    0 3px 10px rgba(0, 0, 0, 0.03);
}

/* Night Mode */
html[data-theme="night"] .dsr-summary-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.05);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.25);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.title-icon {
  font-size: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.summary-item {
  padding: 1.25rem;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

/* Day Mode Items - Glassmorphism */
html[data-theme="day"] .summary-item {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05);
}

html[data-theme="day"] .summary-item.highlight {
  background: rgba(212, 165, 116, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 165, 116, 0.4);
  box-shadow:
    0 6px 16px rgba(212, 165, 116, 0.2);
}

/* Night Mode Items */
html[data-theme="night"] .summary-item {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25);
}

html[data-theme="night"] .summary-item.highlight {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.3);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 165, 116, 0.3);
}

.item-label {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .item-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

html[data-theme="day"] .summary-item.highlight .item-label {
  color: rgba(255, 255, 255, 0.9);
}

html[data-theme="night"] .summary-item.highlight .item-label {
  color: rgba(255, 255, 255, 0.95);
}

.item-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .item-value {
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="day"] .summary-item.highlight .item-value {
  color: white;
}

html[data-theme="night"] .summary-item.highlight .item-value {
  color: white;
}

.dsr-value {
  font-size: 2rem;
}

.item-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.item-badge.safe {
  background: rgba(129, 199, 132, 0.2);
  color: #66BB6A;
}

html[data-theme="night"] .item-badge.safe {
  background: rgba(129, 199, 132, 0.25);
  color: #81C784;
}

/* Responsive */
@media (max-width: 767px) {
  .dsr-summary-card {
    padding: 1.5rem;
  }
  
  .summary-grid {
    gap: 1rem;
  }
  
  .summary-item {
    padding: 1rem;
  }
  
  .item-value {
    font-size: 1.25rem;
  }
  
  .dsr-value {
    font-size: 1.75rem;
  }
}
</style>
