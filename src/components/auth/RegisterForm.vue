<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-group">
      <label for="name">이름</label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="홍길동"
        class="neomorphic-input"
        :class="{ 'error': validation.hasError('name') }"
        @blur="() => validation.validateField('name', formData.name, validation.validateName)"
        @input="() => validation.clearFieldError('name')"
        required
      />
      <span v-if="validation.hasError('name')" class="error-message">
        {{ validation.getError('name') }}
      </span>
    </div>

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
      <label for="birthYear">출생연도</label>
      <input
        id="birthYear"
        v-model.number="formData.birthYear"
        type="number"
        placeholder="1995"
        class="neomorphic-input"
        :class="{ 'error': validation.hasError('birthYear') }"
        @blur="() => validation.validateField('birthYear', formData.birthYear, validation.validateBirthYear)"
        @input="() => validation.clearFieldError('birthYear')"
        min="1900"
        :max="currentYear"
        required
      />
      <span v-if="validation.hasError('birthYear')" class="error-message">
        {{ validation.getError('birthYear') }}
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
      <span v-if=" validation.hasError('password')" class="error-message">
        {{ validation.getError('password') }}
      </span>
    </div>

    <div class="form-group">
      <label for="passwordConfirm">비밀번호 확인</label>
      <input
        id="passwordConfirm"
        v-model="formData.passwordConfirm"
        type="password"
        placeholder="••••••••"
        class="neomorphic-input"
        :class="{ 'error': validation.hasError('passwordConfirm') }"
        @blur="validatePasswordConfirmField"
        @input="() => validation.clearFieldError('passwordConfirm')"
        required
      />
      <span v-if="validation.hasError('passwordConfirm')" class="error-message">
        {{ validation.getError('passwordConfirm') }}
      </span>
    </div>

    <div v-if="apiError" class="api-error-message">
      {{ apiError }}
    </div>

    <button
      type="submit"
      class="neomorphic-button primary"
      :disabled="isLoading"
    >
      <span v-if="!isLoading">회원가입</span>
      <span v-else class="loading">
        <span class="spinner"></span>
        가입 중...
      </span>
    </button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useFormValidation } from '@/composables/useFormValidation'

const emit = defineEmits(['register-success'])
const authStore = useAuthStore()
const validation = useFormValidation()

const currentYear = computed(() => new Date().getFullYear())

const formData = ref({
  name: '',
  email: '',
  birthYear: null,
  password: '',
  passwordConfirm: ''
})

const isLoading = ref(false)
const apiError = ref('')

function validatePasswordConfirmField() {
  validation.validateField(
    'passwordConfirm',
    formData.value.passwordConfirm,
    (value) => validation.validatePasswordConfirm(formData.value.password, value)
  )
}

async function handleSubmit() {
  // 모든 필드 검증
  const nameValid = validation.validateField('name', formData.value.name, validation.validateName)
  const emailValid = validation.validateField('email', formData.value.email, validation.validateEmail)
  const birthYearValid = validation.validateField('birthYear', formData.value.birthYear, validation.validateBirthYear)
  const passwordValid = validation.validateField('password', formData.value.password, validation.validatePassword)
  const passwordConfirmValid = validation.validateField(
    'passwordConfirm',
    formData.value.passwordConfirm,
    (value) => validation.validatePasswordConfirm(formData.value.password, value)
  )

  if (!nameValid || !emailValid || !birthYearValid || !passwordValid || !passwordConfirmValid) {
    return
  }

  isLoading.value = true
  apiError.value = ''

  try {
    await authStore.register({
      email: formData.value.email,
      password: formData.value.password,
      name: formData.value.name,
      birthYear: formData.value.birthYear
    })
    emit('register-success')
  } catch (error) {
    apiError.value = error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
    console.error('Register error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 같은 스타일을 LoginForm.vue와 공유 */
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
  border: 2px solid rgba(93, 64, 55, 0.1);
  border-radius: 10px;
  background: #EEF0F2;
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
  border-color: #FF7F50;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.15);
}

.neomorphic-input.error {
  border-color: #D32F2F;
  background: #FEF2F2;
}

.neomorphic-input.error:focus {
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.15);
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

.neomorphic-button {
  width: 100%;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.neomorphic-button.primary {
  background: #FF7F50;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.3);
  font-weight: 700;
}

.neomorphic-button.primary:hover:not(:disabled) {
  background: #FF6A3D;
  box-shadow: 0 6px 16px rgba(255, 127, 80, 0.4);
  transform: translateY(-2px);
}

.neomorphic-button.primary:active:not(:disabled) {
  background: #FF5A2D;
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.2);
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
