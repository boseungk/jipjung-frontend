<template>
  <div class="property-gallery">
    <!-- 메인 이미지 -->
    <div class="main-image">
      <!-- 유효한 이미지가 있을 때 -->
      <img
        v-if="!hasCurrentImageError"
        :src="currentImageUrl"
        :alt="currentImageAlt"
        @error="handleImageError(currentIndex)"
      />

      <!-- 이미지 에러/없음 시 fallback -->
      <div v-else class="image-fallback">
        <PhImage :size="64" weight="thin" />
        <span class="fallback-text">이미지를 불러올 수 없습니다</span>
        <span class="fallback-title">{{ title }}</span>
      </div>

      <!-- 네비게이션 버튼: 모든 이미지 에러 시 숨김 -->
      <template v-if="!allImagesHaveError && validImageCount > 1">
        <button
          @click="prevImage"
          class="nav-btn prev-btn"
          :disabled="currentIndex === 0"
        >
          ‹
        </button>
        <button
          @click="nextImage"
          class="nav-btn next-btn"
          :disabled="currentIndex === images.length - 1"
        >
          ›
        </button>

        <!-- 이미지 카운터 -->
        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </template>
    </div>

    <!-- 썸네일: 모든 이미지 에러 시 숨김 -->
    <div v-if="!allImagesHaveError && validImageCount > 1" class="thumbnails">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ active: index === currentIndex, error: isImageError(index, image) }"
        @click="currentIndex = index"
      >
        <img
          :src="getImageUrl(image)"
          :alt="getImageAlt(image, index)"
          @error="handleImageError(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PhImage } from '@phosphor-icons/vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '매물'
  }
})

const currentIndex = ref(0)
const imageErrors = ref(new Set())

/**
 * 이미지 객체 또는 문자열에서 URL 추출
 * - { url, alt } 객체 또는 문자열 모두 지원
 */
function getImageUrl(image) {
  if (!image) return null
  if (typeof image === 'string') return image
  return image.url || null
}

/**
 * 이미지 객체에서 alt 텍스트 추출
 */
function getImageAlt(image, index = 0) {
  if (!image) return props.title
  if (typeof image === 'string') return `${props.title} - 이미지 ${index + 1}`
  return image.alt || `${props.title} - 이미지 ${index + 1}`
}

// 이미지 배열이 비어있는지 확인
const hasNoImages = computed(() => !props.images || props.images.length === 0)

// 현재 이미지 URL/Alt
const currentImageUrl = computed(() => getImageUrl(props.images?.[currentIndex.value]))
const currentImageAlt = computed(() => getImageAlt(props.images?.[currentIndex.value], currentIndex.value))

// 현재 이미지가 에러인지 확인
const hasCurrentImageError = computed(() => {
  if (hasNoImages.value) return true
  if (!currentImageUrl.value) return true
  return imageErrors.value.has(currentIndex.value)
})

// 특정 인덱스 이미지가 에러인지 확인
function isImageError(index, image) {
  return !getImageUrl(image) || imageErrors.value.has(index)
}

// 모든 이미지가 에러인지 확인
const allImagesHaveError = computed(() => {
  if (hasNoImages.value) return true
  return props.images.every((img, idx) => !getImageUrl(img) || imageErrors.value.has(idx))
})

// 유효한 이미지 개수
const validImageCount = computed(() => {
  if (hasNoImages.value) return 0
  return props.images.filter((img, idx) => getImageUrl(img) && !imageErrors.value.has(idx)).length
})

// 이미지 변경 시 에러 상태 초기화
watch(() => props.images, () => {
  imageErrors.value = new Set()
  currentIndex.value = 0
}, { deep: true })

function handleImageError(index) {
  imageErrors.value = new Set([...imageErrors.value, index])
}

function prevImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextImage() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}
</script>

<style scoped>
.property-gallery {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .property-gallery {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.main-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--showroom-text-day);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  transform: translateY(-50%) scale(1.1);
}

.prev-btn {
  left: 1rem;
}

.next-btn {
  right: 1rem;
}

.image-counter {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.thumbnail {
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: var(--brand-accent);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail.error {
  opacity: 0.4;
  pointer-events: none;
}

/* 이미지 에러/없음 시 fallback UI */
.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.03), rgba(0, 0, 0, 0.02));
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .image-fallback {
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.05), rgba(255, 255, 255, 0.02));
  color: var(--showroom-text-night);
}

.fallback-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.fallback-title {
  font-size: 0.75rem;
  opacity: 0.7;
}

@media (max-width: 767px) {
  .thumbnails {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>
