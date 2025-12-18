<template>
  <Transition name="fade-slide">
    <DsrSection v-if="simulationResult" class="simulation-result" :enterDelay="enterDelay">
      <div class="result-hero" :class="resultToneClass">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <AppIcon :name="resultIcon" :size="20" weight="fill" />
            <span>{{ resultBadgeText }}</span>
          </div>
          <div class="hero-label">최대 대출 가능액</div>
          <div class="hero-amount">
            <span class="amount-value">{{ formatCurrency(simulationResult.maxLoanAmount) }}</span>
          </div>
          <div class="hero-sub">DSR {{ afterDsrText }} 기준</div>
        </div>
      </div>

      <div class="dsr-comparison-bar">
        <div class="comparison-header">
          <span class="comparison-title">DSR 변화</span>
          <div class="comparison-legend">
            <span class="legend-item current"><span class="legend-dot"></span>현재</span>
            <span class="legend-item projected"><span class="legend-dot"></span>대출 후</span>
          </div>
        </div>

        <div class="dsr-track">
          <div class="track-zones">
            <div class="zone safe" style="width: 40%"></div>
            <div class="zone warning" style="width: 10%"></div>
            <div class="zone danger" style="width: 50%"></div>
          </div>

          <div class="limit-line" style="left: 40%">
            <span class="limit-label">40%</span>
          </div>

          <div class="dsr-marker current-marker" :style="{ left: `${currentMarkerLeft}%` }">
            <span class="marker-value">{{ currentDsrText }}</span>
          </div>

          <div class="dsr-marker projected-marker" :class="resultToneClass" :style="{ left: `${afterMarkerLeft}%` }">
            <div class="pulse-ring"></div>
            <span class="marker-value">{{ afterDsrText0 }}</span>
          </div>
        </div>

        <div class="comparison-footer">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card grade-card">
          <div class="info-card-header">
            <AppIcon name="medal" :size="18" :active="true" />
            <span>DSR 등급</span>
          </div>
          <div class="grade-display" :class="simulationResult.userGrade?.toLowerCase()">
            {{ getGradeLabel(simulationResult.userGrade) }}
          </div>
          <p class="grade-desc">{{ getGradeDescription(simulationResult.userGrade) }}</p>
        </div>

        <div v-if="simulationResult.appliedPolicy" class="info-card policy-card">
          <div class="info-card-header">
            <AppIcon name="fileText" :size="18" :active="true" />
            <span>적용된 정책</span>
          </div>
          <div class="policy-items">
            <div class="policy-row">
              <span>스트레스 금리</span>
              <span class="policy-value"
                >+{{ Number(simulationResult.appliedPolicy.stressDsrRate ?? 0).toFixed(2) }}%p</span
              >
            </div>
            <div class="policy-row">
              <span>장래소득 배율</span>
              <span class="policy-value">{{ Number(simulationResult.appliedPolicy.youthIncomeMultiplier ?? 0).toFixed(2) }}x</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tip-card" :class="tipCardClass">
        <AppIcon :name="tipIcon" :size="24" weight="fill" class="tip-icon" aria-hidden="true" />
        <div class="tip-content">
          <strong>{{ tipTitle }}</strong>
          <p>{{ contextualTip }}</p>
        </div>
      </div>

      <div class="result-actions">
        <button v-if="simulationResult.maxLoanAmount > 0" class="action-button primary" @click="goToProperties">
          <AppIcon name="house" :size="20" />
          이 예산으로 매물 찾아보기
        </button>

        <div class="secondary-actions">
          <button class="action-button ghost" @click="goToProfile">
            <AppIcon name="pencil" :size="18" />
            소득 수정
          </button>

          <button class="action-button ghost" @click="resetSimulation">
            <AppIcon name="arrowCounterClockwise" :size="18" />
            다시 계산
          </button>
        </div>
      </div>
    </DsrSection>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '@/stores/dsrStore'
import DsrSection from '@/components/dsr/DsrSection.vue'
import { formatKrwManwon as formatCurrency } from '@/utils/formatters'

defineProps({
  enterDelay: { type: String, default: '120ms' }
})

const router = useRouter()
const dsrStore = useDsrStore()
const { simulationResult } = storeToRefs(dsrStore)

const maxLoanTier = computed(() => {
  const maxLoan = simulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return 'high'
  if (maxLoan >= 50000000) return 'mid'
  return 'low'
})

const tipCardClass = computed(() => {
  if (maxLoanTier.value === 'high') return 'tip-positive'
  if (maxLoanTier.value === 'mid') return 'tip-neutral'
  return 'tip-warning'
})

