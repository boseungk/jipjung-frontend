<template>
  <div class="property-info">
    <div class="info-section">
      <h3 class="section-title">기본 정보</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">매물 유형</span>
          <span class="info-value">{{ property.propertyType }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">거래 유형</span>
          <span class="info-value">{{ property.transactionType }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">면적</span>
          <span class="info-value">{{ property.area }}평 ({{ property.sqm }}㎡)</span>
        </div>
        <div class="info-item">
          <span class="info-label">방 / 욕실</span>
          <span class="info-value">방 {{ property.rooms }}개 / 욕실 {{ property.bathrooms }}개</span>
        </div>
        <div class="info-item">
          <span class="info-label">층수</span>
          <span class="info-value">{{ property.floor }}</span>
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

    <div class="info-section" v-if="property.agentInfo">
      <h3 class="section-title">중개인 정보</h3>
      <div class="agent-info">
        <div class="info-item">
          <span class="info-label">이름</span>
          <span class="info-value">{{ property.agentInfo.name }}</span>
        </div>
        <div class="info-item" v-if="property.agentInfo.company">
          <span class="info-label">회사</span>
          <span class="info-value">{{ property.agentInfo.company }}</span>
        </div>
        <div class="info-item" v-if="property.agentInfo.phone">
          <span class="info-label">연락처</span>
          <span class="info-value">{{ property.agentInfo.phone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
