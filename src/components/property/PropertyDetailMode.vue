<template>
  <div class="property-detail-mode">
    <!-- Back Button -->
    <button @click="handleBack" class="back-btn">
      ← 목록으로
    </button>

    <div v-if="selectedProperty" class="detail-content">
      <PropertyGallery :images="selectedProperty.images" :title="selectedProperty.title" />

      <div class="detail-header">
        <h1 class="detail-title">{{ selectedProperty.title }}</h1>
        <p class="detail-price">{{ selectedProperty.getFormattedPrice() }}</p>
        <p class="detail-location">📍 {{ selectedProperty.getFullAddress() }}</p>
      </div>

      <PropertyInfo :property="selectedProperty" />
      <PropertyActions :property="selectedProperty" />
    </div>

    <div v-else class="no-selection">
      <p>매물을 선택해주세요</p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import PropertyGallery from './detail/PropertyGallery.vue'
import PropertyInfo from './detail/PropertyInfo.vue'
import PropertyActions from './detail/PropertyActions.vue'

const propertyStore = usePropertyStore()
const { selectedProperty } = storeToRefs(propertyStore)

function handleBack() {
  propertyStore.clearSelection()
}
</script>

<style scoped>
.property-detail-mode {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
}

.back-btn {
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
  margin-bottom: 1.5rem;
}

html[data-theme="night"] .back-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  border-color: var(--nav-btn-border-night);
  box-shadow: var(--nav-btn-shadow-night);
  color: var(--showroom-text-night);
}

.back-btn:hover {
  transform: translateX(-4px);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .detail-header {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.detail-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0 0 1rem 0;
}

html[data-theme="night"] .detail-title {
  color: var(--showroom-text-night);
}

.detail-price {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-accent);
  margin: 0 0 0.5rem 0;
}

html[data-theme="night"] .detail-price {
  color: var(--showroom-accent-night);
}

.detail-location {
  font-size: 1.125rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
  margin: 0;
}

html[data-theme="night"] .detail-location {
  color: var(--showroom-text-night);
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.25rem;
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .no-selection {
  color: var(--showroom-text-night);
}

@media (max-width: 767px) {
  .property-detail-mode {
    padding: 1rem;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-title {
    font-size: 1.5rem;
  }

  .detail-price {
    font-size: 2rem;
  }
}
</style>
