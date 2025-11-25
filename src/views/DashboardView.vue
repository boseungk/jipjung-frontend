<template>
  <div class="dashboard-view">
    <!-- Header -->
    <ShowroomHeader />
    
    <!-- Main Container -->
    <main class="dashboard-container">
      <!-- Hero Section: CrystalBall (Transparent Background) -->
      <section class="hero-section">
        <CrystalBallHero />
      </section>
      
      <!-- Achievement Section (Light Background) -->
      <section class="achievement-section-wrapper">
        <AchievementSection
          @saving="handleSaving"
          @change-dream-home="handleChangeDreamHome"
        />
      </section>
      
      <!-- Gamification Section (Medium Background) -->
      <section class="gamification-section-wrapper">
        <GamificationPanel />
      </section>
      
      <!-- Two Column Layout: Chart + DSR (Medium Background) -->
      <section class="two-column-section-wrapper">
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
      </section>
      
      <!-- Dream Home Panel (Dark Background) -->
      <section class="dreamhome-section-wrapper">
        <DreamHomePanel />
      </section>
    </main>
  </div>
</template>

<script setup>
import ShowroomHeader from '../components/ShowroomHeader.vue'
import CrystalBallHero from '../components/dashboard/CrystalBallHero.vue'
import AchievementSection from '../components/dashboard/AchievementSection.vue'
import GamificationPanel from '../components/dashboard/GamificationPanel.vue'
import DsrSummaryCard from '../components/dashboard/DsrSummaryCard.vue'
import DreamHomePanel from '../components/dashboard/DreamHomePanel.vue'

// Handlers
const handleSaving = () => {
  console.log('저축하기 클릭')
  alert('저축하기 기능은 향후 구현 예정입니다!')
}

const handleChangeDreamHome = () => {
  console.log('드림홈 변경 클릭')
  alert('드림홈 변경 기능은 향후 구현 예정입니다!')
}
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  min-height: 100vh;
}

/* Main container - Full-width stream layout */
.dashboard-container {
  width: 100%;
  padding: 0;
}

/* Section Wrappers with Toss-style Backgrounds */

/* Hero Section: Transparent (No Background) */
.hero-section {
  background: transparent;
  padding: 0;
}

/* Achievement Section: Light Background */
.achievement-section-wrapper {
  background: var(--dashboard-section-bg-light, rgba(232, 224, 213, 0.5));
  padding: 2.5rem 0;
  margin: 1.5rem 0;
}

html[data-theme="night"] .achievement-section-wrapper {
  background: var(--dashboard-section-bg-night-light, rgba(58, 53, 48, 0.3));
}

/* Gamification Section: Medium Background */
.gamification-section-wrapper {
  background: var(--dashboard-section-bg-medium, rgba(232, 224, 213, 0.7));
  padding: 2.5rem 0;
  margin: 1.5rem 0;
}

html[data-theme="night"] .gamification-section-wrapper {
  background: var(--dashboard-section-bg-night-medium, rgba(58, 53, 48, 0.5));
}

/* Two Column Section: Medium Background */
.two-column-section-wrapper {
  background: var(--dashboard-section-bg-medium, rgba(232, 224, 213, 0.7));
  padding: 2.5rem 0;
  margin: 1.5rem 0;
}

html[data-theme="night"] .two-column-section-wrapper {
  background: var(--dashboard-section-bg-night-medium, rgba(58, 53, 48, 0.5));
}

/* Dream Home Section: Darker Background */
.dreamhome-section-wrapper {
  background: var(--dashboard-section-bg-dark, rgba(232, 224, 213, 0.85));
  padding: 2.5rem 0;
  margin: 1.5rem 0 0 0;
}

html[data-theme="night"] .dreamhome-section-wrapper {
  background: var(--dashboard-section-bg-night-dark, rgba(58, 53, 48, 0.6));
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0 2rem;
  max-width: 1000px;
  margin: 0 auto;
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
  .hero-section,
  .achievement-section-wrapper,
  .gamification-section-wrapper,
  .two-column-section-wrapper,
  .dreamhome-section-wrapper {
    padding: 2rem 0;
    margin: 2rem 0;
  }
  
  .two-column-layout {
    padding: 0 1rem;
    gap: 1.5rem;
  }
}
</style>
