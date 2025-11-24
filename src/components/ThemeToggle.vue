<template>
  <div
    id="night-toggle"
    ref="toggleRef"
    role="button"
    tabindex="0"
    aria-label="낮/밤 모드 전환"
    @click="toggleTheme"
    @keydown="handleKeydown"
  >
    <!-- Sun Icon (Day Mode) -->
    <svg
      id="sun-icon"
      class="toggle-icon"
      :class="{ visible: !isNight, hidden: isNight }"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="5" stroke="#FFB300" stroke-width="2" fill="#FFD54F"/>
      <path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.5 3.5L19.07 4.93M4.93 19.07L3.5 20.5M20.5 20.5L19.07 19.07M4.93 4.93L3.5 3.5" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <!-- Moon Icon (Night Mode) -->
    <svg
      id="moon-icon"
      class="toggle-icon"
      :class="{ visible: isNight, hidden: !isNight }"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#5D4037" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Tooltip -->
    <div v-if="showTooltip" class="theme-tooltip">
      {{ isNight ? '낮 모드로 전환' : '밤 모드로 전환' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(value)
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
})

const { theme, isNight, toggleTheme: toggleThemeComposable } = useTheme()
const toggleRef = ref(null)

const toggleTheme = () => {
  toggleThemeComposable()
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleTheme()
  }
}
</script>

<style scoped>
#night-toggle {
  position: fixed;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(129, 199, 132, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  
  /* Position based on prop */
  top: 2rem;
  right: 2rem;
}

#night-toggle:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(129, 199, 132, 0.4);
  border-color: rgba(129, 199, 132, 0.5);
}

#night-toggle:active {
  transform: translateY(-2px) scale(1.02);
}

.toggle-icon {
  position: absolute;
  transition: opacity 400ms ease-in-out, transform 400ms ease-in-out;
}

.toggle-icon.hidden {
  opacity: 0;
  transform: scale(0.8) rotate(-90deg);
  pointer-events: none;
}

.toggle-icon.visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.theme-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
}

#night-toggle:hover .theme-tooltip {
  opacity: 1;
}

/* Night mode button - Tactile Glassmorphism */
html[data-theme="night"] #night-toggle {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.12);
  border-left-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] #night-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 0 30px var(--showroom-glow-night, rgba(129, 199, 132, 0.3));
}

html[data-theme="night"] #night-toggle:active {
  background: rgba(0, 0, 0, 0.2);
  border-top-color: rgba(0, 0, 0, 0.1);
  box-shadow:
    inset 4px 4px 12px rgba(0, 0, 0, 0.5),
    inset -2px -2px 8px rgba(255, 255, 255, 0.03);
  transform: translateY(2px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  #night-toggle {
    width: 56px;
    height: 56px;
    top: 1.5rem !important;
    right: 1.5rem !important;
  }

  .theme-tooltip {
    display: none;
  }
}
</style>
