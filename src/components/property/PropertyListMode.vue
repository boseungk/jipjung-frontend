<template>
  <div class="property-list-mode">
    <div class="list-sticky">
      <!-- 헤더 -->
      <div class="list-header">
        <h2 class="list-title">매물 목록 ({{ filteredProperties.length }})</h2>
        <button @click="handleOpenFilters()" class="filter-icon-btn" aria-label="Filters">
          <PhSliders :size="20" weight="bold" />
          <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- 검색창 -->
      <div class="search-bar">
        <PhMagnifyingGlass :size="20" class="search-icon" />
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="아파트명, 지역 검색..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchKeyword" @click="clearSearch" class="clear-btn" aria-label="Clear search">
          <PhX :size="16" />
        </button>
      </div>

      <!-- Quick Filters (드롭다운 + 칩) -->
      <div class="quick-filters">
        <!-- 지역 드롭다운 칩 -->
        <button 
          class="chip-btn dropdown-chip" 
          @click="handleOpenFilters('region')"
        >
          <PhMapPin :size="16" weight="bold" />
          <span>{{ selectedRegionLabel }}</span>
          <PhCaretDown :size="14" />
        </button>

        <!-- 가격 드롭다운 칩 -->
        <button 
          class="chip-btn dropdown-chip"
          :class="{ active: hasActivePriceFilter }"
          @click="handleOpenFilters('price')"
        >
          <PhCurrencyKrw :size="16" weight="bold" />
          <span>{{ selectedPriceLabel }}</span>
          <PhCaretDown :size="14" />
        </button>

        <!-- 구분선 -->
        <div class="chip-divider"></div>

        <!-- 예산 맞춤 -->
        <button
          class="chip-btn"
          :class="{ active: isBudgetFilterActive }"
          @click="toggleBudgetFilter"
        >
          <PhWallet :size="16" weight="bold" />
          <span>예산맞춤</span>
        </button>

        <!-- 관심 매물 -->
        <button
          class="chip-btn"
          :class="{ active: filters.favoritesOnly }"
          @click="propertyStore.toggleFavoritesFilter()"
        >
          <PhHeart :size="16" :weight="filters.favoritesOnly ? 'fill' : 'regular'" />
          <span>관심</span>
        </button>
      </div>

      <!-- Active Filter Tags -->
      <div v-if="activeFilterTags.length > 0" class="active-filter-tags">
        <TransitionGroup name="tag">
          <span 
            v-for="tag in activeFilterTags" 
            :key="tag.key" 
            class="filter-tag"
          >
            {{ tag.label }}
            <button @click="handleRemoveFilter(tag.key)" class="tag-remove-btn" aria-label="Remove filter">
              <PhX :size="12" weight="bold" />
            </button>
          </span>
        </TransitionGroup>
        <button v-if="activeFilterTags.length > 1" @click="handleClearAllFilters" class="clear-all-btn">
          전체 해제
        </button>
      </div>
    </div>

    <!-- 로딩 상태 (Skeleton) -->
    <div v-if="loading" class="property-grid">
      <SkeletonCard v-for="n in 6" :key="n" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProperties.length === 0" class="empty-state">
      <h3>검색 조건에 맞는 매물이 없습니다</h3>
      <p>필터를 조정하거나 초기화해보세요</p>
      <button @click="handleClearAllFilters" class="reset-btn">필터 초기화</button>
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
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { usePropertyFilters } from '@/composables/usePropertyFilters'
import {
  PhSliders,
  PhMagnifyingGlass,
  PhX,
  PhMapPin,
  PhCurrencyKrw,
  PhCaretDown,
  PhWallet,
  PhHeart
} from '@phosphor-icons/vue'
import PropertyCard from './PropertyCard.vue'
import SkeletonCard from './SkeletonCard.vue'

const emit = defineEmits(['openFilters'])

const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { filteredProperties, loading, filters } = storeToRefs(propertyStore)
const { targetAmount } = storeToRefs(dreamHomeStore)

// Composable에서 필터 관련 computed/methods 가져오기
const {
  activeFilterTags,
  activeFilterCount,
  selectedRegionLabel,
  selectedPriceLabel,
  removeFilter,
  resetAllFilters
} = usePropertyFilters()

// 검색 디바운스
const searchKeyword = ref(filters.value.keyword || '')
let searchTimer = null

watch(
  () => filters.value.keyword,
  (next) => {
    const normalized = next || ''
    if (normalized !== searchKeyword.value) searchKeyword.value = normalized
  }
)

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

// 가격 필터 활성 여부
const hasActivePriceFilter = computed(() => {
  return filters.value.priceMin !== null || filters.value.priceMax !== null
})

