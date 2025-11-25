<template>
  <div id="app">
    <!-- Background Effects (Global) -->
    <BackgroundEffects />
    
    <!-- Theme Toggle (Global) -->
    <ThemeToggle position="top-right" :show-tooltip="true" />
    
    <!-- Navigation Bar (Global) -->
    <NavigationBar />
    
    <!-- Router View: DashboardView or CollectionView -->
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import BackgroundEffects from './components/BackgroundEffects.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import NavigationBar from './components/NavigationBar.vue'
</script>

<style>
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
