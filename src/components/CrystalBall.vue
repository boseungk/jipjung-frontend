<template>
  <div class="room-display">
    <div class="room-container">
      <div class="crystal-ball">
        <!-- Specular Glare -->
        <div class="highlight-glare"></div>

        <!-- SVG Container -->
        <div id="furniture-svg-wrapper" ref="svgWrapper" aria-label="3D 룸 디스플레이">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>3D 룸 로딩 중...</p>
          </div>
          <div v-else-if="error" class="loading" style="opacity: 1">
            <p style="color: #d97979">⚠️ SVG 파일을 불러올 수 없습니다</p>
            <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem">
              figure.svg 파일이 올바른 위치에 있는지 확인해주세요
            </p>
          </div>
        </div>
      </div>

      <!-- Ground Shadow -->
      <div class="ground-shadow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const svgWrapper = ref(null)
const loading = ref(true)
const error = ref(false)

const loadSVG = async () => {
  try {
    const response = await fetch('/figure.svg')
    
    if (!response.ok) {
      throw new Error(`SVG file not found: ${response.status}`)
    }
    
    const svgContent = await response.text()
    
    if (svgWrapper.value) {
      svgWrapper.value.innerHTML = svgContent
      
      // Configure SVG
      const svg = svgWrapper.value.querySelector('svg')
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.removeAttribute('width')
        svg.removeAttribute('height')
      }
      
      // Animate furniture layers
      showAllFurniture()
      
      loading.value = false
    }
  } catch (err) {
    console.error('Error loading SVG:', err)
    error.value = true
    loading.value = false
  }
}

const showAllFurniture = () => {
  const furnitureLayers = document.querySelectorAll(
    '[id^="background"], [id^="sofa"], [id^="tables"], [id^="lamp"], [id^="reze"]'
  )
  
  furnitureLayers.forEach((layer) => {
    if (typeof gsap !== 'undefined') {
      gsap.to(layer, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      })
    } else {
      layer.style.opacity = '1'
    }
  })
}

onMounted(() => {
  loadSVG()
})
</script>

<style scoped>
/* Room Display Container */
.room-display {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  perspective: 1000px;
}

.room-container {
  position: relative;
  width: var(--crystal-ball-size, 350px);
  height: var(--crystal-ball-size, 350px);
  aspect-ratio: 1 / 1;
  max-width: 90vw;
  z-index: 10;
  perspective: 1000px;
}

/* Crystal Ball - MUST BE ROUND */
.crystal-ball {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* CRITICAL: Makes it a sphere */
  position: relative;
  overflow: hidden;
  background: transparent;
  transform-style: preserve-3d;
}

/* Day Mode - Realistic Glass */
html[data-theme="day"] .crystal-ball {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 40%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0.02) 100%);
  box-shadow:
    inset -10px -10px 20px rgba(255, 255, 255, 0.1),
    inset 0 0 30px rgba(255, 255, 255, 0.2),
    inset 10px 10px 40px rgba(0, 0, 0, 0.05),
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
}

/* Night Mode - Dramatic Glass */
html[data-theme="night"] .crystal-ball {
  background: #000;
  box-shadow:
    inset -20px -20px 60px rgba(0, 0, 0, 0.9),
    inset 10px 10px 40px rgba(255, 214, 170, 0.4),
    inset 5px 5px 20px rgba(200, 230, 255, 0.3),
    inset 0 40px 30px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(255, 214, 170, 0.2),
    0 20px 50px rgba(0, 0, 0, 0.6);
}

/* Specular Glare */
.highlight-glare {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 35%;
  height: 20%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.4) 40%,
      transparent 70%);
  transform: rotate(-45deg);
  pointer-events: none;
  filter: blur(1px);
  z-index: 20;
  opacity: 0.9;
}

html[data-theme="day"] .highlight-glare {
  opacity: 0.8;
  background: radial-gradient(ellipse at center,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.6) 40%,
      transparent 70%);
  filter: blur(2px);
}

/* Ground Shadow */
.ground-shadow {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  width: 10rem;
  height: 1rem;
  background: rgba(0, 0, 0, 0.3);
  filter: blur(1rem);
  border-radius: 50%;
}

html[data-theme="night"] .ground-shadow {
  background: rgba(0, 0, 0, 0.5);
  filter: blur(1.5rem);
}

/* SVG Furniture Content */
#furniture-svg-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.1);
}

#furniture-svg-wrapper svg {
  width: 100%;
  height: 100%;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 3rem;
  opacity: 0.6;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(129, 199, 132, 0.2);
  border-top-color: #81c784;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
