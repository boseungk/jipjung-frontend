<template>
  <div class="dashboard-view">
    <!-- Header -->
    <ShowroomHeader />
    
    <section class="page-intro">
      <p class="intro-eyebrow">대시보드</p>
      <h2 class="intro-title">반가워요, {{ userName }}님</h2>
      <p class="intro-sub">목표까지 차근차근 나아가고 있어요. 오늘도 한 걸음 더 가까워집니다.</p>
    </section>

    <div class="dashboard-shell">
      <!-- Zone A: Hero Section (Isometric Room) -->
      <IsometricRoomHero />

      <!-- Zone B: Bento Grid Dashboard -->
      <BentoGrid />
    </div>
  </div>
</template>

<script setup>
import ShowroomHeader from '../components/ShowroomHeader.vue'
import IsometricRoomHero from '../components/dashboard/IsometricRoomHero.vue'
import BentoGrid from '../components/dashboard/BentoGrid.vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { userName } = storeToRefs(authStore)
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  min-height: 100vh;
  padding-top: 64px; /* Account for fixed TopNavigationBar */
  background: #f5f6f8;
}

.page-intro {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 0.75rem;
}

.intro-eyebrow {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--ink-muted, #6b7280);
  text-transform: uppercase;
  margin: 0 0 0.2rem;
}

.intro-title {
  font-size: 1.95rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

.intro-sub {
  margin: 0.35rem 0 0;
  font-size: 0.98rem;
  color: var(--ink-muted, #6b7280);
}

.dashboard-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
