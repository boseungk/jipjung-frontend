<template>
  <div class="property-filters-modal" v-if="isOpen" @click.self="closeModal">
    <div class="filters-content">
      <div class="filters-header">
        <h2>매물 필터</h2>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="filters-body">
        <!-- 지역 선택 -->
        <div class="filter-group">
          <label class="filter-label">지역</label>
          <select v-model="localFilters.region.sido" class="filter-select">
            <option value="">시/도 선택</option>
            <option value="서울특별시">서울특별시</option>
            <option value="경기도">경기도</option>
          </select>
          <select
            v-model="localFilters.region.sigungu"
            class="filter-select"
            :disabled="!localFilters.region.sido"
          >
            <option value="">구/군 선택</option>
            <option v-if="localFilters.region.sido === '서울특별시'" value="강남구">강남구</option>
            <option v-if="localFilters.region.sido === '서울특별시'" value="서초구">서초구</option>
            <option v-if="localFilters.region.sido === '서울특별시'" value="송파구">송파구</option>
          </select>
        </div>

        <!-- 가격 범위 -->
        <div class="filter-group">
          <label class="filter-label">
            가격 범위: {{ formatPrice(localFilters.priceRange[0]) }} ~ {{ formatPrice(localFilters.priceRange[1]) }}
          </label>
          <div class="range-inputs">
            <input
              type="number"
              v-model.number="localFilters.priceRange[0]"
              :max="localFilters.priceRange[1]"
              placeholder="최소"
              class="range-input"
            />
            <span>~</span>
            <input
              type="number"
              v-model.number="localFilters.priceRange[1]"
              :min="localFilters.priceRange[0]"
              placeholder="최대"
              class="range-input"
            />
          </div>
        </div>

        <!-- 매물 유형 -->
        <div class="filter-group">
          <label class="filter-label">매물 유형</label>
          <div class="checkbox-group">
            <label
              v-for="type in propertyTypes"
              :key="type"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="type"
                v-model="localFilters.propertyTypes"
                class="checkbox-input"
              />
              <span>{{ type }}</span>
            </label>
          </div>
        </div>

        <!-- 면적 범위 -->
        <div class="filter-group">
          <label class="filter-label">
            면적: {{ localFilters.areaRange[0] }}평 ~ {{ localFilters.areaRange[1] }}평
          </label>
          <div class="range-inputs">
            <input
              type="number"
              v-model.number="localFilters.areaRange[0]"
              :max="localFilters.areaRange[1]"
              placeholder="최소"
              class="range-input"
            />
            <span>~</span>
            <input
              type="number"
              v-model.number="localFilters.areaRange[1]"
              :min="localFilters.areaRange[0]"
              placeholder="최대"
              class="range-input"
            />
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
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { PROPERTY_TYPES } from '@/constants/properties'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'apply'])

const propertyStore = usePropertyStore()
const { filters } = storeToRefs(propertyStore)

const propertyTypes = PROPERTY_TYPES

// 로컬 필터 상태 (모달 내에서만 변경)
const localFilters = ref({
  region: { sido: '', sigungu: '' },
  priceRange: [0, 999999],
  propertyTypes: [...PROPERTY_TYPES],
  areaRange: [0, 999]
})

// props가 열릴 때 현재 필터값으로 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localFilters.value = {
      region: { ...filters.value.region },
      priceRange: [...filters.value.priceRange],
      propertyTypes: [...filters.value.propertyTypes],
      areaRange: [...filters.value.areaRange]
    }
  }
})

function formatPrice(price) {
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
  closeModal()
}

function handleApply() {
  propertyStore.updateFilters(localFilters.value)
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

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-input {
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
