<template>
  <div class="bento-card profile-card">
    <!-- Level Badge - MOVED FROM HERO -->
    <div class="level-badge">
      <span class="level-icon"><AppIcon name="star" :size="16" :active="true" :is-major-cta="true" /></span>
      <span class="level-text">Lv.{{ currentLevel }} {{ levelTitle }}</span>
    </div>
    
    <div class="card-layout">
      <!-- Avatar -->
      <div class="avatar-section">
        <div class="avatar-circle">
          <span class="avatar-emoji"><AppIcon name="user" :size="32" /></span>
        </div>
      </div>
      
      <!-- User Info -->
      <div class="user-info">
        <div class="username">{{ userName }} 님</div>
        <div class="exp-info">{{ experiencePoints }} / {{ nextLevelExp }} XP</div>
      </div>
    </div>
    
    <!-- XP Bar -->
    <div class="xp-bar-container">
      <div class="xp-bar" :style="{ width: expProgress + '%' }">
        <span class="xp-text">{{ expProgress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'

const gamificationStore = useGamificationStore()
const { currentLevel, levelTitle, expProgress, experiencePoints, nextLevelExp } = storeToRefs(gamificationStore)

// TODO: Replace with actual user store
const userName = '홍길동'
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Increased gap slightly */
  grid-area: profile;
  padding: 1.75rem; /* Increased padding for airy feel */
}

/* Level Badge - ACCENT COLOR - CENTERED CONTENT */
.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.75rem;
  position: relative;
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong)); /* LIVING CORAL */
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.3);
  align-self: flex-start;
  text-align: center;
}

.level-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
}

.level-text {
  white-space: nowrap;
  text-align: center;
}

.card-layout {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Avatar */
.avatar-section {
  flex-shrink: 0;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE4E1, #FFF0F5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  filter: drop-shadow(0 2px 8px rgba(255, 127, 80, 0.2)); /* CORAL shadow */
}

html[data-theme="night"] .avatar-circle {
  background: linear-gradient(135deg, rgba(255, 127, 80, 0.2), rgba(255, 127, 80, 0.1));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}


/* User Info */
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--bento-text, #2C2420);
}

.exp-info {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--bento-text-muted, #6D5D4F);
}

/* XP Bar - Thick Capsule Shape with CORAL */
.xp-bar-container {
  width: 100%;
  height: 20px;
  border-radius: 7px;
  overflow: hidden;
}

html[data-theme="day"] .xp-bar-container {
  background: var(--showroom-card-bg-day, #F5EDE3);
  box-shadow: 
    inset 2px 2px 4px var(--showroom-shadow-dark-day, #D4C8BD),
    inset -2px -2px 4px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="night"] .xp-bar-container {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
}

.xp-bar {
  position: relative;
  height: 100%;
  border-radius: 7px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-theme="day"] .xp-bar {
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent-soft)); /* LIVING CORAL gradient */
  box-shadow: 0 2px 6px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.4);
}

html[data-theme="night"] .xp-bar {
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent-soft));
  box-shadow: 0 0 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.5);
}

.xp-text {
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
