<template>
  <div
    class="property-card"
    :class="{
      selected: isSelected,
      affordable: isAffordable,
      saved: isSaved
    }"
    @click="handleClick"
  >
    <!-- 이미지 -->
    <div class="card-image-wrapper">
      <div class="card-image" :class="{ 'image-error': imageError }">
        <img
          v-if="!imageError && imageUrl"
          :src="imageUrl"
          :alt="imageAlt"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="image-fallback">
          <PhHouse :size="48" weight="thin" class="fallback-icon" />
        </div>
      </div>
      
      <!-- Badges overlay -->
      <div class="image-badge">{{ property.propertyType }}</div>
      
      <button
        class="save-btn"
        @click.stop="handleSave"
        :class="{ active: isSaved }"
        :aria-label="isSaved ? '관심 매물에서 제거' : '관심 매물로 저장'"
      >
        <PhHeart :size="20" :weight="isSaved ? 'fill' : 'regular'" />
      </button>
    </div>

    <!-- Content -->
    <div class="card-content">
      <!-- 가격 & 제목 -->
      <div class="card-header">
        <div class="card-price">{{ property.getFormattedPrice() }}</div>
        <h3 class="card-title">{{ property.title }}</h3>
      </div>

      <!-- 위치 -->
      <div class="card-location">
        <PhMapPin :size="16" weight="fill" />
        <span>{{ property.sido }} {{ property.sigungu }}</span>
      </div>

      <!-- 정보 (rooms/floor/area UI 가드) -->
      <div class="card-specs" v-if="hasValidSpecs">
        <template v-if="displayArea">
          <div class="spec-item">
            <PhRuler :size="14" />
            <span>{{ displayArea }}</span>
          </div>
          <div class="spec-divider" v-if="property.rooms || cleanFloor(property.floor)">•</div>
        </template>
        <div class="spec-item" v-if="property.rooms">
          <PhBed :size="14" />
          <span>{{ property.rooms }}</span>
        </div>
        <div class="spec-divider" v-if="property.rooms && cleanFloor(property.floor)">•</div>
        <div class="spec-item" v-if="cleanFloor(property.floor)">
          <PhBuildings :size="14" />
          <span>{{ cleanFloor(property.floor) }}층</span>
        </div>
      </div>

      <!-- 특징 태그 (feature 있을 때만) -->
      <div class="card-features" v-if="hasFeatures">
        <span
          v-for="feature in property.features.slice(0, 3)"
          :key="feature"
          class="feature-tag"
        >
          {{ feature }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { 
  PhHouse, 
  PhMapPin, 
  PhHeart, 
  PhRuler, 
  PhBed, 
  PhBuildings 
} from '@phosphor-icons/vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select', 'save'])

const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { selectedProperty, savedPropertyIds } = storeToRefs(propertyStore)
const { targetAmount } = storeToRefs(dreamHomeStore)

const isSelected = computed(() => selectedProperty.value?.id === props.property.id)
const propertyAptSeq = computed(() => props.property.aptSeq || props.property.id)
const isSaved = computed(() => savedPropertyIds.value.includes(propertyAptSeq.value))

// 구매 가능 여부
const isAffordable = computed(() => {
  const targetAmountWon = Number(targetAmount.value) || 0
  if (targetAmountWon <= 0) return false

  if (typeof props.property?.isAffordableByTargetAmount === 'function') {
    return props.property.isAffordableByTargetAmount(targetAmountWon)
  }

  const priceManwon = Number(props.property?.price) || 0
  const downPaymentWon = Math.ceil(priceManwon * 10000 * 0.3)
  return downPaymentWon <= targetAmountWon
})

function cleanFloor(floor) {
  if (!floor || floor === '-' || floor === '0') return null
  return String(floor).replace(/['"]/g, '').trim() || null
}

// 면적 표시: 0 이상만
const displayArea = computed(() => {
  const area = Number(props.property?.area) || 0
  return area > 0 ? `${area}평` : null
})

// 유효한 스펙이 하나라도 있는지
const hasValidSpecs = computed(() => {
  return displayArea.value || props.property?.rooms || cleanFloor(props.property?.floor)
})

// feature 배열이 있고 내용이 있는지
const hasFeatures = computed(() => {
  return props.property?.features && props.property.features.length > 0
})

// 이미지 URL/Alt 안전 접근
const imageUrl = computed(() => {
  const images = props.property?.images
  if (!images || images.length === 0) return null
  const first = images[0]
  if (!first) return null
  return typeof first === 'string' ? first : first.url || null
})

const imageAlt = computed(() => {
  const images = props.property?.images
  if (!images || images.length === 0) return props.property?.title || '매물'
  const first = images[0]
  if (!first) return props.property?.title || '매물'
  return (typeof first === 'string' ? props.property?.title : first.alt) || '매물'
})

// 이미지 에러 처리
const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}

function handleClick() {
  emit('select', props.property.id)
}

function handleSave() {
  const aptSeq = propertyAptSeq.value
  emit('save', aptSeq)
}
</script>

<style scoped>
.property-card {
  /* Double-layer Glassmorphism */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

html[data-theme="night"] .property-card {
  background: rgba(45, 45, 45, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.8);
}

html[data-theme="night"] .property-card:hover {
  background: rgba(60, 60, 60, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
}

.property-card.selected {
  border: 2px solid var(--brand-accent);
  box-shadow: 0 0 0 4px rgba(255, 127, 80, 0.15);
}

/* Image Wrapper */
.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.property-card:hover .card-image img {
  transform: scale(1.05);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-image.image-error {
  background: linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02));
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-theme="night"] .card-image.image-error {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
}

.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .image-fallback {
  color: var(--showroom-text-night);
}

.image-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

html[data-theme="night"] .image-badge {
  background: rgba(0, 0, 0, 0.6);
  color: var(--showroom-text-night);
}

.save-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--showroom-text-day);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

html[data-theme="night"] .save-btn {
  background: rgba(0, 0, 0, 0.6);
  color: var(--showroom-text-night);
}

.save-btn:hover {
  transform: scale(1.1);
  background: white;
}

.save-btn.active {
  color: #ef4444;
  background: rgba(255, 255, 255, 0.95);
}

/* Content */
.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-price {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--brand-accent);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night);
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
}

html[data-theme="night"] .card-location {
  color: var(--showroom-text-night);
}

.card-specs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.8;
}

html[data-theme="night"] .card-specs {
  color: var(--showroom-text-night);
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.spec-divider {
  opacity: 0.3;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.feature-tag {
  background: rgba(var(--brand-accent-rgb, 255, 127, 80), 0.1);
  color: var(--brand-accent);
  padding: 0.25rem 0.625rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

html[data-theme="night"] .feature-tag {
  background: rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
}

/* Affordable Highlight */
.property-card.affordable::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #66BB6A;
  z-index: 5;
}
</style>
