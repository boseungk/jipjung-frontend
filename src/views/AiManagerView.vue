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
              src="@/assets/images/reze.png" 
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
        <div v-if="aiManagerStore.receiptInfo" class="receipt-card card">
          <h3 class="receipt-label">RECEIPT INFO</h3>
          <div class="receipt-amount">₩{{ formatAmount(aiManagerStore.receiptInfo.amount) }}</div>
          <div class="receipt-details">
            <p class="receipt-merchant">
              {{ getCategoryEmoji(aiManagerStore.receiptInfo.category) }} 
              {{ aiManagerStore.receiptInfo.storeName }} 
              ({{ aiManagerStore.receiptInfo.categoryLabel }})
            </p>
            <p class="receipt-date">{{ aiManagerStore.receiptInfo.paymentDate }}</p>
          </div>
        </div>

        <!-- Input Trigger Card (Idle State) -->
        <div 
          v-else 
          class="input-trigger-card card"
          @click="openInputModal"
        >
          <AppIcon name="receipt" :size="48" weight="duotone" />
          <p class="trigger-text">클릭하여 지출 등록하기</p>
          <p class="trigger-subtext">📷 영수증 촬영 또는 ✏️ 수기 입력</p>
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
          <!-- IDLE State: Welcome Message -->
          <template v-if="aiManagerStore.isIdle">
            <div class="welcome-message">
              <div class="message message-ai">
                <div class="message-avatar">레제</div>
                <div class="message-bubble">
                  {{ authStore.userName }}~ 오늘 지출 검토할 거 있어?
                </div>
              </div>
            </div>
          </template>

          <!-- ANALYZED State: AI Script + Excuse Selection -->
          <template v-else-if="aiManagerStore.isAnalyzed">
            <div class="messages-container">
              <div class="message message-ai">
                <div class="message-avatar">레제</div>
                <div class="message-bubble">
                  {{ aiManagerStore.currentScript }}
                </div>
              </div>
            </div>

            <ExcuseSelector 
              :excuses="aiManagerStore.suggestedExcuses"
              @submitted="handleJudgmentSubmitted"
            />
          </template>

          <!-- JUDGED State: Result Display -->
          <template v-else-if="aiManagerStore.isJudged">
            <div class="messages-container">
              <div class="message message-ai">
                <div class="message-avatar">레제</div>
                <div class="message-bubble">
                  {{ aiManagerStore.currentScript }}
                </div>
              </div>
            </div>

            <JudgmentResult
              :judgment="aiManagerStore.judgmentResult?.judgment"
              :growth="aiManagerStore.judgmentResult?.growth"
              :character="aiManagerStore.judgmentResult?.character"
              @newEntry="handleNewEntry"
              @viewHistory="toggleHistoryView"
            />
          </template>

          <!-- EXTRACTING State: Wait message -->
          <template v-else-if="aiManagerStore.isExtracting">
            <div class="messages-container">
              <div class="message message-ai">
                <div class="message-avatar">레제</div>
                <div class="message-bubble">
                  {{ aiManagerStore.currentScript || '영수증 확인 중...' }}
                </div>
              </div>
            </div>
          </template>

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
      @analyzed="handleAnalyzed"
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
import { useAiManagerStore } from '@/stores/aiManagerStore'
import { useAuthStore } from '@/stores/authStore'
import { getCategoryEmoji } from '@/constants/spendingCategories'
import AppIcon from '@/components/common/AppIcon.vue'
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
let clockTimer = null

// ============================================================================
// Computed
// ============================================================================

const statusText = computed(() => {
  if (aiManagerStore.isJudged) {
    return aiManagerStore.judgmentResult?.judgment?.result === 'REASONABLE' 
      ? '만족' 
      : '불만'
  }
  if (!aiManagerStore.isIdle) return aiManagerStore.currentMoodLabel
  return '대기 중'
})

const statusClass = computed(() => {
  if (aiManagerStore.isJudged) {
    return aiManagerStore.judgmentResult?.judgment?.result === 'REASONABLE'
      ? 'status-satisfied'
      : 'status-strict'
  }
  const mood = aiManagerStore.currentMood
  if (['ANGRY', 'STRICT', 'ANNOYED'].includes(mood)) return 'status-strict'
  if (['HAPPY', 'NORMAL'].includes(mood)) return 'status-satisfied'
  return 'status-neutral'
})

const badgeClass = computed(() => {
  if (aiManagerStore.isJudged) {
    return aiManagerStore.judgmentResult?.judgment?.result === 'REASONABLE'
      ? 'badge-happy'
      : 'badge-angry'
  }
  const mood = aiManagerStore.currentMood
  if (['ANGRY', 'STRICT', 'ANNOYED'].includes(mood)) return 'badge-angry'
  if (['HAPPY'].includes(mood)) return 'badge-happy'
  return 'badge-neutral'
})

const statusEmoji = computed(() => {
  if (aiManagerStore.isJudged) {
    return aiManagerStore.judgmentResult?.judgment?.result === 'REASONABLE' ? '😊' : '😤'
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

// ============================================================================
// Methods
// ============================================================================

const formatAmount = (amount) => {
  return amount?.toLocaleString() ?? '0'
}

const formatTime = (date = new Date()) => {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const startClock = () => {
  currentTimeDisplay.value = formatTime()
  clockTimer = setInterval(() => {
    currentTimeDisplay.value = formatTime()
  }, 60000)
}

const stopClock = () => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}

// Modal Controls
const openInputModal = () => {
  isInputModalOpen.value = true
}

const closeInputModal = () => {
  isInputModalOpen.value = false
}

// Event Handlers
const handleAnalyzed = () => {
  // Modal already closed by component
  // Store state updated automatically
}

const handleJudgmentSubmitted = () => {
  // Judgment complete, results shown via store state
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
.ai-manager-view {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background: #F5F5F5;
}

html[data-theme="night"] .ai-manager-view {
  background: var(--showroom-bg-night, #3a3530);
}

/* Page Header */
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

/* Main Container */
.manager-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 2rem;
  min-height: 600px;
}

/* Card Base */
.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .card {
  background: var(--showroom-shadow-dark-night, #2a2520);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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

.character-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
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

.character-badge.badge-angry {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
}

.character-badge.badge-happy {
  background: linear-gradient(135deg, #FFD93D, #FFE066);
}

.character-badge.badge-neutral {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
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

/* Input Trigger Card */
.input-trigger-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px dashed transparent;
}

.input-trigger-card:hover {
  border-color: #6366f1;
  background: #f8f7ff;
  transform: translateY(-2px);
}

html[data-theme="night"] .input-trigger-card:hover {
  background: rgba(99, 102, 241, 0.1);
}

.input-trigger-card svg {
  color: #6366f1;
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

/* Chat Area */
.chat-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

html[data-theme="night"] .chat-area {
  background: var(--showroom-shadow-dark-night, #2a2520);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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

.welcome-message {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.message-ai .message-bubble {
  background: #F5F5F5;
  color: var(--showroom-text-day, #2C2420);
  border-bottom-left-radius: 4px;
}

html[data-theme="night"] .message-ai .message-bubble {
  background: rgba(255, 255, 255, 0.05);
  color: var(--showroom-text-night, #F5EDE3);
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
