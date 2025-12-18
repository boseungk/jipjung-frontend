<template>
  <div class="property-list-mode">
    <!-- 헤더 -->
    <div class="list-header">
      <h2 class="list-title">매물 목록 ({{ filteredProperties.length }})</h2>
      <button @click="$emit('openFilters')" class="filter-icon-btn" aria-label="Filters">
        <PhSliders :size="20" weight="bold" />
      </button>
    </div>

    <!-- Quick Filters -->
    <div class="quick-filters">
      <button 
        class="chip-btn" 
        :class="{ active: isBudgetFilterActive }"
        @click="toggleBudgetFilter"
      >
        <span v-if="isBudgetFilterActive">✓</span>
        내 예산 맞춤
      </button>
      <button 
        class="chip-btn" 
        :class="{ active: filters.favoritesOnly }"
        @click="propertyStore.toggleFavoritesFilter()"
      >
        <span v-if="filters.favoritesOnly">✓</span>
        관심 매물
      </button>
      <button 
        class="chip-btn" 
        :class="{ active: filters.propertyType === '아파트' }"
        @click="toggleTypeFilter('아파트')"
      >
        <span v-if="filters.propertyType === '아파트'">✓</span>
        아파트
      </button>
    </div>

    <!-- 로딩 상태 (Skeleton) -->
    <div v-if="loading" class="property-grid">
      <SkeletonCard v-for="n in 6" :key="n" />
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { PhSliders } from '@phosphor-icons/vue'
import PropertyCard from './PropertyCard.vue'
import SkeletonCard from './SkeletonCard.vue'

const emit = defineEmits(['openFilters'])

const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { filteredProperties, loading, filters } = storeToRefs(propertyStore)
const { targetAmount } = storeToRefs(dreamHomeStore)

const isBudgetFilterActive = computed(() => {
  if (!targetAmount.value || targetAmount.value <= 0) return false
  // Check if priceMax is set to our calculated budget
  const budgetLimit = Math.floor((targetAmount.value / 0.3) / 10000)
  return filters.value.priceMax === budgetLimit
})

function toggleBudgetFilter() {
  if (isBudgetFilterActive.value) {
    // Clear filter
    propertyStore.updateFilters({ priceMax: null })
  } else {
    // Set filter (Target / 30% downpayment)
    if (!targetAmount.value) return
    const budgetLimit = Math.floor((targetAmount.value / 0.3) / 10000)
    propertyStore.updateFilters({ priceMax: budgetLimit })
  }
}

function toggleTypeFilter(type) {
  if (filters.value.propertyType === type) {
    propertyStore.updateFilters({ propertyType: null })
  } else {
    propertyStore.updateFilters({ propertyType: type })
  }
}

function handleSelect(id) {
  propertyStore.selectProperty(id)
}

async function handleSave(id) {
  try {
    await propertyStore.toggleSaveProperty(id)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
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
  background: var(--showroom-bg-day);
}

html[data-theme="night"] .property-list-mode {
  background: var(--showroom-bg-night);
}

/* 헤더 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--showroom-bg-day);
}

html[data-theme="night"] .list-header {
  background: var(--showroom-bg-night);
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

.filter-icon-btn {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--showroom-text-day);
  transition: all 0.2s ease;
}

html[data-theme="night"] .filter-icon-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.filter-icon-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Quick Filters */
.quick-filters {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1rem 1.5rem;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar */
  position: sticky;
  top: 70px;
  z-index: 9;
  background: var(--showroom-bg-day);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .quick-filters {
  background: var(--showroom-bg-night);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.quick-filters::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  white-space: nowrap;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  color: var(--showroom-text-day);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

html[data-theme="night"] .chip-btn {
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--showroom-text-night);
}

.chip-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .chip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chip-btn.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
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
