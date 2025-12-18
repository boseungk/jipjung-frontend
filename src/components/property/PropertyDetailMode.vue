<template>
  <div class="property-detail-mode" ref="containerRef" @scroll="handleScroll">
    <template v-if="selectedProperty">
      <!-- Sticky Header -->
      <DetailHeader
        :title="selectedProperty.title"
        :is-scrolled="isScrolled"
        :is-saved="isSaved"
        @back="handleBack"
        @toggle-save="handleSave"
      />

      <div class="detail-content-wrapper">
        <!-- Hero Section -->
        <section class="hero-section">
          <PropertyGallery
            :images="selectedProperty.images"
            :title="selectedProperty.title"
          />
        </section>

        <!-- Title & Price Section -->
        <section class="header-section">
          <div class="badges-row">
            <span class="status-badge">
              <PhTag :size="14" weight="bold" />
              {{ selectedProperty.transactionType }}
            </span>
            <span class="type-badge">{{ selectedProperty.propertyType }}</span>
          </div>

          <h1 class="property-title">{{ selectedProperty.title }}</h1>

          <div class="price-row">
            <span class="main-price">{{ selectedProperty.getFormattedPrice() }}</span>
            <span class="price-sub" v-if="selectedProperty.maintenanceFee">
              (관리비 {{ selectedProperty.maintenanceFee }}만)
            </span>
          </div>

          <div class="address-row">
            <PhMapPin :size="18" weight="fill" class="text-brand" />
            <span>{{ selectedProperty.address }}</span>
          </div>
        </section>

        <!-- Key Specs Grid -->
        <section class="specs-section">
          <PropertySpecs :property="selectedProperty" />
        </section>

        <!-- Main Content Stack (1열 레이아웃) -->
        <div class="content-stack">
          <!-- CTA 먼저 (스크롤 초반에 바로 노출) -->
          <PropertyActions :property="selectedProperty" />

          <!-- 상세 정보 -->
          <PropertyMainContent :property="selectedProperty" />

          <!-- 기본 정보 마지막 -->
          <PropertyBasicInfo :property="selectedProperty" />
        </div>
      </div>
    </template>

    <div v-else class="no-selection">
      <div class="empty-state">
        <p>매물을 선택해주세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { PhMapPin, PhTag } from '@phosphor-icons/vue'

// Components
import DetailHeader from './detail/DetailHeader.vue'
import PropertyGallery from './detail/PropertyGallery.vue'
import PropertySpecs from './detail/PropertySpecs.vue'
import PropertyMainContent from './detail/PropertyMainContent.vue'
import PropertyBasicInfo from './detail/PropertyBasicInfo.vue'
import PropertyActions from './detail/PropertyActions.vue'
import { useToast } from '@/composables/useToast'

const propertyStore = usePropertyStore()
const { selectedProperty, savedPropertyIds } = storeToRefs(propertyStore)
const { showSuccess, showInfo, showError } = useToast()

const containerRef = ref(null)
const isScrolled = ref(false)

const isSaved = computed(() => {
  if (!selectedProperty.value) return false
  const aptSeq = selectedProperty.value.aptSeq || selectedProperty.value.id
  return savedPropertyIds.value.includes(aptSeq)
})

function handleBack() {
  propertyStore.clearSelection()
}

function handleScroll() {
  if (containerRef.value) {
    isScrolled.value = containerRef.value.scrollTop > 50
  }
}

async function handleSave() {
  if (!selectedProperty.value) return
  try {
    const aptSeq = selectedProperty.value.aptSeq || selectedProperty.value.id
    const wasSaved = isSaved.value
    await propertyStore.toggleSaveProperty(aptSeq)
    
    if (wasSaved) {
      showInfo('저장 목록에서 제거되었습니다')
    } else {
      showSuccess('저장 목록에 추가되었습니다')
    }
  } catch (error) {
    showError('저장 처리에 실패했습니다')
  }
}
</script>

<style scoped>
.property-detail-mode {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--showroom-bg-day);
  position: relative;
}

html[data-theme="night"] .property-detail-mode {
  background: var(--showroom-bg-night);
}

.detail-content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header Section */
.header-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.badges-row {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--brand-accent);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.type-badge {
  background: rgba(0, 0, 0, 0.05);
  color: var(--showroom-text-day);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

html[data-theme="night"] .type-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.property-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
  line-height: 1.3;
}

html[data-theme="night"] .property-title {
  color: var(--showroom-text-night);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.main-price {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--brand-accent);
}

.price-sub {
  font-size: 1rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
}

html[data-theme="night"] .price-sub {
  color: var(--showroom-text-night);
}

.address-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--showroom-text-day);
  opacity: 0.8;
}

html[data-theme="night"] .address-row {
  color: var(--showroom-text-night);
}

.text-brand {
  color: var(--brand-accent);
}

/* Stack Layout (항상 1열) */
.content-stack {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .no-selection {
  color: var(--showroom-text-night);
}
</style>
