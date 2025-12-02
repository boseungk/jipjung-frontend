<template>
  <div class="bento-card weekly-streak-card">
    <div class="card-heading">
      <h3 class="card-title">연속 저축</h3>
      <span class="streak-badge">주간</span>
    </div>

    <!-- Week Days Circles -->
    <div class="days-grid">
      <button
        v-for="(day, index) in weekDays"
        :key="index"
        type="button"
        class="day-circle"
        :class="{ active: day.completed, today: day.isToday }"
        :aria-label="dayAriaLabel(day)"
        :title="dayAriaLabel(day)"
        @click="handleDayClick(day)"
      >
        <AppIcon v-if="day.completed" name="check" :size="16" :active="true" :is-major-cta="true" aria-hidden="true" />
        <AppIcon v-else-if="!day.isToday" name="lockSimple" :size="14" class="lock-icon" aria-hidden="true" />
        <span v-else class="day-label">{{ day.label }}</span>
      </button>
    </div>
    
    <!-- Streak Count -->
    <div class="streak-info">
      <span class="streak-icon"><AppIcon name="fire" :size="24" :active="true" :is-major-cta="true" /></span>
      <span class="streak-count">{{ currentStreak }}일 연속</span>
      <span class="streak-sub">최장 {{ longestStreak }}일</span>
    </div>

    <p class="streak-hint">
      <AppIcon name="info" :size="16" :active="true" class="hint-icon" aria-hidden="true" />
      <span>오늘 체크하면 +50 XP, 자물쇠는 아직 열리지 않은 날을 뜻해요.</span>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import confetti from 'canvas-confetti'

const gamificationStore = useGamificationStore()
const { currentStreak, longestStreak } = storeToRefs(gamificationStore)

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

const dayAriaLabel = (day) => {
  if (day.completed) return `${day.label} 저축 완료`
  if (day.isToday) return `오늘(${day.label}) 체크하기`
  return `${day.label} 예정일`
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
  gap: 0.8rem;
  min-height: 240px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.streak-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--surface-muted, #f3f4f6);
  color: var(--bento-text-muted, #6b7280);
  font-size: 0.75rem;
  font-weight: 700;
}

/* Days Grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.45rem;
}

.day-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  border: 1px solid var(--border-soft, #e5e7eb);
  color: var(--bento-text-muted, #6b7280);
  padding: 0;
  line-height: 1;
}

/* Inactive State - IMPROVED VISIBILITY */
.day-circle:not(.active) {
  opacity: 0.8;
}

html[data-theme="night"] .day-circle:not(.active) {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.04);
}

/* Active State - CORAL ACCENT */
.day-circle.active {
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-soft)); /* CORAL */
  color: white;
  border: none;
  box-shadow: 0 8px 16px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

html[data-theme="night"] .day-circle.active {
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong));
  box-shadow: 0 10px 18px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

/* Today Highlight - CORAL */
.day-circle.today:not(.active) {
  border-color: var(--brand-accent);
  color: var(--brand-accent);
  opacity: 1;
  border-width: 2px;
}

@media (max-width: 767px) {
  .day-circle {
    width: 40px;
    height: 40px;
    font-size: 0.72rem;
  }
}

html[data-theme="night"] .day-circle.today:not(.active) {
  border-color: var(--brand-accent);
  color: var(--brand-accent);
}

.day-circle:hover:not(.active) {
  opacity: 1;
  transform: translateY(-1px);
}

/* Lock Icon for Future Days */
.lock-icon {
  opacity: 0.6;
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
  color: var(--bento-text, #1f2937);
}

.streak-sub {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
}

html[data-theme="night"] .streak-count {
  color: var(--showroom-text-night, #f5f6f7);
}

.streak-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--bento-text-muted, #6b7280);
}

.hint-icon {
  color: var(--brand-accent, #ff6b3d);
}
</style>
