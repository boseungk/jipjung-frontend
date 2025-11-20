<template>
  <div class="room-container">
    <div class="crystal-ball">
      <!-- Specular Glare -->
      <div class="highlight-glare"></div>
      <div class="highlight-rim"></div>

      <!-- SVG Container (Inner Scene) -->
      <div id="furniture-svg-wrapper" v-html="svgContent"></div>
      
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>3D 룸 로딩 중...</p>
      </div>
    </div>

    <!-- Ground Shadow -->
    <div class="ground-shadow"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import figureSvgRaw from '@/assets/images/figure.svg?raw'
import { useThemeStore } from '@/stores/theme'

const svgContent = ref('')
const loading = ref(true)
const themeStore = useThemeStore()

onMounted(() => {
  // Simulate loading or just set content
  setTimeout(() => {
    svgContent.value = figureSvgRaw
    loading.value = false
    updateSvgVisibility(themeStore.theme)
  }, 500)
})

// Watch theme changes to update SVG layers
watch(() => themeStore.theme, (newTheme) => {
  updateSvgVisibility(newTheme)
})

function updateSvgVisibility(theme) {
  const wrapper = document.getElementById('furniture-svg-wrapper')
  if (!wrapper) return

  const nightLayers = wrapper.querySelectorAll('[id^="night"]')
  const dayLayers = wrapper.querySelectorAll('[id^="background"], [id^="sofa"], [id^="tables"], [id^="lamp"], [id^="reze"]')

  if (theme === 'night') {
    dayLayers.forEach(el => el.style.opacity = '0')
    nightLayers.forEach(el => el.style.opacity = '1')
  } else {
    dayLayers.forEach(el => el.style.opacity = '1')
    nightLayers.forEach(el => el.style.opacity = '0')
  }
}
</script>

<style scoped>
.room-container {
  position: relative;
  width: 500px;
  height: 500px;
  max-width: 90vw;
  z-index: 10;
  perspective: 1000px;
  margin: 0 auto;
}

.crystal-ball {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  background: transparent;
  transform-style: preserve-3d;
  transition: all 0.5s ease;
}

/* Day Mode */
:global([data-theme="day"]) .crystal-ball {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.02) 100%);
  box-shadow:
    inset -10px -10px 20px rgba(255, 255, 255, 0.1),
    inset 0 0 30px rgba(255, 255, 255, 0.2),
    inset 10px 10px 40px rgba(0, 0, 0, 0.05),
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
  animation: glass-shimmer-day 8s infinite alternate ease-in-out;
}

/* Night Mode */
:global([data-theme="night"]) .crystal-ball {
  background: #000;
  box-shadow:
    inset -20px -20px 60px rgba(0, 0, 0, 0.9),
    inset 10px 10px 40px rgba(255, 214, 170, 0.4),
    inset 5px 5px 20px rgba(200, 230, 255, 0.3),
    inset 0 40px 30px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(255, 214, 170, 0.2),
    0 20px 50px rgba(0, 0, 0, 0.6);
  animation: glass-shimmer-night 6s infinite alternate ease-in-out;
}

.highlight-glare {
  position: absolute; top: 10%; left: 10%; width: 35%; height: 20%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%);
  transform: rotate(-45deg); pointer-events: none; filter: blur(1px); z-index: 20; opacity: 0.9;
}

.highlight-rim {
  position: absolute; bottom: 10%; right: 10%; width: 20%; height: 10%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 214, 170, 0.8) 0%, transparent 70%);
  transform: rotate(-45deg); pointer-events: none; filter: blur(4px); z-index: 20; opacity: 0;
}

:global([data-theme="day"]) .highlight-rim {
  opacity: 0.5;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.8) 0%, rgba(200, 230, 255, 0.5) 40%, rgba(255, 200, 200, 0.3) 60%, transparent 70%);
  mix-blend-mode: overlay;
}

:global([data-theme="night"]) .highlight-rim { opacity: 0.6; }

.ground-shadow {
  position: absolute; bottom: -3rem; left: 50%; transform: translateX(-50%);
  width: 10rem; height: 1rem; background: rgba(0, 0, 0, 0.3);
  filter: blur(1rem); border-radius: 50%; transition: opacity 0.5s ease;
}

:global([data-theme="night"]) .ground-shadow { background: rgba(0, 0, 0, 0.5); filter: blur(1.5rem); }

#furniture-svg-wrapper {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform: scale(1.1);
}

.loading {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center;
}
.loading-spinner {
  width: 48px; height: 48px; border: 4px solid rgba(129, 199, 132, 0.2);
  border-top-color: #81c784; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
