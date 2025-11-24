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
        :achievement-rate="dreamHome.achievementRate"
        :current-amount="dreamHome.currentAmount"
        :target-amount="dreamHome.targetAmount"
        :days-remaining="dreamHome.daysRemaining"
        :target-date="dreamHome.targetDate"
        @saving="handleSaving"
        @change-dream-home="handleChangeDreamHome"
      />
      
      <!-- Gamification Panel -->
      <GamificationPanel
        :current-level="gamification.currentLevel"
        :level-title="gamification.levelTitle"
        :experience-points="gamification.experiencePoints"
        :next-level-exp="gamification.nextLevelExp"
        :exp-progress="gamification.expProgress"
        :current-streak="gamification.currentStreak"
        :longest-streak="gamification.longestStreak"
      />
      
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
      <DreamHomePanel
        :property-name="dreamHome.propertyName"
        :location="dreamHome.location"
        :price="dreamHome.price"
        :target-amount="dreamHome.targetAmount"
      />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDreamHomeStore } from './stores/dreamHomeStore'
import { useGamificationStore } from './stores/gamificationStore'
import { useUserStore } from './stores/userStore'

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

// Stores
const dreamHomeStore = useDreamHomeStore()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

// Computed
const dreamHome = computed(() => dreamHomeStore.dreamHomeInfo)
const gamification = computed(() => gamificationStore.gamificationInfo)

// Handlers
const handleSaving = () => {
  // TODO: Open saving modal
  console. log('저축하기 클릭')
  alert('저축하기 기능은 향후 구현 예정입니다!')
}

const handleChangeDreamHome = () => {
  // TODO: Open dream home selection modal
  console.log('드림홈 변경 클릭')
  alert('드림홈 변경 기능은 향후 구현 예정입니다!')
}
</script>

<style>
/* Main container */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Placeholder for Chart */
.placeholder-card {
  padding: 3rem 2rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .placeholder-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.06);
}

html[data-theme="night"] .placeholder-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.05);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.25);
}

.placeholder-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .placeholder-card h3 {
  color: var(--showroom-text-night, #F5EDE3);
}

.placeholder-card p {
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin: 0.5rem 0;
}

html[data-theme="night"] .placeholder-card p {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.placeholder-note {
  font-weight: 600;
  color: var(--showroom-accent-day, #D4A574) !important;
  margin-top: 1rem !important;
}

html[data-theme="night"] .placeholder-note {
  color: var(--showroom-accent-night, #D4A574) !important;
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
