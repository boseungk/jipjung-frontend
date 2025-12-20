<template>
  <div class="bento-card dsr-gauge-card">
    <div class="card-heading">
      <InfoTooltip :description="FINANCE_TERMS.DSR" id="dsr-gauge-tooltip">
        <h3 class="card-title">DSR</h3>
      </InfoTooltip>
      <span class="status-chip" :class="statusTone">{{ statusMessage }}</span>
    </div>
    
    <div class="gauge-wrapper">
      <apexchart
        v-if="chartLoaded"
        :key="theme"
        type="radialBar"
        :options="chartOptions"
        :series="[displayRatio]"
        height="200"
      />
    </div>
    
    <div class="status-info">
      <AppIcon name="checkCircle" :size="18" :active="true" class="status-icon" aria-hidden="true" />
      <span class="status-text">기존 상환 {{ formatWon(existingLoanMonthly) }} · 여력 {{ formatWon(monthlyRepaymentCapacity) }}</span>
      <InfoTooltip :description="`DSR ${DSR_THRESHOLDS.SAFE}% 이하 시 대출 승인에 유리해요`" id="dsr-criteria-tooltip" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '../../../stores/dsrStore'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from '@/composables/useTheme'
import { CHART_PALETTE } from '@/constants/colors'
import { formatWon } from '@/utils/formatters'
import AppIcon from '@/components/common/AppIcon.vue'
import InfoTooltip from '@/components/common/InfoTooltip.vue'
import { FINANCE_TERMS } from '@/constants/financeTerms'
import { DSR_THRESHOLDS, getDsrGrade, getDsrGaugeColor, getDsrToneClass } from '@/constants/dsrGrade'

const apexchart = VueApexCharts

const dsrStore = useDsrStore()
const {
  dsrRatio,
  existingLoanMonthly,
  monthlyRepaymentCapacity
} = storeToRefs(dsrStore)
const { theme } = useTheme()

const chartLoaded = ref(false)

onMounted(() => {
  chartLoaded.value = true
})

const displayRatio = computed(() => {
  const val = Number(dsrRatio.value) || 0
  if (val <= 0) return 0
  return Math.max(5, Math.min(100, val))
})

// 공통 헬퍼 사용으로 게이지/뱃지 일관성 보장
const dsrGradeInfo = computed(() => getDsrGrade(dsrRatio.value))
const statusMessage = computed(() => dsrGradeInfo.value.description)
const statusTone = computed(() => getDsrToneClass(dsrRatio.value))
const gaugeColor = computed(() => getDsrGaugeColor(dsrRatio.value))

const chartPalette = computed(() => (theme.value === 'night' ? CHART_PALETTE.night : CHART_PALETTE.day))

const chartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    sparkline: { enabled: true }
  },
  plotOptions: {
    radialBar: {
      startAngle: -110,
      endAngle: 110,
      hollow: { size: '65%' },
      track: {
        background: chartPalette.value.track,
        strokeWidth: '80%'
      },
      dataLabels: {
        name: {
          show: true,
          offsetY: -8,
          fontSize: '21px',
          color: chartPalette.value.muted
        },
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

</script>

<style scoped>
.dsr-gauge-card {
  grid-area: dsr;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 800;
  background: var(--dsr-subcard-bg, rgba(17, 24, 39, 0.04));
  border: 1px solid var(--dsr-subcard-border, rgba(17, 24, 39, 0.06));
  color: var(--ink-base, #1f2937);
  white-space: nowrap;
}

.tone-safe {
  background: rgba(67, 160, 71, 0.14);
  border-color: rgba(67, 160, 71, 0.2);
  color: #2e7d32;
}

html[data-theme="night"] .tone-safe {
  background: rgba(67, 160, 71, 0.16);
  color: #86efac;
}

.tone-warning {
  background: rgba(251, 192, 45, 0.16);
  border-color: rgba(251, 192, 45, 0.22);
  color: #b45309;
}

html[data-theme="night"] .tone-warning {
  background: rgba(251, 192, 45, 0.14);
  color: #fbbf24;
}

.tone-danger {
  background: rgba(244, 67, 54, 0.12);
  border-color: rgba(244, 67, 54, 0.2);
  color: #c62828;
}

html[data-theme="night"] .tone-danger {
  background: rgba(244, 67, 54, 0.14);
  color: #fca5a5;
}

.gauge-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.25rem;
}

.status-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: var(--surface-muted, #f3f4f6);
  border-radius: 10px;
  border: 1px solid var(--border-soft, #e5e7eb);
}

.status-icon {
  color: var(--brand-accent, #ff6b3d);
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .status-info {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

html[data-theme="night"] .status-text {
  color: var(--showroom-text-night, #f9fafb);
}

</style>
