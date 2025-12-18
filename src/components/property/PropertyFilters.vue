<template>
  <div
    v-if="isOpen"
    class="property-filters-modal"
    role="dialog"
    aria-modal="true"
    aria-label="매물 필터"
    @click.self="closeModal"
    @wheel.prevent
    @touchmove.prevent
  >
    <div class="filters-content" @wheel.stop @touchmove.stop>
      <div class="filters-header">
        <h2>매물 필터</h2>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="filters-body">
        <!-- 지역 선택 -->
        <section class="filter-section">
          <h3 class="section-title">지역</h3>
          <div class="filter-content">
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
        </section>

        <!-- 가격 범위 + 프리셋 -->
        <section class="filter-section">
          <h3 class="section-title">가격</h3>
          <div class="preset-buttons">
            <button
              v-for="preset in pricePresets"
              :key="preset.label"
              :class="{ active: isPricePresetActive(preset) }"
              @click="applyPricePreset(preset)"
            >{{ preset.label }}</button>
          </div>
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
        </section>

        <!-- 매물 유형 -->
        <section class="filter-section">
          <h3 class="section-title">매물 유형</h3>
          <select v-model="localFilters.propertyType" class="filter-select">
            <option :value="null">전체</option>
            <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </section>

        <!-- 면적 범위 + 프리셋 -->
        <section class="filter-section">
          <h3 class="section-title">면적</h3>
          <div class="preset-buttons">
            <button
              v-for="preset in areaPresets"
              :key="preset.label"
              :class="{ active: isAreaPresetActive(preset) }"
              @click="applyAreaPreset(preset)"
            >{{ preset.label }}</button>
          </div>
          <div class="range-inputs">
            <input
              type="number"
              v-model.number="localFilters.areaMin"
              :max="localFilters.areaMax || undefined"
              placeholder="최소 (평)"
              class="range-input"
            />
            <span>~</span>
            <input
              type="number"
              v-model.number="localFilters.areaMax"
              :min="localFilters.areaMin || undefined"
              placeholder="최대 (평)"
              class="range-input"
            />
          </div>
        </section>

        <!-- 관심 아파트 필터 -->
        <section class="filter-section">
          <label class="checkbox-label favorite-filter">
            <input
              type="checkbox"
              v-model="localFilters.favoritesOnly"
              class="checkbox-input"
            />
            <span>내 관심 아파트만</span>
          </label>
        </section>

        <!-- 정렬 -->
        <section class="filter-section">
          <h3 class="section-title">정렬</h3>
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
        </section>
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

// 가격 프리셋 (단위: 만원)
const pricePresets = [
  { label: '1억 이하', min: null, max: 10000 },
  { label: '1~3억', min: 10000, max: 30000 },
  { label: '3~5억', min: 30000, max: 50000 },
  { label: '5~10억', min: 50000, max: 100000 },
  { label: '10억 이상', min: 100000, max: null }
]

// 면적 프리셋 (단위: 평)
const areaPresets = [
  { label: '10평대', min: 10, max: 19 },
  { label: '20평대', min: 20, max: 29 },
  { label: '30평대', min: 30, max: 39 },
  { label: '40평 이상', min: 40, max: null }
]

function applyPricePreset(preset) {
  localFilters.value.priceMin = preset.min
  localFilters.value.priceMax = preset.max
}

function applyAreaPreset(preset) {
  localFilters.value.areaMin = preset.min
  localFilters.value.areaMax = preset.max
}

function isPricePresetActive(preset) {
  return localFilters.value.priceMin === preset.min &&
         localFilters.value.priceMax === preset.max
}

function isAreaPresetActive(preset) {
  return localFilters.value.areaMin === preset.min &&
         localFilters.value.areaMax === preset.max
}

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

function closeModal() {
  emit('close')
}

function handleReset() {
  propertyStore.resetFilters()
  localSort.value = { sortBy: 'createdAt', sortOrder: 'desc' }
  propertyStore.updateSort('createdAt', 'desc')
  propertyStore.fetchProperties({ page: 1 })
  emit('apply')
  closeModal()
}

async function handleApply() {
  propertyStore.updateFilters(localFilters.value)
  propertyStore.updateSort(localSort.value.sortBy, localSort.value.sortOrder)
  await propertyStore.fetchProperties({ page: 1 })
  emit('apply')
  closeModal()
}
</script>

<style scoped>
.property-filters-modal {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  padding: 1rem;
  overscroll-behavior: contain;
  isolation: isolate;
}

.filters-content {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 75vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overscroll-behavior: contain;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 필터 섹션 카드 스타일 */
.filter-section {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

html[data-theme="night"] .filter-section {
  background: rgba(60, 60, 60, 0.4);
  border-color: rgba(255, 255, 255, 0.03);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .section-title {
  color: var(--showroom-text-night);
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 프리셋 버튼 */
.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .preset-buttons button {
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.preset-buttons button:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .preset-buttons button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.preset-buttons button.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
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

.range-input {
  flex: 1;
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
