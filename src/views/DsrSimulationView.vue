<template>
  <div class="dsr-simulation-view">
    <header class="view-header">
      <button class="back-button" @click="goBack" aria-label="뒤로 가기">
        <PhArrowLeft :size="24" weight="bold" />
      </button>
      <h1 class="view-title">DSR 시뮬레이션</h1>
    </header>

    <div class="view-container">
      <!-- Current DSR Status Card -->
      <section class="section current-status">
        <h2 class="section-title">현재 DSR 상태</h2>
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
          </div>
          <div class="status-info">
            <span class="status-badge" :class="dsrStatus.class">{{ dsrStatus.label }}</span>
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
      <section class="section simulation-form">
        <h2 class="section-title">PRO 시뮬레이션</h2>
        <p class="section-description">2026년 정책 기반 상세 DSR 분석</p>

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
            <input
              type="number"
              v-model.number="formData.targetLoanRate"
              class="form-input"
              step="0.1"
              min="0"
              max="30"
              placeholder="4.0"
            />
          </div>

          <!-- Maturity Years -->
          <div class="form-group">
            <label class="form-label">대출 만기 (년)</label>
            <input
              type="number"
              v-model.number="formData.maturityYears"
              class="form-input"
              min="1"
              max="50"
              placeholder="40"
            />
          </div>

          <!-- Jeonse Loan (Optional) -->
          <div class="form-group optional-section">
            <label class="form-label">
              <PhHouse :size="18" />
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
            <PhSpinnerGap v-if="isSimulating" :size="20" class="spin" />
            <span v-else>시뮬레이션 실행</span>
          </button>
        </form>
      </section>

      <!-- Simulation Result -->
      <section v-if="simulationResult" class="section simulation-result">
        <h2 class="section-title">시뮬레이션 결과</h2>
        
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
          <PhLightbulb :size="20" weight="fill" class="tip-icon" />
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

      <!-- Error Display -->
      <div v-if="simulationError" class="error-message">
        <PhWarning :size="20" />
        <span>{{ simulationError }}</span>
      </div>
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
import { 
  PhArrowLeft, PhHouse, PhLightbulb, PhSpinnerGap, PhWarning 
} from '@phosphor-icons/vue'

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
        name: { show: true, offsetY: -8, fontSize: '14px', color: chartPalette.value.muted },
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
  background: var(--surface-bg, #f5f5f5);
  padding-bottom: 2rem;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--surface-card, white);
  border-bottom: 1px solid var(--border-soft, #e5e7eb);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--ink-base, #1f2937);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: var(--surface-muted, #f3f4f6);
}

.view-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

.view-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.section {
  background: var(--surface-card, white);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0 0 0.5rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--ink-muted, #6b7280);
  margin: 0 0 1rem;
}

.status-card {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.dsr-gauge {
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  width: fit-content;
}

.status-badge.safe { background: #e8f5e9; color: #2e7d32; }
.status-badge.warning { background: #fff8e1; color: #ef6c00; }
.status-badge.danger { background: #ffebee; color: #c62828; }

.status-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.status-detail .label { color: var(--ink-muted, #6b7280); }
.status-detail .value { font-weight: 600; color: var(--ink-base, #1f2937); }

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
  color: var(--ink-base, #1f2937);
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
  background: var(--surface-muted, #f3f4f6);
  border: 2px solid transparent;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.radio-option input { display: none; }

.radio-option.selected {
  background: var(--brand-accent-soft, #fff5f2);
  border-color: var(--brand-accent, #ff6b3d);
}

.radio-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--surface-card, white);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-accent, #ff6b3d);
}

.form-input.small {
  max-width: 100px;
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
  color: var(--ink-muted, #6b7280);
  cursor: pointer;
}

.optional-section {
  padding: 1rem;
  background: var(--surface-muted, #f3f4f6);
  border-radius: 12px;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: var(--brand-accent, #ff6b3d);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 61, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  background: var(--surface-muted, #f3f4f6);
  border-radius: 12px;
  text-align: center;
}

.result-card.highlight {
  grid-column: span 2;
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d), var(--brand-accent-light, #ff9a75));
  color: white;
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
  background: var(--surface-muted, #f3f4f6);
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.policy-info h3, .game-update h3 {
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--ink-base, #1f2937);
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
  background: #fff8e1;
  border-radius: 12px;
}

.tip-icon {
  flex-shrink: 0;
  color: #f9a825;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #ffebee;
  border-radius: 12px;
  color: #c62828;
  font-size: 0.875rem;
}

@media (max-width: 480px) {
  .status-card {
    flex-direction: column;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .result-card.highlight {
    grid-column: span 1;
  }
}
</style>
