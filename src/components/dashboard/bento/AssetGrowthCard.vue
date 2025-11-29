<template>
  <div class="bento-card asset-growth-card">
    <h3 class="card-title">자산 성장</h3>
    
    <div class="chart-wrapper">
      <apexchart
        v-if="chartLoaded"
        :key="theme"
        type="area"
        :options="chartOptions"
        :series="chartSeries"
        height="180"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { BRAND_ACCENT, CHART_PALETTE } from '@/constants/colors'
import { useTheme } from '@/composables/useTheme'

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

const chartOptions = computed(() => {
  const palette = chartPalette.value

  return {
    chart: {
      type: 'area',
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
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      },
      colors: [brandAccent] /* CORAL ACCENT */
    },
    grid: {
      borderColor: palette.grid,
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
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
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => `₩${Math.round(val)}만`,
        style: {
          fontSize: '12px',
          colors: palette.muted
        }
      }
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
  gap: 1rem;
}

.chart-wrapper {
  flex: 1;
  min-height: 0;
}
</style>
