<template>
  <section class="landing-features" ref="sectionRef">
    <h2 class="landing-features__title">
      집정만의 특별한 기능
    </h2>
    
    <div class="landing-features__grid">
      <article 
        v-for="(feature, index) in FEATURES"
        :key="feature.id"
        class="landing-feature-card"
        :class="{ 'is-visible': visibleCards[index] }"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <div class="landing-feature-card__icon">{{ feature.icon }}</div>
        <h3 class="landing-feature-card__title">{{ feature.title }}</h3>
        <p class="landing-feature-card__description">{{ feature.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * LandingFeatures.vue
 * 4가지 핵심 기능 소개 그리드
 * 
 * 기능:
 * - 2x2 Bento Grid 레이아웃
 * - IntersectionObserver로 뷰포트 진입 시 scale-in 애니메이션
 * - Stagger 효과 (0.1s 간격)
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Constants
const FEATURES = [
  {
    id: 'gamification',
    icon: '🏠',
    title: '저축 게이미피케이션',
    description: '저축할 때마다 집이 한 단계씩 완성되어요. 11단계의 성장 과정을 경험하세요.'
  },
  {
    id: 'dsr',
    icon: '📊',
    title: 'DSR 시뮬레이션',
    description: '나의 소득과 부채를 입력하면 대출 한도를 미리 계산해드려요.'
  },
  {
    id: 'property',
    icon: '🔍',
    title: '매물 검색',
    description: '관심 지역의 실거래가와 매물 정보를 한눈에 확인하세요.'
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI 관리사 레제',
    description: '똑똑한 AI가 여러분의 재무 상태를 분석하고 맞춤 조언을 드려요.'
  }
]

// Refs
const sectionRef = ref(null)
const visibleCards = ref([false, false, false, false])

// IntersectionObserver
let observer = null

onMounted(() => {
  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 모든 카드를 순차적으로 표시
          visibleCards.value = FEATURES.map(() => true)
          // 한 번 표시 후 observer 해제
          observer?.disconnect()
        }
      })
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    }
  )

  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Component-specific styles */
</style>
