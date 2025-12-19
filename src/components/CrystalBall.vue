<template>
  <div class="room-display">
    <div class="room-container">
      <div class="crystal-ball">
        <!-- Specular Glare -->
        <div class="highlight-glare"></div>

        <!-- WebP Layer Container -->
        <div id="furniture-webp-wrapper" aria-label="3D 룸 디스플레이">
          <div v-if="isLoading && !hasLoadedOnce" class="loading">
            <div class="loading-spinner"></div>
            <p>3D 룸 로딩 중...</p>
          </div>
          <div v-else-if="hasError && !hasLoadedOnce" class="loading" style="opacity: 1">
            <p style="color: #d97979">⚠️ 이미지를 불러올 수 없습니다</p>
          </div>

          <div v-else class="webp-stage" aria-hidden="true">
            <div class="stage-group stage-group--day">
              <img
                v-if="backgroundLayer"
                :src="backgroundLayer.url"
                class="stage-img stage-img--base"
                alt=""
                aria-hidden="true"
                draggable="false"
              />
              <img
                v-for="layer in dayOverlayLayers"
                :key="layer.id"
                :src="layer.url"
                class="stage-img stage-img--overlay"
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            </div>

            <div class="stage-group stage-group--night">
              <img
                v-if="nightImageUrl"
                :src="nightImageUrl"
                class="stage-img stage-img--base"
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Ground Shadow -->
      <div class="ground-shadow"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import { getInteriorLayerUrls, getInteriorNightUrl, resolveThemeCode } from '@/constants/showroomWebp'

const props = defineProps({
  themeCode: {
    type: String,
    default: null
  }
})

const authStore = useAuthStore()
const { isNight } = useTheme()
const isLoading = ref(true)
const hasError = ref(false)
const hasLoadedOnce = ref(false)
let preloadAbort = null

const resolvedThemeCode = computed(() => {
  return resolveThemeCode(props.themeCode || authStore.userShowroom?.themeCode)
})

const layers = computed(() => getInteriorLayerUrls(resolvedThemeCode.value))
const backgroundLayer = computed(() => layers.value.find((layer) => layer.id === 'background') || null)
const nightImageUrl = computed(() => getInteriorNightUrl(resolvedThemeCode.value))
const dayOverlayLayers = computed(() => layers.value.filter((layer) => layer.id !== 'background'))
const dayBaseUrl = computed(() => backgroundLayer.value?.url || null)
const activeBaseUrl = computed(() => (isNight.value ? nightImageUrl.value : dayBaseUrl.value))

const prefetchedUrls = new Set()
const schedulePrefetch = (url) => {
  if (!url || prefetchedUrls.has(url)) return
  prefetchedUrls.add(url)

  if (typeof window === 'undefined') return
  const run = () => preloadImage(url).catch(() => {})

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 600 })
  } else {
    window.setTimeout(run, 0)
  }
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

async function loadActiveBase() {
  const url = activeBaseUrl.value

  if (!url) {
    isLoading.value = false
    hasError.value = true
    return
  }

  preloadAbort = { aborted: false }
  const token = preloadAbort

  if (!hasLoadedOnce.value) isLoading.value = true
  hasError.value = false

  try {
    await preloadImage(url)
    if (token.aborted) return

    hasLoadedOnce.value = true

    // Prefetch the other mode so the next toggle feels instant.
    const otherUrl = isNight.value ? dayBaseUrl.value : nightImageUrl.value
    schedulePrefetch(otherUrl)
  } catch (error) {
    console.error(error)
    if (!token.aborted) {
      hasError.value = true
    }
  } finally {
    if (!token.aborted) {
      isLoading.value = false
    }
  }
}

watch([resolvedThemeCode, activeBaseUrl], () => {
  // Ensure the currently-visible mode has its base image ready.
  loadActiveBase()

  // Also prefetch the other mode ASAP (night image is a single snapshot).
  schedulePrefetch(nightImageUrl.value)
}, { immediate: true })

onUnmounted(() => {
  if (preloadAbort) preloadAbort.aborted = true
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

#furniture-webp-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.webp-stage {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-group {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--theme-switch-duration, 0.45s) var(--theme-switch-easing, ease-in-out);
  will-change: opacity;
  pointer-events: none;
}

.stage-group--day {
  opacity: 1;
}

html[data-theme="night"] .stage-group--day {
  opacity: 0;
}

html[data-theme="night"] .stage-group--night {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .stage-group {
    transition: none;
  }
}

.stage-img {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
}

.stage-img--base {
  position: relative;
  z-index: 1;
}

.stage-img--overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  z-index: 2;
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

/* WebP Furniture Content */
.webp-stage {
  transform: scale(1.1);
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
