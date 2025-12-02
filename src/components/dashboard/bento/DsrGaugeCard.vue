<template>
  <div class="bento-card dsr-gauge-card">
    <div class="card-heading">
      <h3 class="card-title">DSR</h3>
      <span class="status-chip" :class="statusTone">{{ statusMessage }}</span>
    </div>
    
    <div class="gauge-wrapper">
      <apexchart
        v-if="chartLoaded"
        :key="theme"
        type="radialBar"
        :options="chartOptions"
        :series="[displayRatio]"
        height="180"
      />
    </div>
    
    <div class="status-info">
      <AppIcon name="checkCircle" :size="18" :active="true" class="status-icon" aria-hidden="true" />
      <span class="status-text">기존 상환 ₩{{ formatNumber(existingLoanMonthly) }}만 · 여력 ₩{{ formatNumber(monthlyRepaymentCapacity) }}만</span>
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
import { formatNumber } from '@/utils/formatters'

const apexchart = VueApexCharts

const dsrStore = useDsrStore()
const {
  dsrRatio,
  existingLoanMonthly,
  monthlyRepaymentCapacity
} = storeToRefs(dsrStore)
const { theme } = useTheme()

const chartLoaded = ref(false)
const displayRatio = computed(() => {
  const val = Number(dsrRatio.value) || 0
  if (val <= 0) return 0
  return Math.max(5, Math.min(100, val))
})

const statusMessage = computed(() => {
  if (dsrRatio.value <= 40) return '대출 승인 매우 안전'
  if (dsrRatio.value <= 70) return '대출 승인 주의 필요'
  return '대출 승인 어려움'
})

const statusTone = computed(() => {
  if (dsrRatio.value <= 40) return 'tone-safe'
  if (dsrRatio.value <= 70) return 'tone-warning'
  return 'tone-danger'
})

const gaugeColor = computed(() => {
  if (dsrRatio.value <= 40) return '#43A047'
  if (dsrRatio.value <= 70) return '#FBC02D'
  return '#F44336'
})

const chartPalette = computed(() => (theme.value === 'night' ? CHART_PALETTE.night : CHART_PALETTE.day))

const chartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    toolbar: { show: false },
    sparkline: { enabled: true },
    fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif"
  },
  plotOptions: {
    radialBar: {
      startAngle: -110,
      endAngle: 110,
      hollow: {
        size: '52%',
        background: 'transparent'
      },
      track: {
        background: chartPalette.value.track,
        strokeWidth: '100%'
      },
      dataLabels: {
        name: {
          show: true,
          offsetY: -6,
          fontSize: '13px',
          fontWeight: 600,
          color: chartPalette.value.muted
        },
        value: {
          offsetY: 4,
          fontSize: '26px',
          fontWeight: 'bold',
          color: gaugeColor.value,
          formatter: () => `${Number(dsrRatio.value || 0).toFixed(1)}%`
        }
      }
    }
  },
  colors: [gaugeColor.value],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      gradientToColors: [gaugeColor.value],
      inverseColors: false,
      opacityFrom: 0.95,
      opacityTo: 0.85,
      stops: [0, 60, 100]
    }
  },
  labels: ['DSR'],
  stroke: {
    lineCap: 'round'
  }
}))

onMounted(() => {
  chartLoaded.value = true
})
</script>

<style scoped>
.dsr-gauge-card {
  grid-area: dsr;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
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
  font-weight: 700;
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-base, #1f2937);
}

.tone-safe {
  color: #2e7d32;
}

.tone-warning {
  color: #d97706;
}

.tone-danger {
  color: #dc2626;
}

.gauge-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  display: flex;
  align-items: center;
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
</style>
