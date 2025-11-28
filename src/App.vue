<template>
  <div id="app">
    <!-- Background Effects (Global) -->
    <BackgroundEffects />
    
    <!-- Top Navigation Bar (Only show on authenticated pages) -->
    <TopNavigationBar v-if="showNavBar" />
    
    <!-- Router View: DashboardView or CollectionView -->
    <div class="main-content" :class="{ 'no-nav': !showNavBar }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BackgroundEffects from './components/BackgroundEffects.vue'
import TopNavigationBar from './components/TopNavigationBar.vue'

const route = useRoute()
const authStore = useAuthStore()

// 네비게이션 바를 보여줄지 여부 (라우터 meta.hideNavbar 기반)
const showNavBar = computed(() => {
  return !route.meta.hideNavbar
})

// 앱 시작 시 인증 상태 확인
onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
/* Main content padding to account for fixed top nav */
.main-content {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
  scrollbar-gutter: stable;
}

/* No navigation bar (for auth pages) */
.main-content.no-nav {
  padding-top: 0;
  min-height: 100vh;
}

/* Page Transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>

