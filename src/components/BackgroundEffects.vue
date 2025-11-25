<template>
  <div>
    <!-- Environment Background Effects -->
    <div class="winter-gradient"></div>
    <!-- Lighting effects only on Collection page -->
    <div v-if="isCollectionPage" class="mouse-light-effect"></div>
    <div class="rising-light-container"></div>
    <div class="frost-overlay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollectionPage = computed(() => route.path === '/collection')
</script>

<style scoped>
/* Defined in main.css and imported CSS files */
</style>
