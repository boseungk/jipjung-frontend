<template>
  <div class="property-info">
    <div class="info-section">
      <h3 class="section-title">기본 정보</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">매물 유형</span>
          <span class="info-value">
            <InfoTooltip 
              v-if="REAL_ESTATE_TERMS[property.propertyType]" 
              :description="REAL_ESTATE_TERMS[property.propertyType]"
            >
              {{ property.propertyType }}
            </InfoTooltip>
            <template v-else>{{ property.propertyType }}</template>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">거래 유형</span>
          <span class="info-value">
            <InfoTooltip 
              v-if="REAL_ESTATE_TERMS[property.transactionType]" 
              :description="REAL_ESTATE_TERMS[property.transactionType]"
            >
              {{ property.transactionType }}
            </InfoTooltip>
            <template v-else>{{ property.transactionType }}</template>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">면적</span>
          <span class="info-value">
            <InfoTooltip :description="REAL_ESTATE_TERMS.평">
              {{ property.area }}평
            </InfoTooltip>
            ({{ property.sqm }}㎡)
          </span>
        </div>
        <div class="info-item" v-if="property.rooms || property.bathrooms">
          <span class="info-label">방 / 욕실</span>
          <span class="info-value">
            <template v-if="property.rooms">방 {{ property.rooms }}개</template>
            <template v-if="property.rooms && property.bathrooms"> / </template>
            <template v-if="property.bathrooms">욕실 {{ property.bathrooms }}개</template>
          </span>
        </div>
        <div class="info-item" v-if="property.floor">
          <span class="info-label">층수</span>
          <span class="info-value">{{ property.floor }}층</span>
        </div>
        <div class="info-item">
          <span class="info-label">건축년도</span>
          <span class="info-value">{{ property.buildYear }}년 {{ property.isNewBuilding() ? '(신축)' : '' }}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="section-title">위치</h3>
      <div class="info-item">
        <span class="info-label">주소</span>
        <span class="info-value">{{ property.address }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">지역</span>
        <span class="info-value">{{ property.sido }} {{ property.sigungu }}</span>
      </div>
    </div>

    <div class="info-section" v-if="property.features.length > 0">
      <h3 class="section-title">특징</h3>
      <div class="features-list">
        <span
          v-for="feature in property.features"
          :key="feature"
          class="feature-badge"
        >
          {{ feature }}
        </span>
      </div>
    </div>

    <div class="info-section" v-if="property.description">
      <h3 class="section-title">설명</h3>
      <p class="description-text">{{ property.description }}</p>
    </div>
  </div>
</template>

<script setup>
import InfoTooltip from '@/components/common/InfoTooltip.vue'
import { REAL_ESTATE_TERMS } from '@/constants/realEstateTerms'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.property-info {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

html[data-theme="night"] .property-info {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .section-title {
  color: var(--showroom-text-night);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
  font-weight: 500;
}

html[data-theme="night"] .info-label {
  color: var(--showroom-text-night);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .info-value {
  color: var(--showroom-text-night);
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.feature-badge {
  background: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

html[data-theme="night"] .feature-badge {
  background: rgba(66, 133, 244, 0.2);
}

.description-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--showroom-text-day);
  opacity: 0.8;
  margin: 0;
}

html[data-theme="night"] .description-text {
  color: var(--showroom-text-night);
}

@media (max-width: 767px) {
  .property-info {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
