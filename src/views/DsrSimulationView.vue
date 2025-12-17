<template>
  <div class="dsr-simulation-view">
    <header class="view-header">
      <button class="back-button" @click="goBack" aria-label="뒤로 가기">
        <AppIcon name="arrowLeft" :size="24" weight="bold" aria-hidden="true" />
      </button>
      <div class="header-text">
        <h1 class="view-title">DSR 시뮬레이션</h1>
        <p class="view-subtitle">내 소득과 부채로 2026년 정책 기반 PRO 분석</p>
      </div>
    </header>

    <div class="view-container">
      <!-- Current DSR Status Card -->
      <section class="section current-status" style="--enter-delay: 0ms">
        <div class="section-header">
          <h2 class="section-title">현재 DSR 상태</h2>
          <span class="status-chip" :class="dsrStatus.class">{{ dsrStatus.label }}</span>
        </div>
        <div class="status-card">
          <div class="dsr-gauge">
            <apexchart
              v-if="chartReady"
              :key="theme"
              type="radialBar"
              :options="gaugeOptions"
              :series="[displayRatio]"
              height="180"
            />
            <div v-else class="gauge-skeleton" aria-hidden="true"></div>
          </div>
          <div class="status-info">
            <div class="status-detail">
              <span class="label">월 소득</span>
              <span class="value">{{ formatCurrency(monthlyIncome) }}</span>
            </div>
            <div class="status-detail">
              <span class="label">기존 상환액</span>
              <span class="value">{{ formatCurrency(existingLoanMonthly) }}</span>
            </div>
            <div class="status-detail">
              <span class="label">상환 여력</span>
              <span class="value">{{ formatCurrency(monthlyRepaymentCapacity) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PRO Simulation Form -->
      <section class="section simulation-form" style="--enter-delay: 80ms">
        <div class="section-header">
          <div>
            <h2 class="section-title">PRO 시뮬레이션</h2>
            <p class="section-description">입력값에 따라 최대 대출 가능액과 등급을 계산해요</p>
          </div>
        </div>

        <form @submit.prevent="runSimulation" class="form">
          <!-- Region -->
          <div class="form-group">
            <label class="form-label">지역</label>
            <div class="radio-group">
              <label class="radio-option" :class="{ selected: formData.region === 'SEOUL_METRO' }">
                <input type="radio" v-model="formData.region" value="SEOUL_METRO" />
                <span class="radio-text">수도권</span>
              </label>
              <label class="radio-option" :class="{ selected: formData.region === 'ETC' }">
                <input type="radio" v-model="formData.region" value="ETC" />
                <span class="radio-text">비수도권</span>
              </label>
            </div>
          </div>

          <!-- Loan Type -->
          <div class="form-group">
            <label class="form-label">대출 유형</label>
            <div class="radio-group loan-type">
              <label 
                v-for="type in loanTypes" 
                :key="type.value"
                class="radio-option"
                :class="{ selected: formData.targetLoanType === type.value }"
              >
                <input type="radio" v-model="formData.targetLoanType" :value="type.value" />
                <span class="radio-text">{{ type.label }}</span>
              </label>
            </div>
          </div>

          <!-- Loan Rate -->
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

          <!-- Maturity Years -->
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

          <!-- Jeonse Loan (Optional) -->
          <div class="form-group optional-section">
            <label class="form-label">
              <AppIcon name="house" :size="18" aria-hidden="true" />
              전세대출 (선택)
            </label>
            <div class="inline-inputs">
              <input
                type="number"
                v-model.number="formData.jeonseLoanBalance"
                class="form-input"
                placeholder="잔액 (원)"
              />
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

          <button 
            type="submit" 
            class="submit-button"
            :disabled="isSimulating"
          >
            <template v-if="isSimulating">
              <AppIcon name="spinnerGap" :size="20" weight="bold" class="spin" aria-hidden="true" />
              <span>실행 중...</span>
            </template>
            <span v-else>시뮬레이션 실행</span>
          </button>
        </form>
      </section>

      <!-- Simulation Result -->
      <Transition name="fade-slide">
        <section v-if="simulationResult" class="section simulation-result" style="--enter-delay: 120ms">
          <div class="section-header">
            <h2 class="section-title">시뮬레이션 결과</h2>
          </div>
        
          <div class="result-cards">
            <div class="result-card highlight">
              <span class="result-label">최대 대출 가능액</span>
              <span class="result-value">{{ formatCurrency(simulationResult.maxLoanAmount) }}</span>
            </div>
          
            <div class="result-card">
              <span class="result-label">현재 DSR</span>
              <span class="result-value">{{ simulationResult.currentDsrPercent?.toFixed(1) }}%</span>
            </div>
          
            <div class="result-card">
              <span class="result-label">최대 대출 시 DSR</span>
              <span class="result-value">{{ simulationResult.dsrAfterMaxLoanPercent?.toFixed(1) }}%</span>
            </div>
          
            <div class="result-card">
              <span class="result-label">DSR 등급</span>
              <span class="result-value grade" :class="simulationResult.userGrade?.toLowerCase()">
                {{ getGradeLabel(simulationResult.userGrade) }}
              </span>
            </div>
          </div>

          <!-- Applied Policy -->
          <div v-if="simulationResult.appliedPolicy" class="policy-info">
            <h3>적용된 정책</h3>
            <div class="policy-detail">
              <span>스트레스 금리</span>
              <span>+{{ simulationResult.appliedPolicy.stressDsrRate?.toFixed(2) }}%p</span>
            </div>
            <div class="policy-detail">
              <span>장래소득 배율</span>
              <span>{{ simulationResult.appliedPolicy.youthIncomeMultiplier?.toFixed(3) }}x</span>
            </div>
          </div>

          <!-- Simulation Tip -->
          <div v-if="simulationResult.simulationTip" class="tip-card">
            <AppIcon name="lightbulb" :size="20" weight="fill" class="tip-icon" aria-hidden="true" />
            <span>{{ simulationResult.simulationTip }}</span>
          </div>

          <!-- Game Update -->
          <div v-if="simulationResult.gameUpdate" class="game-update">
            <h3>게임 갱신</h3>
            <div class="update-detail">
              <span>줄어든 목표 저축액</span>
              <span class="positive">-{{ formatCurrency(simulationResult.gameUpdate.reducedGap) }}</span>
            </div>
            <div class="update-detail">
              <span>획득 경험치</span>
              <span class="positive">+{{ simulationResult.gameUpdate.expGained }} XP</span>
            </div>
          </div>
        </section>
      </Transition>

      <!-- Error Display -->
      <Transition name="fade-slide">
        <div v-if="simulationError" class="error-message" role="alert">
          <AppIcon name="warning" :size="20" weight="fill" aria-hidden="true" />
          <span>{{ simulationError }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '@/stores/dsrStore'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import { CHART_PALETTE } from '@/constants/colors'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const router = useRouter()
const dsrStore = useDsrStore()
const authStore = useAuthStore()
const { theme } = useTheme()

const { 
  dsrRatio, dsrStatus, monthlyIncome, existingLoanMonthly, 
  monthlyRepaymentCapacity, isSimulating, simulationResult, simulationError
} = storeToRefs(dsrStore)

const chartReady = ref(false)

const loanTypes = [
  { value: 'FIXED', label: '고정' },
  { value: 'PERIODIC', label: '주기형' },
  { value: 'MIXED', label: '혼합' },
  { value: 'VARIABLE', label: '변동' }
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

const displayRatio = computed(() => {
  const val = Number(dsrRatio.value) || 0
  if (val <= 0) return 0
  return Math.max(5, Math.min(100, val))
})

const gaugeColor = computed(() => {
  const ratio = dsrRatio.value
  if (ratio <= 40) return '#43A047'
  if (ratio <= 70) return '#FBC02D'
  return '#F44336'
})

const chartPalette = computed(() => theme.value === 'night' ? CHART_PALETTE.night : CHART_PALETTE.day)

const gaugeOptions = computed(() => ({
  chart: { type: 'radialBar', sparkline: { enabled: true } },
  plotOptions: {
    radialBar: {
      startAngle: -110,
      endAngle: 110,
      hollow: { size: '65%' },
      track: { background: chartPalette.value.track, strokeWidth: '80%' },
      dataLabels: {
        name: { show: true, offsetY: -8, fontSize: '19px', color: chartPalette.value.muted },
        value: { 
          offsetY: 4, fontSize: '24px', fontWeight: '700', color: gaugeColor.value,
          formatter: () => `${Number(dsrRatio.value || 0).toFixed(1)}%`
        }
      }
    }
  },
  colors: [gaugeColor.value],
  labels: ['DSR'],
  stroke: { lineCap: 'round' }
}))

function formatCurrency(value) {
  if (!value) return '₩0'
  return '₩' + (value / 10000).toLocaleString() + '만'
}

function getGradeLabel(grade) {
  const labels = { SAFE: '안전', WARNING: '주의', RESTRICTED: '위험' }
  return labels[grade] || grade
}

function goBack() {
  router.back()
}

async function runSimulation() {
  const annualIncome = authStore.userAnnualIncome || 0
  const existingDebt = (authStore.userExistingLoanMonthly || 0) * 12

  await dsrStore.runSimulation({
    annualIncome: annualIncome * 10000, // Convert from 만원 to 원
    existingAnnualDebtService: existingDebt * 10000,
    ...formData
  })
}

onMounted(() => {
  chartReady.value = true
})
</script>

<style scoped>
.dsr-simulation-view {
  min-height: 100vh;
  background: var(--showroom-bg-day, #f7f8fa);
  padding-bottom: 2rem;
  --dsr-ink: var(--ink-base, #1f2937);
  --dsr-ink-muted: var(--ink-muted, #6b7280);
  --dsr-subcard-bg: rgba(17, 24, 39, 0.04);
  --dsr-subcard-border: rgba(17, 24, 39, 0.06);
  --dsr-warning-bg: rgba(251, 192, 45, 0.16);
  --dsr-warning-fg: #b45309;
  --dsr-safe-bg: rgba(67, 160, 71, 0.14);
  --dsr-safe-fg: #2e7d32;
  --dsr-danger-bg: rgba(244, 67, 54, 0.12);
  --dsr-danger-fg: #c62828;
}

html[data-theme="night"] .dsr-simulation-view {
  background: var(--showroom-bg-night, #1a1c20);
  --dsr-ink: var(--showroom-text-night, #f5f6f7);
  --dsr-ink-muted: rgba(245, 246, 247, 0.75);
  --dsr-subcard-bg: rgba(255, 255, 255, 0.06);
  --dsr-subcard-border: rgba(255, 255, 255, 0.1);
  --dsr-warning-bg: rgba(251, 192, 45, 0.14);
  --dsr-warning-fg: #fbbf24;
  --dsr-safe-bg: rgba(67, 160, 71, 0.16);
  --dsr-safe-fg: #86efac;
  --dsr-danger-bg: rgba(244, 67, 54, 0.14);
  --dsr-danger-fg: #fca5a5;
}

.view-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  background: var(--surface-card-bg, #ffffff);
  border-bottom: 1px solid var(--surface-card-border, rgba(0, 0, 0, 0.06));
  box-shadow: 0 8px 18px -16px rgba(17, 24, 39, 0.18);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--dsr-ink);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.18s var(--easing-bounce, cubic-bezier(0.68, -0.55, 0.265, 1.55)), background 0.2s ease;
}

.back-button:hover {
  background: var(--dsr-subcard-bg);
  transform: translateY(-1px);
}

.back-button:active {
  transform: translateY(1px) scale(0.98);
}

.back-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.18);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.15rem;
}

.view-title {
  font-family: var(--font-family-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--dsr-ink);
  margin: 0;
}

.view-subtitle {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dsr-ink-muted);
}

.view-container {
  max-width: var(--panel-max-width, 600px);
  margin: 0 auto;
  padding: 1rem;
}

.section {
  background: var(--surface-card-bg, #ffffff);
  border-radius: var(--border-radius-sm, 16px);
  padding: 1.4rem;
  margin-bottom: 1rem;
  border: 1px solid var(--surface-card-border, rgba(0, 0, 0, 0.06));
  box-shadow: var(--surface-card-shadow, 0 12px 36px -22px rgba(0, 0, 0, 0.24));
  animation: section-enter 520ms var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1)) both;
  animation-delay: var(--enter-delay, 0ms);
  transform-origin: top center;
}

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

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 800;
  background: var(--dsr-subcard-bg);
  border: 1px solid var(--dsr-subcard-border);
  color: var(--dsr-ink);
  white-space: nowrap;
}

.status-chip.safe {
  background: var(--dsr-safe-bg);
  border-color: rgba(67, 160, 71, 0.2);
  color: var(--dsr-safe-fg);
}

.status-chip.warning {
  background: var(--dsr-warning-bg);
  border-color: rgba(251, 192, 45, 0.22);
  color: var(--dsr-warning-fg);
}

.status-chip.danger {
  background: var(--dsr-danger-bg);
  border-color: rgba(244, 67, 54, 0.2);
  color: var(--dsr-danger-fg);
}

.status-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.25rem;
  align-items: center;
}

.dsr-gauge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-skeleton {
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dsr-subcard-bg), rgba(255, 255, 255, 0.22), var(--dsr-subcard-bg));
  background-size: 200% 100%;
  animation: shimmer 1.25s linear infinite;
  border: 1px solid var(--dsr-subcard-border);
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.status-detail .label { color: var(--dsr-ink-muted); }
.status-detail .value { font-weight: 700; color: var(--dsr-ink); }

/* Form Styles */
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
  display: flex;
  gap: 0.5rem;
}

