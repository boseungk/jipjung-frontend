<template>
  <div class="specs-grid">
    <div class="spec-item">
      <div class="spec-icon-wrapper">
        <PhRuler :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">전용면적</span>
        <span class="spec-value">{{ property.area }}평</span>
      </div>
    </div>

    <div class="spec-item">
      <div class="spec-icon-wrapper">
        <PhBed :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">방</span>
        <span class="spec-value">{{ property.rooms || '-' }}개</span>
      </div>
    </div>

    <div class="spec-item">
      <div class="spec-icon-wrapper">
        <PhBathtub :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">욕실</span>
        <span class="spec-value">{{ property.bath || property.bathrooms || '-' }}개</span>
      </div>
    </div>

    <div class="spec-item">
      <div class="spec-icon-wrapper">
        <PhBuildings :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">층수</span>
        <span class="spec-value">{{ cleanFloor(property.floor) }}층</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhRuler, PhBed, PhBathtub, PhBuildings } from '@phosphor-icons/vue'

defineProps({
  property: {
    type: Object,
    required: true
  }
})

function cleanFloor(floor) {
  if (!floor || floor === '-') return '-'
  return String(floor).replace(/['"]/g, '').trim()
}
</script>

<style scoped>
.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

html[data-theme="night"] .specs-grid {
  background: rgba(60, 60, 60, 0.4);
  border-color: rgba(255, 255, 255, 0.05);
}

@media (min-width: 640px) {
  .specs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spec-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 16px;
  color: var(--showroom-text-day);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .spec-icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.spec-content {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-size: 0.75rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
}

html[data-theme="night"] .spec-label {
  color: var(--showroom-text-night);
}

.spec-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .spec-value {
  color: var(--showroom-text-night);
}
</style>
