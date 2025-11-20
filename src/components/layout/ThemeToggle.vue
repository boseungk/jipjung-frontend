<template>
  <button 
    class="theme-toggle-btn" 
    @click="themeStore.toggleTheme"
    :aria-label="themeStore.theme === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'"
  >
    <span v-if="themeStore.theme === 'day'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle-btn {
  position: fixed;
  top: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 100;
  transition: all 0.3s ease;
}

/* Day Mode */
:global([data-theme="day"]) .theme-toggle-btn {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6), 
    -8px -8px 16px rgba(255, 255, 255, 0.5);
}

/* Night Mode */
:global([data-theme="night"]) .theme-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
}

.theme-toggle-btn:active {
  transform: translateY(1px);
}
</style>
