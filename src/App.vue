<template>
  <div id="app">
    <!-- Background Effects -->
    <BackgroundEffects />
    <SnowCanvas />
    
    <!-- Theme Controls -->
    <ColorThemeManager position="top-left" :show-labels="true" />
    <ThemeToggle position="top-right" :show-tooltip="true" />
    
    <!-- Header -->
    <ShowroomHeader />
    
    <!-- Main Container -->
    <main class="main-container">
      <!-- Concept Title -->
      <div class="concept-title-section">
        <h2 class="concept-title">🏠 라이프스타일 쇼룸</h2>
      </div>
      
      <!-- Crystal Ball Display -->
      <CrystalBall />
      
      <!-- Description Panel -->
      <DescriptionPanel />
      
      <!-- Showroom Samples -->
      <ShowroomSamples />
      
      <!-- Features List -->
      <FeaturesList />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { useMousePosition } from './composables/useMousePosition'

// Components
import BackgroundEffects from './components/BackgroundEffects.vue'
import SnowCanvas from './components/SnowCanvas.vue'
import ColorThemeManager from './components/ColorThemeManager.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import ShowroomHeader from './components/ShowroomHeader.vue'
import CrystalBall from './components/CrystalBall.vue'
import DescriptionPanel from './components/DescriptionPanel.vue'
import ShowroomSamples from './components/ShowroomSamples.vue'
import FeaturesList from './components/FeaturesList.vue'

// Use composables
const { theme } = useTheme()
const { x, y } = useMousePosition()

onMounted(() => {
  // Add showroom concept class
  document.documentElement.classList.add('concept-showroom')
})
</script>

<style>
/* Main container */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

/* Concept title */
.concept-title-section {
  text-align: center;
  margin-bottom: 3rem;
}

.concept-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.5s ease;
}
</style>
