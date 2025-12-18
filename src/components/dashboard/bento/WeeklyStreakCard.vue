<template>
  <div class="bento-card weekly-streak-card">
    <div class="card-heading">
      <h3 class="card-title">연속 활동</h3>
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
          <!-- M-4: 탭 힌트 (오늘 + 미완료) -->
          <span v-if="day.isToday && !day.completed" class="tap-hint">탭해서 저축!</span>
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
      <span>매일 앱을 방문하면 불꽃이 켜지고 EXP를 받아요!</span>
    </p>
  </div>
</template>

<script setup>
import { computed, defineEmits } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import { useAuthStore } from '../../../stores/authStore'
import AppIcon from '../../common/AppIcon.vue'

const emit = defineEmits(['open-saving-modal'])

const gamificationStore = useGamificationStore()
const authStore = useAuthStore()
const { currentStreak, longestStreak } = storeToRefs(gamificationStore)

const KOREAN_WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일']

const todayIndex = computed(() => {
  // JS 일요일(0) 기준을 월요일(0) 기준으로 변환
  return (new Date().getDay() + 6) % 7
})

/**
 * 백엔드 기준 오늘 스트릭 참여 여부
 * (활동 기반 스트릭)
 */
const rawIsTodayParticipated = computed(() => {
  return !!authStore.user?._raw?.streak?.isTodayParticipated
})

/**
 * 주간 스트릭 상태 계산
 * - 백엔드 weeklyStatus 데이터 우선 사용
 * - 없으면 currentStreak 기반 폴백
 */
const weekDays = computed(() => {
  // 백엔드 weeklyStatus 데이터가 있으면 사용
  const weeklyStatus = authStore.user?._raw?.streak?.weeklyStatus
  if (Array.isArray(weeklyStatus) && weeklyStatus.length === 7) {
    return weeklyStatus.map((status, index) => ({
      label: status.day || KOREAN_WEEK_LABELS[index],
      completed: status.achieved || false,
      isToday: index === todayIndex.value
    }))
  }
  
  // 폴백: currentStreak 기반 계산
  const streakSpan = Math.min(7, Math.max(0, currentStreak.value))
  return KOREAN_WEEK_LABELS.map((label, index) => {
    const distanceFromToday = (todayIndex.value - index + 7) % 7
    const isToday = index === todayIndex.value
    const completed = isToday
      ? rawIsTodayParticipated.value
      : streakSpan > 0 &&
        distanceFromToday > 0 &&
        (rawIsTodayParticipated.value
          ? distanceFromToday < streakSpan
          : distanceFromToday <= streakSpan)

    return { label, completed, isToday }
  })
})

/**
 * 오늘 불꽃 클릭 핸들러
 * [C-1 UX 개선] 저축 모달 열기 이벤트 emit
 * 스트릭은 백엔드에서 활동 시 자동 처리
 */
const handleDayClick = (day) => {
  if (!day.isToday) return
  
  // 저축 모달 열기 이벤트 발생
  emit('open-saving-modal')
}

const dayAriaLabel = (day) => {
  if (day.completed) return `${day.label} 활동 완료`
  if (day.isToday) return `오늘(${day.label}) - 활동하면 불꽃이 켜져요`
  return `${day.label} 예정일`
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

/* M-4: 탭 힌트 스타일 */
.tap-hint {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
  white-space: nowrap;
  animation: tap-bounce 2s ease-in-out infinite;
}

@keyframes tap-bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(-3px);
    opacity: 0.8;
  }
}

.day-item.today {
  position: relative;
  padding-bottom: 1.5rem;
}
</style>
