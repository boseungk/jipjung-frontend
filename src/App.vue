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
    <main class="dashboard-container">
      <!-- Crystal Ball Hero - PRIMARY -->
      <CrystalBallHero />
      
      <!-- Achievement Section - SECONDARY HERO -->
      <AchievementSection
        @saving="handleSaving"
        @change-dream-home="handleChangeDreamHome"
      />
      
      <!-- Gamification Panel -->
      <GamificationPanel />
      
      <!-- Two Column Layout: Chart + DSR -->
      <div class="two-column-layout">
        <div class="column-placeholder">
          <div class="placeholder-card">
            <h3>📊 저축 통계</h3>
            <p>Chart.js 차트가 여기에 표시됩니다</p>
            <p class="placeholder-note">평균: ₩50만/월</p>
          </div>
        </div>
        
        <DsrSummaryCard />
      </div>
      
      <!-- Dream Home Panel -->
      <DreamHomePanel />
    </main>
  </div>
</template>

<script setup>
// Components
import BackgroundEffects from './components/BackgroundEffects.vue'
import SnowCanvas from './components/SnowCanvas.vue'
import ColorThemeManager from './components/ColorThemeManager.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import ShowroomHeader from './components/ShowroomHeader.vue'
import CrystalBallHero from './components/dashboard/CrystalBallHero.vue'
import AchievementSection from './components/dashboard/AchievementSection.vue'
import GamificationPanel from './components/dashboard/GamificationPanel.vue'
import DsrSummaryCard from './components/dashboard/DsrSummaryCard.vue'
import DreamHomePanel from './components/dashboard/DreamHomePanel.vue'

// Handlers
const handleSaving = () => {
  // TODO: Open saving modal
  console.log('저축하기 클릭')
  alert('저축하기 기능은 향후 구현 예정입니다!')
}

const handleChangeDreamHome = () => {
  // TODO: Open dream home selection modal
  console.log('드림홈 변경 클릭')
  alert('드림홈 변경 기능은 향후 구현 예정입니다!')
}
</script>

<style>
/* Main container - Full-width stream layout */
.dashboard-container {
  width: 100%;
  padding: 0;
}

/* Section spacing */
.dashboard-container > * {
  margin-bottom: 5rem; /* 80px vertical spacing */
}

.dashboard-container > *:last-child {
  margin-bottom: 4rem;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 0; /* Handled by section spacing */
  padding: 0 2rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

/* Placeholder for Chart */
.placeholder-card {
  padding: 3rem 2rem;
  text-align: center;
  background: transparent;
}

.placeholder-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #4E342E;
}

html[data-theme="night"] .placeholder-card h3 {
  color: #FFFFFF;
}

.placeholder-card p {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #6D4C41;
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .placeholder-card p {
  color: #EFEBE9;
}

.placeholder-note {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .placeholder-note {
  color: var(--showroom-accent-night, #D4A574);
}

/* Responsive */
@media (max-width: 1023px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .dashboard-container {
    padding: 0 1rem 2rem;
  }
  
  .two-column-layout {
    gap: 1.5rem;
  }
}
</style>
