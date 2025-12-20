<template>
  <div class="theme-controls">
    <button
      class="theme-toggle-btn nav-btn-base"
      type="button"
      @click="$emit('toggle-theme')"
      aria-label="테마 전환"
      title="Day/Night 모드 전환"
    >
      <ThemeIcons :type="isNight ? 'moon' : 'sun'" />
    </button>
  </div>
</template>

<script setup>
import ThemeIcons from '../common/ThemeIcons.vue'

defineProps({
  isNight: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-theme'])
</script>

<style scoped>
.theme-controls {
  display: flex;
  align-items: center;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
}
</style>
