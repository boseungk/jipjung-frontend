<template>
  <div class="property-list-mode">
    <!-- 헤더 -->
    <div class="list-header">
      <h2 class="list-title">매물 목록 ({{ filteredProperties.length }})</h2>
      <button @click="$emit('openFilters')" class="filter-btn">
        🔍 필터
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>매물을 불러오는 중...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProperties.length === 0" class="empty-state">
      <div class="empty-icon">🏠</div>
      <h3>검색 조건에 맞는 매물이 없습니다</h3>
      <p>필터를 조정하거나 초기화해보세요</p>
      <button @click="resetFilters" class="reset-btn">필터 초기화</button>
    </div>

    <!-- Grid -->
    <div v-else class="property-grid">
      <PropertyCard
        v-for="property in filteredProperties"
        :key="property.id"
        :property="property"
        @select="handleSelect"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import PropertyCard from './PropertyCard.vue'

const emit = defineEmits(['openFilters'])

const propertyStore = usePropertyStore()
const { filteredProperties, loading } = storeToRefs(propertyStore)

function handleSelect(id) {
  propertyStore.selectProperty(id)
}

function handleSave(id) {
  propertyStore.toggleSaveProperty(id)
}

function resetFilters() {
  propertyStore.resetFilters()
}
</script>

<style scoped>
.property-list-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

html[data-theme="night"] .list-header {
  background: rgba(58, 53, 48, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.list-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
}

html[data-theme="night"] .list-title {
  color: var(--showroom-text-night);
}

.filter-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  box-shadow: var(--nav-btn-shadow-day);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .filter-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  border-color: var(--nav-btn-border-night);
  box-shadow: var(--nav-btn-shadow-night);
  color: var(--showroom-text-night);
}

.filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* 그리드 */
.property-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Desktop: 2 columns */
@media (min-width: 1040px) {
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet: 1 column */
@media (min-width: 768px) and (max-width: 1039px) {
  .property-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile: 1 column */
@media (max-width: 767px) {
  .property-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .list-header {
    padding: 1rem;
  }

  .list-title {
    font-size: 1.25rem;
  }
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 127, 80, 0.2);
  border-top-color: var(--brand-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
}

html[data-theme="night"] .loading-state p {
  color: var(--showroom-text-night);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  margin: 0;
}

html[data-theme="night"] .empty-state h3 {
  color: var(--showroom-text-night);
}

.empty-state p {
  font-size: 1rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
  margin: 0;
}

html[data-theme="night"] .empty-state p {
  color: var(--showroom-text-night);
}

.reset-btn {
  background: var(--brand-accent);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 127, 80, 0.4);
}
</style>
