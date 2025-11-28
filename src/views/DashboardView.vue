<template>
  <div class="dashboard-view">
    <!-- Header -->
    <ShowroomHeader />
    
    <!-- Zone A: Hero Section (Isometric Room) -->
    <IsometricRoomHero />
    
    <!-- Zone B: Bento Grid Dashboard -->
    <BentoGrid />
  </div>
</template>

<script setup>
import ShowroomHeader from '../components/ShowroomHeader.vue'
import IsometricRoomHero from '../components/dashboard/IsometricRoomHero.vue'
import BentoGrid from '../components/dashboard/BentoGrid.vue'
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  min-height: 100vh;
  padding-top: 64px; /* Account for fixed TopNavigationBar */
  background: transparent;
}
</style>
