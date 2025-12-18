<template>
  <div class="basic-info-card">
    <h3 class="card-title">기본 정보</h3>
    
    <div class="info-list">
      <div
        v-for="(item, index) in infoItems"
        :key="item.label"
        class="info-row"
      >
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>

    <!-- 정보가 부족할 때 안내 메시지 -->
    <div v-if="infoItems.length < 3" class="info-notice">
      일부 정보가 등록되지 않았습니다
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

/**
 * 유효한 정보 항목만 동적으로 생성
 * - null, 0, '-', undefined는 표시하지 않음
 * - '확인 필요' 텍스트 제거
 */
const infoItems = computed(() => {
  const p = props.property
  const items = []

  // 필수 항목 (항상 표시)
  if (p.propertyType) {
    items.push({ label: '매물 유형', value: p.propertyType })
  }
  if (p.transactionType) {
    items.push({ label: '거래 유형', value: p.transactionType })
  }

  // 선택 항목 (데이터 있을 때만)
  const area = Number(p.area) || 0
  const sqm = Number(p.sqm) || 0
  if (area > 0 || sqm > 0) {
    items.push({
      label: '공급/전용',
      value: `${area > 0 ? area + '평' : '-'} / ${sqm > 0 ? sqm + '㎡' : '-'}`
    })
  }

  const rooms = Number(p.rooms) || 0
  const bathrooms = Number(p.bathrooms) || 0
  if (rooms > 0 || bathrooms > 0) {
    const parts = []
    if (rooms > 0) parts.push(`방 ${rooms}개`)
    if (bathrooms > 0) parts.push(`욕실 ${bathrooms}개`)
    items.push({ label: '방/욕실', value: parts.join(' / ') })
  }

  // 층수: '-', '0', 빈값 제외
  const floor = p.floor
  if (floor && floor !== '-' && floor !== '0') {
    items.push({ label: '해당층', value: `${floor}층` })
  }

  // 건축년도: 1900 이상만
  const buildYear = Number(p.buildYear) || 0
  if (buildYear > 1900) {
    items.push({ label: '사용승인일', value: `${buildYear}년` })
  }

  // 관리비: 0 이상만
  const maintenanceFee = Number(p.maintenanceFee) || 0
  if (maintenanceFee > 0) {
    items.push({ label: '관리비', value: `${maintenanceFee}만원` })
  }

  return items
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

/* 정보 부족 안내 메시지 */
.info-notice {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--showroom-text-day);
  opacity: 0.5;
  text-align: center;
}

html[data-theme="night"] .info-notice {
  background: rgba(255, 255, 255, 0.02);
  color: var(--showroom-text-night);
}
</style>
