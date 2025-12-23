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
            <li><strong>집 짓기:</strong> 6단계 (터파기 → 완공)</li>
            <li><strong>인테리어:</strong> 5단계 (집 완공 후)</li>
          </ul>
          <p class="level-info-desc">저축으로 XP를 모아 내 집을 완성하세요!</p>
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
    </div>
  </div>

    <div class="progress-section">
      <div class="progress-top">
        <span class="progress-label">{{ isFurnitureTrack ? '인테리어 진행도' : '레벨 진행도' }}</span>
        <span class="progress-value">{{ progressText }}%</span>
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
          <div class="xp-help-header">
            <span class="xp-help-title">XP 획득 방법</span>
          </div>
          <div class="xp-sources">
            <div class="xp-source-item">
              <div class="xp-source-content">
                <span class="xp-source-label">저축</span>
                <span class="xp-source-value">1만원당 <strong>+1 XP</strong></span>
              </div>
            </div>
            <div class="xp-source-item">
              <div class="xp-source-content">
                <span class="xp-source-label">7일 연속 스트릭</span>
                <span class="xp-source-value"><strong>+50 XP</strong></span>
              </div>
            </div>
          </div>
          <div class="xp-stage-block">
            <p class="xp-stage-title">{{ stageXpTitle }}</p>
            <div class="xp-stage-grid">
              <div v-for="item in stageXpList" :key="item.key" class="xp-stage-item">
                <span class="xp-stage-label">{{ item.label }}</span>
                <span class="xp-stage-value">{{ item.value }} XP</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>


  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../../stores/authStore'
import { SHOWROOM_TOTAL_STAGES } from '../../../constants/showroomWebp'
import { LEVEL_TITLES } from '@/constants/user'
import { normalizeGoalProgress, getStageProgress, getTrackFromPhase, getStageFromPhase, getPhaseLabel, GOAL_PROGRESS_PHASES } from '@/utils/goalProgress'

const authStore = useAuthStore()
const { userName, user } = storeToRefs(authStore)

const goalSnapshot = computed(() => user.value?._raw?.goal || null)
const goalProgress = computed(() => normalizeGoalProgress(goalSnapshot.value))
const currentPhase = computed(() => goalProgress.value.currentPhase || 1)
const totalExp = computed(() => goalProgress.value.totalExp ?? 0)
const targetExp = computed(() => goalProgress.value.targetExp ?? 0)
const expProgress = computed(() => {
  const value = Number(goalProgress.value.expProgress)
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
})

const isFurnitureTrack = computed(() => getTrackFromPhase(currentPhase.value) === 'furniture')
const furnitureStage = computed(() => getStageFromPhase(currentPhase.value))
const furnitureTotalStages = SHOWROOM_TOTAL_STAGES.furniture
const houseStageLabels = Object.keys(LEVEL_TITLES)
  .map(key => Number(key))
  .sort((a, b) => a - b)
  .map(key => LEVEL_TITLES[key])
  .filter(Boolean)

const currentLevel = computed(() => Math.min(SHOWROOM_TOTAL_STAGES.house, Math.max(1, currentPhase.value)))
const levelTitle = computed(() => getPhaseLabel(currentPhase.value, houseStageLabels))

const stageProgress = computed(() => getStageProgress(totalExp.value, targetExp.value, currentPhase.value))
const progressText = computed(() => expProgress.value.toFixed(1))
const currentExpInLevel = computed(() => {
  if (!stageProgress.value) return 0
  return Math.max(0, Math.floor(stageProgress.value.currentInStage))
})
const nextLevelExp = computed(() => {
  if (!stageProgress.value) return 0
  return Math.max(0, Math.ceil(stageProgress.value.requiredForStage))
})
const remainingExp = computed(() => {
  if (!stageProgress.value) return 0
  return Math.max(0, Math.ceil(stageProgress.value.remainingInStage))
})

const userInitial = computed(() => {
  const name = (userName.value || '').trim()
  return name ? name[0] : ''
})

const perStageExp = computed(() => {
  const target = Number(targetExp.value)
  if (!Number.isFinite(target) || target <= 0) return 0
  return target / GOAL_PROGRESS_PHASES.total
})

const resolveStageExp = (phaseIndex) => {
  const target = Number(targetExp.value)
  if (!Number.isFinite(target) || target <= 0) return 0
  const perStage = perStageExp.value
  if (phaseIndex >= GOAL_PROGRESS_PHASES.total) {
    const remainder = target - perStage * (GOAL_PROGRESS_PHASES.total - 1)
    return Math.max(1, Math.ceil(remainder))
  }
  return Math.max(1, Math.ceil(perStage))
}

