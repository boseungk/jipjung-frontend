<template>
  <div class="judgment-result" :class="resultClass">
    <!-- Result Header -->
    <div class="result-header">
      <span class="result-emoji">{{ resultEmoji }}</span>
      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-score">점수: {{ judgment?.score ?? 0 }}점</p>
    </div>

    <!-- Judgment Comment -->
    <div class="result-comment">
      <p>"{{ judgment?.comment }}"</p>
    </div>

    <!-- Character Script -->
    <div v-if="character?.script" class="character-script">
      <span class="script-emoji">💬</span>
      <p>{{ character.script }}</p>
    </div>

    <!-- Growth Section -->
    <div v-if="growth" class="growth-section">
      <!-- EXP Change -->
      <div class="exp-change" :class="expChangeClass">
        <span class="exp-icon">{{ growth.expChange >= 0 ? '✨' : '💔' }}</span>
        <span class="exp-value">
          {{ growth.expChange >= 0 ? '+' : '' }}{{ growth.expChange }} EXP
        </span>
      </div>

      <!-- Level Progress -->
      <div class="level-progress">
        <div class="progress-header">
          <span class="level-label">Lv.{{ growth.level }} {{ growth.levelLabel }}</span>
          <span class="exp-label">{{ displayCurrentExp }} / {{ displayMaxExp }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Level Up Celebration -->
      <div v-if="growth.isLevelUp" class="level-up-celebration">
        <span class="level-up-emoji">🎉</span>
        <span class="level-up-text">레벨 업!</span>
      </div>

      <!-- Warning Message -->
      <div v-if="growth.warning" class="warning-message">
        <span class="warning-icon">⚠️</span>
        <p>{{ growth.warning }}</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="action-button primary" @click="$emit('newEntry')">
        새로운 지출 등록
      </button>
      <button type="button" class="action-button secondary" @click="$emit('viewHistory')">
        내역 보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calculateLevelProgress } from '@/constants/user'

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  /** 판결 결과 */
  judgment: {
    type: Object,
    default: null
  },
  /** 성장/경험치 정보 */
  growth: {
    type: Object,
    default: null
  },
  /** 캐릭터 반응 */
  character: {
    type: Object,
    default: null
  }
})

defineEmits(['newEntry', 'viewHistory'])

// ============================================================================
// Computed
// ============================================================================

const isReasonable = computed(() => {
  return props.judgment?.result === 'REASONABLE'
})

const resultClass = computed(() => {
  return isReasonable.value ? 'reasonable' : 'waste'
})

const resultEmoji = computed(() => {
  return isReasonable.value ? '🎉' : '😢'
})

const resultTitle = computed(() => {
  return isReasonable.value ? '합리적 소비!' : '낭비 판정...'
})

const expChangeClass = computed(() => {
  if (!props.growth) return ''
  return props.growth.expChange >= 0 ? 'positive' : 'negative'
})

/**
 * 레벨 내 진행도 계산 (누적 경험치가 아닌 현재 레벨 내 진행도)
 */
const levelProgress = computed(() => {
  if (!props.growth) return { currentInLevel: 0, requiredForLevel: 0, percent: 0 }
  return calculateLevelProgress(props.growth.currentExp, props.growth.level)
})

const progressPercent = computed(() => levelProgress.value.percent)
const displayCurrentExp = computed(() => levelProgress.value.currentInLevel)
const displayMaxExp = computed(() => levelProgress.value.requiredForLevel)
</script>

<style scoped>
.judgment-result {
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Result Header */
.result-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.result-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.reasonable .result-title {
  color: #10b981;
}

.waste .result-title {
  color: #ef4444;
}

.result-score {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Comment */
.result-comment {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.result-comment p {
  margin: 0;
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  font-style: italic;
}

/* Character Script */
.character-script {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.script-emoji {
  font-size: 1.25rem;
}

.character-script p {
  margin: 0;
  font-size: 0.9375rem;
  color: #1e40af;
  line-height: 1.5;
}

/* Growth Section */
.growth-section {
  margin-bottom: 1.5rem;
}

/* EXP Change */
.exp-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.25rem;
}

.exp-change.positive {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

.exp-change.negative {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
}

.exp-icon {
  font-size: 1.5rem;
}

/* Level Progress */
.level-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.level-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.exp-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 6px;
  transition: width 0.6s ease;
}

/* Level Up */
.level-up-celebration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.level-up-emoji {
  font-size: 1.5rem;
}

.level-up-text {
  font-size: 1rem;
  font-weight: 700;
  color: #b45309;
}

/* Warning */
.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

.warning-icon {
  font-size: 1rem;
}

.warning-message p {
  margin: 0;
  font-size: 0.875rem;
  color: #991b1b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  padding: 0.85rem 1rem;
  font-size: 0.9375rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.action-button.primary {
  background: linear-gradient(to right, #fb923c, #f97316);
  color: white;
  box-shadow:
    0 4px 12px rgba(251, 146, 60, 0.2),
    0 10px 28px rgba(249, 115, 22, 0.18);
}

.action-button.primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 6px 16px rgba(251, 146, 60, 0.3),
    0 14px 32px rgba(249, 115, 22, 0.24);
}

.action-button.primary:active {
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
