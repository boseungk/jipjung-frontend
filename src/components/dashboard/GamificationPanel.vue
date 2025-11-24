<template>
  <div class="gamification-panel">
    <!-- Level Section -->
    <div class="level-section">
      <div class="level-icon">🌟</div>
      <div class="level-info">
        <div class="level-header">
          <span class="level-text">Level {{ currentLevel }}</span>
          <span class="level-divider">:</span>
          <span class="level-title">{{ levelTitle }}</span>
        </div>
        <div class="exp-container">
          <div 
            class="exp-bar"
            :style="{ width: expProgress + '%' }"
            role="progressbar"
            :aria-valuenow="expProgress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`경험치 ${expProgress}%`"
          ></div>
        </div>
        <div class="exp-text">
          {{ experiencePoints }} / {{ nextLevelExp }} EXP ({{ expProgress }}%)
        </div>
      </div>
    </div>
    
    <!-- Streak Section -->
    <div class="streak-section">
      <div class="streak-icon">🔥</div>
      <div class="streak-info">
        <span class="streak-text">연속 저축: {{ currentStreak }}일</span>
        <span class="streak-divider">|</span>
        <span class="streak-record">최장: {{ longestStreak }}일</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGamificationStore } from '../../stores/gamificationStore'

const gamificationStore = useGamificationStore()

const props = defineProps({
  currentLevel: {
    type: Number,
    required: true
  },
  levelTitle: {
    type: String,
    required: true
  },
  experiencePoints: {
    type: Number,
    required: true
  },
  nextLevelExp: {
    type: Number,
    required: true
  },
  expProgress: {
    type: [String, Number],
    required: true
  },
  currentStreak: {
    type: Number,
    required: true
  },
  longestStreak: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.gamification-panel {
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode */
html[data-theme="day"] .gamification-panel {
  background: var(--showroom-card-bg-day);
  box-shadow:
    8px 8px 16px var(--showroom-shadow-dark-day),
    -8px -8px 16px var(--showroom-shadow-light-day);
}

/* Night Mode */
html[data-theme="night"] .gamification-panel {
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

/* Level Section */
.level-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.level-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.level-info {
  flex: 1;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
}

.level-text {
  font-weight: 700;
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .level-text {
  color: var(--showroom-accent-night, #D4A574);
}

.level-divider {
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.5;
}

html[data-theme="night"] .level-divider {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.level-title {
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .level-title {
  color: var(--showroom-text-night, #F5EDE3);
}

/* EXP Bar */
.exp-container {
  position: relative;
  width: 100%;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

html[data-theme="day"] .exp-container {
  background: var(--showroom-card-bg-day);
  box-shadow:
    inset 3px 3px 6px var(--showroom-shadow-dark-day),
    inset -3px -3px 6px var(--showroom-shadow-light-day);
}

html[data-theme="night"] .exp-container {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
}

.exp-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .exp-bar {
  background: #81C784;
  box-shadow: 0 2px 6px rgba(129, 199, 132, 0.3);
}

html[data-theme="night"] .exp-bar {
  background: #81C784;
  box-shadow: 0 0 16px rgba(129, 199, 132, 0.5);
}

.exp-text {
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .exp-text {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Streak Section */
.streak-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
}

html[data-theme="day"] .streak-section {
  background: rgba(255, 152, 0, 0.1);
}

html[data-theme="night"] .streak-section {
  background: rgba(255, 152, 0, 0.15);
}

.streak-icon {
  font-size: 2rem;
  animation: flicker 2s infinite;
  flex-shrink: 0;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.streak-text {
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .streak-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.streak-divider {
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.5;
}

html[data-theme="night"] .streak-divider {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.streak-record {
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .streak-record {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Responsive */
@media (max-width: 767px) {
  .gamification-panel {
    padding: 1.5rem;
  }
  
  .level-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .streak-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .streak-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .streak-divider {
    display: none;
  }
}
</style>
