<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">🏠 드림홈 설정</h2>
          <button class="close-button" @click="closeModal" :disabled="isSubmitting">✕</button>
        </div>

        <!-- Property Info -->
        <div class="property-info">
          <h3 class="property-name">{{ property?.title || '아파트' }}</h3>
          <p class="property-location">{{ property?.sido }} {{ property?.sigungu }}</p>
          <p class="property-price">최신 거래가: {{ formatPrice(property?.price || 0) }}</p>
        </div>

        <!-- Form -->
        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Target Amount -->
          <div class="form-group">
            <label class="form-label">목표 금액 (필요 계약금)</label>
            <div class="input-with-calc">
              <div class="input-wrapper">
                <input
                  v-model.number="formData.targetAmount"
                  type="number"
                  class="form-input"
                  placeholder="목표 금액 입력"
                  min="1"
                  required
                  :disabled="isSubmitting"
                />
                <span class="input-suffix">만원</span>
              </div>
              <button type="button" class="calc-button" @click="calcDownPayment" :disabled="isSubmitting">
                30% 자동계산
              </button>
            </div>
          </div>

          <!-- Target Date -->
          <div class="form-group">
            <label class="form-label">목표 달성일</label>
            <input
              v-model="formData.targetDate"
              type="date"
              class="form-input"
              :min="minDate"
              required
              :disabled="isSubmitting"
            />
          </div>

          <!-- Monthly Goal (Auto-calculated) -->
          <div class="form-group">
            <label class="form-label">월 목표 저축액</label>
            <div class="input-wrapper">
              <input
                v-model.number="formData.monthlyGoal"
                type="number"
                class="form-input"
                placeholder="월 저축 목표"
                min="1"
                required
                :disabled="isSubmitting"
              />
              <span class="input-suffix">만원</span>
            </div>
            <p class="hint" v-if="monthsRemaining > 0">
              {{ monthsRemaining }}개월 동안 매달 {{ formatMoney(suggestedMonthly) }}만원씩
            </p>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-button" :disabled="isSubmitting || !isFormValid">
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? '설정 중...' : '드림홈 설정하기' }}
          </button>
        </form>
      </div>
    </div>
  </transition>
  </Teleport>
</template>

<script setup>
/**
 * DreamHomeSetModal
 * 
 * 드림홈(목표 주택) 설정 모달 컴포넌트.
 * 매물 상세에서 "내 집으로 설정" 버튼 클릭 시 표시됩니다.
 * 
 * 백엔드 API: POST /api/dream-home
 */
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  property: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'success'])

// Stores & Composables
const router = useRouter()
const dreamHomeStore = useDreamHomeStore()
const { showSuccess, showError } = useToast()

// State
const isSubmitting = ref(false)
const formData = ref({
  targetAmount: null,
  targetDate: '',
  monthlyGoal: null
})

// 최소 날짜 (오늘)
const minDate = computed(() => new Date().toISOString().split('T')[0])

// 남은 개월 수
const monthsRemaining = computed(() => {
  if (!formData.value.targetDate) return 0
  const target = new Date(formData.value.targetDate)
  const today = new Date()
  const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())
  return Math.max(1, months)
})

// 추천 월 저축액
const suggestedMonthly = computed(() => {
  if (!formData.value.targetAmount || !monthsRemaining.value) return 0
  return Math.ceil(formData.value.targetAmount / monthsRemaining.value)
})

// 폼 유효성
const isFormValid = computed(() => {
  return formData.value.targetAmount > 0 && 
         formData.value.targetDate && 
         formData.value.monthlyGoal > 0
})

// 목표 달성일 변경 시 월 저축액 자동 계산
watch(() => formData.value.targetDate, () => {
  if (formData.value.targetAmount && monthsRemaining.value > 0) {
    formData.value.monthlyGoal = suggestedMonthly.value
  }
})

// 목표 금액 변경 시 월 저축액 자동 계산
watch(() => formData.value.targetAmount, () => {
  if (monthsRemaining.value > 0) {
    formData.value.monthlyGoal = suggestedMonthly.value
  }
})

/**
 * 30% 계약금 자동 계산
 */
