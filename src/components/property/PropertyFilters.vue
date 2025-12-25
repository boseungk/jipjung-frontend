<template>
  <Teleport to="body">
    <Transition
      name="bottom-sheet"
      @before-enter="isAnimating = true"
      @after-enter="isAnimating = false"
      @before-leave="isAnimating = true"
      @after-leave="isAnimating = false"
    >
      <div
        v-if="isOpen"
        class="bottom-sheet-overlay"
        :class="{ 'is-animating': isAnimating }"
        @click.self="closeSheet"
      >
        <div 
          class="bottom-sheet-container"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag Handle -->
          <div class="drag-handle-wrapper">
            <div class="drag-handle"></div>
          </div>

          <!-- Header -->
          <header class="sheet-header">
            <h2 class="sheet-title">상세 필터</h2>
            <button @click="closeSheet" class="close-btn" aria-label="닫기">
              <PhX :size="20" weight="bold" />
            </button>
          </header>

          <!-- Content -->
          <div class="sheet-content">
            <!-- 지역 섹션 -->
            <section class="filter-section" ref="regionSection">
              <h3 class="section-title">
                <PhMapPin :size="18" />
                <span>지역</span>
              </h3>
              <div class="region-selects">
                <select v-model="localFilters.sido" class="filter-select">
                  <option value="">시/도 선택</option>
                  <option v-for="sido in SIDO_LIST" :key="sido" :value="sido">{{ sido }}</option>
                </select>
                <select
                  v-model="localFilters.sigungu"
                  class="filter-select"
                  :disabled="!localFilters.sido"
                >
                  <option value="">시/군/구 선택</option>
                  <option v-for="sigungu in availableSigunguOptions" :key="sigungu" :value="sigungu">
                    {{ sigungu }}
                  </option>
                </select>
              </div>
            </section>

            <!-- 가격 섹션 -->
            <section class="filter-section" ref="priceSection">
              <h3 class="section-title">
                <PhCurrencyKrw :size="18" />
                <span>가격</span>
              </h3>
              <!-- 프리셋 버튼 -->
              <div class="preset-chips">
                <button
                  v-for="preset in PRICE_PRESETS"
                  :key="preset.label"
                  class="preset-chip"
                  :class="{ active: isPricePresetActive(preset) }"
                  @click="applyPricePreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>
              <!-- Range Slider -->
              <RangeSlider
                :min="SLIDER_CONFIG.price.min"
                :max="SLIDER_CONFIG.price.max"
                :step="SLIDER_CONFIG.price.step"
                :modelMin="localFilters.priceMin"
                :modelMax="localFilters.priceMax"
                :formatValue="formatPriceLabel"
                @update:modelMin="localFilters.priceMin = $event"
                @update:modelMax="localFilters.priceMax = $event"
              />
            </section>

            <!-- 면적 섹션 -->
            <section class="filter-section">
              <h3 class="section-title">
                <PhRuler :size="18" />
                <span>면적</span>
              </h3>
              <!-- 프리셋 버튼 -->
              <div class="preset-chips">
                <button
                  v-for="preset in AREA_PRESETS"
                  :key="preset.label"
                  class="preset-chip"
                  :class="{ active: isAreaPresetActive(preset) }"
                  @click="applyAreaPreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>
              <!-- Range Slider -->
              <RangeSlider
                :min="SLIDER_CONFIG.area.min"
                :max="SLIDER_CONFIG.area.max"
                :step="SLIDER_CONFIG.area.step"
                :modelMin="localFilters.areaMin"
                :modelMax="localFilters.areaMax"
                :formatValue="formatAreaLabel"
                @update:modelMin="localFilters.areaMin = $event"
                @update:modelMax="localFilters.areaMax = $event"
              />
            </section>

            <!-- 관심 매물 토글 -->
            <section class="filter-section toggle-section">
              <label class="toggle-label">
                <span class="toggle-text">
                  <PhHeart :size="18" />
                  내 관심 아파트만
                </span>
                <button 
                  class="toggle-switch"
                  :class="{ active: localFilters.favoritesOnly }"
                  @click="localFilters.favoritesOnly = !localFilters.favoritesOnly"
                  role="switch"
                  :aria-checked="localFilters.favoritesOnly"
                >
                  <span class="toggle-knob"></span>
                </button>
              </label>
            </section>

            <!-- 정렬 섹션 -->
            <section class="filter-section">
              <h3 class="section-title">
                <PhSortAscending :size="18" />
                <span>정렬</span>
              </h3>
              <div class="sort-options">
                <select v-model="localSort.sortBy" class="filter-select">
                  <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <select v-model="localSort.sortOrder" class="filter-select">
                  <option v-for="opt in SORT_ORDER_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <footer class="sheet-footer">
            <button @click="handleReset" class="btn btn-secondary reset-btn">
              <PhArrowCounterClockwise :size="18" />
              초기화
            </button>
            <button @click="handleApply" class="btn btn-primary apply-btn">
              {{ filteredCount }}개 매물 보기
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  PhX,
  PhMapPin,
  PhCurrencyKrw,
  PhRuler,
  PhHeart,
  PhSortAscending,
  PhArrowCounterClockwise
} from '@phosphor-icons/vue'
import RangeSlider from '@/components/common/RangeSlider.vue'
import { usePropertyFilters } from '@/composables/usePropertyFilters'
import { SLIDER_CONFIG, SORT_OPTIONS, SORT_ORDER_OPTIONS, formatPriceLabel, formatAreaLabel } from '@/constants/filterPresets'
// PROPERTY_TYPES removed - only apartments in DB
import { SIDO_LIST } from '@/constants/regions'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  initialSection: { type: String, default: null } // 'region' | 'price' 등
})

