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

        <!-- Receipt Info Card -->
        <div v-if="currentReceipt" class="receipt-card card">
          <h3 class="receipt-label">RECEIPT INFO</h3>
          <div class="receipt-amount">₩{{ formatAmount(currentReceipt.amount) }}</div>
          <div class="receipt-details">
            <p class="receipt-merchant">
              🍗 {{ currentReceipt.merchantName }} ({{ currentReceipt.category }})
            </p>
            <p class="receipt-date">{{ currentReceipt.date }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-card card">
          <AppIcon name="sealCheck" :size="48" weight="duotone" />
          <p class="empty-text">처리할 영수증이 없습니다!</p>
          <p class="empty-subtext">Excellent saving! 🎉</p>
        </div>
      </aside>

      <!-- Right Chat Area (70%) -->
      <main class="chat-area">
        <!-- Time Indicator -->
        <div class="time-indicator">
          오늘 {{ currentTimeDisplay }}
        </div>

        <!-- Chat Messages -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message"
            :class="{ 'message-ai': message.sender === 'ai', 'message-user': message.sender === 'user' }"
          >
            <div class="message-avatar" v-if="message.sender === 'ai'">레제</div>
            <div class="message-bubble">
              {{ message.text }}
            </div>
          </div>
        </div>

        <!-- Quick Reply Chips -->
        <div v-if="showQuickReplies" class="quick-replies">
          <button 
            v-for="chip in quickReplyChips" 
            :key="chip.id"
            class="quick-chip"
            @click="handleQuickReply(chip.text)"
          >
            {{ chip.emoji }} {{ chip.text }}
          </button>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <input
            v-model="userInput"
            type="text"
            class="message-input"
            :placeholder="inputPlaceholder"
            @keyup.enter="handleSendMessage"
            :disabled="userResponded"
          />
          <button 
            class="send-button" 
            @click="handleSendMessage"
            :disabled="!userInput.trim() || userResponded"
          >
            <AppIcon name="paperPlaneRight" :size="20" weight="fill" />
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useReceiptStore } from '@/stores/receiptStore'
import AppIcon from '@/components/common/AppIcon.vue'

const receiptStore = useReceiptStore()

// Refs
const userInput = ref('')
const userResponded = ref(false)
const messages = ref([])
const messagesContainer = ref(null)
const currentTimeDisplay = ref('')
let clockTimer = null

// Quick Reply Chips
const quickReplyChips = [
  { id: 1, emoji: '😢', text: '스트레스 비용' },
  { id: 2, emoji: '🛡️', text: '팔려죄 소비 주장' },
  { id: 3, emoji: '🏳️', text: '인정합니다' },
  { id: 4, emoji: '💼', text: '회식이었어요' }
]

// Computed
const currentReceipt = computed(() => receiptStore.getLatestPendingReceipt)
const hasPendingReceipts = computed(() => receiptStore.getPendingCount > 0)

const statusText = computed(() => {
  return hasPendingReceipts.value ? '매우 엄한함' : '만족'
})

const statusClass = computed(() => {
  return hasPendingReceipts.value ? 'status-strict' : 'status-satisfied'
})

const badgeClass = computed(() => {
  return hasPendingReceipts.value ? 'badge-angry' : 'badge-happy'
})

const statusEmoji = computed(() => {
  return hasPendingReceipts.value ? '😠' : '😊'
})

const showQuickReplies = computed(() => {
  return hasPendingReceipts.value && !userResponded.value
})

const inputPlaceholder = computed(() => {
  if (userResponded.value) return '답변 완료'
  return hasPendingReceipts.value ? '변명을 입력하세요...' : '메시지를 입력하세요...'
})

