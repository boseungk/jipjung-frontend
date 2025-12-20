<template>
  <div class="ai-manager-view">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">AI 관리실</h1>
      <p class="page-subtitle">레제가 당신의 지출을 관리합니다</p>
    </div>

    <!-- Main Content: Left-Right Split Layout -->
    <div class="manager-container">
      <!-- Left Sidebar (30%) -->
      <aside class="sidebar">
        <!-- Character Profile Card -->
        <div class="profile-card card">
          <div class="character-image-wrapper">
            <img 
              :src="rezeImageUrl"
              alt="레제" 
              class="character-image"
            />
            <div class="character-badge" :class="badgeClass">
              {{ statusEmoji }}
            </div>
          </div>
          
          <div class="character-info">
            <h2 class="character-name">관리인 레제</h2>
            <p class="character-status" :class="statusClass">
              상태: {{ statusText }}
            </p>
          </div>
        </div>

        <!-- Receipt Info Card (After Analysis) -->
        <div v-if="receiptInfo" class="receipt-card card">
          <h3 class="receipt-label">영수증 정보</h3>
          <div class="receipt-amount">₩{{ formatAmount(receiptInfo.amount) }}</div>
          <div class="receipt-details">
            <p class="receipt-merchant">
              {{ receiptInfo.storeName }}
              ({{ receiptInfo.categoryLabel }})
            </p>
            <p class="receipt-date">{{ receiptInfo.paymentDate }}</p>
          </div>
        </div>

        <!-- Input Trigger Card (Idle State) -->
        <button
          v-else-if="aiManagerStore.isIdle"
          type="button"
          class="input-trigger-card card"
          aria-label="지출 등록하기"
          @click="openInputModal"
        >
          <AppIcon name="receipt" :size="48" weight="duotone" />
          <p class="trigger-text">클릭하여 지출 등록하기</p>
          <p class="trigger-subtext">📷 영수증 촬영 또는 ✏️ 수기 입력</p>
        </button>

        <!-- Processing Card (Non-idle without receipt) -->
        <div v-else class="processing-card card">
          <p class="processing-title">진행 중</p>
          <p class="processing-subtitle">{{ sidebarStatusText }}</p>
        </div>
      </aside>

      <!-- Right Chat Area (70%) -->
      <main class="chat-area">
        <!-- Time Indicator -->
        <div class="time-indicator">
          오늘 {{ currentTimeDisplay }}
        </div>

        <!-- Chat Content -->
        <div class="chat-content">
          <!-- AI Message -->
          <div class="messages-container">
            <div class="message message-ai">
              <div class="message-avatar">레제</div>
              <div class="message-bubble">
                {{ aiMessageText }}
              </div>
            </div>
          </div>

          <!-- ANALYZED State: Excuse Selection -->
          <ExcuseSelector
            v-if="aiManagerStore.isAnalyzed"
            :excuses="aiManagerStore.suggestedExcuses"
          />

          <!-- JUDGED State: Result Display -->
          <JudgmentResult
            v-else-if="aiManagerStore.isJudged"
            :judgment="aiManagerStore.judgmentResult?.judgment"
            :growth="aiManagerStore.judgmentResult?.growth"
            @newEntry="handleNewEntry"
            @viewHistory="toggleHistoryView"
          />

          <!-- Error Message -->
          <div v-if="aiManagerStore.error" class="error-banner">
            <AppIcon name="warningCircle" :size="16" weight="fill" />
            <span>{{ aiManagerStore.error }}</span>
            <button type="button" @click="aiManagerStore.clearError()">✕</button>
          </div>
        </div>

        <!-- History Section (Toggle) -->
        <div v-if="showHistory" class="history-section">
          <HistoryList />
        </div>
      </main>
    </div>

    <!-- SpendingInputModal -->
    <SpendingInputModal
      :isOpen="isInputModalOpen"
      @close="closeInputModal"
    />

    <!-- Loading Overlay -->
    <LoadingOverlay
      :isVisible="aiManagerStore.isOverlayLoading"
      :type="aiManagerStore.overlayType"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAiManagerStore, AI_MANAGER_STATUS } from '@/stores/aiManagerStore'