const houseStageXpList = computed(() => {
  const list = []
  for (let phase = 1; phase < GOAL_PROGRESS_PHASES.house; phase += 1) {
    list.push({
      key: `house-${phase}`,
      label: `Lv.${phase} → ${phase + 1}`,
      value: resolveStageExp(phase)
    })
  }
  return list
})

const furnitureStageXpList = computed(() => {
  const list = []
  for (let stage = 1; stage < GOAL_PROGRESS_PHASES.furniture; stage += 1) {
    const phase = stage + GOAL_PROGRESS_PHASES.house
    list.push({
      key: `furniture-${stage}`,
      label: `단계 ${stage} → ${stage + 1}`,
      value: resolveStageExp(phase)
    })
  }
  return list
})

const stageXpTitle = computed(() => (
  isFurnitureTrack.value ? '인테리어 단계별 필요 XP' : '집 단계별 필요 XP'
))

const stageXpList = computed(() => (
  isFurnitureTrack.value ? furnitureStageXpList.value : houseStageXpList.value
))

// M-6: XP 획득 방법 팝업 상태
const showXpHelp = ref(false)

// M-1: 레벨 설명 팝업 상태
const showLevelInfo = ref(false)
</script>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  grid-area: profile;
  padding: 1.25rem;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
}

.profile-card.bento-card {
  height: auto;
  align-self: start;
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
  gap: 0.85rem;
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
  height: 28px;
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
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
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
  padding: 1rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9));
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 16px;
  box-shadow: 
    0 12px 32px -8px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(8px);
}

html[data-theme="night"] .xp-help-popup {
  background: var(--showroom-card-bg-night, #20242a);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 12px 32px -8px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.xp-help-header {
  margin-bottom: 0.875rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border-soft, #e5e7eb);
}

html[data-theme="night"] .xp-help-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.xp-help-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  letter-spacing: -0.01em;
}

html[data-theme="night"] .xp-help-title {
  color: var(--showroom-text-night, #f5f6f7);
}

.xp-sources {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.xp-source-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.08), rgba(255, 154, 117, 0.04));
  border: 1px solid rgba(255, 107, 61, 0.15);
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.xp-source-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(255, 107, 61, 0.2);
}

html[data-theme="night"] .xp-source-item {
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.12), rgba(255, 154, 117, 0.06));
  border-color: rgba(255, 107, 61, 0.25);
}

.xp-source-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.xp-source-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.xp-source-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-muted, #6b7280);
}

.xp-source-value {
  font-size: 0.8125rem;
  color: var(--ink-base, #1f2937);
}

.xp-source-value strong {
  color: var(--brand-accent, #ff6b3d);
  font-weight: 700;
}

html[data-theme="night"] .xp-source-value {
  color: var(--showroom-text-night, #f5f6f7);
}

.xp-stage-block {
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px dashed var(--border-soft, #e5e7eb);
}

html[data-theme="night"] .xp-stage-block {
  border-top-color: rgba(255, 255, 255, 0.12);
}

.xp-stage-title {
  margin: 0 0 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.xp-stage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.xp-stage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.625rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 0.6875rem;
}

html[data-theme="night"] .xp-stage-item {
  background: rgba(255, 255, 255, 0.04);
}

.xp-stage-label {
  color: var(--ink-muted, #6b7280);
  font-weight: 500;
}

.xp-stage-value {
  color: var(--ink-base, #1f2937);
  font-weight: 700;
}

html[data-theme="night"] .xp-stage-value {
  color: var(--showroom-text-night, #f5f6f7);
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

.xp-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: var(--surface-card-bg, #ffffff);
}

html[data-theme="night"] .xp-summary {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.xp-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.xp-summary-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .xp-summary-title {
  color: var(--showroom-text-night, #f5f6f7);
}

.xp-summary-caption {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
}

/* heading-actions */
.heading-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* More Menu */
.more-menu-wrapper {
  position: relative;
}

.more-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--bento-text-muted, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-menu-btn:hover {
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .more-menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-text-night, #f5f6f7);
}

.more-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 100;
  min-width: 180px;
  padding: 0.5rem;
  background: var(--surface-elevated, #ffffff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  box-shadow: 
    0 12px 32px -8px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.04);
}

html[data-theme="night"] .more-menu-dropdown {
  background: var(--surface-elevated, #2d3139);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 12px 32px -8px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.2);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-base, #1f2937);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.menu-item:hover:not(:disabled) {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
  color: var(--brand-accent, #ff6b3d);
}

.menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

html[data-theme="night"] .menu-item {
  color: var(--showroom-text-night, #f5f6f7);
}

html[data-theme="night"] .menu-item:hover:not(:disabled) {
  background: rgba(255, 107, 61, 0.12);
  color: #ff9a75;
}

/* Dropdown 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
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