// Methods
const formatAmount = (amount) => {
  return amount.toLocaleString()
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

const initializeChat = () => {
  messages.value = []
  userResponded.value = false
  userInput.value = ''

  const timestamp = formatTime()

  if (hasPendingReceipts.value && currentReceipt.value) {
    const receipt = currentReceipt.value
    messages.value.push({
      sender: 'ai',
      text: `아, 지금 일일 돈 거 뭐야? ${formatAmount(receipt.amount)}원? 이번 달 돈표 자숙액까지 12만 원 남았는데, 진짜 괜찮겠어?`,
      time: timestamp
    })
  } else {
    messages.value.push({
      sender: 'ai',
      text: '오, 대단한데? 처리할 지출이 하나도 없네. 너 진짜 계획적으로 사는구나. 보상으로 경험치 +50 줄게!',
      time: timestamp
    })
  }

  scrollToBottom()
}

const handleQuickReply = (text) => {
  handleSendMessage(text)
}

const handleSendMessage = (customText) => {
  const text = customText || userInput.value.trim()
  if (!text || userResponded.value) return

  messages.value.push({
    sender: 'user',
    text: text,
    time: formatTime()
  })

  userInput.value = ''
  userResponded.value = true

  // AI Response
  setTimeout(() => {
    let aiResponse = ''

    if (hasPendingReceipts.value) {
      if (text.includes('스트레스')) {
        aiResponse = '스트레스? 너 스트레스 받으면 돈 쓰는 버릇 고쳐야겠다. 다음엔 산책이나 해.'
      } else if (text.includes('팔려죄') || text.includes('소비')) {
        aiResponse = '팔려죄... 뭐, 어쩔 수 없지. 근데 다음엔 좀 더 신중하게 생각해.'
      } else if (text.includes('인정') || text.includes('반성')) {
        aiResponse = '알았어, 이번만 봐줄게. 근데 다음에 또 그러면 진짜 혼난다?'
      } else if (text.includes('회식')) {
        aiResponse = '회식... 뭐, 어쩔 수 없지. 근데 2차는 안 갔겠지?'
      } else {
        aiResponse = '변명은 들었고, 다음부터는 좀 더 신중하게 써. 알았지?'
      }
      
      if (currentReceipt.value) {
        receiptStore.processReceipt(currentReceipt.value.id, text)
      }
    } else {
      aiResponse = '좋아! 계속 이렇게만 해줘. 난 일 없는 게 제일 좋거든.'
    }

    messages.value.push({
      sender: 'ai',
      text: aiResponse,
      time: formatTime()
    })

    const hasMoreReceipts = hasPendingReceipts.value

    scrollToBottom()

    if (hasMoreReceipts) {
      setTimeout(() => {
        initializeChat()
      }, 800)
    } else {
      userResponded.value = false
    }
  }, 1000)

  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  startClock()
  initializeChat()
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

/* Empty Card */
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
}

.empty-card svg {
  color: #51C784;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day, #2C2420);
  margin: 0;
}

html[data-theme="night"] .empty-text {
  color: var(--showroom-text-night, #F5EDE3);
}

.empty-subtext {
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

.messages-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.message-user {
  justify-content: flex-end;
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

.message-user .message-bubble {
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-soft));
  color: white;
  border-bottom-right-radius: 4px;
}

/* Quick Replies */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0 2rem 1rem;
}

.quick-chip {
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  border: none;
  background: #F5F5F5;
  color: var(--showroom-text-day, #2C2420);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-chip:hover {
  background: #E0E0E0;
  transform: translateY(-2px);
}

html[data-theme="night"] .quick-chip {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .quick-chip:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Input Area */
.input-area {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .input-area {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.message-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #F5F5F5;
  color: var(--showroom-text-day, #2C2420);
  font-size: 0.9375rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.2s ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.1);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="night"] .message-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night, #F5EDE3);
}

.send-button {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-soft));
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.4);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

  .messages-container {
    padding: 1.5rem;
  }

  .input-area {
    padding: 1rem 1.5rem;
  }

  .quick-replies {
    padding: 0 1.5rem 1rem;
  }
}
</style>