.radio-group.loan-type {
  flex-wrap: wrap;
}

.radio-option {
  flex: 1;
  min-width: 80px;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--dsr-subcard-bg);
  border: 1px solid var(--dsr-subcard-border);
  cursor: pointer;
  text-align: center;
  transition: transform 0.18s var(--easing-bounce, cubic-bezier(0.68, -0.55, 0.265, 1.55)), background 0.2s ease, border-color 0.2s ease;
  user-select: none;
  position: relative;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-option.selected {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  border-color: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
  transform: translateY(-1px);
}

.radio-option:focus-within {
  outline: none;
  border-color: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.14);
}

.radio-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dsr-ink);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--dsr-subcard-border);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.85);
  color: var(--dsr-ink);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.14);
}

.form-input::placeholder {
  color: var(--dsr-ink-muted);
}

html[data-theme="night"] .form-input {
  background: rgba(255, 255, 255, 0.06);
}

.form-input.small {
  max-width: 100px;
}

.input-suffix {
  flex: 0 0 auto;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: var(--dsr-subcard-bg);
  border: 1px solid var(--dsr-subcard-border);
  font-size: 0.875rem;
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

.submit-button {
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

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.submit-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
  opacity: 0.9;
  box-shadow: inset 0 2px 6px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button:focus-visible {
  outline: none;
  box-shadow:
    0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45),
    0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Result Styles */
.result-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-card {
  padding: 1rem;
  background: var(--dsr-subcard-bg);
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--dsr-subcard-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px -22px rgba(17, 24, 39, 0.22);
}

.result-card.highlight {
  grid-column: span 2;
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d), var(--brand-accent-light, #ff9a75));
  color: white;
  border: none;
}

.result-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.result-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
}

.result-card.highlight .result-value {
  font-size: 1.5rem;
}

.result-value.grade.safe { color: #2e7d32; }
.result-value.grade.warning { color: #ef6c00; }
.result-value.grade.restricted { color: #c62828; }

.policy-info, .game-update {
  padding: 1rem;
  background: var(--dsr-subcard-bg);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid var(--dsr-subcard-border);
}

.policy-info h3, .game-update h3 {
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--dsr-ink);
}

.policy-detail, .update-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.positive {
  color: #2e7d32;
  font-weight: 600;
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

.tip-icon {
  flex-shrink: 0;
  color: var(--dsr-warning-fg);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--dsr-danger-bg);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.22);
  color: var(--dsr-danger-fg);
  font-size: 0.875rem;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1)),
    transform 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1));
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes section-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 480px) {
  .status-card {
    grid-template-columns: 1fr;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .result-card.highlight {
    grid-column: span 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .section {
    animation: none;
  }

  .gauge-skeleton {
    animation: none;
  }

  .spin {
    animation: none;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none;
  }
}
</style>
