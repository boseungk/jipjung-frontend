<template>
  <div class="bento-card asset-growth-card">
    <div class="card-heading">
      <h3 class="card-title">자산 성장</h3>
      <div class="growth-meta">
        <span class="meta-primary">최근 {{ latestValueText }}</span>
        <span class="meta-change" :class="{ 'is-up': changeValue >= 0, 'is-down': changeValue < 0 }">
          {{ changeLabel }}
        </span>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <apexchart
        v-if="chartLoaded"
        :key="theme"
        type="area"
        :options="chartOptions"
        :series="chartSeries"
        height="170"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { BRAND_ACCENT, CHART_PALETTE } from '@/constants/colors'
import { useTheme } from '@/composables/useTheme'
import { formatNumber } from '@/utils/formatters'

const apexchart = VueApexCharts
const brandAccent = BRAND_ACCENT
const { theme } = useTheme()

const chartLoaded = ref(false)

// Mock data - replace with real data from store
const chartSeries = ref([
  {
    name: '저축액',
    data: [
      { x: new Date('2024-10-01').getTime(), y: 500 },
      { x: new Date('2024-10-15').getTime(), y: 1200 },
      { x: new Date('2024-11-01').getTime(), y: 2000 },
      { x: new Date('2024-11-15').getTime(), y: 3200 },
      { x: new Date('2024-11-25').getTime(), y: 4250 }
    ]
  }
])

const chartPalette = computed(() => (theme.value === 'night' ? CHART_PALETTE.night : CHART_PALETTE.day))

const firstPoint = computed(() => chartSeries.value?.[0]?.data?.[0] || null)
const latestPoint = computed(() => {
  const data = chartSeries.value?.[0]?.data || []
  return data.length ? data[data.length - 1] : null
})

const latestValue = computed(() => (latestPoint.value ? latestPoint.value.y : 0))
const firstValue = computed(() => (firstPoint.value ? firstPoint.value.y : 0))
const changeValue = computed(() => latestValue.value - firstValue.value)
const changePercent = computed(() => {
  if (!firstValue.value) return 0
  return (changeValue.value / firstValue.value) * 100
})

const latestValueText = computed(() => `${formatNumber(Math.round(latestValue.value))}만`)
const changeLabel = computed(() => {
  if (!firstPoint.value) return '데이터 없음'
  const sign = changeValue.value >= 0 ? '+' : '-'
  const absChange = Math.abs(Math.round(changeValue.value))
  const percent = Math.abs(changePercent.value).toFixed(1)
  return `${sign}${formatNumber(absChange)}만 (${percent}%)`
})

const chartOptions = computed(() => {
  const palette = chartPalette.value

  return {
    chart: {
      type: 'area',
      fontFamily: "'Space Grotesk','Noto Sans KR',sans-serif",
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: false
      },
      fontFamily: "'Noto Sans KR', sans-serif"
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [brandAccent] /* CORAL ACCENT */
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.9,
        opacityFrom: 0.55,
        opacityTo: 0.12,
        stops: [0, 90, 100]
      },
      colors: [brandAccent] /* CORAL ACCENT */
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      colors: ['#ffffff'],
      strokeColors: [brandAccent],
      hover: { size: 6 }
    },
    grid: {
      borderColor: palette.grid,
      strokeDashArray: 4,
      padding: {
        left: 12,
        right: 12,
        top: 0,
        bottom: 0
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          fontSize: '12px',
          colors: palette.muted
        },
        datetimeFormatter: {
          month: 'MM월'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        show: true,
        stroke: {
          color: palette.grid,
          width: 1,
          dashArray: 5
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => `₩${Math.round(val)}만`,
        style: {
          fontSize: '12px',
          colors: palette.muted
        }
      },
      title: {
        text: '만원',
        style: {
          color: palette.muted,
          fontSize: '12px'
        }
      },
      min: 0
    },
    tooltip: {
      enabled: true,
      theme: theme.value === 'night' ? 'dark' : 'light',
      x: {
        format: 'MM월 dd일'
      },
      y: {
        formatter: (val) => `₩${Math.round(val)}만`
      }
    },
    dataLabels: {
      enabled: false
    }
  }
})

onMounted(() => {
  chartLoaded.value = true
})
</script>

<style scoped>
.asset-growth-card {
  grid-area: growth;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.growth-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.meta-primary {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

.meta-change {
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--surface-muted, #f3f4f6);
  color: var(--brand-accent, #ff6b3d);
}

.meta-change.is-up {
  color: var(--brand-accent, #ff6b3d);
}

.meta-change.is-down {
  color: #dc2626;
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
}

</style>
