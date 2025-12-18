<template>
  <!-- 유효한 스펙이 있을 때만 그리드 표시 -->
  <div class="specs-grid" v-if="hasAnySpec">
    <div class="spec-item" v-if="specs.area">
      <div class="spec-icon-wrapper">
        <PhRuler :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">전용면적</span>
        <span class="spec-value">{{ specs.area }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.rooms">
      <div class="spec-icon-wrapper">
        <PhBed :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">방</span>
        <span class="spec-value">{{ specs.rooms }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.bathrooms">
      <div class="spec-icon-wrapper">
        <PhBathtub :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">욕실</span>
        <span class="spec-value">{{ specs.bathrooms }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.floor">
      <div class="spec-icon-wrapper">
        <PhBuildings :size="24" weight="light" />
      </div>
      <div class="spec-content">
        <span class="spec-label">층수</span>
        <span class="spec-value">{{ specs.floor }}</span>
      </div>
    </div>
  </div>

  <!-- 모든 스펙이 없을 때 대체 메시지 -->
  <div class="specs-empty" v-else>
    <PhQuestion :size="20" weight="light" />
    <span>상세 정보가 등록되지 않았습니다</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhRuler, PhBed, PhBathtub, PhBuildings, PhQuestion } from '@phosphor-icons/vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

/**
 * 층수 정제: 따옴표 제거, '-' 또는 '0'은 null 반환
 */
function cleanFloor(floor) {
  if (!floor || floor === '-' || floor === '0') return null
  const cleaned = String(floor).replace(/['"]/g, '').trim()
  return cleaned || null
}

/**
 * 유효성 검증된 스펙 객체
 * - 값이 유효할 때만 포맷된 문자열 반환
 * - 유효하지 않으면 null 반환
 */
const specs = computed(() => {
  const p = props.property
  const rooms = Number(p.rooms) || 0
  const bathrooms = Number(p.bath || p.bathrooms) || 0
  const area = Number(p.area) || 0
  const floor = cleanFloor(p.floor)

  return {
    area: area > 0 ? `${area}평` : null,
    rooms: rooms > 0 ? `${rooms}개` : null,
    bathrooms: bathrooms > 0 ? `${bathrooms}개` : null,
    floor: floor ? `${floor}층` : null
  }
})

/**
 * 하나라도 유효한 스펙이 있는지 확인
 */
const hasAnySpec = computed(() => Object.values(specs.value).some(v => v !== null))
</script>

<style scoped>
.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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

/* 대체 메시지 스타일 */
.specs-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  color: var(--showroom-text-day);
  opacity: 0.5;
  font-size: 0.875rem;
}

html[data-theme="night"] .specs-empty {
  background: rgba(255, 255, 255, 0.02);
  color: var(--showroom-text-night);
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
