<template>
  <div class="bento-card profile-card">
    <div class="card-heading">
      <div class="title-stack">
        <p class="eyebrow">내 계정</p>
        <h3 class="card-title">프로필</h3>
      </div>
      <span class="level-chip heading-level">
        <AppIcon name="star" :size="14" :active="true" :is-major-cta="true" class="level-icon" aria-hidden="true" />
        Lv.{{ currentLevel }} · {{ levelTitle }}
      </span>
    </div>
    <div class="card-layout">
      <!-- Avatar -->
      <div class="avatar-section">
        <div class="avatar-circle" :aria-label="`${userName} 아바타`">
          <span v-if="userInitial" class="avatar-initial">{{ userInitial }}</span>
          <AppIcon v-else name="user" :size="28" />
        </div>
      </div>
      
      <!-- User Info -->
      <div class="user-info">
        <div class="user-row">
          <div class="username">{{ userName }} 님</div>
        </div>
        <p class="user-note">목표를 향해 천천히, 꾸준히 가고 있어요</p>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-top">
        <span class="progress-label">레벨 진행도</span>
        <span class="progress-value">{{ expProgress }}%</span>
      </div>
      <div class="xp-bar-container" role="progressbar" :aria-valuenow="Number(expProgress)" aria-valuemin="0" aria-valuemax="100">
        <div class="xp-bar" :style="{ width: expProgress + '%' }">
          <span class="xp-text">{{ expProgress }}%</span>
        </div>
      </div>
      <div class="exp-row">
        <div class="exp-info">{{ experiencePoints }} / {{ nextLevelExp }} XP</div>
        <div class="exp-remaining">다음 레벨까지 {{ remainingExp }} XP</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import { useAuthStore } from '../../../stores/authStore'

const gamificationStore = useGamificationStore()
const { currentLevel, levelTitle, expProgress, experiencePoints, nextLevelExp, remainingExp } = storeToRefs(gamificationStore)

const authStore = useAuthStore()
const { userName } = storeToRefs(authStore)

const userInitial = computed(() => {
  const name = (userName.value || '').trim()
  return name ? name[0] : ''
})
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  grid-area: profile;
  padding: 1.25rem;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.title-stack {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bento-text-muted, #6b7280);
}

.card-layout {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

/* Avatar */
.avatar-section {
  flex-shrink: 0;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 154, 117, 0.08));
  border: 1px solid var(--border-soft, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-shadow: 0 10px 30px -18px rgba(17, 24, 39, 0.3);
}

html[data-theme="night"] .avatar-circle {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.avatar-initial {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

/* User Info */
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.username {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--bento-text, #1f2937);
}

.level-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-base, #1f2937);
  font-size: 0.8125rem;
  font-weight: 700;
  border: 1px solid var(--border-soft, #e5e7eb);
}

.heading-level {
  padding: 0.35rem 0.75rem;
  box-shadow: 0 6px 18px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.level-icon {
  margin-right: -0.05rem;
}

.user-note {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--bento-text-muted, #6b7280);
  line-height: 1.4;
}

.exp-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}

.exp-info {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
}

.exp-remaining {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
}

/* XP Bar */
.xp-bar-container {
  width: 100%;
  height: 36px;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(0, 0, 0, 0.02));
  border: 1px solid var(--border-soft, #e5e7eb);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.06);
  position: relative;
}

html[data-theme="night"] .xp-bar-container {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.04));
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
}

.xp-bar {
  position: relative;
  height: 100%;
  border-radius: 13px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, 
    var(--brand-accent) 0%, 
    var(--brand-accent-soft) 50%,
    var(--brand-accent) 100%
  );
  box-shadow: 
    0 4px 12px -4px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.5),
    0 2px 6px -2px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.xp-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(0, 0, 0, 0.08) 100%
  );
  pointer-events: none;
}

.xp-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    rgba(255, 255, 255, 0.3) 40%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.3) 60%,
    transparent 80%
  );
  animation: shimmer 3s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.xp-text {
  position: relative;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
  border: 1px solid var(--border-soft, #e5e7eb);
  box-shadow: 0 12px 28px -24px rgba(17, 24, 39, 0.3);
}

html[data-theme="night"] .progress-section {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.progress-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6b7280);
}

.progress-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .progress-value {
  color: var(--showroom-text-night, #f5f6f7);
}

html[data-theme="night"] .user-note {
  color: var(--bento-text-muted, #9CA3AF);
}
</style>
