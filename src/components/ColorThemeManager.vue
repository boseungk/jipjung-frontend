<template>
  <div id="color-theme-picker" class="color-theme-picker">
    <button
      v-for="(themeData, themeKey) in themes"
      :key="themeKey"
      class="theme-swatch"
      :class="{ active: currentTheme === themeKey }"
      :data-theme="themeKey"
      :aria-label="`${themeData.description} 테마로 변경`"
      :title="themeData.description"
      @click="selectTheme(themeKey)"
      @keydown="handleKeydown($event, themeKey)"
    >
      <span class="swatch-bg" :style="{ background: themeData.color }"></span>
      <span v-if="showLabels" class="swatch-label">{{ themeData.emoji }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  position: {
    type: String,
    default: 'top-left',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  showLabels: {
    type: Boolean,
    default: true
  }
})

const currentTheme = ref('warm-beige')

const themes = {
  'warm-beige': {
    name: 'Beige',
    emoji: '🏠',
    color: '#F5EDE3',
    description: '따뜻한 베이지'
  },
  'olive-green': {
    name: 'Olive',
    emoji: '🌿',
    color: '#fcfbf8',
    description: '차분한 올리브'
  },
  'cool-gray': {
    name: 'Gray',
    emoji: '🌫️',
    color: '#F5F6F8',
    description: '세련된 그레이'
  },
  'sky-blue': {
    name: 'Blue',
    emoji: '☁️',
    color: '#F0F9FF',
    description: '모던 블루'
  }
}

const selectTheme = (themeName) => {
  currentTheme.value = themeName
  document.documentElement.setAttribute('data-color-theme', themeName)
  localStorage.setItem('showroom-color-theme', themeName)
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('colorthemechange', {
    detail: {
      theme: themeName,
      themeName: themes[themeName].name,
      themeColor: themes[themeName].color,
      themeDescription: themes[themeName].description
    }
  }))
}

const handleKeydown = (e, themeName) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    selectTheme(themeName)
  }
}

onMounted(() => {
  // Load saved theme
  const savedTheme = localStorage.getItem('showroom-color-theme')
  if (savedTheme && themes[savedTheme]) {
    currentTheme.value = savedTheme
  }
  document.documentElement.setAttribute('data-color-theme', currentTheme.value)
})
</script>

<style scoped>
.color-theme-picker {
  position: fixed;
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--showroom-card-bg-day, #F5EDE3);
  border-radius: 24px;
  box-shadow:
    8px 8px 16px var(--showroom-shadow-dark-day, #D4C8BD),
    -8px -8px 16px var(--showroom-shadow-light-day, #FFFFFF);
  z-index: 9998;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  top: 2rem;
  left: 2rem;
}

html[data-theme="night"] .color-theme-picker {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.05);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.25);
}

.theme-swatch {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: var(--showroom-card-bg-day, #F5EDE3);
  box-shadow:
    4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0;
}

html[data-theme="night"] .theme-swatch {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.2);
}

html[data-theme="night"] .theme-swatch:hover {
  background: rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.25),
    0 0 20px var(--showroom-glow-night, rgba(212, 165, 116, 0.4));
}

html[data-theme="night"] .theme-swatch:active {
  background: rgba(0, 0, 0, 0.2);
  border-top-color: rgba(0, 0, 0, 0.1);
  box-shadow:
    inset 3px 3px 10px rgba(0, 0, 0, 0.5),
    inset -2px -2px 6px rgba(255, 255, 255, 0.03);
  transform: translateY(2px) scale(0.92);
}

.theme-swatch.active {
  border-color: var(--showroom-accent-day, #D4A574);
  transform: scale(1.1);
}

html[data-theme="night"] .theme-swatch.active {
  border-color: var(--showroom-accent-night, #D4A574);
}

.swatch-bg {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.swatch-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  pointer-events: none;
  margin-top: 2px;
}

html[data-theme="night"] .swatch-label {
  color: var(--showroom-text-night, #F5EDE3);
}

@media (max-width: 768px) {
  .color-theme-picker {
    gap: 0.5rem;
    padding: 0.75rem;
    top: 1rem !important;
    left: 1rem !important;
  }

  .theme-swatch {
    width: 52px;
    height: 52px;
  }

  .swatch-bg {
    width: 28px;
    height: 28px;
  }

  .swatch-label{
    font-size: 0.7rem;
  }
}
</style>
