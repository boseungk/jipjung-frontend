<template>
  <div class="bento-grid">
    <MainGoalCard />
    <ProfileCard />
    <AssetGrowthCard />
    <WeeklyStreakCard @open-savings="goToSavings" />
    <DsrGaugeCard />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProfileCard from './bento/ProfileCard.vue'
import MainGoalCard from './bento/MainGoalCard.vue'
import WeeklyStreakCard from './bento/WeeklyStreakCard.vue'
import DsrGaugeCard from './bento/DsrGaugeCard.vue'
import AssetGrowthCard from './bento/AssetGrowthCard.vue'

const router = useRouter()

const goToSavings = () => {
  router.push({ name: 'Savings' })
}
</script>

<style scoped>
.bento-grid {
  display: grid;
  gap: 1.25rem;
  padding: 1.75rem 1.5rem 1.75rem; /* breathe a little more */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  grid-auto-flow: row;
  grid-auto-rows: minmax(240px, auto);
  align-items: stretch;
}

/* Desktop: named grid areas */
@media (min-width: 960px) {
  .bento-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-areas:
      "profile profile profile profile main main main main main main main main"
      "streak streak streak streak streak streak dsr dsr dsr dsr dsr dsr"
      "growth growth growth growth growth growth growth growth growth growth growth growth";
    grid-template-rows: auto auto auto;
  }
}

/* Tablet: 2 columns */
@media (min-width: 768px) and (max-width: 1039px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(220px, auto);
    padding: 1.25rem 1.25rem 1.75rem;
    grid-template-areas:
      "profile main"
      "streak dsr"
      "growth growth";
  }
}

/* Mobile: 1 column stack */
@media (max-width: 767px) {
  .bento-grid {
    grid-template-columns: 1fr;
    padding: 0.85rem 0.85rem 1.5rem;
    gap: 0.85rem; /* Reduced gap for mobile */
    grid-auto-rows: auto;
    grid-template-areas:
      "profile"
      "main"
      "streak"
      "dsr"
      "growth";
  }
}

/* Base card styles (inherited by all bento cards) */
:global(html) {
  --bento-card-bg: #ffffff;
  --bento-card-border: #e5e7eb;
  --bento-card-title: var(--ink-base, #1f2937);
  --bento-text: var(--ink-base, #1f2937);
  --bento-text-muted: var(--ink-muted, #6b7280);
}

:global(html[data-theme="night"]) {
  --bento-card-bg: var(--showroom-card-bg-night, #20242a);
  --bento-card-border: rgba(255, 255, 255, 0.08);
  --bento-card-title: var(--showroom-text-night, #f5f6f7);
  --bento-text: var(--showroom-text-night, #f5f6f7);
  --bento-text-muted: rgba(245, 246, 247, 0.75);
}

:deep(.bento-card) {
  background: var(--bento-card-bg);
  color: var(--bento-text);
  border-radius: 12px;
  padding: 1.35rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: 0 14px 28px -20px rgba(17, 24, 39, 0.16);
  border: 1px solid var(--bento-card-border);
  backdrop-filter: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

:deep(.bento-card):hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px -20px rgba(17, 24, 39, 0.22);
  border-color: var(--bento-card-border);
}

:global(html[data-theme="night"]) :deep(.bento-card) {
  background: var(--showroom-card-bg-night, #20242a);
  box-shadow: 0 18px 36px -18px rgba(0, 0, 0, 0.62);
  color: var(--showroom-text-night, #f5f6f7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(html[data-theme="night"]) :deep(.bento-card):hover {
  box-shadow: 0 22px 40px -18px rgba(0, 0, 0, 0.68);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.bento-card:focus-within) {
  outline: none;
  border-color: var(--bento-card-border);
  box-shadow: 0 18px 36px -20px rgba(17, 24, 39, 0.22);
}

:deep(.card-title) {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--bento-card-title);
  margin: 0;
}
</style>
