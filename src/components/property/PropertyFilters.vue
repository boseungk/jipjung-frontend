<template>
  <div class="property-filters-modal" v-if="isOpen" @click.self="closeModal">
    <div class="filters-content">
      <div class="filters-header">
        <h2>매물 필터</h2>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="filters-body">
        <!-- 검색 -->
        <div class="filter-group">
          <label class="filter-label">검색</label>
          <input
            type="text"
            v-model="localFilters.keyword"
            placeholder="아파트명, 지역 검색..."
            class="filter-input"
          />
        </div>

        <!-- 지역 선택: constants/regions.js 사용 -->
        <div class="filter-group">
          <label class="filter-label">지역</label>
          <select v-model="localFilters.sido" class="filter-select">
            <option value="">시/도 선택</option>
            <option v-for="sido in SIDO_LIST" :key="sido" :value="sido">{{ sido }}</option>
          </select>
          <select
            v-model="localFilters.sigungu"
            class="filter-select"
            :disabled="!localFilters.sido"
          >
            <option value="">읍/면/동 선택</option>
            <option v-for="sigungu in availableSigunguOptions" :key="sigungu" :value="sigungu">
              {{ sigungu }}
            </option>
          </select>
        </div>

        <!-- 가격 범위: 개별 필드 -->
        <div class="filter-group">
          <label class="filter-label">
            가격 범위: {{ formatPrice(localFilters.priceMin) }} ~ {{ formatPrice(localFilters.priceMax) }}
          </label>
          <div class="range-inputs">
            <input
              type="number"
              v-model.number="localFilters.priceMin"
              :max="localFilters.priceMax || undefined"
              placeholder="최소 (만원)"
              class="range-input"
            />
            <span>~</span>
            <input
              type="number"
              v-model.number="localFilters.priceMax"
              :min="localFilters.priceMin || undefined"
              placeholder="최대 (만원)"
              class="range-input"
            />
          </div>
        </div>

        <!-- 매물 유형: 단일 select -->
        <div class="filter-group">
          <label class="filter-label">매물 유형</label>
          <select v-model="localFilters.propertyType" class="filter-select">
            <option :value="null">전체</option>
            <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <!-- 면적 범위: 개별 필드 -->
        <div class="filter-group">
          <label class="filter-label">
            면적: {{ localFilters.areaMin || 0 }}평 ~ {{ localFilters.areaMax || '∞' }}평
          </label>
          <div class="range-inputs">
            <input
              type="number"
              v-model.number="localFilters.areaMin"
              :max="localFilters.areaMax || undefined"
              placeholder="최소"
              class="range-input"
            />
            <span>~</span>
            <input
              type="number"
              v-model.number="localFilters.areaMax"
              :min="localFilters.areaMin || undefined"
              placeholder="최대"
              class="range-input"
            />
          </div>
        </div>

        <!-- 관심 아파트 필터 -->
        <div class="filter-group">
          <label class="checkbox-label favorite-filter">
            <input
              type="checkbox"
              v-model="localFilters.favoritesOnly"
              class="checkbox-input"
            />
            <span>❤️ 내 관심 아파트만</span>
          </label>
        </div>

        <!-- 정렬 -->
        <div class="filter-group">
          <label class="filter-label">정렬</label>
          <div class="sort-inputs">
            <select v-model="localSort.sortBy" class="filter-select">
              <option value="createdAt">최신순</option>
              <option value="price">가격순</option>
              <option value="area">면적순</option>
            </select>
            <select v-model="localSort.sortOrder" class="filter-select">
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </div>
        </div>
      </div>

      <div class="filters-footer">
        <button @click="handleReset" class="reset-btn">초기화</button>
        <button @click="handleApply" class="apply-btn">적용</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { PROPERTY_TYPES } from '@/constants/properties'
import { SIDO_LIST } from '@/constants/regions'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'apply'])

const propertyStore = usePropertyStore()
const { filters, sortBy, sortOrder, properties } = storeToRefs(propertyStore)

