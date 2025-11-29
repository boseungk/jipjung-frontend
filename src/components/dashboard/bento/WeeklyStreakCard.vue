<template>
  <div class="bento-card weekly-streak-card">
    <h3 class="card-title">연속 저축</h3>

    <!-- Week Days Circles -->
    <div class="days-grid">
      <div
        v-for="(day, index) in weekDays"
        :key="index"
        class="day-circle"
        :class="{ active: day.completed, today: day.isToday }"
        @click="handleDayClick(day)"
      >
        <span v-if="day.completed" class="check-icon"><PhCheck :size="16" weight="bold" color="white" /></span>
        <span v-else-if="!day.isToday" class="lock-icon"><PhLockSimple :size="12" weight="bold" /></span>
        <span v-else class="day-label">{{ day.label }}</span>
      </div>
    </div>
    
    <!-- Streak Count -->
    <div class="streak-info">
      <span class="streak-icon"><AppIcon name="fire" :size="24" :active="true" :is-major-cta="true" /></span>
      <span class="streak-count">{{ currentStreak }}일 연속</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import confetti from 'canvas-confetti'
import { PhCheck, PhLockSimple } from '@phosphor-icons/vue'

const gamificationStore = useGamificationStore()
const { currentStreak } = storeToRefs(gamificationStore)

const weekDays = ref([
  { label: '월', completed: true, isToday: false },
  { label: '화', completed: true, isToday: false },
  { label: '수', completed: true, isToday: false },
  { label: '목', completed: true, isToday: false },
  { label: '금', completed: false, isToday: true },
  { label: '토', completed: false, isToday: false },
  { label: '일', completed: false, isToday: false }
])

const handleDayClick = (day) => {
  if (day.isToday && !day.completed) {
    day.completed = true
    triggerConfetti()
  }
}

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#D4A574', '#E8C9A1', '#F5EDE3']
  })
}
</script>

<style scoped>
.weekly-streak-card {
  grid-area: streak;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Days Grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-circle {
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Inactive State - IMPROVED VISIBILITY */
.day-circle:not(.active) {
  border: 2.5px solid var(--showroom-text-secondary-day, #8D6E63);
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.6;
}

html[data-theme="night"] .day-circle:not(.active) {
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.55);
  opacity: 0.7;
}

/* Active State - CORAL ACCENT */
.day-circle.active {
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong)); /* LIVING CORAL */
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.4);
}

html[data-theme="night"] .day-circle.active {
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong));
  box-shadow: 0 2px 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.5);
}

/* Today Highlight - CORAL */
.day-circle.today:not(.active) {
  border-color: var(--brand-accent); /* CORAL */
  color: var(--brand-accent);
  opacity: 1;
  border-width: 3px;
}

html[data-theme="night"] .day-circle.today:not(.active) {
  border-color: var(--brand-accent);
  color: var(--brand-accent);
}

.day-circle:hover:not(.active) {
  opacity: 1;
  transform: scale(1.1);
}

/* Lock Icon for Future Days */
.lock-icon {
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-theme="night"] .lock-icon {
  opacity: 0.6;
}

/* Streak Info */
.streak-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: transparent;
}

.streak-icon {
  animation: flicker 2s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.streak-count {
  font-size: 1rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .streak-count {
  color: var(--showroom-text-night, #F5EDE3);
}
</style>
