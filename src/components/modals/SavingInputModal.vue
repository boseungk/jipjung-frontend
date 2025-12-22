<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div 
          class="modal-container" 
          @click.stop
          role="dialog"
          aria-modal="true"
          aria-labelledby="saving-modal-title"
        >
        <!-- Header -->
        <div class="modal-header">
          <h2 id="saving-modal-title" class="modal-title">
            저축하기
          </h2>
          <button class="close-button" @click="closeModal" aria-label="닫기" :disabled="isSubmitting">
            <PhX :size="20" weight="bold" color="currentColor" />
          </button>
        </div>

        <!-- Goal Progress Mini Display -->
        <div v-if="hasGoal" class="goal-mini-progress">
          <div class="progress-info">
            <span class="goal-name">{{ propertyName }}</span>
            <span class="progress-rate">{{ achievementRate }}%</span>
          </div>
          <div class="progress-bar-mini">
            <div class="progress-fill" :style="{ width: achievementRate + '%' }"></div>
          </div>
        </div>

        <!-- Quick Amount Buttons -->
        <div class="quick-amounts">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="quick-btn"
            :class="{ active: selectedQuickAmount === amount }"
            @click="selectQuickAmount(amount)"
            :disabled="isSubmitting"
          >
            {{ formatQuickAmount(amount) }}
          </button>
        </div>

        <!-- Form -->
        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Amount Input -->
          <div class="form-group">
            <label for="amount" class="form-label">직접 입력</label>
            <div class="input-wrapper">
              <input
                id="amount"
                type="text"
                inputmode="numeric"
                class="form-input"
                placeholder="금액을 입력하세요"
                :value="amountDisplay"
                :disabled="isSubmitting"
                @input="handleAmountInput"
                @blur="handleAmountBlur"
                @focus="handleAmountFocus"
              />
              <span class="input-suffix">원</span>
            </div>
          </div>

          <!-- XP Preview -->
          <div v-if="estimatedXp > 0" class="xp-preview">
            <span>예상 경험치: <strong>약 +{{ estimatedXp }} XP</strong></span>
          </div>

          <!-- Memo Input -->
          <div class="form-group">
            <label for="memo" class="form-label">메모 (선택)</label>
            <textarea
              id="memo"
              v-model="formData.memo"
              class="form-textarea"
              placeholder="메모를 입력하세요"
              rows="2"
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-button" :disabled="isSubmitting || !finalAmount">
            <AppIcon v-if="!isSubmitting" name="floppyDisk" :size="20" :active="true" :is-major-cta="true" aria-hidden="true" />
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? '저축 기록 중...' : submitButtonText }}
          </button>
        </form>
      </div>
    </div>
  </transition>
  </Teleport>

  <!-- Stage Upgrade Celebration Modal -->
  <StageUpgradeModal
    :is-open="isStageUpModalOpen"
    :previous-stage="stageUpInfo?.previousStage ?? 1"
    :current-stage="stageUpInfo?.currentStage ?? 1"
    :track="stageUpInfo?.track ?? 'house'"
    :level-label="stageUpInfo?.levelLabel ?? ''"
    @confirm="handleStageUpConfirm"
  />

  <CollectionCompleteModal
    :is-open="isCompletionModalOpen"
    :target-amount="completionInfo?.targetAmount ?? 0"
    :total-saved="completionInfo?.totalSaved ?? 0"
    @close="handleCompletionClose"
    @view-collection="handleCompletionViewCollection"
    @set-next-goal="handleCompletionSetNextGoal"
  />
</template>

<script setup>
/**
 * SavingInputModal
 * 
 * 저축 기록 모달 컴포넌트.
 * 대시보드 "저축하기" 버튼 클릭 시 표시됩니다.
 * 
 * [C-1 UX 개선] 개선 사항:
 * - 목표 진행률 미니 표시
 * - 빠른 저축 버튼 (1만/5만/10만/50만원)
 * - XP 미리보기 (보수적 "약" 표현)
 * 
 * 백엔드 API: POST /api/dream-home/savings
 */
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { PhX } from '@phosphor-icons/vue'
import AppIcon from '@/components/common/AppIcon.vue'
import StageUpgradeModal from './StageUpgradeModal.vue'
import CollectionCompleteModal from './CollectionCompleteModal.vue'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { useToast } from '@/composables/useToast'
import { useMoneyInput } from '@/composables/useMoneyInput'
import { formatWon } from '@/utils/formatters'
import { calculateEstimatedExp } from '@/constants/exp'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Stores & Composables
const dreamHomeStore = useDreamHomeStore()
const gamificationStore = useGamificationStore()
const collectionStore = useCollectionStore()
const router = useRouter()
const { showSuccess, showError } = useToast()

