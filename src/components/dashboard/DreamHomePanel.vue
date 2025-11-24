<template>
  <div class="dream-home-panel" :class="{ expanded: isExpanded }">
    <!-- Header (Always Visible) -->
    <button class="panel-header" @click="toggleExpand">
      <div class="header-left">
        <span class="home-icon">🏠</span>
        <span class="home-name">{{ propertyName }}</span>
        <span class="home-location">({{ location }})</span>
      </div>
      <div class="expand-icon" :class="{ rotated: isExpanded }">
        {{ isExpanded ? '▲' : '▼' }}
      </div>
    </button>
    
    <!-- Expandable Content -->
    <transition name="expand">
      <div v-if="isExpanded" class="panel-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">매물가</span>
            <span class="info-value">₩{{ formatNumber(price) }}만</span>
          </div>
          <div class="info-item">
            <span class="info-label">필요 계약금</span>
            <span class="info-value">₩{{ formatNumber(targetAmount) }}만</span>
          </div>
          <div class="info-item">
            <span class="info-label">최근 시세</span>
            <span class="info-value trend-up">
              📈 +2.3% ↑
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  propertyName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  }
})

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.dream-home-panel {
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode */
html[data-theme="day"] .dream-home-panel {
  background: var(--showroom-card-bg-day);
  box-shadow:
    6px 6px 12px var(--showroom-shadow-dark-day),
    -6px -6px 12px var(--showroom-shadow-light-day);
}

/* Night Mode */
html[data-theme="night"] .dream-home-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.2);
}

/* Panel Header */
.panel-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.panel-header:hover {
  opacity: 0.8;
}

html[data-theme="day"] .panel-header:active {
  box-shadow:
    inset 3px 3px 8px var(--showroom-shadow-dark-day),
    inset -3px -3px 8px var(--showroom-shadow-light-day);
}

html[data-theme="night"] .panel-header:active {
  background: rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.home-icon {
  font-size: 1.5rem;
}

.home-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .home-name {
  color: var(--showroom-text-night, #F5EDE3);
}

.home-location {
  font-size: 0.9375rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .home-location {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.expand-icon {
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  transition: transform 0.3s ease;
}

html[data-theme="night"] .expand-icon {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* Panel Content */
.panel-content {
  padding: 0 2rem 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .info-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.info-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .info-value {
  color: var(--showroom-text-night, #F5EDE3);
}

.trend-up {
  color: #66BB6A !important;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Responsive */
@media (max-width: 767px) {
  .panel-header {
    padding: 1rem 1.5rem;
  }
  
  .panel-content {
    padding: 0 1.5rem 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .header-left {
    flex-wrap: wrap;
  }
}
</style>
