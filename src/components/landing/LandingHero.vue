<template>
  <section class="landing-hero">
    <!-- Crystal Ball Display -->
    <div class="landing-hero__crystal-ball">
      <CrystalBall />
    </div>

    <!-- Content -->
    <div class="landing-hero__content">
      <h1 class="landing-hero__headline">
        저축이 집이 되는 경험
      </h1>
      <p class="landing-hero__subheadline">
        매일 저축하며 드림홈을 완성하세요.<br>
        작은 저축이 큰 꿈이 됩니다.
      </p>
      <button 
        class="landing-hero__cta"
        @click="handleStartClick"
      >
        시작하기
        <span class="landing-hero__cta-arrow">→</span>
      </button>
    </div>

    <!-- Scroll Hint -->
    <div class="landing-hero__scroll-hint" aria-hidden="true">
      <span class="landing-hero__scroll-hint-icon">↓</span>
      <span>스크롤하여 둘러보기</span>
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
 * - 헤드라인 + 서브텍스트 + CTA 버튼
 * - 스크롤 힌트 애니메이션
 */
import CrystalBall from '@/components/CrystalBall.vue'

// Emits
const emit = defineEmits(['start-click'])

/**
 * CTA 버튼 클릭 핸들러
 */
function handleStartClick() {
  emit('start-click')
}
</script>

<style scoped>
/* Component-specific overrides if needed */
.landing-hero__cta-arrow {
  transition: transform 0.2s ease;
}

.landing-hero__cta:hover .landing-hero__cta-arrow {
  transform: translateX(4px);
}
</style>
