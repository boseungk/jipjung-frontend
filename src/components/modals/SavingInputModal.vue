<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            <AppIcon name="piggyBank" :size="24" weight="fill" color="currentColor" />
            저축 기록하기
          </h2>
          <button class="close-button" @click="closeModal" aria-label="닫기">
            <PhX :size="20" weight="bold" color="currentColor" />
          </button>
        </div>

        <!-- Form -->
        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Amount Input -->
          <div class="form-group">
            <label for="amount" class="form-label">저축 금액</label>
            <div class="input-wrapper">
              <input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                class="form-input"
                placeholder="금액을 입력하세요"
                min="1"
                required
              />
              <span class="input-suffix">원</span>
            </div>
          </div>

          <!-- Saving Method -->
          <div class="form-group">
            <label for="method" class="form-label">저축 방법</label>
            <select
              id="method"
              v-model="formData.method"
              class="form-select"
              required
            >
              <option value="">선택하세요</option>
              <option value="KB청년희망적금">KB청년희망적금</option>
              <option value="신한 쏠편한 적금">신한 쏠편한 적금</option>
              <option value="하나 청년도약계좌">하나 청년도약계좌</option>
              <option value="일반 적금">일반 적금</option>
              <option value="자유 저축">자유 저축</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <!-- Date Input -->
          <div class="form-group">
            <label for="date" class="form-label">저축 날짜</label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              class="form-input"
              :max="today"
              required
            />
          </div>

          <!-- Memo Input -->
          <div class="form-group">
            <label for="memo" class="form-label">메모 (선택)</label>
            <textarea
              id="memo"
              v-model="formData.memo"
              class="form-textarea"
              placeholder="메모를 입력하세요"
              rows="3"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-button">
            <AppIcon name="floppyDisk" :size="20" :active="true" :is-major-cta="true" aria-hidden="true" />
            저축 기록하기
          </button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhX } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Form data
const formData = ref({
  amount: null,
  method: '',
  date: new Date().toISOString().split('T')[0],
  memo: ''
})

// Today's date for max attribute
const today = computed(() => new Date().toISOString().split('T')[0])

const closeModal = () => {
  emit('close')
  resetForm()
}

const handleOverlayClick = () => {
  closeModal()
}

const handleSubmit = () => {
  // TODO: Add validation
  if (formData.value.amount && formData.value.method && formData.value.date) {
    emit('submit', { ...formData.value })
    closeModal()
  }
}

const resetForm = () => {
  formData.value = {
    amount: null,
    method: '',
    date: new Date().toISOString().split('T')[0],
    memo: ''
  }
}
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
  margin-bottom: 2rem;
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

html[data-theme="day"] .close-button {
  background: transparent;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="day"] .close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .close-button {
  background: transparent;
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .close-button:hover {
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
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  font-size: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: all 0.3s ease;
}

html[data-theme="day"] .form-input,
html[data-theme="day"] .form-select,
html[data-theme="day"] .form-textarea {
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.85));
  color: var(--showroom-text-day, #5D4037);
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  box-shadow: var(--nav-btn-shadow-day);
}

html[data-theme="day"] .form-input:focus,
html[data-theme="day"] .form-select:focus,
html[data-theme="day"] .form-textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow:
    0 0 0 4px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.14),
    var(--nav-btn-shadow-day-hover);
}

html[data-theme="night"] .form-input,
html[data-theme="night"] .form-select,
html[data-theme="night"] .form-textarea {
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  color: var(--showroom-text-night, #F5EDE3);
  border: 1px solid var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  box-shadow: var(--nav-btn-shadow-night);
  backdrop-filter: blur(var(--nav-btn-blur-night, 16px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-night, 16px));
}

html[data-theme="night"] .form-input:focus,
html[data-theme="night"] .form-select:focus,
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  cursor: pointer;
}

/* Submit Button - Glass CTA */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  border-radius: 16px;
  font-size: 1.0625rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .submit-button {
  background: linear-gradient(
    135deg,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.22) 0%,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.12) 100%
  );
  color: white;
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  box-shadow:
    var(--nav-btn-shadow-day),
    0 12px 28px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
}

html[data-theme="day"] .submit-button:hover {
  transform: translateY(-3px);
  box-shadow:
    var(--nav-btn-shadow-day-hover),
    0 14px 36px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.26);
}

html[data-theme="day"] .submit-button:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: var(--nav-btn-press-shadow-day);
}

html[data-theme="night"] .submit-button {
  background: rgba(212, 165, 116, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.3);
  border-left-color: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.35), 
    0 0 25px rgba(212, 165, 116, 0.4);
}

html[data-theme="night"] .submit-button:hover {
  background: rgba(212, 165, 116, 0.25);
  transform: translateY(-4px);
  border-top-color: rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.4), 
    0 0 35px rgba(212, 165, 116, 0.5);
}

html[data-theme="night"] .submit-button:active {
  background: rgba(0, 0, 0, 0.25);
  transform: translateY(2px) scale(0.98);
  box-shadow:
    inset 4px 4px 12px rgba(0, 0, 0, 0.6),
    inset -2px -2px 8px rgba(255, 255, 255, 0.03);
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
  .form-select,
  .form-textarea {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
