<template>
  <div class="property-exploration-layout" :class="{ 'modal-open': showFilters }">
    <div class="split-container">
      <!-- 지도 패널 -->
      <div class="map-panel">
        <PropertyMapPanel @openFilters="showFilters = true" />
      </div>

      <!-- 리사이저 -->
      <PanelResizer
        @resizeStart="handleResizeStart"
        @resize="handleResize"
        @resizeEnd="handleResizeEnd"
      />

      <!-- 정보 패널 -->
      <div class="info-panel" :style="{ width: infoPanelWidth + 'px' }">
        <PropertyInfoPanel @openFilters="handleOpenFilters" />
      </div>
    </div>

    <!-- 필터 Bottom Sheet -->
    <PropertyFilters
      :isOpen="showFilters"
      :initialSection="filterInitialSection"
      @close="showFilters = false"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { usePropertyStore } from '@/stores/propertyStore'
import PropertyMapPanel from './PropertyMapPanel.vue'
import PropertyInfoPanel from './PropertyInfoPanel.vue'
import PropertyFilters from './PropertyFilters.vue'
import PanelResizer from './PanelResizer.vue'

const propertyStore = usePropertyStore()
const showFilters = ref(false)
const filterInitialSection = ref(null)

// 리사이저 상태
const MIN_PANEL_WIDTH = 505 // 최소 너비 (글자 줄바꿈 고려 + 핸들 영역)
const MAX_PANEL_WIDTH = 600 // 최대 너비
const DEFAULT_PANEL_WIDTH = 550 // 기본 너비

const infoPanelWidth = ref(DEFAULT_PANEL_WIDTH)
const initialPanelWidth = ref(DEFAULT_PANEL_WIDTH)

onMounted(async () => {
  // 매물 데이터 로드 (컴포넌트 마운트 후)
  await nextTick()
  await propertyStore.fetchFavorites()  // 관심 아파트 목록 로드
  await propertyStore.fetchProperties()
})

/**
 * 필터 열기 (특정 섹션으로)
 * @param {string|null} section - 스크롤할 섹션 ('region' | 'price' | null)
 */
function handleOpenFilters(section = null) {
  filterInitialSection.value = section
  showFilters.value = true
}

/**
 * 필터 적용 후 매물 재조회
 */
function handleFilterApply() {
  showFilters.value = false
  filterInitialSection.value = null
}

/**
 * 리사이저 드래그 시작
 */
function handleResizeStart() {
  initialPanelWidth.value = infoPanelWidth.value
}

/**
 * 리사이저 드래그 중
 * @param {number} deltaX - 드래그 이동량
 */
function handleResize(deltaX) {
  // 새 너비 계산 (드래그 방향 반대로 적용)
  const newWidth = initialPanelWidth.value - deltaX

  // 최소/최대 너비 제한
  if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
    infoPanelWidth.value = newWidth
  } else if (newWidth < MIN_PANEL_WIDTH) {
    infoPanelWidth.value = MIN_PANEL_WIDTH
  } else if (newWidth > MAX_PANEL_WIDTH) {
    infoPanelWidth.value = MAX_PANEL_WIDTH
  }
}

/**
 * 리사이저 드래그 종료
 */
function handleResizeEnd() {
  // 필요시 localStorage에 저장하거나 다른 처리
}
</script>

<style scoped>
.property-exploration-layout {
  width: 100%;
  height: calc(100vh - var(--nav-height, 64px));
  position: relative;
}

.split-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.map-panel {
  flex: 1;
  overflow: hidden;
  min-width: 0; /* flex 아이템이 컨텐츠 크기보다 작아질 수 있도록 */
}

.info-panel {
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.1s ease-out;
}

.modal-open .split-container {
  pointer-events: none;
}

/* Desktop & Tablet: 좌우 배치 */
@media (min-width: 768px) {
  .split-container {
    flex-direction: row;
  }
}

/* Mobile: 상하 배치 */
@media (max-width: 767px) {
  .split-container {
    flex-direction: column;
  }

  .map-panel {
    height: 300px;
    flex: 0 0 300px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  html[data-theme="night"] .map-panel {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  .info-panel {
    flex: 1;
    width: 100% !important; /* 모바일에서는 전체 너비 사용 */
  }
}
</style>
