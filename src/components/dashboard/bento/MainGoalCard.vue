<template>
  <div class="bento-card main-goal-card">
    <!-- TRUE 1:1 Grid: Donut Chart | Text + Button -->
    <div class="equal-grid">
      <!-- LEFT: CSS Donut Chart -->
      <div class="chart-column">
        <div class="css-donut-chart">
          <div class="donut-ring" :style="{ '--progress': achievementRate + '%' }">
            <div class="donut-hole">
              <div class="donut-text">{{ achievementRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- RIGHT: Text + Button (Vertical Stack) -->
      <div class="content-column">
        <div class="text-stack">
          <div class="context-small">입주까지</div>
          <div class="amount-huge">{{ formatNumber(remainingAmount) }}<span class="unit-small">만원</span></div>
          <div class="context-small">남음</div>
          <div class="subtitle-info">
            목표: {{ propertyName }} <span class="muted">(총 {{ formatNumber(targetAmount) }}만원)</span>
          </div>
        </div>
        
        <!-- Full-Width Button -->
        <button class="savings-button" @click="handleSaving">
          <span class="btn-icon">💾</span>
          <span class="btn-text">저축하기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDreamHomeStore } from '../../../stores/dreamHomeStore'
import { formatNumber } from '../../../utils/formatters'

const dreamHomeStore = useDreamHomeStore()
const { currentAmount, targetAmount, propertyName, achievementRate } = storeToRefs(dreamHomeStore)

const remainingAmount = computed(() => targetAmount.value - currentAmount.value)

const handleSaving = () => {
  console.log('저축하기 클릭')
}
</script>

<style scoped>
.main-goal-card {
  grid-area: main;
  grid-row: auto;
  padding: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .main-goal-card {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

/* TRUE 1:1 Grid Layout */
.equal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
  height: 100%;
}

/* LEFT: Chart Column */
.chart-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CSS Donut Chart */
.css-donut-chart {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
}

.donut-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #fb923c 0%,
    #fb923c var(--progress, 28%),
    #E8E0D5 var(--progress, 28%),
    #E8E0D5 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform: rotate(-90deg);
}

.donut-hole {
  width: 65%;
  height: 65%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
}

html[data-theme="night"] .donut-hole {
  background: rgba(58, 53, 48, 0.95);
}

.donut-text {
  font-size: 2rem;
  font-weight: 900;
  color: #2C2420;
}

html[data-theme="night"] .donut-text {
  color: #F5EDE3;
}

/* RIGHT: Content Column - Vertical Stack */
.content-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
}

/* Text Stack */
.text-stack {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* Small Context Text */
.context-small {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #999;
  line-height: 1.2;
}

html[data-theme="night"] .context-small {
  color: rgba(255, 255, 255, 0.5);
}

/* HUGE Amount - The Star */
.amount-huge {
  font-size: 2.75rem;
  font-weight: 900;
  color: #2C2420;
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 0.4rem 0;
}

html[data-theme="night"] .amount-huge {
  color: var(--showroom-text-night, #F5EDE3);
}

.unit-small {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin-left: 0.2rem;
}

html[data-theme="night"] .unit-small {
  color: rgba(255, 255, 255, 0.6);
}

/* Subtitle Info */
.subtitle-info {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #2C2420;
  margin-top: 0.5rem;
}

html[data-theme="night"] .subtitle-info {
  color: var(--showroom-text-night, #F5EDE3);
}

.muted {
  font-weight: 400;
  color: #999;
}

html[data-theme="night"] .muted {
  color: rgba(255, 255, 255, 0.5);
}

/* Full-Width Savings Button */
.savings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.0625rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(to right, #fb923c, #f97316);
  color: white;
  box-shadow: 0 10px 20px -5px rgba(251, 146, 60, 0.4);
}

.savings-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px -5px rgba(251, 146, 60, 0.5);
}

.savings-button:active {
  transform: translateY(0px);
  box-shadow: 0 10px 20px -5px rgba(251, 146, 60, 0.4);
}

.btn-icon {
  font-size: 1.375rem;
}

.btn-text {
  letter-spacing: 0.03em;
}

/* Responsive */
/* Desktop: grid-row span 2 */
@media (min-width: 1040px) {
  .main-goal-card {
    grid-row: span 2;
  }
}

/* Tablet/Mobile: layout adjustments */
@media (max-width: 1039px) {
  .equal-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .css-donut-chart {
    max-width: 200px; /* Smaller on tablet */
  }

  .text-stack {
    text-align: center;
  }

  .amount-huge {
    font-size: 2.5rem;
  }
}

@media (max-width: 767px) {
  .main-goal-card {
    padding: 1.25rem; /* Reduced from 1.5rem */
  }

  .equal-grid {
    gap: 1rem; /* Tighter gap */
  }

  .css-donut-chart {
    max-width: 160px; /* Even smaller on mobile */
  }

  .donut-text {
    font-size: 1.5rem; /* Smaller percentage text */
  }

  .content-column {
    gap: 1.25rem; /* Tighter vertical gap */
  }

  .context-small {
    font-size: 0.875rem;
  }

  .amount-huge {
    font-size: 2rem; /* Smaller huge text */
  }

  .unit-small {
    font-size: 1.25rem;
  }

  .subtitle-info {
    font-size: 0.875rem;
  }

  .savings-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  .btn-icon {
    font-size: 1.25rem;
  }
}

/* Extra small devices */
@media (max-width: 374px) {
  .amount-huge {
    font-size: 1.75rem;
  }

  .css-donut-chart {
    max-width: 140px;
  }
}
</style>