// 예산 필터 활성 여부
// targetAmount는 원 단위, 매물가격은 만원 단위
// 계약금(30%) 기준: 매물가격(만원) × 10000 × 0.3 ≤ targetAmount(원)
// → 매물가격(만원) ≤ targetAmount / 10000 / 0.3
const isBudgetFilterActive = computed(() => {
  const target = targetAmount.value
  if (!target || target <= 0) return false
  const budgetLimitManwon = Math.floor(target / 10000 / 0.3)
  return filters.value.priceMax === budgetLimitManwon
})

/**
 * 예산 필터 토글
 * targetAmount(원) / 10000 / 0.3 = 구매 가능 최대 매물가(만원)
 */
function toggleBudgetFilter() {
  if (isBudgetFilterActive.value) {
    propertyStore.updateFilters({ priceMax: null })
  } else {
    const target = targetAmount.value
    if (!target || target <= 0) return
    const budgetLimitManwon = Math.floor(target / 10000 / 0.3)
    propertyStore.updateFilters({ priceMax: budgetLimitManwon })
  }
}

/**
 * 필터 모달 열기 (특정 섹션으로 스크롤)
 */
function handleOpenFilters(section = null) {
  emit('openFilters', section)
}

/**
 * 개별 필터 제거
 */
async function handleRemoveFilter(key) {
  await removeFilter(key)
}

/**
 * 모든 필터 초기화
 */
async function handleClearAllFilters() {
  await resetAllFilters()
  searchKeyword.value = ''
}

/**
 * 매물 선택
 */
function handleSelect(id) {
  propertyStore.selectProperty(id)
}

/**
 * 매물 저장 토글
 */
async function handleSave(id) {
  try {
    await propertyStore.toggleSaveProperty(id)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

/**
 * 검색 실행 (디바운스)
 */
function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    propertyStore.searchProperties(searchKeyword.value)
  }, 300)
}

/**
 * 검색어 초기화
 */
function clearSearch() {
  searchKeyword.value = ''
  if (searchTimer) clearTimeout(searchTimer)
  propertyStore.searchProperties('')
}
</script>

<style scoped>
/* ========================================
   Container
   ======================================== */
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

/* ========================================
   Sticky Header
   ======================================== */
.list-sticky {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--showroom-bg-day);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .list-sticky {
  background: var(--showroom-bg-night);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

/* ========================================
   Header
   ======================================== */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
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
  position: relative;
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

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand-accent);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================================
   Search Bar
   ======================================== */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  margin: 0 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .search-bar {
  background: rgba(60, 60, 60, 0.5);
  border-color: rgba(255, 255, 255, 0.05);
}

.search-icon {
  color: var(--showroom-text-day);
  opacity: 0.5;
  flex-shrink: 0;
}

html[data-theme="night"] .search-icon {
  color: var(--showroom-text-night);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
  color: var(--showroom-text-day);
}

.search-input::placeholder {
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .search-input {
  color: var(--showroom-text-night);
}

html[data-theme="night"] .search-input::placeholder {
  color: var(--showroom-text-night);
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--showroom-text-day);
  opacity: 0.5;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.clear-btn:hover {
  opacity: 1;
}

html[data-theme="night"] .clear-btn {
  color: var(--showroom-text-night);
}

/* ========================================
   Quick Filters
   ======================================== */
.quick-filters {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 0.75rem 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-filters::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  white-space: nowrap;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  color: var(--showroom-text-day);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

html[data-theme="night"] .chip-btn {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(60, 60, 60, 0.5);
  color: var(--showroom-text-night);
}

.chip-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

html[data-theme="night"] .chip-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.chip-btn.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
}

.dropdown-chip {
  gap: 0.25rem;
}

.chip-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 0.25rem;
  flex-shrink: 0;
}

html[data-theme="night"] .chip-divider {
  background: rgba(255, 255, 255, 0.1);
}

/* ========================================
   Active Filter Tags
   ======================================== */
.active-filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.5rem 0.75rem 1.5rem;
  align-items: center;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: rgba(255, 127, 80, 0.12);
  color: var(--brand-accent);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

html[data-theme="night"] .filter-tag {
  background: rgba(255, 127, 80, 0.2);
}

.tag-remove-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--brand-accent);
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tag-remove-btn:hover {
  opacity: 1;
}

.clear-all-btn {
  background: none;
  border: none;
  padding: 0.375rem 0.5rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
  font-size: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clear-all-btn:hover {
  opacity: 1;
}

html[data-theme="night"] .clear-all-btn {
  color: var(--showroom-text-night);
}

/* Tag transition */
.tag-enter-active,
.tag-leave-active {
  transition: all 0.2s ease;
}
.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* ========================================
   Grid
   ======================================== */
.property-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
}

@media (min-width: 1040px) {
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1039px) {
  .property-grid {
    grid-template-columns: 1fr;
  }
}

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

  .search-bar {
    margin: 0 1rem 0.75rem;
  }

  .quick-filters {
    padding: 0 1rem 0.75rem 1rem;
  }

  .active-filter-tags {
    padding: 0 1rem 0.75rem 1rem;
  }
}

/* ========================================
   Empty State
   ======================================== */
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
