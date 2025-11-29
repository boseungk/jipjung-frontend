<template>
  <div
    class="property-card bento-card"
    :class="{
      selected: isSelected,
      affordable: isAffordable,
      saved: isSaved
    }"
    @click="handleClick"
  >
    <!-- 이미지 -->
    <div class="card-image" :class="{ 'image-error': imageError }">
      <img
        v-if="!imageError"
        :src="property.images[0].url"
        :alt="property.images[0].alt"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="image-fallback">
        <span class="fallback-icon">🏠</span>
        <span class="fallback-text">{{ property.propertyType }}</span>
      </div>
      <div class="image-badge">{{ property.propertyType }}</div>
      <button class="save-btn" @click.stop="handleSave" :class="{ saved: isSaved }">
        {{ isSaved ? '❤️' : '🤍' }}
      </button>
    </div>

    <!-- 가격 -->
    <div class="card-price">{{ property.getFormattedPrice() }}</div>

    <!-- 제목 -->
    <h3 class="card-title">{{ property.title }}</h3>

    <!-- 위치 -->
    <p class="card-location">📍 {{ property.sido }} {{ property.sigungu }}</p>

    <!-- 정보 -->
    <div class="card-info">
      <span>{{ property.area }}평</span>
      <span>•</span>
      <span>방 {{ property.rooms }}개</span>
      <span>•</span>
      <span>{{ property.floor }}</span>
    </div>

    <!-- 특징 태그 -->
    <div class="card-features">
      <span
        v-for="feature in property.features.slice(0, 3)"
        :key="feature"
        class="feature-tag"
      >
        {{ feature }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'

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
const isSaved = computed(() => savedPropertyIds.value.includes(props.property.id))
const isAffordable = computed(() => props.property.price * 0.3 <= targetAmount.value)

// 이미지 에러 처리
const imageError = ref(false)

function handleImageError() {
  imageError.value = true
  console.warn(`Failed to load image for property ${props.property.id}`)
}

function handleClick() {
  emit('select', props.property.id)
  propertyStore.selectProperty(props.property.id)
}

function handleSave() {
  emit('save', props.property.id)
  propertyStore.toggleSaveProperty(props.property.id)
}
</script>

<style scoped>
/* BentoGrid.vue 패턴 기반 */
.property-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  transform: translateZ(0); /* GPU 가속 */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px -10px rgba(0, 0, 0, 0.15);
}

.property-card.selected {
  border: 3px solid var(--brand-accent);
  box-shadow: 0 20px 60px -10px rgba(255, 127, 80, 0.3);
}

html[data-theme="night"] .property-card {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

html[data-theme="night"] .property-card:hover {
  box-shadow: 0 15px 50px -10px rgba(0, 0, 0, 0.6);
}

/* 이미지 */
.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 이미지 에러 처리 */
.card-image.image-error {
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(66, 133, 244, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-theme="night"] .card-image.image-error {
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.2), rgba(66, 133, 244, 0.1));
}

.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
}

html[data-theme="night"] .image-fallback {
  color: var(--showroom-text-night);
}

.fallback-icon {
  font-size: 3rem;
}

.fallback-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.image-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day);
}

.save-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn:hover {
  transform: scale(1.1);
}

.save-btn.saved {
  background: rgba(255, 127, 80, 0.95);
}

/* 가격 */
.card-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-accent);
}

html[data-theme="night"] .card-price {
  color: var(--showroom-accent-night);
}

/* 제목 */
.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  margin: 0;
  line-height: 1.4;
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night);
}

/* 위치 */
.card-location {
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.7;
  margin: 0;
}

html[data-theme="night"] .card-location {
  color: var(--showroom-text-night);
}

/* 정보 */
.card-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.8;
}

html[data-theme="night"] .card-info {
  color: var(--showroom-text-night);
}

/* 특징 태그 */
.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

html[data-theme="night"] .feature-tag {
  background: rgba(66, 133, 244, 0.2);
}

/* 구매 가능 하이라이트 */
.property-card.affordable::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  border-radius: 24px;
  z-index: -1;
  opacity: 0.3;
}
</style>