const emit = defineEmits(['close', 'apply'])

const isAnimating = ref(false)

// Composable에서 필터 로직 가져오기
const {
  localFilters,
  localSort,
  availableSigunguOptions,
  filteredCount,
  PRICE_PRESETS,
  AREA_PRESETS,
  syncFromStore,
  isPricePresetActive,
  isAreaPresetActive,
  applyPricePreset,
  applyAreaPreset,
  applyFilters,
  resetAllFilters
} = usePropertyFilters()

// 섹션 refs (스크롤 타겟)
const regionSection = ref(null)
const priceSection = ref(null)

// 터치 제스처 상태
const touchStartY = ref(0)
const touchDeltaY = ref(0)

// 모달 열릴 때 초기화
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      syncFromStore()
      document.body.style.overflow = 'hidden'
      
      // 특정 섹션으로 스크롤
      if (props.initialSection) {
        scrollToSection(props.initialSection)
      }
    } else {
      document.body.style.overflow = ''
    }
  }
)

/**
 * 섹션으로 스크롤
 */
function scrollToSection(section) {
  setTimeout(() => {
    const sectionRef = section === 'region' ? regionSection.value
                      : section === 'price' ? priceSection.value
                      : null
    sectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}

/**
 * 터치 제스처 핸들러 (아래로 스와이프시 닫기)
 */
function handleTouchStart(e) {
  touchStartY.value = e.touches[0].clientY
}

function handleTouchMove(e) {
  touchDeltaY.value = e.touches[0].clientY - touchStartY.value
}

function handleTouchEnd() {
  // 100px 이상 아래로 스와이프하면 닫기
  if (touchDeltaY.value > 100) {
    closeSheet()
  }
  touchDeltaY.value = 0
}

/**
 * 시트 닫기
 */
function closeSheet() {
  emit('close')
}

/**
 * 필터 적용
 */
async function handleApply() {
  await applyFilters()
  emit('apply')
  closeSheet()
}

/**
 * 필터 초기화
 */
async function handleReset() {
  await resetAllFilters()
  emit('apply')
  closeSheet()
}
</script>

<style scoped>
/* ========================================
   Bottom Sheet Transition
   ======================================== */
.bottom-sheet-enter-active {
  transition: opacity 0.3s ease;
}
.bottom-sheet-enter-active .bottom-sheet-container {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bottom-sheet-leave-active {
  transition: opacity 0.2s ease;
}
.bottom-sheet-leave-active .bottom-sheet-container {
  transition: transform 0.3s ease-in;
}
.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}
.bottom-sheet-enter-from .bottom-sheet-container,
.bottom-sheet-leave-to .bottom-sheet-container {
  transform: translateY(100%);
}

/* ========================================
   Overlay
   ======================================== */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottom-sheet-overlay.is-animating {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.bottom-sheet-overlay.is-animating .filter-section,
.bottom-sheet-overlay.is-animating .preset-chip,
.bottom-sheet-overlay.is-animating .segmented-control {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* ========================================
   Container
   ======================================== */
.bottom-sheet-container {
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background: var(--showroom-bg-day, #faf9f7);
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
}

html[data-theme="night"] .bottom-sheet-container {
  background: var(--showroom-bg-night, #2a2520);
}

/* ========================================
   Drag Handle
   ======================================== */
.drag-handle-wrapper {
  padding: 12px 0 8px;
  display: flex;
  justify-content: center;
}

.drag-handle {
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

html[data-theme="night"] .drag-handle {
  background: rgba(255, 255, 255, 0.2);
}

/* ========================================
   Header
   ======================================== */
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .sheet-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.sheet-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
}

html[data-theme="night"] .sheet-title {
  color: var(--showroom-text-night);
}

.close-btn {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--showroom-text-day);
  transition: all 0.2s ease;
}

html[data-theme="night"] .close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

/* ========================================
   Content
   ======================================== */
.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ========================================
   Filter Sections
   ======================================== */
.filter-section {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 16px;
  padding: 1rem;
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
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .section-title {
  color: var(--showroom-text-night);
}

/* ========================================
   Region Selects
   ======================================== */
.region-selects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.5);
  color: var(--showroom-text-day);
  cursor: pointer;
  transition: all 0.2s ease;
}

html[data-theme="night"] .filter-select {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.filter-select:focus {
  outline: none;
  border-color: var(--brand-accent);
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========================================
   Preset Chips - 전역 버튼 변수 사용
   ======================================== */
.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 0.5rem);
  margin-bottom: 1rem;
}

.preset-chip {
  padding: 0.5rem 1rem;
  border-radius: var(--app-btn-radius, 12px);
  border: 1.5px solid var(--nav-btn-border-day, rgba(0, 0, 0, 0.06));
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.82));
  font-size: var(--font-size-body-small, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: var(--app-btn-transition, all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1));
  color: var(--showroom-text-day);
  box-shadow: var(--nav-btn-shadow-day);
}

html[data-theme="night"] .preset-chip {
  border-color: var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  color: var(--showroom-text-night);
  box-shadow: var(--nav-btn-shadow-night);
}

.preset-chip:hover {
  box-shadow: var(--nav-btn-shadow-day-hover);
  transform: translateY(-1px);
}

html[data-theme="night"] .preset-chip:hover {
  box-shadow: var(--nav-btn-shadow-night-hover);
}

.preset-chip.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.3);
}

