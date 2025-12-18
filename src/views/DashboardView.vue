<template>
  <div class="dashboard-view">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <AppIcon name="house" :size="28" weight="fill" />
          <h1>라이프스타일 쇼룸</h1>
        </div>
        <p class="subtitle">당신의 저축을 아름다운 공간으로 전시하세요</p>
      </div>
    </header>

    <div class="dashboard-shell">
      <!-- Zone A: Hero Section (Isometric Room) -->
      <IsometricRoomHero />

      <!-- Zone B: Bento Grid Dashboard -->
      <BentoGrid />
    </div>

    <!-- Goal Guide Modal -->
    <GoalGuideModal
      :is-open="showGoalGuideModal"
      title="목표를 설정해주세요!"
      message="아직 목표로 하는 집이 없어요. 매물을 둘러보고 꿈의 집을 선택해보세요!"
      primary-button-text="매물 보러가기"
      secondary-button-text="나중에 할게요"
      @primary="handleGoToProperties"
      @secondary="handleDismissGoalGuide"
    />
  </div>
</template>

<script setup>
/**
 * Dashboard View
 *
 * 메인 대시보드 페이지.
 * 마운트 시 대시보드 API를 호출하여 최신 데이터를 로드합니다.
 */
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/common/AppIcon.vue'
import IsometricRoomHero from '@/components/dashboard/IsometricRoomHero.vue'
import BentoGrid from '@/components/dashboard/BentoGrid.vue'
import GoalGuideModal from '@/components/modals/GoalGuideModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showError } = useToast()

/** @type {import('vue').Ref<boolean>} 목표 안내 모달 표시 여부 */
const showGoalGuideModal = ref(false)

const dismissalKey = computed(() => {
  const id = authStore.userId
  return id ? `goalGuideDismissed:${id}` : 'goalGuideDismissed'
})

const hasGoal = computed(() => authStore.hasDreamHomeGoal)

function syncGoalGuideVisibility() {
  if (hasGoal.value) {
    showGoalGuideModal.value = false
    return
  }

  // userId가 없으면 범용 키로 체크하지 않고 항상 모달 표시
  // (이전 사용자의 dismiss 기록이 영향주는 것 방지)
  if (!authStore.userId) {
    showGoalGuideModal.value = true
    return
  }

  const dismissed = sessionStorage.getItem(dismissalKey.value)
  showGoalGuideModal.value = !dismissed
}

/**
 * 대시보드 데이터 로드
 *
 * API 호출 실패 시에도 기존 캐시된 데이터로 UI를 표시합니다.
 * (Graceful Degradation)
 */
async function loadDashboardData() {
  try {
    await authStore.loadDashboard()
  } catch (err) {
    console.error('Failed to load dashboard:', err)
    showError('데이터를 불러오는 중 오류가 발생했습니다. 일부 정보가 최신이 아닐 수 있습니다.')
  } finally {
    syncGoalGuideVisibility()
  }
}

/** 매물 화면으로 이동 */
function handleGoToProperties() {
  showGoalGuideModal.value = false
  router.push({ name: 'Properties' })
}

/** 나중에 하기 - 모달 닫기 */
function handleDismissGoalGuide() {
  showGoalGuideModal.value = false
  // 세션 동안만 숨김 (창을 닫거나 새로고침 후에는 다시 보여줌)
  sessionStorage.setItem(dismissalKey.value, 'true')
}

watch([hasGoal, dismissalKey], syncGoalGuideVisibility, { immediate: true })

onMounted(() => {
  // 인증된 사용자만 대시보드 데이터 로드
  if (authStore.isAuthenticated) {
    loadDashboardData()
  }
})
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  min-height: 100vh;
  background: var(--showroom-bg-day);
}

html[data-theme='night'] .dashboard-view {
  background: var(--showroom-bg-night);
}

.page-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1rem 0.2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.header-left h1 {
  font-family: var(--font-family-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

html[data-theme='night'] .header-left h1 {
  color: var(--minimal-text-night, #f5f6f7);
}

.subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

html[data-theme='night'] .subtitle {
  color: rgba(245, 246, 247, 0.7);
}

.dashboard-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem 1rem 0.65rem;
  }

  .header-left h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.88rem;
    padding-left: 2.1rem;
  }
}
</style>
