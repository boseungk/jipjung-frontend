<template>
  <div class="basic-info-card">
    <h3 class="card-title">기본 정보</h3>
    
    <div class="info-list">
      <div class="info-row">
        <span class="label">매물 유형</span>
        <span class="value">{{ property.propertyType }}</span>
      </div>
      <div class="info-row">
        <span class="label">거래 유형</span>
        <span class="value">{{ property.transactionType }}</span>
      </div>
      <div class="info-row">
        <span class="label">공급/전용</span>
        <span class="value">{{ property.area }}평 / {{ property.sqm }}㎡</span>
      </div>
      <div class="info-row" v-if="property.rooms || property.bathrooms">
        <span class="label">방/욕실</span>
        <span class="value">
          {{ property.rooms ? `방 ${property.rooms}개` : '' }}
          {{ property.rooms && property.bathrooms ? ' / ' : '' }}
          {{ property.bathrooms ? `욕실 ${property.bathrooms}개` : '' }}
        </span>
      </div>
      <div class="info-row" v-if="property.floor">
        <span class="label">해당층/총층</span>
        <span class="value">{{ property.floor }}층</span>
      </div>
      <div class="info-row">
        <span class="label">사용승인일</span>
        <span class="value">{{ property.buildYear }}년</span>
      </div>
      <div class="info-row">
        <span class="label">주차가능여부</span>
        <span class="value">확인 필요</span>
      </div>
      <div class="info-row">
        <span class="label">관리비</span>
        <span class="value">{{ property.maintenanceFee ? `${property.maintenanceFee}만원` : '확인 필요' }}</span>
      </div>
    </div>
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
.basic-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .basic-info-card {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
}

.label {
  color: var(--showroom-text-day);
  opacity: 0.6;
  font-weight: 500;
}

html[data-theme="night"] .label {
  color: var(--showroom-text-night);
}

.value {
  color: var(--showroom-text-day);
  font-weight: 600;
  text-align: right;
}

html[data-theme="night"] .value {
  color: var(--showroom-text-night);
}
</style>