// 목표 정보 (Goal Progress Mini Display)
const { 
  propertyName, 
  achievementRate,
  dreamHomeId 
} = storeToRefs(dreamHomeStore)

// 목표 설정 여부
const hasGoal = computed(() => dreamHomeId.value != null)

// State
const isSubmitting = ref(false)
const selectedQuickAmount = ref(null)
const formData = ref({
  amount: null,
  memo: ''
})

// Stage Upgrade Modal State
const isStageUpModalOpen = ref(false)
const stageUpInfo = ref(null)

const isCompletionModalOpen = ref(false)
const completionInfo = ref(null)

// 빠른 저축 금액 옵션
const quickAmounts = [10000, 50000, 100000, 500000]

/**
 * 최종 금액 (빠른 선택 또는 직접 입력)
 */
const finalAmount = computed(() => {
  return selectedQuickAmount.value || formData.value.amount || 0
})

/**
 * XP 예상치 계산 (centralized constant 사용)
 */
const estimatedXp = computed(() => calculateEstimatedExp(finalAmount.value))

/**
 * 제출 버튼 텍스트
 */
const submitButtonText = computed(() => {
  if (finalAmount.value > 0) {
    return `${formatWon(finalAmount.value)} 저축하기`
  }
  return '저축하기'
})

/**
 * 빠른 금액 선택
 */
const selectQuickAmount = (amount) => {
  selectedQuickAmount.value = amount
  formData.value.amount = null // 직접 입력 초기화
}

/**
 * 빠른 금액 포맷 (버튼용)
 */
const formatQuickAmount = (amount) => {
  if (amount >= 10000) return `${amount / 10000}만원`
  return `${amount.toLocaleString()}원`
}

/**
 * 금액 입력 composable
 */
const amountRef = computed({
  get: () => formData.value.amount,
  set: (val) => { formData.value.amount = val }
})
const { displayValue: amountDisplay, handleInput: moneyHandleInput, handleBlur: handleAmountBlur, handleFocus: handleAmountFocus } = useMoneyInput(amountRef)

/**
 * 금액 입력 핸들러 (빠른 선택 해제 포함)
 */
const handleAmountInput = (event) => {
  selectedQuickAmount.value = null
  moneyHandleInput(event)
}

/**
 * 모달 닫기
 */
const closeModal = () => {
  if (isSubmitting.value) return
  emit('close')
  resetForm()
}

/**
 * 오버레이 클릭 시 닫기
 */
const handleOverlayClick = () => {
  closeModal()
}

/**
 * 폼 제출 - 백엔드 저축 API 호출
 */
const handleSubmit = async () => {
  const amount = finalAmount.value
  if (!amount || amount <= 0) {
    showError('금액을 입력해주세요')
    return
  }

  isSubmitting.value = true

  try {
    // 백엔드 저축 API 호출 (항상 DEPOSIT)
    const result = await dreamHomeStore.recordSavings(
      amount,
      'DEPOSIT',
      formData.value.memo || ''
    )

    // 경험치/레벨 반영 및 단계 상승 정보 획득
    if (result.growth) {
      const upgradeResult = gamificationStore.applyGrowthResult(result.growth)
      if (upgradeResult?.isStageUp) {
        stageUpInfo.value = upgradeResult
      }
    }

    if (result?.dreamHomeStatus?.justCompleted) {
      completionInfo.value = {
        targetAmount: result.dreamHomeStatus.targetAmount,
        totalSaved: result.dreamHomeStatus.currentSavedAmount,
        completedCollectionId: result.dreamHomeStatus.completedCollectionId
      }
      isCompletionModalOpen.value = true
      await collectionStore.fetchCollections()
    } else if (stageUpInfo.value) {
      isStageUpModalOpen.value = true
    } else if (result?.growth) {
      showSuccess(`+${result.growth.expChange} XP 획득!`)
    } else {
      showSuccess('저축이 기록되었습니다!')
    }

    emit('submit', result)
    
    isSubmitting.value = false
    closeModal()
  } catch (error) {
    showError(error.message || '저축 기록에 실패했습니다')
    isSubmitting.value = false
  }
}

/**
 * 단계 상승 모달 확인 핸들러
 */
