<template>
  <div class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <div class="warning-icon">
          <AppIcon name="exclamationTriangle" :size="32" />
        </div>
        <h2>정말 탈퇴하시겠습니까?</h2>
        <p class="modal-subtitle">
          탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-field">
          <label class="field-label">비밀번호 확인</label>
          <input
            v-model="password"
            type="password"
            class="field-input"
            placeholder="현재 비밀번호를 입력하세요"
            :disabled="isDeleting"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          <AppIcon name="exclamationCircle" :size="16" />
          {{ errorMessage }}
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
            :disabled="isDeleting"
          >
            취소
          </button>
          <button
            type="submit"
            class="btn btn-danger"
            :disabled="isDeleting || !password"
          >
            {{ isDeleting ? '처리 중...' : '회원탈퇴' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'

const emit = defineEmits(['close', 'confirm'])

const props = defineProps({
  isDeleting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const password = ref('')

function handleOverlayClick() {
  if (props.isDeleting) return
  emit('close')
}

function handleSubmit() {
  if (!password.value) return
  emit('confirm', password.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--glass-bg-day, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

html[data-theme="night"] .modal-content {
  background: var(--glass-bg-night, rgba(58, 53, 48, 0.95));
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.warning-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FF6B6B, #EE5A5A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--showroom-text-day, #2C2420);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .modal-header h2 {
  color: var(--showroom-text-night, #F9F8F6);
}

.modal-subtitle {
  font-size: 0.9375rem;
  color: var(--showroom-text-day, #2C2420);
  opacity: 0.7;
}

html[data-theme="night"] .modal-subtitle {
  color: var(--showroom-text-night, #F9F8F6);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day, #2C2420);
}

html[data-theme="night"] .field-label {
  color: var(--showroom-text-night, #F9F8F6);
}

.field-input {
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--showroom-text-day, #2C2420);
  transition: all 0.2s ease;
}

html[data-theme="night"] .field-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night, #F9F8F6);
}

.field-input:focus {
  outline: none;
  border-color: #FF6B6B;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  color: #D32F2F;
  font-size: 0.875rem;
}

html[data-theme="night"] .error-message {
  color: #EF5350;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn {
  flex: 1;
}

/* Button visuals live in src/assets/css/components/buttons.css */
</style>