const availableSigunguOptions = computed(() => {
  const values = (properties.value || []).map((p) => p?.sigungu).filter(Boolean)
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ko'))
})

// 로컬 필터 상태 (Store 스키마와 일치)
const localFilters = ref({
  sido: '',
  sigungu: '',
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  propertyType: null,
  favoritesOnly: false,
  keyword: ''
})

// 정렬은 filters 외부에서 관리
const localSort = ref({
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 모달 열릴 때 현재 필터/정렬 값으로 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localFilters.value = {
      sido: filters.value.sido || '',
      sigungu: filters.value.sigungu || '',
      priceMin: filters.value.priceMin,
      priceMax: filters.value.priceMax,
      areaMin: filters.value.areaMin,
      areaMax: filters.value.areaMax,
      propertyType: filters.value.propertyType,
      favoritesOnly: filters.value.favoritesOnly || false,
      keyword: filters.value.keyword || ''
    }
    localSort.value = {
      sortBy: sortBy.value || 'createdAt',
      sortOrder: sortOrder.value || 'desc'
    }
  }
})

// 시/도 변경 시 시/군/구 초기화
watch(() => localFilters.value.sido, (next, prev) => {
  if (!prev) return
  if (next !== prev) localFilters.value.sigungu = ''
})

function formatPrice(price) {
  if (price === null || price === undefined) return '0'
  if (price >= 10000) {
    return `${(price / 10000).toFixed(1)}억`
  }
  return `${price.toLocaleString()}만원`
}

function closeModal() {
  emit('close')
}

function handleReset() {
  propertyStore.resetFilters()
  localSort.value = { sortBy: 'createdAt', sortOrder: 'desc' }
  closeModal()
}

async function handleApply() {
  propertyStore.updateFilters(localFilters.value)
  propertyStore.updateSort(localSort.value.sortBy, localSort.value.sortOrder)
  await propertyStore.fetchProperties()
  emit('apply')
  closeModal()
}
</script>

<style scoped>
.property-filters-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.filters-content {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .filters-content {
  background: rgba(58, 53, 48, 0.98);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .filters-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.filters-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
}

html[data-theme="night"] .filters-header h2 {
  color: var(--showroom-text-night);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--showroom-text-day);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

html[data-theme="night"] .close-btn {
  color: var(--showroom-text-night);
}

.close-btn:hover {
  opacity: 1;
}

.filters-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .filter-label {
  color: var(--showroom-text-night);
}

.filter-select,
.range-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.5);
  color: var(--showroom-text-day);
  transition: all 0.3s ease;
}

html[data-theme="night"] .filter-select,
html[data-theme="night"] .range-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.filter-select:focus,
.range-input:focus {
  outline: none;
  border-color: var(--brand-accent);
}

.range-inputs,
.sort-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-inputs .filter-select {
  flex: 1;
}

.range-input,
.filter-input {
  flex: 1;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--showroom-text-day);
}

.checkbox-label.favorite-filter {
  padding: 0.75rem 1rem;
  background: rgba(255, 107, 61, 0.08);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.checkbox-label.favorite-filter:hover {
  background: rgba(255, 107, 61, 0.15);
}

html[data-theme="night"] .checkbox-label {
  color: var(--showroom-text-night);
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.filters-footer {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .filters-footer {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.reset-btn,
.apply-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  color: var(--showroom-text-day);
}

html[data-theme="night"] .reset-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  border-color: var(--nav-btn-border-night);
  color: var(--showroom-text-night);
}

.apply-btn {
  background: linear-gradient(135deg, var(--brand-accent) 0%, #FF6347 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 127, 80, 0.3);
}

.reset-btn:hover,
.apply-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 767px) {
  .filters-content {
    max-height: 100vh;
    border-radius: 0;
  }

  .filters-header,
  .filters-body,
  .filters-footer {
    padding: 1.5rem;
  }
}
</style>
