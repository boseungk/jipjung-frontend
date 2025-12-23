<template>
  <section class="landing-features" ref="sectionRef">
    <h2 class="landing-features__title">
      집중만의 저축 여정
    </h2>
    <p class="landing-features__subtitle">
      실제 부동산 매물을 목표로, 저축이 집이 되는 과정을 경험하세요
    </p>

    <!-- Service Flow Timeline -->
    <div class="landing-features__flow">
      <!-- Flow Line (연결선) -->
      <div
        class="landing-features__flow-line"
        :class="{ 'is-animated': isFlowLineVisible }"
      ></div>

      <article
        v-for="(step, index) in FLOW_STEPS"
        :key="step.id"
        class="landing-flow-card"
        :class="{ 'is-visible': visibleCards[index] }"
        :style="{ '--step-index': index }"
      >
        <div class="landing-flow-card__step-number">
          {{ String(index + 1).padStart(2, '0') }}
        </div>
        <div class="landing-flow-card__icon" v-html="step.icon"></div>
        <div class="landing-flow-card__content">
          <h3 class="landing-flow-card__title">{{ step.title }}</h3>
          <p class="landing-flow-card__description">{{ step.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * LandingFeatures.vue
 * 서비스 플로우를 전달하는 Timeline 레이아웃
 *
 * 기능:
 * - 4단계 서비스 플로우 (매물 탐색 → 목표 설정 → 저축 실천 → 집 성장)
 * - Flow Line 연결선 애니메이션
 * - IntersectionObserver로 순차 진입 애니메이션
 * - Glassmorphism 카드 스타일
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

// SVG Icons
const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>`,
  piggyBank: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
    <path d="M16 11h.01"/>
  </svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`
}

// Service Flow Steps (서비스 이용 순서대로)
const FLOW_STEPS = [
  {
    id: 'property',
    icon: ICONS.search,
    title: '매물 탐색',
    description: '관심 지역의 아파트, 오피스텔 매물을 검색하고 실거래가를 확인하세요.'
  },
  {
    id: 'goal',
    icon: ICONS.target,
    title: '목표 설정',
    description: '드림홈을 선택하고 DSR 시뮬레이션으로 필요한 목표 금액을 계산하세요.'
  },
  {
    id: 'save',
    icon: ICONS.piggyBank,
    title: '저축 실천',
    description: '매일 조금씩 저축하며 AI 관리사 레제의 격려와 조언을 받으세요.'
  },
  {
    id: 'grow',
    icon: ICONS.home,
    title: '집 성장',
    description: '저축할수록 집이 11단계로 성장해요. 완성된 드림홈을 컬렉션에 추가하세요.'
  }
]

// Refs
const sectionRef = ref(null)
const visibleCards = ref([false, false, false, false])
const isFlowLineVisible = ref(false)

// IntersectionObserver
let observer = null

onMounted(() => {
  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Flow Line 애니메이션 시작
          isFlowLineVisible.value = true

          // 카드 순차 표시 (stagger)
          FLOW_STEPS.forEach((_, index) => {
            setTimeout(() => {
              visibleCards.value[index] = true
            }, index * 150)
          })

          // 한 번 표시 후 observer 해제
          observer?.disconnect()
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Component-specific styles are in landing.css */
/* Only scoped overrides here if needed */
</style>
