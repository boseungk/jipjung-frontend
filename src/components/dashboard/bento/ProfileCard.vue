<template>
  <div class="bento-card profile-card">
    <!-- Level Badge - MOVED FROM HERO -->
    <div class="level-badge">
      <span class="level-icon">⭐</span>
      <span class="level-text">Lv.{{ currentLevel }} {{ levelTitle }}</span>
    </div>
    
    <div class="card-layout">
      <!-- Avatar -->
      <div class="avatar-section">
        <div class="avatar-circle">
          <span class="avatar-emoji">👤</span>
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
  gap: 1rem;
  grid-area: profile;
}

/* Level Badge - ACCENT COLOR */
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #FF7F50, #FF6347); /* LIVING CORAL */
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.3);
  align-self: flex-start;
}

.level-icon {
  font-size: 1rem;
}

.level-text {
  white-space: nowrap;
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

.avatar-emoji {
  font-size: 2rem;
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
  color: #2C2420; /* DARKER for contrast */
}

html[data-theme="night"] .username {
  color: var(--showroom-text-night, #F5EDE3);
}

.exp-info {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #999; /* LIGHTER for hierarchy */
}

html[data-theme="night"] .exp-info {
  color: rgba(255, 255, 255, 0.5);
}

/* XP Bar - Thick Capsule Shape with CORAL */
.xp-bar-container {
  width: 100%;
  height: 14px;
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
  background: linear-gradient(90deg, #FF7F50, #FF6B6B); /* LIVING CORAL gradient */
  box-shadow: 0 2px 6px rgba(255, 127, 80, 0.4);
}

html[data-theme="night"] .xp-bar {
  background: linear-gradient(90deg, #FF7F50, #FF6B6B);
  box-shadow: 0 0 12px rgba(255, 127, 80, 0.5);
}

.xp-text {
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
