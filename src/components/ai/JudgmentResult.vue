<template>
  <div class="judgment-result-container" :class="resultToneClass">
    <!-- Header Badge -->
    <div class="result-badge-container">
      <div class="result-badge">
        <AppIcon :name="resultIconName" :size="16" weight="fill" />
        <span class="badge-text">{{ resultTitle }}</span>
      </div>
    </div>

    <!-- Score Section -->
    <div class="score-section">
      <div class="score-display">
        <span class="score-number">{{ judgment?.score ?? 0 }}</span>
        <span class="score-label">점</span>
      </div>
      <p class="score-comment">
        {{ judgment?.comment }}
      </p>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Growth Report -->
    <div v-if="growth" class="growth-section">
      <div class="section-label">
        <AppIcon name="trendUp" :size="14" weight="bold" />
        <span>성장 리포트</span>
      </div>

      <div class="level-info">
        <div class="level-text">
          <span class="lv-number">Lv.{{ growth.level }}</span>
          <span class="lv-name">{{ growth.levelLabel }}</span>
        </div>
        <span class="exp-text">{{ displayCurrentExp }} / {{ displayMaxExp }}</span>
      </div>

      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }">
            <div class="shimmer"></div>
          </div>
        </div>
      </div>

      <div class="growth-footer">
        <div class="exp-change" :class="expChangeClass">
          {{ growth.expChange >= 0 ? '+' : '' }}{{ growth.expChange }} EXP
        </div>
        <div v-if="growth.isLevelUp" class="levelup-badge">
          레벨 업!
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn btn-primary" @click="$emit('newEntry')">
        <span>기록하기</span>
      </button>
      <button type="button" class="btn btn-secondary" @click="$emit('viewHistory')">
        <AppIcon name="listBullets" :size="18" weight="regular" />
        <span>내역</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calculateLevelProgress } from '@/constants/user'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  judgment: { type: Object, default: null },
  growth: { type: Object, default: null }
})

defineEmits(['newEntry', 'viewHistory'])

// Computed
const isReasonable = computed(() => props.judgment?.result === 'REASONABLE')

const resultToneClass = computed(() => isReasonable.value ? 'tone-positive' : 'tone-negative')

const resultTitle = computed(() => isReasonable.value ? '합리적 소비' : '과소비 주의')
const resultIconName = computed(() => isReasonable.value ? 'checkCircle' : 'warningCircle')

const expChangeClass = computed(() => {
  if (!props.growth) return ''
  return props.growth.expChange >= 0 ? 'exp-plus' : 'exp-minus'
})

const levelProgress = computed(() => {
  if (!props.growth) return { currentInLevel: 0, requiredForLevel: 0, percent: 0 }
  return calculateLevelProgress(props.growth.currentExp, props.growth.level)
})

const progressPercent = computed(() => levelProgress.value.percent)
const displayCurrentExp = computed(() => levelProgress.value.currentInLevel)
const displayMaxExp = computed(() => levelProgress.value.requiredForLevel)
</script>

<style scoped>
.judgment-result-container {
  /* Local Design Tokens */
  --bg-glass: linear-gradient(145deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.5));
  --border-glass: rgba(255, 255, 255, 0.6);
  --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  
  --color-text-main: #1f2937;
  --color-text-sub: #6b7280;
  --color-bg-sub: rgba(255, 255, 255, 0.5); /* Lighter sub-bg for cleaner look */
  --color-border-sub: rgba(0, 0, 0, 0.04);

  --color-safe: #059669;
  --color-safe-bg: rgba(16, 185, 129, 0.1);
  --color-danger: #dc2626;
  --color-danger-bg: rgba(239, 68, 68, 0.08);

  --font-display: 'Fredoka', sans-serif;
  --font-body: 'Noto Sans KR', sans-serif;

  position: relative;
  width: 100%;
  padding: 2rem;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  animation: fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

:global([data-theme='night']) .judgment-result-container {
  --bg-glass: linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(30, 30, 35, 0.5));
  --border-glass: rgba(255, 255, 255, 0.08);
  --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  --color-text-main: #f5f6f7;
  --color-text-sub: rgba(245, 246, 247, 0.6);
  --color-bg-sub: rgba(255, 255, 255, 0.05);
  --color-border-sub: rgba(255, 255, 255, 0.05);
}

/* Header Badge */
.result-badge-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-bg-sub);
  color: var(--color-text-sub);
  border: 1px solid var(--color-border-sub);
  transition: all 0.3s ease;
}

.tone-positive .result-badge {
  background: var(--color-safe-bg);
  color: var(--color-safe);
  border-color: rgba(16, 185, 129, 0.2);
}

.tone-negative .result-badge {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.2);
}

/* Score Section */
.score-section {
  text-align: center;
  margin-bottom: 2rem;
}

.score-display {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.3rem; /* Increased from default for better separation */
  line-height: 1;
  margin-bottom: 1rem;
}

.score-number {
  font-family: var(--font-display);
  font-size: 4.5rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  
  /* Gradient Text for Depth */
  background: linear-gradient(135deg, var(--color-text-main) 20%, var(--color-text-sub) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  /* Fallback color */
  color: var(--color-text-main);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
}

.score-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-sub);
  margin-bottom: 0.8rem;
  margin-left: 0.5rem; /* Increased for clearer separation */
}

.score-comment {
  font-family: var(--font-body);
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-text-sub);
  max-width: 85%;
  margin: 0 auto;
  font-weight: 500;
}

/* Divider */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-text-main), transparent);
  opacity: 0.1;
  margin: 0 1rem 2rem;
}

:global([data-theme='night']) .divider {
  background: linear-gradient(90deg, transparent, #fff, transparent);
  opacity: 0.15;
}

/* Growth Section */
.growth-section {
  background: var(--color-bg-sub);
  border: 1px solid var(--color-border-sub);
  border-radius: 18px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.level-text {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.lv-number {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
}

.lv-name {
  font-size: 0.875rem;
  color: var(--color-text-sub);
  font-weight: 500;
}

.exp-text {
  font-size: 0.8125rem;
  color: var(--color-text-sub);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.progress-container {
  height: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

:global([data-theme='night']) .progress-container {
  background: rgba(255, 255, 255, 0.1);
}

.progress-track {
  width: 100%;
  height: 100%;
}

.progress-fill {
  height: 100%;
  background: var(--color-text-main);
  border-radius: 4px;
  position: relative;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.tone-positive .progress-fill { background: var(--color-safe); }
.tone-negative .progress-fill { background: var(--color-danger); }

/* Shimmer Effect */
.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.growth-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.exp-change {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.exp-plus { color: var(--color-safe); }
.exp-minus { color: var(--color-danger); }

.levelup-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  /* Local overrides for layout if needed, but letting global styles handle visual */
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
