<template>
  <section class="landing-hero">
    <!-- Floating Orbs Background -->
    <div class="landing-hero__orbs">
      <div class="landing-hero__orb landing-hero__orb--1"></div>
      <div class="landing-hero__orb landing-hero__orb--2"></div>
      <div class="landing-hero__orb landing-hero__orb--3"></div>
    </div>

    <!-- Crystal Ball Display -->
    <div class="landing-hero__crystal-ball" ref="crystalBallRef">
      <CrystalBall />
    </div>

    <!-- Content -->
    <div class="landing-hero__content">
      <h1 class="landing-hero__headline">
        <span
          v-for="(word, index) in headlineWords"
          :key="index"
          class="landing-hero__word"
          :style="{ animationDelay: `${index * 0.12}s` }"
        >{{ word }}&nbsp;</span>
      </h1>
      <p class="landing-hero__subheadline">
        매일 저축하며 드림홈을 완성하세요.<br>
        작은 저축이 큰 꿈이 됩니다.
      </p>
      <button
        class="landing-hero__cta"
        @click="handleStartClick"
      >
        <span>시작하기</span>
        <svg
          class="landing-hero__cta-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>


  </section>
</template>

<script setup>
/**
 * LandingHero.vue
 * 랜딩 페이지 히어로 섹션
 *
 * 기능:
 * - CrystalBall 3D 수정구 디스플레이 (완성된 인테리어)
 * - Floating Orbs 배경 애니메이션
 * - 헤드라인 스태거 애니메이션
 * - CTA 버튼 (shimmer + pulse)
 * - 스크롤 힌트 애니메이션
 */
import { ref, onMounted, computed } from 'vue'
import gsap from 'gsap'
import CrystalBall from '@/components/CrystalBall.vue'

// Emits
const emit = defineEmits(['start-click'])

// Refs
const crystalBallRef = ref(null)

// Headline words for stagger animation
const headlineWords = computed(() => {
  return '저축이 집이 되는 경험'.split(' ')
})

/**
 * CTA 버튼 클릭 핸들러
 */
function handleStartClick() {
  emit('start-click')
}

/**
 * GSAP 진입 애니메이션
 */
onMounted(() => {
  if (crystalBallRef.value) {
    // CrystalBall 진입 애니메이션
    gsap.from(crystalBallRef.value, {
      scale: 0.5,
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'elastic.out(1, 0.6)',
      delay: 0.2
    })
  }
})
</script>

<style scoped>
/* Component-specific styles are in landing.css */
/* Only component-specific overrides here if needed */
</style>
