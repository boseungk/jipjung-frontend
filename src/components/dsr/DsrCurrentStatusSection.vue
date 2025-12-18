<template>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { useDsrStore } from '@/stores/dsrStore'
import { useTheme } from '@/composables/useTheme'
import { CHART_PALETTE } from '@/constants/colors'
import { getDsrGaugeColor } from '@/constants/dsrGrade'
import { formatKrwManwon as formatCurrency } from '@/utils/formatters'

const apexchart = VueApexCharts

const dsrStore = useDsrStore()
const { theme } = useTheme()

const { dsrRatio, dsrStatus, monthlyIncome, existingLoanMonthly, monthlyRepaymentCapacity } =
  storeToRefs(dsrStore)

const chartReady = ref(false)

const displayRatio = computed(() => {
  const val = Number(dsrRatio.value) || 0
  if (val <= 0) return 0
  return Math.max(5, Math.min(100, val))
})

const gaugeColor = computed(() => getDsrGaugeColor(dsrRatio.value))
const chartPalette = computed(() => (theme.value === 'night' ? CHART_PALETTE.night : CHART_PALETTE.day))

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
          offsetY: 4,
          fontSize: '24px',
          fontWeight: '700',
          color: gaugeColor.value,
          formatter: () => `${Number(dsrRatio.value || 0).toFixed(1)}%`
        }
      }
    }
  },
  colors: [gaugeColor.value],
  labels: ['DSR'],
  stroke: { lineCap: 'round' }
}))

onMounted(() => {
  chartReady.value = true
})
</script>

<style scoped>
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

.status-detail .label {
  color: var(--dsr-ink-muted);
}

.status-detail .value {
  font-weight: 700;
  color: var(--dsr-ink);
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
}

@media (prefers-reduced-motion: reduce) {
  .gauge-skeleton {
    animation: none;
  }
}
</style>