import { useAuthStore } from '@/stores/authStore'
import { getCategoryEmoji } from '@/constants/spendingCategories'
import AppIcon from '@/components/common/AppIcon.vue'
import rezeImageUrl from '@/assets/images/reze.png'
import SpendingInputModal from '@/components/ai/SpendingInputModal.vue'
import ExcuseSelector from '@/components/ai/ExcuseSelector.vue'
import JudgmentResult from '@/components/ai/JudgmentResult.vue'
import HistoryList from '@/components/ai/HistoryList.vue'
import LoadingOverlay from '@/components/ai/LoadingOverlay.vue'

// ============================================================================
// Store
// ============================================================================

const aiManagerStore = useAiManagerStore()
const authStore = useAuthStore()

// ============================================================================
// State
// ============================================================================

const currentTimeDisplay = ref('')
const isInputModalOpen = ref(false)
const showHistory = ref(false)
let clockTimeoutId = null
let clockIntervalId = null

// ============================================================================
// Computed
// ============================================================================

const receiptInfo = computed(() => aiManagerStore.receiptInfo)

const isReasonableJudgment = computed(() => {
  return (
    aiManagerStore.isJudged &&
    aiManagerStore.judgmentResult?.judgment?.result === 'REASONABLE'
  )
})

const statusTone = computed(() => {
  if (aiManagerStore.isJudged) return isReasonableJudgment.value ? 'happy' : 'angry'

  const mood = aiManagerStore.currentMood
  if (['ANGRY', 'STRICT', 'ANNOYED'].includes(mood)) return 'angry'
  if (['HAPPY', 'NORMAL'].includes(mood)) return 'happy'
  return 'neutral'
})

const badgeTone = computed(() => {
  if (aiManagerStore.isJudged) return isReasonableJudgment.value ? 'happy' : 'angry'

  const mood = aiManagerStore.currentMood
  if (['ANGRY', 'STRICT', 'ANNOYED'].includes(mood)) return 'angry'
  if (mood === 'HAPPY') return 'happy'
  return 'neutral'
})

const statusText = computed(() => {
  if (aiManagerStore.isJudged) {
    return isReasonableJudgment.value ? '만족' : '불만'
  }
  if (!aiManagerStore.isIdle) return aiManagerStore.currentMoodLabel
  return '대기 중'
})

const statusClass = computed(() => {
  if (statusTone.value === 'angry') return 'status-strict'
  if (statusTone.value === 'happy') return 'status-satisfied'
  return 'status-neutral'
})

const badgeClass = computed(() => {
  if (badgeTone.value === 'angry') return 'badge-angry'
  if (badgeTone.value === 'happy') return 'badge-happy'
  return 'badge-neutral'
})

const statusEmoji = computed(() => {
  if (aiManagerStore.isJudged) {
    return isReasonableJudgment.value ? '😊' : '😤'
  }
  const mood = aiManagerStore.currentMood
  const emojiMap = {
    NORMAL: '😐',
    ANGRY: '😠',
    HAPPY: '😊',
    STRICT: '😤',
    CURIOUS: '🧐',
    CONFUSED: '😕',
    ANNOYED: '😒'
  }
  return emojiMap[mood] ?? '😐'
})

const aiMessageText = computed(() => {
  const userName = authStore.userName || '회원님'

  if (aiManagerStore.isIdle) return `${userName}~ 오늘 지출 검토할 거 있어?`
  if (aiManagerStore.isExtracting) return aiManagerStore.currentScript || '영수증 확인 중...'
  if (aiManagerStore.isAnalyzed || aiManagerStore.isJudged) return aiManagerStore.currentScript

  switch (aiManagerStore.status) {
    case AI_MANAGER_STATUS.ANALYZING:
      return '영수증 분석 중...'
    case AI_MANAGER_STATUS.JUDGING:
      return '판결 중...'
    default:
      return aiManagerStore.currentScript || '처리 중...'
  }
})

const sidebarStatusText = computed(() => {
  if (aiManagerStore.isExtracting) return '영수증에서 정보를 추출하고 있어요'
  switch (aiManagerStore.status) {
    case AI_MANAGER_STATUS.ANALYZING:
      return '영수증을 분석하고 있어요'
    case AI_MANAGER_STATUS.JUDGING:
      return '판결을 준비하고 있어요'
    default:
      return '잠시만 기다려 주세요'
  }
})

// ============================================================================
// Methods
// ============================================================================

const amountFormatter = new Intl.NumberFormat('ko-KR')
const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

