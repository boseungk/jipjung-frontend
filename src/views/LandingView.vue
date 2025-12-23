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
    <LandingJourneyPreview @phase-change="handlePhaseChange" />
    <LandingAiDemo @start-click="navigateToLogin" />
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
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

// Components
import SnowCanvas from '@/components/SnowCanvas.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
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

/**
 * 테마 스코프 관리
 * 랜딩 페이지 진입 시 Day 모드로 시작, 이탈 시 원래 테마 복원
 */
onMounted(() => {
  previousTheme.value = theme.value
  setTheme('day')
})

onBeforeUnmount(() => {
  setTheme(previousTheme.value || 'day')
})

/**
 * Phase 변경 핸들러
 * Journey 섹션에서 Phase가 변경될 때 호출
 */
function handlePhaseChange(phase) {
  isAtFinalPhase.value = phase >= TOTAL_PHASES
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
</style>
