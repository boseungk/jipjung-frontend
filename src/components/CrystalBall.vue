<template>
  <div class="room-display">
    <div class="room-container">
      <div class="crystal-ball">
        <!-- Specular Glare -->
        <div class="highlight-glare"></div>
        <div class="highlight-rim"></div>

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
/* Styles are defined in the imported CSS files */
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
