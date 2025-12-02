<template>
  <div class="bento-card profile-card">
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
          <span class="level-chip">
            <AppIcon name="star" :size="14" :active="true" :is-major-cta="true" class="level-icon" aria-hidden="true" />
            Lv.{{ currentLevel }} · {{ levelTitle }}
          </span>
        </div>
        <div class="exp-row">
          <div class="exp-info">{{ experiencePoints }} / {{ nextLevelExp }} XP</div>
          <div class="exp-remaining">다음 레벨까지 {{ remainingExp }} XP</div>
        </div>
      </div>
    </div>
    
    <!-- XP Bar -->
    <div class="xp-bar-container" role="progressbar" :aria-valuenow="Number(expProgress)" aria-valuemin="0" aria-valuemax="100">
      <div class="xp-bar" :style="{ width: expProgress + '%' }">
        <span class="xp-text">{{ expProgress }}%</span>
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
  gap: 1.2rem;
  grid-area: profile;
  padding: 1.75rem 1.75rem 1.5rem;
}

.card-layout {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

/* Avatar */
.avatar-section {
  flex-shrink: 0;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 154, 117, 0.08));
  border: 1px solid var(--border-soft, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

html[data-theme="night"] .avatar-circle {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.avatar-initial {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

/* User Info */
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.1rem;
}

.username {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--bento-text, #1f2937);
}

.level-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-base, #1f2937);
  font-size: 0.8125rem;
  font-weight: 700;
  border: 1px solid var(--border-soft, #e5e7eb);
}

.level-icon {
  margin-right: -0.05rem;
}

.exp-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.1rem;
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
  height: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.08));
  border: 1px solid var(--border-soft, #e5e7eb);
  margin-top: 0.35rem;
}

html[data-theme="night"] .xp-bar-container {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.xp-bar {
  position: relative;
  height: 100%;
  border-radius: 12px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent-soft));
  box-shadow: 0 6px 14px -8px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.6);
}

.xp-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.18));
  mix-blend-mode: screen;
  pointer-events: none;
}

.xp-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}
</style>
