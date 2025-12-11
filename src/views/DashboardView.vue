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
      :isOpen="showGoalGuideModal"
      title="목표를 설정해주세요!"
      message="아직 목표로 하는 집이 없어요. 매물을 둘러보고 꿈의 집을 선택해보세요!"
      primaryButtonText="매물 보러가기"
      secondaryButtonText="나중에 할게요"
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
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import AppIcon from '../components/common/AppIcon.vue'
import IsometricRoomHero from '../components/dashboard/IsometricRoomHero.vue'
import BentoGrid from '../components/dashboard/BentoGrid.vue'
import GoalGuideModal from '../components/modals/GoalGuideModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const dreamHomeStore = useDreamHomeStore()

/** @type {import('vue').Ref<string|null>} 에러 메시지 */
const error = ref(null)

/** @type {import('vue').Ref<boolean>} 목표 안내 모달 표시 여부 */
const showGoalGuideModal = ref(false)

const dismissalKey = computed(() => {
  const id = authStore.userId
  return id ? `goalGuideDismissed:${id}` : 'goalGuideDismissed'
})

function maybeShowGoalGuide() {
  const dismissed = sessionStorage.getItem(dismissalKey.value)
  if (!hasGoal.value && !dismissed) {
    showGoalGuideModal.value = true
  }
}

/** 목표가 설정되었는지 확인 (dreamHomeId가 없거나 기본값인 경우) */
const hasGoal = computed(() => {
  const dreamHome = authStore.userDreamHome
  // dreamHomeId가 없거나, 기본 propertyName이면 목표가 없는 것으로 간주
  return dreamHome?.dreamHomeId && dreamHome?.propertyName !== '목표를 설정해주세요'
})

/**
 * 대시보드 데이터 로드
 *
 * API 호출 실패 시에도 기존 캐시된 데이터로 UI를 표시합니다.
 * (Graceful Degradation)
 */
async function loadDashboardData() {
    try {
        error.value = null
        await authStore.loadDashboard()
        
        // 데이터 로드 후 목표가 없으면 모달 표시
        // 세션 저장소로 "나중에 할게요" 선택 여부 확인
        maybeShowGoalGuide()
    } catch (err) {
        console.error('Failed to load dashboard:', err)
        // 에러 발생해도 기존 데이터로 렌더링 (graceful degradation)
        error.value = '데이터를 불러오는 중 오류가 발생했습니다. 일부 정보가 최신이 아닐 수 있습니다.'
        // 대시보드 실패 시에도 목표 미설정이면 안내 표시
        maybeShowGoalGuide()
    }
}

/** 매물 화면으로 이동 */
function handleGoToProperties() {
  showGoalGuideModal.value = false
  router.push('/properties')
}

/** 나중에 하기 - 모달 닫기 */
function handleDismissGoalGuide() {
  showGoalGuideModal.value = false
  // 세션 동안만 숨김 (창을 닫거나 새로고침 후에는 다시 보여줌)
  sessionStorage.setItem(dismissalKey.value, 'true')
}

watch(hasGoal, (goalSet) => {
  if (!goalSet) {
    maybeShowGoalGuide()
  } else {
    showGoalGuideModal.value = false
  }
})

onMounted(() => {
    // 초기 상태에서도 목표 안내 여부 확인 (API 이전에도 실행)
    maybeShowGoalGuide()

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
  padding-top: 64px; /* Account for fixed TopNavigationBar */
  background: #f5f6f8;
}

html[data-theme='night'] .dashboard-view {
  background: var(--minimal-bg-night, #1a1c1e);
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
