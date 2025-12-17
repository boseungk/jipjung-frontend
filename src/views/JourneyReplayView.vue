<template>
  <div class="journey-replay-view" ref="containerRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">저축 여정을 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button class="back-btn" @click="goBack">← 컬렉션으로 돌아가기</button>
    </div>

    <!-- Journey Content -->
    <template v-else-if="journeyData">
      <!-- Fixed Header -->
      <header class="journey-header">
        <button class="back-btn" @click="goBack" aria-label="뒤로 가기">
          ← 
        </button>
        <h1 class="journey-title">{{ journeyData.collection.propertyName }}</h1>
        <span class="journey-subtitle">{{ journeyData.collection.location }}</span>
      </header>

      <!-- Main Content: House Image (80% of viewport) -->
      <main class="journey-main">
        <!-- House Image Container -->
        <div class="house-image-container">
          <img 
            :src="currentPhaseImage" 
            :alt="`Phase ${currentPhase} - ${currentPhaseName}`"
            class="house-image"
          />
          <!-- Phase Badge -->
          <div class="phase-badge">
            <span class="phase-number">{{ currentPhase }}/{{ totalPhases }}</span>
            <span class="phase-name">{{ currentPhaseName }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="journey-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
          <div class="progress-dots">
            <span 
              v-for="phase in totalPhases" 
              :key="phase"
              class="dot"
              :class="{ active: phase <= currentPhase, current: phase === currentPhase }"
            ></span>
          </div>
        </div>

        <!-- Scroll Indicator (only if not at end) -->
        <div v-if="currentPhase < totalPhases" class="scroll-indicator">
          <span>아래로 스크롤하여 여정 진행</span>
          <div class="scroll-arrow">↓</div>
        </div>
      </main>

      <!-- Bottom Sheet -->
      <aside class="bottom-sheet" :class="{ expanded: isSheetExpanded }">
        <div class="sheet-handle" @click="toggleSheet">
          <div class="handle-bar"></div>
        </div>

        <div class="sheet-content">
          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-card">
              <span class="summary-label">시작일</span>
              <span class="summary-value">{{ formatDate(journeyData.summary.startDate) }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">완료일</span>
              <span class="summary-value">{{ formatDate(journeyData.summary.completedDate) }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">소요 기간</span>
              <span class="summary-value">{{ journeyData.summary.totalDays }}일</span>
            </div>
            <div class="summary-card highlight">
              <span class="summary-label">총 저축</span>
              <span class="summary-value">{{ formatMoney(journeyData.summary.targetAmount) }}</span>
            </div>
          </div>

          <!-- Current Phase Details -->
          <div v-if="currentPhaseData" class="phase-details">
            <h3 class="phase-title">{{ currentPhaseName }} - 저축 기록</h3>
            <p class="phase-cumulative">
              누적 저축: <strong>{{ formatMoney(currentPhaseData.cumulativeAmount) }}</strong>
            </p>

            <!-- Events List -->
            <ul v-if="currentPhaseData.events?.length" class="events-list">
              <li v-for="event in currentPhaseData.events" :key="event.eventId" class="event-item">
                <span class="event-type" :class="event.eventType.toLowerCase()">
                  {{ event.eventType === 'DEPOSIT' ? '💰' : '📤' }}
                </span>
                <div class="event-details">
                  <span class="event-amount">{{ formatMoney(event.amount) }}</span>
                  <span v-if="event.memo" class="event-memo">{{ event.memo }}</span>
                </div>
                <span class="event-date">{{ formatShortDate(event.date) }}</span>
              </li>
            </ul>
            <p v-else class="no-events">이 단계에는 저축 기록이 없어요</p>
          </div>
        </div>
      </aside>

      <!-- Completion Celebration (when at 100%) -->
      <div v-if="currentPhase === totalPhases" class="completion-overlay">
        <div class="confetti-container" ref="confettiRef"></div>
        <div class="completion-card">
          <h2 class="completion-title">🎉 축하해요!</h2>
          <p class="completion-message">
            {{ journeyData.summary.totalDays }}일간의 여정을 완주했어요!
          </p>
          <p class="completion-amount">
            총 {{ formatMoney(journeyData.summary.targetAmount) }} 저축 완료
          </p>
          <button class="share-btn" @click="shareJourney">📤 공유하기</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collectionService } from '@/api/services/collectionService'

const route = useRoute()
const router = useRouter()
const containerRef = ref(null)
const confettiRef = ref(null)

// State
const isLoading = ref(true)
const error = ref(null)
const journeyData = ref(null)
const currentPhase = ref(1)
const isSheetExpanded = ref(false)

// Constants
const totalPhases = 11

// Computed
const currentPhaseData = computed(() => {
  if (!journeyData.value?.phases) return null
  return journeyData.value.phases.find(p => p.phaseNumber === currentPhase.value)
})

const currentPhaseName = computed(() => {
  return currentPhaseData.value?.phaseName || `Phase ${currentPhase.value}`
})

const currentPhaseImage = computed(() => {
  if (!journeyData.value?.collection?.themeCode) return ''
  const theme = journeyData.value.collection.themeCode.toLowerCase()
  
  // Phase 1-6: house stages, Phase 7-11: furniture stages
  if (currentPhase.value <= 6) {
    return `/webp/${theme}/stage${currentPhase.value}.webp`
  } else {
    const furnitureStage = currentPhase.value - 6
    return `/webp/${theme}/furniture${furnitureStage}.webp`
  }
})

const progressPercent = computed(() => {
  return ((currentPhase.value - 1) / (totalPhases - 1)) * 100
})

// Methods
const fetchJourney = async () => {
  const collectionId = route.params.id
  if (!collectionId) {
    error.value = '잘못된 접근입니다'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    journeyData.value = await collectionService.getJourney(collectionId)
  } catch (err) {
    console.error('여정 조회 실패:', err)
    error.value = err.response?.data?.message || '여정 데이터를 불러올 수 없습니다'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/collection')
}

const toggleSheet = () => {
  isSheetExpanded.value = !isSheetExpanded.value
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const formatShortDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatMoney = (amount) => {
  if (!amount) return '0원'
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}

const shareJourney = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `${journeyData.value.collection.propertyName} 저축 완료!`,
        text: `${journeyData.value.summary.totalDays}일간 ${formatMoney(journeyData.value.summary.targetAmount)} 저축 완료!`,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  } catch (err) {
    console.log('공유 취소됨')
  }
}

// Scroll-based Phase Transition
let scrollHandler = null

const setupScrollListener = () => {
  if (!containerRef.value) return

  scrollHandler = () => {
    const container = containerRef.value
    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight

    // Calculate progress (0 to 1)
    const scrollProgress = Math.min(1, scrollTop / (docHeight - windowHeight))
    
    // Map to phase (1 to 11)
    const newPhase = Math.floor(scrollProgress * (totalPhases - 1)) + 1
    const clampedPhase = Math.max(1, Math.min(totalPhases, newPhase))
    
    if (clampedPhase !== currentPhase.value) {
      currentPhase.value = clampedPhase
    }
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
}

// Lifecycle
onMounted(() => {
  fetchJourney()
  // Delay scroll listener setup to after data is loaded
  watch(journeyData, (newVal) => {
    if (newVal) {
      // Set body height for scroll effect
      document.body.style.height = `${totalPhases * 100}vh`
      setupScrollListener()
    }
  })
})

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
  document.body.style.height = ''
})
</script>

<style scoped>
.journey-replay-view {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #F5EDE3 0%, #E8DFD5 100%);
  position: relative;
}

html[data-theme="night"] .journey-replay-view {
  background: linear-gradient(180deg, #1A1A2E 0%, #16213E 100%);
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #D4A574;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text,
.error-text {
  color: #5D4037;
  font-size: 1rem;
  text-align: center;
}

html[data-theme="night"] .loading-text,
html[data-theme="night"] .error-text {
  color: #F5EDE3;
}

/* Header */
.journey-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 1.5rem;
  background: rgba(245, 237, 227, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1rem;
}

html[data-theme="night"] .journey-header {
  background: rgba(26, 26, 46, 0.9);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #5D4037;
  padding: 0.5rem;
}

html[data-theme="night"] .back-btn {
  color: #F5EDE3;
}

.journey-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #5D4037;
  flex: 1;
}

html[data-theme="night"] .journey-title {
  color: #F5EDE3;
}

.journey-subtitle {
  font-size: 0.875rem;
  color: #8D6E63;
}

html[data-theme="night"] .journey-subtitle {
  color: #D7CCC8;
}

/* Main Content */
.journey-main {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* House Image */
.house-image-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.house-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.5s ease, transform 0.5s ease;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.phase-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(212, 165, 116, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
}

.phase-number {
  font-weight: 700;
  font-size: 1rem;
}

.phase-name {
  opacity: 0.9;
}

/* Progress Bar */
.journey-progress {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4A574 0%, #B8956F 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-dots {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.dot.active {
  background: #D4A574;
}

.dot.current {
  transform: scale(1.5);
  box-shadow: 0 0 10px #D4A574;
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 8rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #8D6E63;
  font-size: 0.875rem;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

html[data-theme="night"] .scroll-indicator {
  color: #D7CCC8;
}

.scroll-arrow {
  font-size: 1.5rem;
}

/* Bottom Sheet */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(calc(100% - 180px));
  transition: transform 0.3s ease;
  z-index: 50;
  max-height: 70vh;
}

.bottom-sheet.expanded {
  transform: translateY(0);
}

html[data-theme="night"] .bottom-sheet {
  background: #252538;
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 1rem;
  cursor: pointer;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #D7CCC8;
  border-radius: 2px;
}

.sheet-content {
  padding: 0 1.5rem 2rem;
  overflow-y: auto;
  max-height: calc(70vh - 60px);
}

/* Summary Cards */
.summary-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: #F5F0EB;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

html[data-theme="night"] .summary-card {
  background: #1A1A2E;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #D4A574 0%, #B8956F 100%);
  color: white;
}

.summary-label {
  display: block;
  font-size: 0.75rem;
  color: #8D6E63;
  margin-bottom: 0.25rem;
}

html[data-theme="night"] .summary-label {
  color: #D7CCC8;
}

.summary-card.highlight .summary-label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #5D4037;
}

html[data-theme="night"] .summary-value {
  color: #F5EDE3;
}

.summary-card.highlight .summary-value {
  color: white;
}

/* Phase Details */
.phase-details {
  margin-top: 1rem;
}

.phase-title {
  font-size: 1rem;
  font-weight: 700;
  color: #5D4037;
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .phase-title {
  color: #F5EDE3;
}

.phase-cumulative {
  font-size: 0.875rem;
  color: #8D6E63;
  margin-bottom: 1rem;
}

html[data-theme="night"] .phase-cumulative {
  color: #D7CCC8;
}

.events-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .event-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.event-type {
  font-size: 1.25rem;
}

.event-details {
  flex: 1;
}

.event-amount {
  display: block;
  font-weight: 600;
  color: #5D4037;
}

html[data-theme="night"] .event-amount {
  color: #F5EDE3;
}

.event-memo {
  display: block;
  font-size: 0.75rem;
  color: #8D6E63;
  margin-top: 0.125rem;
}

html[data-theme="night"] .event-memo {
  color: #D7CCC8;
}

.event-date {
  font-size: 0.75rem;
  color: #8D6E63;
}

html[data-theme="night"] .event-date {
  color: #D7CCC8;
}

.no-events {
  font-size: 0.875rem;
  color: #8D6E63;
  text-align: center;
  padding: 1rem;
}

/* Completion Overlay */
.completion-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.completion-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  text-align: center;
  max-width: 90%;
  animation: popIn 0.5s ease;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

html[data-theme="night"] .completion-card {
  background: #252538;
}

.completion-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.completion-message {
  font-size: 1rem;
  color: #5D4037;
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .completion-message {
  color: #F5EDE3;
}

.completion-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #D4A574;
  margin-bottom: 1.5rem;
}

.share-btn {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #D4A574 0%, #B8956F 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 480px) {
  .journey-header {
    padding: 0.75rem 1rem;
  }

  .journey-title {
    font-size: 1rem;
  }

  .house-image-container {
    height: 50vh;
  }

  .summary-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