/* ========================================
   Segmented Control - 전역 버튼 변수 사용
   ======================================== */
.segmented-control {
  display: flex;
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.82));
  border-radius: var(--app-btn-radius, 12px);
  padding: 4px;
  gap: 4px;
  box-shadow: var(--nav-btn-shadow-day);
  border: 1px solid var(--nav-btn-border-day, rgba(0, 0, 0, 0.06));
}

html[data-theme="night"] .segmented-control {
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  box-shadow: var(--nav-btn-shadow-night);
  border-color: var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
}

.segment {
  flex: 1;
  padding: 0.625rem 0.5rem;
  border: none;
  border-radius: calc(var(--app-btn-radius, 12px) - 4px);
  background: transparent;
  font-size: var(--font-size-body-small, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: var(--app-btn-transition, all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1));
  color: var(--showroom-text-day);
}

html[data-theme="night"] .segment {
  color: var(--showroom-text-night);
}

.segment.active {
  background: rgba(255, 127, 80, 0.12);
  border: 1px solid rgba(255, 127, 80, 0.25);
  color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.15);
  font-weight: var(--font-weight-semibold, 600);
}

html[data-theme="night"] .segment.active {
  background: rgba(255, 127, 80, 0.18);
  border: 1px solid rgba(255, 127, 80, 0.3);
  color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.2);
}

/* ========================================
   Toggle Section
   ======================================== */
.toggle-section {
  padding: 0.75rem 1rem;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .toggle-text {
  color: var(--showroom-text-night);
}

.toggle-switch {
  width: 48px;
  height: 28px;
  background: rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

html[data-theme="night"] .toggle-switch {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-switch.active {
  background: var(--brand-accent);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(20px);
}

/* ========================================
   Sort Options
   ======================================== */
.sort-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ========================================
   Footer - 전역 버튼 클래스 사용
   ======================================== */
.sheet-footer {
  display: flex;
  gap: var(--spacing-sm, 1rem);
  padding: 1rem 1.5rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  border-top: 1px solid var(--surface-glass-border, rgba(0, 0, 0, 0.05));
  background: var(--showroom-bg-day, #faf9f7);
}

html[data-theme="night"] .sheet-footer {
  border-top-color: var(--surface-glass-border, rgba(255, 255, 255, 0.05));
  background: var(--showroom-bg-night, #2a2520);
}

/* 전역 btn 클래스에 flex 비율만 추가 */
.sheet-footer .reset-btn {
  flex: 1;
}

.sheet-footer .apply-btn {
  flex: 2;
}

/* ========================================
   Mobile Adjustments
   ======================================== */
@media (max-width: 480px) {
  .bottom-sheet-container {
    max-height: 90vh;
  }

  .region-selects,
  .sort-options {
    grid-template-columns: 1fr;
  }

  .preset-chips {
    gap: 0.375rem;
  }

  .preset-chip {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
