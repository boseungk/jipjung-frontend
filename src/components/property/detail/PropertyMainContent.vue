<template>
  <div class="property-main-content">
    <!-- Description -->
    <section class="content-section" v-if="property.description">
      <h3 class="section-title">상세 설명</h3>
      <p class="description-text">{{ property.description }}</p>
    </section>

    <!-- Features -->
    <section class="content-section" v-if="property.features && property.features.length > 0">
      <h3 class="section-title">특징</h3>
      <div class="features-list">
        <span
          v-for="feature in property.features"
          :key="feature"
          class="feature-badge"
        >
          #{{ feature }}
        </span>
      </div>
    </section>

    <!-- Location Text -->
    <section class="content-section">
      <h3 class="section-title">위치</h3>
      <div class="location-info">
        <p class="address-main">{{ property.address }}</p>
        <p class="address-sub">{{ property.sido }} {{ property.sigungu }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.property-main-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
}

html[data-theme="night"] .section-title {
  color: var(--showroom-text-night);
}

.description-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--showroom-text-day);
  opacity: 0.9;
  white-space: pre-line;
  margin: 0;
}

html[data-theme="night"] .description-text {
  color: var(--showroom-text-night);
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.feature-badge {
  background: rgba(var(--brand-accent-rgb, 255, 127, 80), 0.1);
  color: var(--brand-accent);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 600;
}

html[data-theme="night"] .feature-badge {
  background: rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
}

.location-info {
  background: rgba(0, 0, 0, 0.03);
  padding: 1.5rem;
  border-radius: 16px;
}

html[data-theme="night"] .location-info {
  background: rgba(255, 255, 255, 0.05);
}

.address-main {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  margin: 0 0 0.5rem 0;
}

html[data-theme="night"] .address-main {
  color: var(--showroom-text-night);
}

.address-sub {
  font-size: 0.9375rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
  margin: 0;
}

html[data-theme="night"] .address-sub {
  color: var(--showroom-text-night);
}
</style>
