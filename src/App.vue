<template>
  <div id="app">
    <!-- Background Effects (Global) -->
    <BackgroundEffects />
    
    <!-- Top Navigation Bar (Global) -->
    <TopNavigationBar />
    
    <!-- Router View: DashboardView or CollectionView -->
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import BackgroundEffects from './components/BackgroundEffects.vue'
import TopNavigationBar from './components/TopNavigationBar.vue'
</script>

<style>
/* Main content padding to account for fixed top nav */
.main-content {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
  scrollbar-gutter: stable;
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