const tipIcon = computed(() => {
  if (maxLoanTier.value === 'high') return 'checkCircle'
  if (maxLoanTier.value === 'mid') return 'info'
  return 'warning'
})

const tipTitle = computed(() => {
  if (maxLoanTier.value === 'high') return '대출 가능!'
  if (maxLoanTier.value === 'mid') return '대출 가능 (제한적)'
  return '대출 어려움'
})

const contextualTip = computed(() => {
  const result = simulationResult.value
  if (!result) return ''

  const maxLoan = result.maxLoanAmount || 0
  const dsrAfter = Number(result.dsrAfterMaxLoanPercent ?? 0)

  if (maxLoanTier.value === 'high') {
    return `최대 ${formatCurrency(maxLoan)}까지 대출 가능해요. DSR ${dsrAfter.toFixed(1)}%로 안정적인 수준입니다.`
  }
  if (maxLoanTier.value === 'mid') {
    return `${formatCurrency(maxLoan)}까지 대출 가능하지만, 기존 대출을 줄이면 한도가 늘어날 수 있어요.`
  }
  return result.simulationTip || '기존 대출 상환을 우선 검토해보세요.'
})

const resultToneClass = computed(() => {
  if (maxLoanTier.value === 'high') return 'tone-positive'
  if (maxLoanTier.value === 'mid') return 'tone-neutral'
  return 'tone-warning'
})

const resultIcon = computed(() => {
  if (maxLoanTier.value === 'high') return 'rocketLaunch'
  if (maxLoanTier.value === 'mid') return 'trendUp'
  return 'warning'
})

const resultBadgeText = computed(() => {
  if (maxLoanTier.value === 'high') return '대출 가능'
  if (maxLoanTier.value === 'mid') return '제한적 가능'
  return '추가 검토 필요'
})

function getGradeDescription(grade) {
  const descriptions = {
    SAFE: '대출 승인에 유리한 상태입니다',
    WARNING: '추가 대출 시 신중한 검토가 필요합니다',
    RESTRICTED: '현재 상태에서는 대출이 어려울 수 있습니다'
  }
  return descriptions[grade] || ''
}

function getGradeLabel(grade) {
  const labels = { SAFE: '안전', WARNING: '주의', RESTRICTED: '위험' }
  return labels[grade] || grade
}

function clampPercent(value) {
  const asNumber = Number(value || 0)
  return Math.max(0, Math.min(100, asNumber))
}

const currentMarkerLeft = computed(() => clampPercent(simulationResult.value?.currentDsrPercent))
const afterMarkerLeft = computed(() => clampPercent(simulationResult.value?.dsrAfterMaxLoanPercent))

const currentDsrText = computed(() => `${Number(simulationResult.value?.currentDsrPercent ?? 0).toFixed(0)}%`)
const afterDsrText = computed(() => `${Number(simulationResult.value?.dsrAfterMaxLoanPercent ?? 0).toFixed(1)}%`)
const afterDsrText0 = computed(() => `${Number(simulationResult.value?.dsrAfterMaxLoanPercent ?? 0).toFixed(0)}%`)

function goToProfile() {
  router.push('/profile')
}

function goToProperties() {
  router.push('/properties')
}

function resetSimulation() {
  dsrStore.clearSimulationResult()
}
</script>

<style scoped>
:deep(.fade-slide-enter-active),
:deep(.fade-slide-leave-active) {
  transition: opacity 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1)),
    transform 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1));
}

:deep(.fade-slide-enter-from),
:deep(.fade-slide-leave-to) {
  opacity: 0;
  transform: translateY(10px);
}

.result-hero {
  position: relative;
  padding: 2.5rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 24px;
  overflow: hidden;
  text-align: center;
  isolation: isolate;
}

.result-hero.tone-positive,
.result-hero.tone-neutral,
.result-hero.tone-warning {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
}

.result-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 20% 80%, rgba(255, 107, 61, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255, 107, 61, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255, 255, 255, 0.35), transparent 60%),
    radial-gradient(ellipse 50% 30% at 70% 80%, rgba(255, 255, 255, 0.15), transparent 50%);
  pointer-events: none;
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-amount {
  margin-bottom: 0.75rem;
}

.amount-value {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  line-height: 1.1;
}

.hero-sub {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: inline-block;
}

.dsr-comparison-bar {
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comparison-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--dsr-ink);
}

.comparison-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--dsr-ink-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item.current .legend-dot {
  background: var(--dsr-ink-muted);
}

