<template>
  <div class="bento-card main-goal-card">
    <!-- TRUE 1:1 Grid: Donut Chart | Text + Button -->
    <div class="equal-grid">
      <!-- LEFT: CSS Donut Chart -->
      <div class="chart-column">
        <div class="card-heading">
          <h3 class="card-title">목표 달성률</h3>
        </div>
        <div class="css-donut-chart">
          <div class="donut-ring" :style="{ '--progress': achievementRate + '%' }">
            <div class="donut-hole">
              <div class="donut-label">진행도</div>
              <div class="donut-text">{{ achievementRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- RIGHT: Text + Button (Vertical Stack) -->
      <div class="content-column">
        <div class="text-stack">
          <div class="context-small">입주까지</div>
          <div class="amount-row">
            <div class="amount-huge">{{ formatNumber(remainingAmount) }}<span class="unit-small">만원</span></div>
            <span class="pill ghost">남은 금액</span>
          </div>
          <div class="subtitle-info">
            목표: {{ propertyName }} <span class="muted">(총 {{ formatNumber(targetAmount) }}만원)</span>
          </div>
        </div>
        
        <!-- Full-Width Button -->
        <button class="savings-button" @click="handleSaving">
          <AppIcon name="floppyDisk" :size="20" :active="true" :is-major-cta="true" class="btn-icon" aria-hidden="true" />
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
import { useGamificationStore } from '../../../stores/gamificationStore'
import { formatNumber } from '../../../utils/formatters'
import AppIcon from '../../common/AppIcon.vue'

const dreamHomeStore = useDreamHomeStore()
const {
  currentAmount,
  targetAmount,
  propertyName,
  achievementRate,
  remainingAmount,
  monthlyGoal
} = storeToRefs(dreamHomeStore)
const gamificationStore = useGamificationStore()
const { remainingExp } = storeToRefs(gamificationStore)

const contributionAmount = computed(() => {
  const remaining = Math.max(0, remainingAmount.value)
  const goal = Number(monthlyGoal.value) || 0
  if (!remaining) return 0
  if (!goal) return remaining
  return Math.min(goal, remaining)
})

const XP_REWARD = 60

const handleSaving = async () => {
  try {
    const contribution = contributionAmount.value
    if (contribution <= 0) {
      return
    }

    await dreamHomeStore.updateProgress(contribution)
    await gamificationStore.addExperience(XP_REWARD)
  } catch (error) {
    console.error('XP 적립/저축 실패', error)
  }
}
</script>

<style scoped>
.main-goal-card {
  grid-area: main;
  grid-row: auto;
  padding: 1.35rem 1.4rem;
}

/* TRUE 1:1 Grid Layout */
.equal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem; /* Reduced from 2.5rem */
  align-items: center;
  height: 100%;
}

/* LEFT: Chart Column */
.chart-column {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.35rem;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: flex-start;
}

.meta-value {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

/* CSS Donut Chart */
.css-donut-chart {
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
}

.donut-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--brand-accent, #ff6b3d) 0%,
    var(--brand-accent, #ff6b3d) var(--progress, 28%),
    #e5e7eb var(--progress, 28%),
    #e5e7eb 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform: rotate(-90deg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.donut-ring:hover {
  background: conic-gradient(
    #ff8559 0%,
    #ff8559 var(--progress, 28%),
    #e5e7eb var(--progress, 28%),
    #e5e7eb 100%
  );
}

.donut-hole {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid var(--border-soft, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  flex-direction: column;
}

html[data-theme="night"] .donut-hole {
  background: rgba(32, 36, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.08);
}

.donut-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6b7280);
}

.donut-text {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .donut-text {
  color: var(--showroom-text-night, #f5f6f7);
}

/* RIGHT: Content Column - Vertical Stack */
.content-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Reduced from 2rem */
  justify-content: center;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  color: var(--bento-text-muted, #6b7280);
  line-height: 1.2;
}

/* HUGE Amount - The Star */
.amount-huge {
  font-size: 2.15rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 0.4rem 0;
}

html[data-theme="night"] .amount-huge {
  color: var(--showroom-text-night, #F5EDE3);
}

.unit-small {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
  margin-left: 0.2rem;
}

/* Subtitle Info */
.subtitle-info {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  margin-top: 0.5rem;
}

html[data-theme="night"] .subtitle-info {
  color: var(--showroom-text-night, #F5EDE3);
}

.muted {
  font-weight: 400;
  color: var(--bento-text-muted, #6b7280);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  color: var(--brand-accent, #ff6b3d);
  font-weight: 700;
  font-size: 0.875rem;
}

.pill.ghost {
  background: var(--surface-muted, #f3f4f6);
  color: var(--bento-text-muted, #6b7280);
  border: 1px solid var(--border-soft, #e5e7eb);
}

.progress-note {
  margin-top: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

/* Full-Width Savings Button */
.savings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.95rem 1.6rem;
  min-height: 52px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: #ffffff;
  box-shadow: 0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.savings-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.savings-button:active {
  transform: translateY(1px) scale(0.99);
  opacity: 0.9;
  box-shadow: inset 0 2px 6px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

.saving-feedback {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .saving-feedback {
  color: var(--showroom-text-night, #f5f6f7);
}


.btn-icon {
  font-size: 1.375rem;
  color: #ffffff;
}

.btn-text {
  letter-spacing: 0.03em;
}

/* Responsive */
@media (max-width: 1039px) {
  .equal-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .css-donut-chart {
    max-width: 180px; /* Smaller on tablet */
  }

  .text-stack {
    text-align: center;
  }

  .amount-row {
    justify-content: center;
  }

  .amount-huge {
    font-size: 2.25rem;
  }
}

@media (max-width: 767px) {
  .main-goal-card {
    padding: 1.25rem; /* Reduced from 1.5rem */
  }

  .equal-grid {
    gap: 1.25rem; /* Tighter gap */
  }

  .css-donut-chart {
    max-width: 140px; /* Even smaller on mobile */
  }

  .donut-text {
    font-size: 1.5rem; /* Smaller percentage text */
  }

  .content-column {
    gap: 1.1rem; /* Tighter vertical gap */
  }

  .context-small {
    font-size: 0.875rem;
  }

  .amount-huge {
    font-size: 1.75rem; /* Smaller huge text */
  }

  .unit-small {
    font-size: 1.1rem;
  }

  .subtitle-info {
    font-size: 0.875rem;
  }

  .savings-button {
    padding: 0.85rem 1.35rem;
    min-height: 48px;
    font-size: 1rem;
    gap: 0.5rem;
  }

  .btn-icon {
    font-size: 1.25rem;
    color: #ffffff;
  }
}

/* Extra small devices */
@media (max-width: 374px) {
  .amount-huge {
    font-size: 1.6rem;
  }

  .css-donut-chart {
    max-width: 130px;
  }
}
</style>