const calcDownPayment = () => {
  if (props.property?.price) {
    formData.value.targetAmount = Math.ceil(props.property.price * 0.3)
  }
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
 * 폼 제출 - 백엔드 드림홈 설정 API 호출
 */
const handleSubmit = async () => {
  if (!isFormValid.value) {
    showError('모든 필드를 입력해주세요')
    return
  }

  isSubmitting.value = true

  try {
    const response = await dreamHomeStore.setDreamHome({
      aptSeq: props.property?.aptSeq || props.property?.id,
      targetAmount: formData.value.targetAmount,
      targetDate: formData.value.targetDate,
      monthlyGoal: formData.value.monthlyGoal
    })

    showSuccess(`"${props.property?.title}"을(를) 드림홈으로 설정했습니다!`)
    emit('success', response)
    closeModal()

    // 대시보드로 이동
    router.push('/')
  } catch (error) {
    showError(error.message || '드림홈 설정에 실패했습니다')
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 폼 초기화
 */
const resetForm = () => {
  formData.value = {
    targetAmount: null,
    targetDate: '',
    monthlyGoal: null
  }
}

/**
 * 가격 포맷팅
 */
const formatPrice = (priceInManwon) => {
  if (!priceInManwon) return '가격 미정'
  const eok = Math.floor(priceInManwon / 10000)
  const remainder = priceInManwon % 10000
  const chun = Math.floor(remainder / 1000)

  if (eok > 0 && chun > 0) {
    return `${eok}억 ${chun}천만원`
  } else if (eok > 0) {
    return `${eok}억원`
  } else if (chun > 0) {
    return `${chun}천만원`
  } else {
    return `${priceInManwon}만원`
  }
}

/**
 * 숫자 천 단위 콤마
 */
const formatMoney = (value) => {
  if (!value) return '0'
  return value.toLocaleString('ko-KR')
}

// 모달 열릴 때 기본값 설정
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.property?.price) {
    // 기본 목표 금액: 30% 계약금
    formData.value.targetAmount = Math.ceil(props.property.price * 0.3)
    
    // 기본 목표 날짜: 2년 후
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)
    formData.value.targetDate = twoYearsLater.toISOString().split('T')[0]
  }
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Modal Container */
.modal-container {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
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
  background: transparent;
  color: var(--showroom-text-day, #5D4037);
  transition: all 0.2s ease;
}

html[data-theme="night"] .close-button {
  color: var(--showroom-text-night, #F5EDE3);
}

.close-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Property Info */
.property-info {
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
}

.property-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0 0 0.5rem 0;
}

html[data-theme="night"] .property-name {
  color: var(--showroom-text-night, #F5EDE3);
}

.property-location {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
  margin: 0 0 0.25rem 0;
}

.property-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--brand-accent, #ff6b3d);
  margin: 0;
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
}

html[data-theme="night"] .form-label {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Input with Calc Button */
.input-with-calc {
  display: flex;
  gap: 0.5rem;
}

.input-with-calc .input-wrapper {
  flex: 1;
}

.calc-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  color: var(--brand-accent, #ff6b3d);
  transition: all 0.2s ease;
}

.calc-button:hover:not(:disabled) {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

.calc-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Inputs */
.form-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  font-size: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.3s ease;
}

html[data-theme="day"] .form-input {
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.85));
  color: var(--showroom-text-day, #5D4037);
  box-shadow: var(--nav-btn-shadow-day);
}

html[data-theme="day"] .form-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 4px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.14);
}

html[data-theme="night"] .form-input {
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  color: var(--showroom-text-night, #F5EDE3);
  border: 1px solid var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  box-shadow: var(--nav-btn-shadow-night);
}

html[data-theme="night"] .form-input:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.16);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Hint Text */
.hint {
  font-size: 0.8125rem;
  color: var(--bento-text-muted, #6b7280);
  margin: 0;
}

/* Submit Button */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.0625rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: #ffffff;
  box-shadow: 0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.submit-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

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

  .input-with-calc {
    flex-direction: column;
  }

  .calc-button {
    width: 100%;
  }

  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
