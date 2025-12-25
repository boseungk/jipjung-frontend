<template>
  <div class="landing-view">
    <!-- Background Effects -->
    <div class="winter-gradient"></div>
    <div class="frost-overlay"></div>

    <!-- Snow Effect (Night mode only, shown after journey completion) -->
    <SnowCanvas v-if="showSnow" />

    <!-- Sections -->
    <LandingHero @start-click="navigateToLogin" />
    <LandingFeatures />
    <LandingGoalPreview />
    <LandingJourneyPreview @phase-change="handlePhaseChange" />
    <LandingAiDemo @start-click="navigateToLogin" />
    
    <!-- Scroll Navigation Buttons -->
    <div class="scroll-nav" :class="{ 'is-visible': showScrollNav }">
      <button 
        class="scroll-nav__btn" 
        @click="scrollToTop" 
        title="맨 위로 이동"
        aria-label="맨 위로 이동"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
      <button 
        class="scroll-nav__btn" 
        @click="scrollToBottom" 
        title="맨 아래로 이동"
        aria-label="맨 아래로 이동"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * LandingView.vue
 * 서비스 소개 랜딩 페이지 메인 컨테이너
 * 
 * 책임:
 * - 섹션 컴포넌트 조합
 * - 테마 스코프 관리 (진입 시 Day, 이탈 시 복원)
 * - 전역 상태 관리 (Snow 효과 등)
 * - 스크롤 네비게이션
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

// Components
import SnowCanvas from '@/components/SnowCanvas.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingGoalPreview from '@/components/landing/LandingGoalPreview.vue'
import LandingJourneyPreview from '@/components/landing/LandingJourneyPreview.vue'
import LandingAiDemo from '@/components/landing/LandingAiDemo.vue'

// CSS
import '@/assets/css/layouts/landing.css'

// Composables
const router = useRouter()
const { theme, isNight, setTheme } = useTheme()

// State
const TOTAL_PHASES = 11
const previousTheme = ref('day')
const isAtFinalPhase = ref(false)
const showSnow = computed(() => isNight.value && isAtFinalPhase.value)

// Scroll Navigation State
const showScrollNav = ref(false)

/**
 * 테마 스코프 관리
 * 랜딩 페이지 진입 시 Day 모드로 시작, 이탈 시 원래 테마 복원
 */
onMounted(() => {
  previousTheme.value = theme.value
  setTheme('day')
  
  // Scroll Listener for showing/hiding scroll nav
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial check
})

onBeforeUnmount(() => {
  setTheme(previousTheme.value || 'day')
  window.removeEventListener('scroll', handleScroll)
})

/**
 * 스크롤 핸들러 - 스크롤 네비게이션 표시 여부 결정
 */
function handleScroll() {
  // Show scroll nav after scrolling past first viewport height
  showScrollNav.value = window.scrollY > window.innerHeight * 0.5
}

/**
 * Phase 변경 핸들러
 * Journey 섹션에서 Phase가 변경될 때 호출
 */
function handlePhaseChange(phase) {
  isAtFinalPhase.value = phase >= TOTAL_PHASES
}

/**
 * 맨 위로 스크롤
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

/**
 * 맨 아래로 스크롤
 */
function scrollToBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}

/**
 * 로그인 페이지로 이동
 */
function navigateToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.landing-view {
  position: relative;
}

/* Scroll Navigation */
.scroll-nav {
  position: fixed;
  right: 4rem;
  bottom: 6rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 100;
  
  /* Initial hidden state */
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scroll-nav.is-visible {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.scroll-nav__btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  
  /* Shadow & Style */
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  
  color: var(--landing-text, #2C2420);
  cursor: pointer;
  
  transition: 
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background-color 0.3s ease,
    color 0.3s ease;
}

.scroll-nav__btn:hover {
  transform: scale(1.1);
  background: rgba(255, 107, 61, 0.9);
  color: white;
  box-shadow: 
    0 8px 24px rgba(255, 107, 61, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.scroll-nav__btn:active {
  transform: scale(1.02);
}

/* Night Mode */
html[data-theme="night"] .scroll-nav__btn {
  background: rgba(74, 69, 63, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--landing-text, #F5EDE3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

html[data-theme="night"] .scroll-nav__btn:hover {
  background: rgba(255, 107, 61, 0.9);
  color: white;
  box-shadow: 
    0 8px 24px rgba(255, 107, 61, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Mobile - Slightly smaller */
@media (max-width: 640px) {
  .scroll-nav {
    right: 1rem;
    bottom: 1.5rem;
    gap: 0.5rem;
  }
  
  .scroll-nav__btn {
    width: 40px;
    height: 40px;
  }
  
  .scroll-nav__btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>
