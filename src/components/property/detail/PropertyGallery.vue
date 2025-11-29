<template>
  <div class="property-gallery">
    <!-- 메인 이미지 -->
    <div class="main-image">
      <img :src="currentImage" :alt="title" />

      <!-- 네비게이션 버튼 -->
      <button
        v-if="images.length > 1"
        @click="prevImage"
        class="nav-btn prev-btn"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>
      <button
        v-if="images.length > 1"
        @click="nextImage"
        class="nav-btn next-btn"
        :disabled="currentIndex === images.length - 1"
      >
        ›
      </button>

      <!-- 이미지 카운터 -->
      <div v-if="images.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- 썸네일 -->
    <div v-if="images.length > 1" class="thumbnails">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      >
        <img :src="image" :alt="`${title} - 이미지 ${index + 1}`" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const currentImage = computed(() => props.images[currentIndex.value])

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
