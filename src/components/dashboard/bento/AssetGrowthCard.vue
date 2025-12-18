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
        v-if="chartLoaded && hasChartData"
        :key="theme"
        type="area"
        :options="chartOptions"
        :series="chartSeries"
        height="170"
      />
      <!-- M-5: 빈 상태 CTA -->
      <div v-else-if="chartLoaded" class="no-data-placeholder">
        <div class="empty-chart-icon">
          <AppIcon name="chartLine" :size="32" :active="true" />
        </div>
        <p class="no-data-text">저축을 시작하면 성장 그래프가 표시됩니다</p>
        <button class="start-saving-btn" @click="handleStartSaving">
          <AppIcon name="plus" :size="16" />
          <span>첫 저축 시작하기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { useAuthStore } from '@/stores/authStore'
import { BRAND_ACCENT, CHART_PALETTE } from '@/constants/colors'
import { useTheme } from '@/composables/useTheme'
import { formatNumber } from '@/utils/formatters'
import AppIcon from '@/components/common/AppIcon.vue'

const emit = defineEmits(['start-saving'])

const apexchart = VueApexCharts
const brandAccent = BRAND_ACCENT
const { theme } = useTheme()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const chartLoaded = ref(false)

/**
 * M-5: 저축 시작하기 버튼 클릭 핸들러
 * 부모(BentoGrid)에서 저축 모달 열기
 */
function handleStartSaving() {
  emit('start-saving')
}

// =========================================================================
// 백엔드 데이터 연동
// =========================================================================

/**
 * authStore.user._raw.assets.chartData에서 차트 데이터 추출
 * - 데이터가 없으면 빈 배열 반환
 * - 날짜 기준 오름차순 정렬 (백엔드 정렬 미보장 대비)
 * - 원(won) 단위를 만원 단위로 변환
 */
const chartSeries = computed(() => {
  const rawChartData = user.value?._raw?.assets?.chartData || []
  
  if (!rawChartData.length) {
    return [{ name: '저축액', data: [] }]
  }
  
  // 날짜 기준 정렬 후 매핑
  const sortedData = [...rawChartData].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  
  return [{
    name: '저축액',
    data: sortedData.map(item => ({
      x: new Date(item.date).getTime(),
      y: Math.round((item.balance || 0) / 10000) // 원 → 만원 변환
    }))
  }]
})

/** 차트 데이터 존재 여부 */
const hasChartData = computed(() => {
  return chartSeries.value[0]?.data?.length > 0
})

// =========================================================================
// 차트 통계 계산
// =========================================================================

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

const latestValueText = computed(() => {
  if (!hasChartData.value) return '0만'
  return `${formatNumber(Math.round(latestValue.value))}만`
})

const changeLabel = computed(() => {
  if (!firstPoint.value) return '데이터 없음'
  const sign = changeValue.value >= 0 ? '+' : '-'
  const absChange = Math.abs(Math.round(changeValue.value))
  const percent = Math.abs(changePercent.value).toFixed(1)
  return `${sign}${formatNumber(absChange)}만 (${percent}%)`
})

// =========================================================================
// 차트 옵션
// =========================================================================

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
      }
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
        formatter: (val) => `₩${formatNumber(Math.round(val))}만`
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

/* 데이터 없음 플레이스홀더 */
.no-data-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 170px;
  padding: 1.5rem;
  background: var(--surface-muted, #f9fafb);
  border-radius: 12px;
  border: 1px dashed var(--border-muted, #e5e7eb);
}

.empty-state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
}

.empty-chart-icon {
  color: var(--bento-text-muted, #9ca3af);
}

.no-data-text {
  color: var(--bento-text-muted, #6b7280);
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.start-saving-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: white;
  font-weight: 600;
  font-size: 0.8125rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-saving-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 61, 0.3);
}

/* 다크모드 대응 */
html[data-theme="night"] .no-data-placeholder {
  background: var(--surface-muted, #1f2937);
  border-color: var(--border-muted, #374151);
}

html[data-theme="night"] .meta-primary {
  color: var(--ink-base, #f9fafb);
}
</style>
