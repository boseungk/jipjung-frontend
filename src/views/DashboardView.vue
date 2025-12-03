<template>
  <div class="dashboard-view">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <AppIcon name="house" :size="28" weight="fill" />
          <h1>라이프스타일 쇼룸</h1>
        </div>
        <p class="subtitle">당신의 저축을 아름다운 공간으로 전시하세요</p>
      </div>
    </header>

    <div class="dashboard-shell">
      <!-- Zone A: Hero Section (Isometric Room) -->
      <IsometricRoomHero />

      <!-- Zone B: Bento Grid Dashboard -->
      <BentoGrid />
    </div>
  </div>
</template>

<script setup>
import AppIcon from '../components/common/AppIcon.vue'
import IsometricRoomHero from '../components/dashboard/IsometricRoomHero.vue'
import BentoGrid from '../components/dashboard/BentoGrid.vue'
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  min-height: 100vh;
  padding-top: 64px; /* Account for fixed TopNavigationBar */
  background: #f5f6f8;
}

html[data-theme='night'] .dashboard-view {
  background: var(--minimal-bg-night, #1a1c1e);
}

.page-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1rem 0.2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.header-left h1 {
  font-family: var(--font-family-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

html[data-theme='night'] .header-left h1 {
  color: var(--minimal-text-night, #f5f6f7);
}

.subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

html[data-theme='night'] .subtitle {
  color: rgba(245, 246, 247, 0.7);
}

.dashboard-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem 1rem 0.65rem;
  }

  .header-left h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.88rem;
    padding-left: 2.1rem;
  }
}
</style>