const handleStageUpConfirm = () => {
  isStageUpModalOpen.value = false
  stageUpInfo.value = null
}

const handleCompletionClose = () => {
  isCompletionModalOpen.value = false
  completionInfo.value = null
}

const handleCompletionViewCollection = () => {
  handleCompletionClose()
  router.push('/collection')
}

const handleCompletionSetNextGoal = () => {
  handleCompletionClose()
  router.push('/properties')
}

/**
 * 폼 초기화
 */
const resetForm = () => {
  formData.value = {
    amount: null,
    memo: ''
  }
  selectedQuickAmount.value = null
}

// ESC 키로 모달 닫기
watch(() => props.isOpen, (isOpen, _, onCleanup) => {
  if (!isOpen) return

  const handleEsc = (e) => {
    if (e.key === 'Escape') closeModal()
  }

  document.addEventListener('keydown', handleEsc)
  onCleanup(() => document.removeEventListener('keydown', handleEsc))
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

html[data-theme="day"] .modal-overlay {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

html[data-theme="night"] .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Modal Container - Glassmorphism */
.modal-container {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Goal Progress Mini Display */
.goal-mini-progress {
  padding: 0.75rem 1rem;
  background: var(--surface-muted, #f9fafb);
  border-radius: 12px;
  margin-bottom: 1rem;
}

html[data-theme="night"] .goal-mini-progress {
  background: rgba(255, 255, 255, 0.06);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.goal-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

html[data-theme="night"] .goal-name {
  color: var(--showroom-text-night, #F5EDE3);
}

.progress-rate {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
}

.progress-bar-mini {
  height: 6px;
  background: var(--border-soft, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

html[data-theme="night"] .progress-bar-mini {
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Quick Amount Buttons */
.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-btn {
  padding: 0.65rem 0.5rem;
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 10px;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
}

html[data-theme="night"] .quick-btn {
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--showroom-text-night, #F5EDE3);
}

.quick-btn:hover:not(:disabled) {
  border-color: var(--brand-accent, #ff6b3d);
  color: var(--brand-accent, #ff6b3d);
  background: rgba(255, 107, 61, 0.05);
}

.quick-btn.active {
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  border-color: var(--brand-accent, #ff6b3d);
  color: #ffffff;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* XP Preview */
.xp-preview {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 107, 61, 0.08);
  border-radius: 10px;
  font-size: 0.8125rem;
  color: var(--brand-accent, #ff6b3d);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .xp-preview {
  background: rgba(212, 165, 116, 0.12);
  color: var(--showroom-accent-night, #D4A574);
}

.xp-preview strong {
  font-weight: 700;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="day"] .close-button {
  background: transparent;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .close-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .close-button {
  background: transparent;
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
  background: transparent;
}

html[data-theme="night"] .form-label {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--showroom-text-secondary-day, #8D6E63);
  pointer-events: none;
}

html[data-theme="night"] .input-suffix {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Inputs - Glass Cushioned */
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  font-size: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.3s ease;
}

html[data-theme="day"] .form-input,
html[data-theme="day"] .form-textarea {
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.85));
  color: var(--showroom-text-day, #5D4037);
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  box-shadow: var(--nav-btn-shadow-day);
}

html[data-theme="day"] .form-input:focus,
html[data-theme="day"] .form-textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow:
    0 0 0 4px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.14),
    var(--nav-btn-shadow-day-hover);
}

html[data-theme="night"] .form-input,
html[data-theme="night"] .form-textarea {
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  color: var(--showroom-text-night, #F5EDE3);
  border: 1px solid var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  box-shadow: var(--nav-btn-shadow-night);
  backdrop-filter: blur(var(--nav-btn-blur-night, 16px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-night, 16px));
}

html[data-theme="night"] .form-input:focus,
html[data-theme="night"] .form-textarea:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  box-shadow:
    0 0 0 4px rgba(212, 165, 116, 0.16),
    var(--nav-btn-shadow-night-hover, 0 12px 40px rgba(0, 0, 0, 0.5));
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--showroom-text-secondary-day, #8D6E63);
  opacity: 0.6;
}

html[data-theme="night"] .form-input::placeholder,
html[data-theme="night"] .form-textarea::placeholder {
  color: var(--showroom-text-secondary-night, #D7CCC8);
  opacity: 0.4;
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Remove number input arrows */
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Submit Button styles live in src/assets/css/components/buttons.css */

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }

  .modal-container {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .form-input,
  .form-textarea {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