const formatAmount = (amount) => {
  const numericAmount = Number(amount)
  return amountFormatter.format(Number.isFinite(numericAmount) ? numericAmount : 0)
}

const updateTimeDisplay = (date = new Date()) => {
  currentTimeDisplay.value = timeFormatter.format(date)
}

const startClock = () => {
  stopClock()

  updateTimeDisplay()
  const now = new Date()
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

  clockTimeoutId = setTimeout(() => {
    updateTimeDisplay()
    clockIntervalId = setInterval(() => updateTimeDisplay(), 60000)
  }, Math.max(0, msToNextMinute))
}

const stopClock = () => {
  if (clockTimeoutId) clearTimeout(clockTimeoutId)
  if (clockIntervalId) clearInterval(clockIntervalId)
  clockTimeoutId = null
  clockIntervalId = null
}

// Modal Controls
const openInputModal = () => {
  isInputModalOpen.value = true
}

const closeInputModal = () => {
  isInputModalOpen.value = false
}

const handleNewEntry = () => {
  aiManagerStore.resetConversation()
  isInputModalOpen.value = true
}

const toggleHistoryView = () => {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    aiManagerStore.fetchHistory()
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  startClock()
})

onUnmounted(() => {
  stopClock()
})
</script>

<style scoped>
/* ================================================
   LOCAL CSS VARIABLES
   - Brand accent RGB for rgba() usage
   - Ensures maintainability and DRY principle
   ================================================ */
.ai-manager-view {
  /* Brand Accent Colors (from colors.js) */
  --brand-accent: #FF6B3D;
  --brand-accent-rgb: 255, 107, 61;
  --brand-accent-secondary: #FF8557;
  
  /* Layout */
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background: var(--surface-muted, #F5F5F5);
}

html[data-theme="night"] .ai-manager-view {
  background: var(--showroom-bg-night, #3a3530);
}

/* ================================================
   PAGE HEADER
   ================================================ */
.page-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--showroom-text-day, #2C2420);
  margin: 0 0 0.5rem;
}

html[data-theme="night"] .page-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.page-subtitle {
  font-size: 1rem;
  color: var(--bento-text-muted, #6D5D4F);
  margin: 0;
}

/* ================================================
   MAIN CONTAINER
   ================================================ */
.manager-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 2rem;
  min-height: 600px;
}

/* ================================================
   GLASSMORPHIC CARD BASE
   - Multi-layer shadows for depth
   - Backdrop blur for glass effect
   - Gradient backgrounds for premium feel
   ================================================ */
.card {
  /* Day Mode: Light glass with warm gradient */
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.85), 
    rgba(255, 255, 255, 0.65)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  
  /* Multi-layer shadow: ambient + highlight */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="night"] .card {
  /* Night Mode: Dark glass with subtle glow */
  background: linear-gradient(145deg,
    rgba(42, 37, 32, 0.9),
    rgba(42, 37, 32, 0.7)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Enhanced shadows for night depth */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Profile Card */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* ================================================
   CHARACTER PROFILE CARD
   ================================================ */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.character-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  /* 3D elevation: outer shadow for lift effect */
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  
  /* Glassmorphic background */
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 3px solid rgba(255, 255, 255, 0.6);
  
  /* Multi-layer depth shadow */
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.9);
}

html[data-theme="night"] .character-image {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.06)
  );
  border-color: rgba(255, 255, 255, 0.2);
  
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.character-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Badge State Colors - Using brand accent for angry state */
.character-badge.badge-angry {
  background: linear-gradient(135deg, 
    var(--brand-accent), 
    var(--brand-accent-secondary)
  );
}

