<template>
  <div class="bento-card weekly-streak-card">
    <div class="card-heading">
      <h3 class="card-title">연속 저축</h3>
      <span class="streak-badge">주간</span>
    </div>

    <!-- Week Days with Flames -->
    <div class="days-grid">
      <button
        v-for="(day, index) in weekDays"
        :key="index"
        type="button"
        class="day-item"
        :class="{ active: day.completed, today: day.isToday, future: !day.completed && !day.isToday }"
        :aria-label="dayAriaLabel(day)"
        :title="dayAriaLabel(day)"
        @click="handleDayClick(day)"
      >
        <div class="day-content">
          <AppIcon 
            v-if="day.completed" 
            name="fire" 
            :size="28" 
            weight="fill"
            :active="true" 
            :is-major-cta="true" 
            class="flame-icon active-flame"
            aria-hidden="true" 
          />
          <AppIcon 
            v-else-if="day.isToday" 
            name="fire" 
            :size="26" 
            weight="fill"
            color="#FFB800"
            class="flame-icon today-flame"
            aria-hidden="true" 
          />
          <div v-else class="future-dot"></div>
          <span class="day-label">{{ day.label }}</span>
        </div>
      </button>
    </div>
    
    <!-- Streak Count with Fire Badge -->
    <div class="streak-info">
      <div class="fire-badge">
        <span class="streak-icon"><AppIcon name="fire" :size="24" :active="true" :is-major-cta="true" /></span>
      </div>
      <div class="streak-text">
        <span class="streak-count">{{ currentStreak }}일 연속</span>
        <span class="streak-sub">최장 {{ longestStreak }}일</span>
      </div>
    </div>

    <p class="streak-hint">
      <AppIcon name="info" :size="16" :active="true" class="hint-icon" aria-hidden="true" />
      <span>오늘 불꽃을 켜면 +50 XP를 받을 수 있어요!</span>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import confetti from 'canvas-confetti'
import AppIcon from '../../common/AppIcon.vue'

const gamificationStore = useGamificationStore()
const { currentStreak, longestStreak } = storeToRefs(gamificationStore)

const KOREAN_WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const isSaving = ref(false)
const todayIndex = computed(() => {
  // JS 일요일(0) 기준을 월요일(0) 기준으로 변환
  return (new Date().getDay() + 6) % 7
})

const weekDays = computed(() => {
  const streakSpan = Math.min(7, Math.max(0, currentStreak.value))
  return KOREAN_WEEK_LABELS.map((label, index) => {
    const distanceFromToday = (todayIndex.value - index + 7) % 7
    const isToday = index === todayIndex.value
    const completed = streakSpan > 0 && distanceFromToday < streakSpan

    return { label, completed, isToday }
  })
})

const handleDayClick = async (day) => {
  if (!day.isToday || day.completed || isSaving.value) return
  isSaving.value = true
  try {
    await gamificationStore.incrementStreak()
    triggerConfetti()
  } catch (error) {
    console.error('오늘 스트릭 체크 실패', error)
  } finally {
    isSaving.value = false
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
  gap: 1rem;
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
  display: flex;
  justify-content: space-between;
  gap: 0.35rem;
  padding: 0.25rem 0;
}

.day-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: transparent;
  border: none;
  padding: 0.5rem 0.25rem;
  border-radius: 8px;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.day-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
  transition: color 0.2s ease;
}

/* Flame Icons */
.flame-icon {
  transition: all 0.3s ease;
}

.active-flame {
  filter: drop-shadow(0 2px 8px rgba(255, 107, 61, 0.5));
  animation: flame-flicker 2s ease-in-out infinite;
}

@keyframes flame-flicker {
  0%, 100% {
    filter: drop-shadow(0 2px 8px rgba(255, 107, 61, 0.5));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 3px 12px rgba(255, 107, 61, 0.7));
    transform: scale(1.08);
  }
}

.today-flame {
  filter: drop-shadow(0 2px 10px rgba(255, 184, 0, 0.5));
  animation: pulse-flame 2s ease-in-out infinite;
  color: #FFB800 !important;
}

.today-flame :deep(svg) {
  color: #FFB800 !important;
  fill: #FFB800 !important;
}

.today-flame :deep(path) {
  color: #FFB800 !important;
  fill: #FFB800 !important;
}

@keyframes pulse-flame {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 2px 10px rgba(255, 184, 0, 0.5));
    transform: scale(1);
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 3px 14px rgba(255, 184, 0, 0.7));
    transform: scale(1.1);
  }
}

.future-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-soft, #e5e7eb);
  opacity: 0.5;
}

/* Active State */
.day-item.active .day-label {
  color: var(--brand-accent, #ff6b3d);
  font-weight: 700;
}

/* Today State */
.day-item.today {
  background: linear-gradient(
    135deg,
    rgba(255, 184, 0, 0.08) 0%,
    rgba(255, 200, 50, 0.05) 100%
  );
  border-radius: 8px;
}

.day-item.today .day-label {
  color: #FFB800;
  font-weight: 700;
}

/* Hover States */
.day-item:hover {
  background: rgba(255, 107, 61, 0.04);
}

.day-item.active:hover .active-flame {
  filter: drop-shadow(0 4px 14px rgba(255, 107, 61, 0.8));
  transform: scale(1.12);
}

.day-item.today:hover .today-flame {
  opacity: 1;
  transform: scale(1.15);
}

html[data-theme="night"] .future-dot {
  background: rgba(255, 255, 255, 0.2);
  opacity: 0.4;
}

@media (max-width: 767px) {
  .flame-icon {
    font-size: 1.25rem;
  }
  
  .day-label {
    font-size: 0.7rem;
  }
}

/* Streak Info */
.streak-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
}

.fire-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 61, 0.12) 0%,
    rgba(255, 154, 117, 0.08) 100%
  );
  border: 2px solid rgba(255, 107, 61, 0.2);
  box-shadow: 
    0 4px 14px rgba(255, 107, 61, 0.15),
    inset 0 2px 6px rgba(255, 255, 255, 0.3);
}

html[data-theme="night"] .fire-badge {
  background: linear-gradient(
    135deg,
    rgba(255, 107, 61, 0.18) 0%,
    rgba(255, 154, 117, 0.12) 100%
  );
  border-color: rgba(255, 107, 61, 0.3);
  box-shadow: 
    0 6px 20px rgba(255, 107, 61, 0.25),
    inset 0 2px 8px rgba(255, 255, 255, 0.1);
}

.streak-icon {
  animation: glow-pulse 2.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { 
    filter: drop-shadow(0 0 4px rgba(255, 107, 61, 0.6));
    transform: scale(1);
  }
  50% { 
    filter: drop-shadow(0 0 8px rgba(255, 107, 61, 0.8));
    transform: scale(1.05);
  }
}

.streak-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.streak-count {
  font-size: 1rem;
  font-weight: 800;
  color: var(--bento-text, #1f2937);
  letter-spacing: -0.01em;
}

.streak-sub {
  font-size: 0.8125rem;
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
