<template>
  <div class="bento-card dsr-gauge-card">
    <h3 class="card-title">DSR</h3>
    
    <div class="gauge-wrapper">
      <apexchart
        v-if="chartLoaded"
        :key="theme"
        type="radialBar"
        :options="chartOptions"
        :series="[dsrRatio]"
        height="190"
      />
    </div>
    
    <div class="status-info">
      <span class="status-icon"><PhCheckCircle :size="18" weight="fill" color="#43A047" /></span>
      <span class="status-text">{{ statusMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDsrStore } from '../../../stores/dsrStore'
import VueApexCharts from 'vue3-apexcharts'
import { PhCheckCircle } from '@phosphor-icons/vue'
import { useTheme } from '@/composables/useTheme'
import { CHART_PALETTE } from '@/constants/colors'

const apexchart = VueApexCharts

const dsrStore = useDsrStore()
const { dsrRatio } = storeToRefs(dsrStore)
const { theme } = useTheme()

const chartLoaded = ref(false)

const statusMessage = computed(() => {
  if (dsrRatio.value <= 40) return '대출 승인 매우 안전'
  if (dsrRatio.value <= 70) return '대출 승인 주의 필요'
  return '대출 승인 어려움'
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
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: '60%',
        background: 'transparent'
      },
      track: {
        background: chartPalette.value.track,
        strokeWidth: '100%'
      },
      dataLabels: {
        name: {
          show: true,
          offsetY: -10,
          fontSize: '14px',
          fontWeight: 600,
          color: chartPalette.value.muted
        },
        value: {
          offsetY: 0,
          fontSize: '32px',
          fontWeight: 'bold',
          color: gaugeColor.value,
          formatter: (val) => `${val.toFixed(1)}%`
        }
      }
    }
  },
  colors: [gaugeColor.value],
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
  gap: 0.5rem;
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
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
}


.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind(gaugeColor);
}
</style>