/* Happy state keeps distinct warm yellow */
.character-badge.badge-happy {
  background: linear-gradient(135deg, #FFD93D, #FFE066);
}

/* Neutral state keeps cool gray */
.character-badge.badge-neutral {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
}

/* Night mode glow animation for badges */
html[data-theme="night"] .character-badge {
  animation: badge-glow 3s ease-in-out infinite;
}

@keyframes badge-glow {
  0%, 100% {
    box-shadow: 
      0 0 12px rgba(var(--brand-accent-rgb), 0.4),
      0 4px 8px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 
      0 0 20px rgba(var(--brand-accent-rgb), 0.6),
      0 0 32px rgba(var(--brand-accent-rgb), 0.3),
      0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-text-day, #2C2420);
  margin: 0 0 0.5rem;
}

html[data-theme="night"] .character-name {
  color: var(--showroom-text-night, #F5EDE3);
}

.character-status {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.character-status.status-strict {
  color: #FF6B6B;
}

.character-status.status-satisfied {
  color: #51C784;
}

.character-status.status-neutral {
  color: #6b7280;
}

/* Receipt Card */
.receipt-card {
  text-align: center;
}

.receipt-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6D5D4F);
  margin: 0 0 0.75rem;
  letter-spacing: 0.5px;
}

.receipt-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--showroom-text-day, #2C2420);
  margin: 0 0 1rem;
}

html[data-theme="night"] .receipt-amount {
  color: var(--showroom-text-night, #F5EDE3);
}

.receipt-details {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .receipt-details {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.receipt-merchant,
.receipt-date {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6D5D4F);
  margin: 0.25rem 0;
}

/* ================================================
   INPUT TRIGGER CARD
   - Glassmorphic CTA with brand accent
   - Tactile pressed state for feedback
   ================================================ */
.input-trigger-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  width: 100%;
  appearance: none;
  
  /* Glassmorphic base with subtle brand tint */
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb), 0.08),
    rgba(var(--brand-accent-rgb), 0.04)
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px dashed rgba(var(--brand-accent-rgb), 0.25);
  
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.input-trigger-card:hover {
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb), 0.15),
    rgba(var(--brand-accent-rgb), 0.08)
  );
  border-color: var(--brand-accent);
  box-shadow: 
    0 12px 32px rgba(var(--brand-accent-rgb), 0.16),
    0 0 24px rgba(var(--brand-accent-rgb), 0.12);
  transform: translateY(-4px);
}

/* Tactile pressed state */
.input-trigger-card:active {
  background: rgba(var(--brand-accent-rgb), 0.05);
  box-shadow: inset 4px 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(2px) scale(0.98);
}

html[data-theme="night"] .input-trigger-card {
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb), 0.12),
    rgba(var(--brand-accent-rgb), 0.06)
  );
}

html[data-theme="night"] .input-trigger-card:hover {
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb), 0.2),
    rgba(var(--brand-accent-rgb), 0.1)
  );
}

html[data-theme="night"] .input-trigger-card:active {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 4px 4px 12px rgba(0, 0, 0, 0.5);
}

.input-trigger-card svg {
  color: var(--brand-accent);
}

.input-trigger-card:focus-visible {
  outline: 3px solid rgba(var(--brand-accent-rgb), 0.35);
  outline-offset: 2px;
}

.processing-card {
  text-align: center;
}

.processing-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6D5D4F);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.processing-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6D5D4F);
}

.trigger-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day, #2C2420);
  margin: 0;
}

html[data-theme="night"] .trigger-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.trigger-subtext {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6D5D4F);
  margin: 0;
}

/* ================================================
   CHAT AREA
   - Glassmorphic container with subtle gradient
   - Visual hierarchy differentiation from sidebar
   ================================================ */
.chat-area {
  /* Gradient background for depth */
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(249, 248, 246, 0.85) 50%,
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

html[data-theme="night"] .chat-area {
  background: linear-gradient(180deg,
    rgba(42, 37, 32, 0.95) 0%,
    rgba(42, 37, 32, 0.8) 50%,
    rgba(42, 37, 32, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.time-indicator {
  padding: 1rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--bento-text-muted, #6D5D4F);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .time-indicator {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

/* Chat Content */
.chat-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Message Bubbles */
.message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-ai {
  justify-content: flex-start;
}

.message-avatar {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6D5D4F);
  padding: 0.5rem 0;
}

.message-bubble {
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* Glassmorphic AI message bubble */
.message-ai .message-bubble {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: var(--showroom-text-day, #2C2420);
  border-bottom-left-radius: 4px;
  
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

html[data-theme="night"] .message-ai .message-bubble {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04)
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night, #F5EDE3);
  
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.875rem;
}

.error-banner button {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
}

/* History Section */
.history-section {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

html[data-theme="night"] .history-section {
  border-top-color: rgba(255, 255, 255, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .ai-manager-view {
    padding: 1rem;
  }

  .manager-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .sidebar {
    order: 1;
  }

  .chat-area {
    order: 2;
    min-height: 500px;
  }

  .chat-content {
    padding: 1.5rem;
  }
}
</style>
