<template>
  <div class="property-list-view">
    <PropertyExplorationLayout />
  </div>
</template>

<script setup>
import PropertyExplorationLayout from '@/components/property/PropertyExplorationLayout.vue'
</script>

<style scoped>
.property-list-view {
  width: 100%;
  height: calc(100vh - var(--nav-height, 64px));
}
</style>
