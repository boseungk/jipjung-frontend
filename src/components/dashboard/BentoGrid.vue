<template>
  <div class="bento-grid">
    <ProfileCard />
    <MainGoalCard />
    <WeeklyStreakCard />
    <DsrGaugeCard />
    <AssetGrowthCard />
  </div>
</template>

<script setup>
import ProfileCard from './bento/ProfileCard.vue'
import MainGoalCard from './bento/MainGoalCard.vue'
import WeeklyStreakCard from './bento/WeeklyStreakCard.vue'
import DsrGaugeCard from './bento/DsrGaugeCard.vue'
import AssetGrowthCard from './bento/AssetGrowthCard.vue'
</script>

<style scoped>
.bento-grid {
  display: grid;
  gap: 1.5rem;
  padding: 2rem 2rem 2rem; /* Increased top padding for better separation */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  grid-auto-flow: row;
  grid-auto-rows: minmax(0, auto);
}

/* Desktop: 3 columns with named grid areas */
@media (min-width: 1040px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      "profile main main"
      "streak main main"
      "dsr growth growth";
  }
}

/* Tablet: 2 columns */
@media (min-width: 768px) and (max-width: 1039px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(200px, auto);
    padding: 1.5rem 1.5rem 2rem;
    grid-template-areas:
      "profile streak"
      "main main"
      "dsr growth";
  }
}

/* Mobile: 1 column stack */
@media (max-width: 767px) {
  .bento-grid {
    grid-template-columns: 1fr;
    padding: 1rem 1rem 2rem;
    gap: 1rem; /* Reduced gap for mobile */
    grid-template-areas:
      "profile"
      "main"
      "streak"
      "dsr"
      "growth";
  }
}

/* Base card styles (inherited by all bento cards) */
:deep(.bento-card) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:deep(.bento-card):hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px -10px rgba(0, 0, 0, 0.15);
}

html[data-theme="night"] :deep(.bento-card) {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

html[data-theme="night"] :deep(.bento-card):hover {
  box-shadow: 0 15px 50px -10px rgba(0, 0, 0, 0.6);
}
</style>
