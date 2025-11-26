<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-group">
      <label for="email">이메일</label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        placeholder="example@email.com"
        class="neomorphic-input"
        :class="{ 'error': validation.hasError('email') }"
        @blur="() => validation.validateField('email', formData.email, validation.validateEmail)"
        @input="() => validation.clearFieldError('email')"
        required
      />
      <span v-if="validation.hasError('email')" class="error-message">
        {{ validation.getError('email') }}
      </span>
    </div>

    <div class="form-group">
      <label for="password">비밀번호</label>
      <input
        id="password"
        v-model="formData.password"
        type="password"
        placeholder="••••••••"
        class="neomorphic-input"
        :class="{ 'error': validation.hasError('password') }"
        @blur="() => validation.validateField('password', formData.password, validation.validatePassword)"
        @input="() => validation.clearFieldError('password')"
        required
      />
      <span v-if="validation.hasError('password')" class="error-message">
        {{ validation.getError('password') }}
      </span>
    </div>

    <div class="form-options">
      <label class="checkbox-label">
        <input v-model="formData.rememberMe" type="checkbox" />
        <span>로그인 유지</span>
      </label>
    </div>

    <div v-if="apiError" class="api-error-message">
      {{ apiError }}
    </div>

    <button
      type="submit"
      class="neomorphic-button primary"
      :disabled="isLoading"
    >
      <span v-if="!isLoading">로그인</span>
      <span v-else class="loading">
        <span class="spinner"></span>
        로그인 중...
      </span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useFormValidation } from '@/composables/useFormValidation'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()
const validation = useFormValidation()

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)
const apiError = ref('')

async function handleSubmit() {
  // 폼 검증
  const emailValid = validation.validateField('email', formData.value.email, validation.validateEmail)
  const passwordValid = validation.validateField('password', formData.value.password, validation.validatePassword)

  if (!emailValid || !passwordValid) {
    return
  }

  isLoading.value = true
  apiError.value = ''

  try {
    await authStore.login(formData.value.email, formData.value.password)
    emit('login-success')
  } catch (error) {
    apiError.value = error.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--showroom-text-day, #5D4037);
  letter-spacing: 0.01em;
}

html[data-theme="night"] .form-group label {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Clean Box Input Design */
.neomorphic-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 2px solid rgba(93, 64, 55, 0.15);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--showroom-text-day, #5D4037);
  transition: all 0.25s ease;
  line-height: 1.5;
}

.neomorphic-input::placeholder {
  color: rgba(93, 64, 55, 0.5);
  font-size: 0.875rem;
}

.neomorphic-input:focus {
  outline: none;
  border-color: var(--showroom-accent-day, #D4A574);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.neomorphic-input.error {
  border-color: #D32F2F;
  background: rgba(255, 255, 255, 0.9);
}

.neomorphic-input.error:focus {
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

html[data-theme="night"] .neomorphic-input {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  border-color: rgba(245, 237, 227, 0.2);
}

html[data-theme="night"] .neomorphic-input::placeholder {
  color: rgba(245, 237, 227, 0.5);
}

html[data-theme="night"] .neomorphic-input:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

html[data-theme="night"] .neomorphic-input.error {
  border-color: #D32F2F;
  background: rgba(0, 0, 0, 0.25);
}

/* Autofill 스타일 */
.neomorphic-input:-webkit-autofill,
.neomorphic-input:-webkit-autofill:hover,
.neomorphic-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--showroom-text-day, #5D4037);
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.7) inset;
  transition: background-color 5000s ease-in-out 0s;
  border-radius: 10px;
}

html[data-theme="night"] .neomorphic-input:-webkit-autofill,
html[data-theme="night"] .neomorphic-input:-webkit-autofill:hover,
html[data-theme="night"] .neomorphic-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--showroom-text-night, #F5EDE3);
  -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.2) inset;
}

/* Form Options */
.form-options {
  margin-bottom: 2rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--showroom-text-day, #5D4037);
  font-weight: 400;
}

html[data-theme="night"] .checkbox-label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Error Messages */
.error-message {
  display: block;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  color: #D32F2F;
  font-weight: 500;
  line-height: 1.4;
}

.api-error-message {
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
  background: rgba(211, 47, 47, 0.08);
  border-radius: 10px;
  border-left: 3px solid #D32F2F;
  color: #D32F2F;
  font-size: 0.9375rem;
  text-align: left;
  line-height: 1.5;
  font-weight: 500;
}

/* Neomorphic Button */
.neomorphic-button {
  width: 100%;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-top: 0.5rem;
}

.neomorphic-button.primary {
  background: var(--showroom-accent-day, #D4A574);
  color: #FFFFFF;
  box-shadow: 
    4px 4px 8px rgba(93, 64, 55, 0.2),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.neomorphic-button.primary:hover:not(:disabled) {
  box-shadow: 
    6px 6px 12px rgba(93, 64, 55, 0.25),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.neomorphic-button.primary:active:not(:disabled) {
  box-shadow: 
    inset 3px 3px 6px rgba(93, 64, 55, 0.3),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
  transform: translateY(0);
}

.neomorphic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

html[data-theme="night"] .neomorphic-button.primary {
  background: var(--showroom-accent-night, #D4A574);
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.05);
}

/* Loading Spinner */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
