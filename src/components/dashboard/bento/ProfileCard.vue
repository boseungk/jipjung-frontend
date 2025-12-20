<template>
  <div class="bento-card profile-card">
    <div class="card-heading">
      <div class="title-stack">
        <p class="eyebrow">내 계정</p>
        <h3 class="card-title">프로필</h3>
      </div>
      <!-- M-1: Level chip with tooltip -->
      <button 
        type="button" 
        class="level-chip heading-level" 
        @click="showLevelInfo = !showLevelInfo"
        :aria-expanded="showLevelInfo"
        aria-label="레벨 설명 보기"
      >
        <AppIcon
          :name="isFurnitureTrack ? 'confetti' : 'star'"
          :size="14"
          :active="true"
          :is-major-cta="true"
          class="level-icon"
          aria-hidden="true"
        />
        <template v-if="isFurnitureTrack">
          인테리어 {{ furnitureStage }} / {{ furnitureTotalStages }}
        </template>
        <template v-else>
          Lv.{{ currentLevel }} · {{ levelTitle }}
        </template>
      </button>
      <!-- M-1: Level Info Tooltip -->
      <Transition name="fade">
        <div v-if="showLevelInfo" class="level-info-popup">
          <p class="level-info-title">레벨 시스템 안내</p>
          <ul class="level-info-list">
            <li><strong>Lv.1~3:</strong> 기초 단계 (씨앗 심기)</li>
            <li><strong>Lv.4~6:</strong> 성장 단계 (뿌리 내리기)</li>
            <li><strong>Lv.7~9:</strong> 발전 단계 (꽃 피우기)</li>
            <li><strong>Lv.10+:</strong> 마스터 단계 (열매 맺기)</li>
          </ul>
          <p class="level-info-desc">저축을 통해 XP를 쌓고 레벨업하세요!</p>
        </div>
      </Transition>
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
        <span class="progress-label">{{ isFurnitureTrack ? '인테리어 진행도' : '레벨 진행도' }}</span>
        <span class="progress-value">{{ expProgress }}%</span>
      </div>
      <div class="xp-bar-container" role="progressbar" :aria-valuenow="Number(expProgress)" aria-valuemin="0" aria-valuemax="100">
        <div class="xp-bar" :style="{ width: expProgress + '%' }">
        </div>
      </div>
      <div class="exp-row">
        <div class="exp-info">
          {{ currentExpInLevel }} / {{ nextLevelExp }} XP
          <!-- M-6: XP 획득 방법 툴팁 -->
          <button
            type="button"
            :class="['xp-help-trigger', { 'is-open': showXpHelp }]"
            @click="showXpHelp = !showXpHelp"
            :aria-label="showXpHelp ? 'XP 획득 방법 닫기' : 'XP 획득 방법'"
          >
            <AppIcon
              name="question"
              :size="10"
              weight="bold"
              color="currentColor"
              customClass="xp-help-trigger__icon"
              aria-hidden="true"
              focusable="false"
            />
          </button>
        </div>
        <div class="exp-remaining">
          {{ isFurnitureTrack ? '다음 단계까지' : '다음 레벨까지' }} {{ remainingExp }} XP
        </div>
      </div>
      <!-- M-6: XP 획득 방법 팝업 -->
      <Transition name="fade">
        <div v-if="showXpHelp" class="xp-help-popup">
          <ul class="xp-help-list">
            <li><strong>매일 접속</strong> +5 XP</li>
            <li><strong>저축 1만원당</strong> +1 XP</li>
            <li><strong>목표 달성</strong> +100 XP</li>
            <li><strong>7일 연속 스트릭</strong> +50 XP</li>
          </ul>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '../../../stores/gamificationStore'
import { useAuthStore } from '../../../stores/authStore'
import { SHOWROOM_TOTAL_STAGES } from '../../../constants/showroomWebp'

const gamificationStore = useGamificationStore()
const { buildTrack, furnitureStage, currentLevel, levelTitle, expProgress, currentExpInLevel, nextLevelExp, remainingExp } = storeToRefs(gamificationStore)

const authStore = useAuthStore()
const { userName } = storeToRefs(authStore)

const isFurnitureTrack = computed(() => buildTrack.value === 'furniture')
const furnitureTotalStages = SHOWROOM_TOTAL_STAGES.furniture

const userInitial = computed(() => {
  const name = (userName.value || '').trim()
  return name ? name[0] : ''
})

// M-6: XP 획득 방법 팝업 상태
const showXpHelp = ref(false)

// M-1: 레벨 설명 팝업 상태
const showLevelInfo = ref(false)
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
  position: relative;
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

html[data-theme="night"] .avatar-initial {
  color: var(--showroom-text-night, #f5f6f7);
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

html[data-theme="night"] .username {
  color: var(--showroom-text-night, #f9fafb);
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

html[data-theme="night"] .level-chip {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--showroom-text-night, #f9fafb);
}

.heading-level {
  padding: 0.35rem 0.75rem;
  box-shadow: 0 6px 18px -10px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

html[data-theme="night"] .heading-level {
  background: rgba(255, 107, 61, 0.16);
  border-color: rgba(255, 107, 61, 0.3);
  color: #ff9a75;
  box-shadow: 0 8px 20px -10px rgba(255, 107, 61, 0.35);
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

/* M-6: XP 획득 방법 */
.xp-help-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 0.35rem;
  border: none;
  border-radius: 50%;
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-muted, #6b7280);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.xp-help-trigger :deep(.xp-help-trigger__icon) {
  transition: opacity 0.15s ease;
}

.xp-help-trigger:hover {
  background: var(--brand-accent-soft, #ffe4d9);
  color: var(--brand-accent, #ff6b3d);
  transform: scale(1.1);
}

.xp-help-trigger.is-open {
  background: var(--brand-accent, #ff6b3d);
  color: #fff;
  transform: none;
}

.xp-help-trigger.is-open :deep(.xp-help-trigger__icon) {
  opacity: 0;
}

.xp-help-popup {
  margin-top: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--surface-card-bg, #fff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .xp-help-popup {
  background: var(--surface-card-bg, #1f2937);
  border-color: var(--border-soft, #374151);
}

.xp-help-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .xp-help-list {
  color: var(--showroom-text-night, #f5f6f7);
}

.xp-help-list li {
  display: flex;
  justify-content: space-between;
}

.xp-help-list strong {
  color: var(--ink-muted, #6b7280);
}

/* M-1: Level Info Popup */
.level-info-popup {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  z-index: 100;
  width: 260px;
  padding: 1rem;
  background: var(--surface-elevated, #ffffff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.15);
}

html[data-theme="night"] .level-info-popup {
  background: var(--surface-elevated, #2d3139);
  border-color: rgba(255, 255, 255, 0.1);
}

.level-info-title {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .level-info-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.level-info-list {
  margin: 0 0 0.75rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .level-info-list {
  color: var(--showroom-text-night, #F5EDE3);
}

.level-info-list strong {
  color: var(--brand-accent, #ff6b3d);
  margin-right: 0.35rem;
}

.level-info-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--bento-text-muted, #9ca3af);
}

/* Fade 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