.legend-item.projected .legend-dot {
  background: var(--brand-accent, #ff6b3d);
}

.dsr-track {
  position: relative;
  height: 32px;
  margin-bottom: 0.5rem;
}

.track-zones {
  position: absolute;
  inset: 0;
  display: flex;
  border-radius: 8px;
  overflow: hidden;
}

.track-zones .zone {
  height: 100%;
}

.zone.safe {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25));
}

.zone.warning {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.3));
}

.zone.danger {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.35));
}

.limit-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--dsr-ink-muted);
  opacity: 0.5;
  transform: translateX(-50%);
}

.limit-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--dsr-ink-muted);
  background: var(--glass-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.dsr-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.current-marker::before {
  content: '';
  width: 12px;
  height: 12px;
  background: var(--dsr-ink-muted);
  border-radius: 50%;
  border: 2px solid var(--glass-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.current-marker .marker-value {
  position: absolute;
  bottom: -22px;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--dsr-ink-muted);
  white-space: nowrap;
}

.projected-marker {
  z-index: 2;
}

.projected-marker::before {
  content: '';
  width: 18px;
  height: 18px;
  background: var(--brand-accent, #ff6b3d);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(255, 107, 61, 0.4);
  z-index: 1;
}

.projected-marker .marker-value {
  position: absolute;
  top: -28px;
  font-size: 0.8125rem;
  font-weight: 800;
  color: var(--dsr-ink);
  background: var(--glass-bg);
  padding: 2px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.pulse-ring {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--brand-accent, #ff6b3d);
  opacity: 0;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.comparison-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--dsr-ink-muted);
  opacity: 0.7;
  padding: 0 0.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.info-card {
  padding: 1.25rem;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.12);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--dsr-ink-muted);
}

.grade-display {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.grade-display.safe {
  color: #10b981;
}
.grade-display.warning {
  color: #f59e0b;
}
.grade-display.restricted {
  color: #ef4444;
}

.grade-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--dsr-ink-muted);
  line-height: 1.4;
}

.policy-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.policy-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--dsr-ink-muted);
}

.policy-value {
  font-weight: 700;
  color: var(--dsr-ink);
}

.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--dsr-warning-bg);
  border-radius: 12px;
  border: 1px solid rgba(251, 192, 45, 0.22);
  color: var(--dsr-ink);
}

.tip-card.tip-positive {
  background: var(--dsr-safe-bg);
  border-color: rgba(67, 160, 71, 0.2);
}

.tip-card.tip-positive .tip-icon {
  color: var(--dsr-safe-fg);
}

.tip-card.tip-neutral {
  background: var(--dsr-warning-bg);
  border-color: rgba(251, 192, 45, 0.2);
}

.tip-card.tip-neutral .tip-icon {
  color: var(--dsr-warning-fg);
}

.tip-card.tip-warning {
  background: var(--dsr-danger-bg);
  border-color: rgba(244, 67, 54, 0.2);
}

.tip-card.tip-warning .tip-icon {
  color: var(--dsr-danger-fg);
}

.tip-icon {
  flex-shrink: 0;
  color: var(--dsr-warning-fg);
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tip-content strong {
  font-weight: 700;
  font-size: 0.9375rem;
}

.tip-content p {
  margin: 0;
  font-size: 0.8125rem;
  opacity: 0.9;
  line-height: 1.5;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--dsr-subcard-border);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-button.primary {
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: white;
  box-shadow: 0 8px 20px -12px rgba(255, 107, 61, 0.5);
}

.action-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -12px rgba(255, 107, 61, 0.6);
}

.secondary-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.action-button.ghost {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 1rem;
  background: var(--surface-muted);
  color: var(--dsr-ink-muted);
  border: 1px solid var(--dsr-subcard-border);
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.ghost:hover {
  background: var(--dsr-subcard-bg);
  color: var(--dsr-ink);
  border-color: var(--brand-accent);
}

@media (max-width: 480px) {
  .result-hero {
    padding: 2rem 1rem;
  }

  .amount-value {
    font-size: 2.25rem;
  }

  .hero-label {
    font-size: 0.8125rem;
  }

  .hero-sub {
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
  }

  .dsr-comparison-bar {
    padding: 1rem;
  }

  .dsr-track {
    height: 40px;
    margin-bottom: 1rem;
  }

  .projected-marker .marker-value {
    top: -24px;
    font-size: 0.75rem;
    padding: 2px 6px;
  }

  .current-marker .marker-value {
    bottom: -20px;
    font-size: 0.625rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .secondary-actions {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-glow {
    animation: none;
  }

  .pulse-ring {
    animation: none;
  }

  .dsr-marker {
    transition: none;
  }

  :deep(.fade-slide-enter-active),
  :deep(.fade-slide-leave-active) {
    transition: none;
  }
}
</style>

