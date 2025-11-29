<template>
  <div class="property-exploration-layout">
    <div class="layout-actions">
      <button class="toggle-btn" @click="toggleMap">
        {{ mapCollapsed ? '지도 펼치기' : '지도 접기' }}
      </button>
      <button class="toggle-btn" @click="toggleInfo">
        {{ infoCollapsed ? '정보 패널 펼치기' : '정보 패널 접기' }}
      </button>
    </div>

    <div class="split-container" :class="containerClasses">
      <!-- 지도 패널 -->
      <div class="map-panel" :class="{ hidden: mapCollapsed }">
        <PropertyMapPanel @openFilters="showFilters = true" />
      </div>

      <!-- 정보 패널 -->
      <div class="info-panel" :class="{ hidden: infoCollapsed }">
        <PropertyInfoPanel @openFilters="showFilters = true" />
      </div>
    </div>

    <!-- 필터 모달 -->
    <PropertyFilters
      :isOpen="showFilters"
      @close="showFilters = false"
      @apply="handleFilterApply"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePropertyStore } from '@/stores/propertyStore'
import PropertyMapPanel from './PropertyMapPanel.vue'
import PropertyInfoPanel from './PropertyInfoPanel.vue'
import PropertyFilters from './PropertyFilters.vue'

const propertyStore = usePropertyStore()
const showFilters = ref(false)
const mapCollapsed = ref(false)
const infoCollapsed = ref(false)

const containerClasses = computed(() => {
  return {
    'map-collapsed': mapCollapsed.value,
    'info-collapsed': infoCollapsed.value
  }
})

onMounted(async () => {
  // 매물 데이터 로드
  await propertyStore.fetchProperties()
})

/**
 * 필터 적용 후 매물 재조회
 */
function handleFilterApply() {
  showFilters.value = false
  propertyStore.fetchProperties()
}

function toggleMap() {
  mapCollapsed.value = !mapCollapsed.value
  if (mapCollapsed.value) {
    infoCollapsed.value = false
  }
}

function toggleInfo() {
  infoCollapsed.value = !infoCollapsed.value
  if (infoCollapsed.value) {
    mapCollapsed.value = false
  }
}
</script>

<style scoped>
.property-exploration-layout {
  width: 100%;
  height: calc(100vh - var(--nav-height, 64px));
  position: relative;
}

.layout-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 0.5rem;
  z-index: 20;
}

.toggle-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  box-shadow: var(--nav-btn-shadow-day);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .toggle-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  border-color: var(--nav-btn-border-night);
  box-shadow: var(--nav-btn-shadow-night);
  color: var(--showroom-text-night);
}

.toggle-btn:hover {
  transform: translateY(-2px);
}

.split-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  transition: grid-template-columns 0.3s ease, grid-template-rows 0.3s ease;
}

/* Desktop: 50/50 split (좌우) */
@media (min-width: 1040px) {
  .split-container {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }

  .map-panel {
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }

  html[data-theme="night"] .map-panel {
    border-right-color: rgba(255, 255, 255, 0.05);
  }
}

/* Tablet: 40/60 split (좌우) */
@media (min-width: 768px) and (max-width: 1039px) {
  .split-container {
    grid-template-columns: 40% 60%;
    grid-template-rows: 1fr;
  }

  .map-panel {
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }

  html[data-theme="night"] .map-panel {
    border-right-color: rgba(255, 255, 255, 0.05);
  }
}

/* Mobile: Stack (상하) */
@media (max-width: 767px) {
  .split-container {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr;
  }

  .map-panel {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  html[data-theme="night"] .map-panel {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }
}

.map-panel,
.info-panel {
  overflow: hidden;
}

.map-panel.hidden,
.info-panel.hidden {
  display: none;
}

.split-container.map-collapsed {
  grid-template-columns: 0 1fr;
}

.split-container.info-collapsed {
  grid-template-columns: 1fr 0;
}

@media (max-width: 767px) {
  .split-container.map-collapsed {
    grid-template-columns: 1fr;
    grid-template-rows: 0 1fr;
  }

  .split-container.info-collapsed {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 0;
  }
}
</style>
