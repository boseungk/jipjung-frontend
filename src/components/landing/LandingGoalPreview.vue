<template>
  <section class="landing-goal-preview">
    <!-- Section Header -->
    <div class="landing-goal-preview__header">
      <h2 class="landing-goal-preview__title">나만의 저축 목표 설정</h2>
      <p class="landing-goal-preview__subtitle">
        실거래가 기반으로 목표를 설정하고, 저축 여정을 시작하세요
      </p>
    </div>

    <!-- Image Carousel -->
    <div class="landing-goal-preview__carousel">
      <!-- Image Container -->
      <div 
        class="landing-goal-preview__image-wrapper"
        :style="{ maxWidth: screenshots[currentIndex].maxWidth }"
      >
        <transition name="slide-fade" mode="out-in">
          <img
            :key="currentIndex"
            :src="screenshots[currentIndex].src"
            :alt="screenshots[currentIndex].alt"
            class="landing-goal-preview__image"
          />
        </transition>
      </div>

      <!-- Caption Text -->
      <transition name="fade" mode="out-in">
        <div :key="currentIndex" class="landing-goal-preview__caption">
          <span class="landing-goal-preview__caption-step">
            {{ currentIndex + 1 }}/{{ screenshots.length }}
          </span>
          <p class="landing-goal-preview__caption-text">
            {{ screenshots[currentIndex].caption }}
          </p>
        </div>
      </transition>

      <!-- Carousel Dots -->
      <div class="landing-goal-preview__dots">
        <button
          v-for="(_, index) in screenshots"
          :key="index"
          class="landing-goal-preview__dot"
          :class="{ 'is-active': index === currentIndex }"
          :aria-label="`슬라이드 ${index + 1}로 이동`"
          @click="goToSlide(index)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * LandingGoalPreview.vue
 * 목표 설정 스크린샷을 자연스러운 캐러셀로 보여주는 섹션
 * 
 * 기능:
 * - 자동 슬라이드 캐러셀
 * - 설명 텍스트 오버레이
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Screenshots data with individual sizing
const screenshots = [
  {
    src: new URL('@/assets/screenshots/goal_setting1.png', import.meta.url).href,
    alt: '목표 설정 화면 1',
    caption: '꿈꾸는 집의 실거래가를 확인하고 목표 금액을 설정해요',
    maxWidth: '550px' // 첫번째 이미지 크게
  },
  {
    src: new URL('@/assets/screenshots/goal_setting2.png', import.meta.url).href,
    alt: '목표 설정 화면 2',
    caption: '월 저축 금액을 설정하고 나만의 저축 계획을 세워요',
    maxWidth: '400px' // 두번째 이미지 원래 크기
  }
]

// State
const currentIndex = ref(0)
let autoSlideInterval = null
const AUTO_SLIDE_DELAY = 4000 // 4초

/**
 * 특정 슬라이드로 이동
 */
function goToSlide(index) {
  currentIndex.value = index
  resetAutoSlide()
}

/**
 * 다음 슬라이드로 이동
 */
function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % screenshots.length
}

/**
 * 자동 슬라이드 시작
 */
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, AUTO_SLIDE_DELAY)
}

/**
 * 자동 슬라이드 초기화 (사용자 인터랙션 후 재시작)
 */
function resetAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
  }
  startAutoSlide()
}

// Lifecycle
onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
  }
})
</script>

<style scoped>
/* Section Container */
.landing-goal-preview {
  padding: 6rem 2rem;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

/* Header */
.landing-goal-preview__header {
  text-align: center;
}

.landing-goal-preview__title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  color: var(--landing-text, #2C2420);
}

.landing-goal-preview__subtitle {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--landing-text-secondary, rgba(44, 36, 32, 0.7));
  line-height: 1.7;
  max-width: 400px;
  margin: 0 auto;
}

/* Carousel Container */
.landing-goal-preview__carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

/* Image Wrapper - Glassmorphism card style */
.landing-goal-preview__image-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 0.75rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  transition: max-width 0.4s ease;
}

/* Image */
.landing-goal-preview__image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Caption */
.landing-goal-preview__caption {
  text-align: center;
  max-width: 340px;
}

.landing-goal-preview__caption-step {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 107, 61, 0.12);
  color: var(--brand-accent, #FF6B3D);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1rem;
  margin-bottom: 0.75rem;
}

.landing-goal-preview__caption-text {
  font-size: 1rem;
  color: var(--landing-text-secondary, rgba(44, 36, 32, 0.7));
  line-height: 1.6;
  margin: 0;
}

/* Carousel Dots */
.landing-goal-preview__dots {
  display: flex;
  gap: 0.75rem;
}

.landing-goal-preview__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: 
    background 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
}

.landing-goal-preview__dot:hover {
  transform: scale(1.2);
  background: rgba(255, 107, 61, 0.4);
}

.landing-goal-preview__dot.is-active {
  background: var(--brand-accent, #FF6B3D);
  transform: scale(1.4);
  box-shadow: 0 0 10px rgba(255, 107, 61, 0.4);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Night Mode */
html[data-theme="night"] .landing-goal-preview__image-wrapper {
  background: rgba(74, 69, 63, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

html[data-theme="night"] .landing-goal-preview__dot {
  background: rgba(255, 255, 255, 0.2);
}

html[data-theme="night"] .landing-goal-preview__dot.is-active {
  background: var(--brand-accent, #FF6B3D);
}

html[data-theme="night"] .landing-goal-preview__caption-step {
  background: rgba(255, 107, 61, 0.2);
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .landing-goal-preview {
    padding: 4rem 1.5rem;
    gap: 2rem;
  }
  
  .landing-goal-preview__image-wrapper {
    border-radius: 1rem;
    padding: 0.5rem;
  }
  
  .landing-goal-preview__image {
    border-radius: 0.75rem;
  }
  
  .landing-goal-preview__caption-text {
    font-size: 0.9rem;
  }
}
</style>
