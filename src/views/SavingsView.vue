<template>
  <div class="savings-view">
    <header class="view-header">
      <button class="back-button" @click="goBack" aria-label="뒤로 가기">
        <PhArrowLeft :size="24" weight="bold" />
      </button>
      <h1 class="view-title">저축하기</h1>
    </header>

    <div class="view-container">
      <!-- Goal Progress Card -->
      <section class="section goal-section">
        <div class="goal-header">
          <h2 class="goal-name">{{ goalName }}</h2>
          <span class="achievement-rate">{{ achievementRate.toFixed(1) }}%</span>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: `${Math.min(100, achievementRate)}%` }"></div>
        </div>
        
        <div class="goal-stats">
          <div class="stat">
            <span class="stat-label">저축액</span>
            <span class="stat-value">{{ formatCurrency(savedAmount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">목표</span>
            <span class="stat-value">{{ formatCurrency(targetAmount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">남은 금액</span>
            <span class="stat-value highlight">{{ formatCurrency(remainingAmount) }}</span>
          </div>
        </div>
      </section>

      <!-- Quick Save Buttons -->
      <section class="section">
        <h2 class="section-title">빠른 저축</h2>
        <div class="quick-save-grid">
          <button 
            v-for="amount in quickAmounts" 
            :key="amount"
            class="quick-save-btn"
            @click="selectAmount(amount)"
            :class="{ selected: selectedAmount === amount }"
          >
            <span class="amount">{{ formatQuickAmount(amount) }}</span>
          </button>
        </div>
      </section>

      <!-- Custom Amount Input -->
      <section class="section">
        <h2 class="section-title">직접 입력</h2>
        <div class="custom-input-group">
          <input
            type="number"
            v-model.number="customAmount"
            class="amount-input"
            placeholder="저축할 금액"
            min="0"
            @focus="selectedAmount = null"
          />
          <span class="input-unit">원</span>
        </div>
      </section>

      <!-- Save Action -->
      <section class="section action-section">
        <div class="save-summary">
          <span class="summary-label">저축 금액</span>
          <span class="summary-value">{{ formatCurrency(finalAmount) }}</span>
        </div>
        
        <div class="reward-preview" v-if="estimatedExp > 0">
          <PhStar :size="18" weight="fill" class="reward-icon" />
          <span>예상 경험치: <strong>+{{ estimatedExp }} XP</strong></span>
        </div>

        <button 
          class="save-button"
          :disabled="finalAmount <= 0 || isSaving"
          @click="handleSave"
        >
          <PhSpinnerGap v-if="isSaving" :size="20" class="spin" />
          <template v-else>
            <PhPiggyBank :size="24" weight="fill" />
            <span>저축하기</span>
          </template>
        </button>
      </section>

      <!-- Streak Info -->
      <section class="section streak-section">
        <div class="streak-card">
          <div class="streak-icon">
            <PhFire :size="32" weight="fill" :class="streakActive ? 'active' : ''" />
          </div>
          <div class="streak-info">
            <span class="streak-count">{{ currentStreak }}일 연속</span>
            <span class="streak-label">{{ streakMessage }}</span>
          </div>
          <div class="streak-badge" v-if="rewardAvailable">
            <PhGift :size="20" weight="fill" />
            <span>보상 가능</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useToast } from '@/composables/useToast'
import { calculateEstimatedExp } from '@/constants/exp'
import { 
  PhArrowLeft, PhStar, PhPiggyBank, PhSpinnerGap, PhFire, PhGift 
} from '@phosphor-icons/vue'

const router = useRouter()
const authStore = useAuthStore()
const gamificationStore = useGamificationStore()
const dreamHomeStore = useDreamHomeStore()
const { showSuccess, showError } = useToast()

const { userDreamHome, user } = storeToRefs(authStore)
const { currentStreak } = storeToRefs(gamificationStore)

// State
const selectedAmount = ref(null)
const customAmount = ref(null)
const isSaving = ref(false)

// Quick save amounts (in 원)
const quickAmounts = [10000, 50000, 100000, 500000, 1000000, 5000000]

// Goal data from dashboard
const goalName = computed(() => userDreamHome.value?.propertyName || '목표 아파트')
const targetAmount = computed(() => userDreamHome.value?.targetAmount || 0)
const savedAmount = computed(() => userDreamHome.value?.currentAmount || 0)
const remainingAmount = computed(() => userDreamHome.value?.remainingAmount || Math.max(0, targetAmount.value - savedAmount.value))
const achievementRate = computed(() => userDreamHome.value?.achievementRate || 0)

// Streak info
const rawStreak = computed(() => user.value?._raw?.streak || {})
const isTodayParticipated = computed(() => rawStreak.value?.isTodayParticipated || false)
const rewardAvailable = computed(() => rawStreak.value?.rewardAvailable || false)
const streakActive = computed(() => currentStreak.value > 0)
const streakMessage = computed(() => {
  if (isTodayParticipated.value) return '오늘 스트릭 참여 완료!'
  if (currentStreak.value > 0) return '오늘도 활동하면 연속 기록!'
  return '첫 활동으로 스트릭 시작!'
})

// Final amount to save
const finalAmount = computed(() => selectedAmount.value || customAmount.value || 0)

// Estimated experience points (using centralized constant with 500 max)
const estimatedExp = computed(() => calculateEstimatedExp(finalAmount.value))

function formatCurrency(value) {
  if (!value) return '₩0'
  if (value >= 100000000) {
    return '₩' + (value / 100000000).toFixed(1) + '억'
  }
  if (value >= 10000) {
    return '₩' + (value / 10000).toLocaleString() + '만'
  }
  return '₩' + value.toLocaleString()
}

function formatQuickAmount(value) {
  if (value >= 10000) {
    return (value / 10000) + '만원'
  }
  return value.toLocaleString() + '원'
}

function selectAmount(amount) {
  selectedAmount.value = amount
  customAmount.value = null
}

function goBack() {
  router.back()
}

async function handleSave() {
  if (finalAmount.value <= 0) return
  
  isSaving.value = true
  
  try {
    // 백엔드 저축 API 호출
    const result = await dreamHomeStore.recordSavings(
      finalAmount.value,
      'DEPOSIT',
      ''
    )
    
    // 경험치/레벨 반영 (백엔드 응답에서)
    if (result?.growth) {
      gamificationStore.applyGrowthResult(result.growth)
      if (result.growth.isLevelUp) {
        showSuccess(`🎉 레벨업! ${result.growth.levelLabel}`)
      } else {
        showSuccess(`+${result.growth.expChange} XP 획득!`)
      }
    } else {
      showSuccess('저축이 기록되었습니다!')
    }
    
    // Navigate back or show success
    router.push('/')
  } catch (error) {
    showError(error.message || '저축에 실패했습니다')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.savings-view {
  min-height: 100vh;
  background: var(--surface-bg, #f5f5f5);
  padding-bottom: 2rem;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--surface-card, white);
  border-bottom: 1px solid var(--border-soft, #e5e7eb);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--ink-base, #1f2937);
  border-radius: 10px;
  cursor: pointer;
}

.back-button:hover {
  background: var(--surface-muted, #f3f4f6);
}

.view-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

.view-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.section {
  background: var(--surface-card, white);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0 0 1rem;
}

/* Goal Section */
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goal-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0;
}

.achievement-rate {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--brand-accent, #ff6b3d);
}

.progress-bar-container {
  height: 12px;
  background: var(--surface-muted, #f3f4f6);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-light, #ff9a75));
  border-radius: 6px;
  transition: width 0.3s ease;
}

.goal-stats {
  display: flex;
  justify-content: space-between;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--ink-muted, #6b7280);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

.stat-value.highlight {
  color: var(--brand-accent, #ff6b3d);
}

/* Quick Save Grid */
.quick-save-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.quick-save-btn {
  padding: 1rem;
  border: 2px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  background: var(--surface-card, white);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-save-btn:hover {
  border-color: var(--brand-accent, #ff6b3d);
}

.quick-save-btn.selected {
  background: var(--brand-accent-soft, #fff5f2);
  border-color: var(--brand-accent, #ff6b3d);
}

.quick-save-btn .amount {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

/* Custom Input */
.custom-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.amount-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: right;
  transition: border-color 0.2s;
}

.amount-input:focus {
  outline: none;
  border-color: var(--brand-accent, #ff6b3d);
}

.input-unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink-muted, #6b7280);
}

/* Action Section */
.action-section {
  background: linear-gradient(135deg, var(--brand-accent, #ff6b3d) 0%, var(--brand-accent-light, #ff9a75) 100%);
  color: white;
}

.save-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-label {
  font-size: 1rem;
  opacity: 0.9;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.reward-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.reward-icon {
  color: #ffd54f;
}

/* .save-button visuals live in src/assets/css/components/buttons.css */

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Streak Section */
.streak-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.streak-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-muted, #f3f4f6);
  border-radius: 14px;
}

.streak-icon svg {
  color: var(--ink-muted, #9ca3af);
}

.streak-icon svg.active {
  color: #ff6b3d;
}

.streak-info {
  flex: 1;
}

.streak-count {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

.streak-label {
  font-size: 0.875rem;
  color: var(--ink-muted, #6b7280);
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: #fff8e1;
  border-radius: 999px;
  color: #f9a825;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Remove number input arrows */
.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input[type=number] {
  -moz-appearance: textfield;
}

@media (max-width: 480px) {
  .quick-save-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .goal-stats {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .stat {
    flex: 1;
    min-width: 80px;
  }
}
</style>
