<template>
  <div v-if="true" style="position: fixed; top: 0; left: 0; z-index: 9999; background: red; color: white; padding: 10px;">
    App Mounted - Debug Mode
  </div>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
