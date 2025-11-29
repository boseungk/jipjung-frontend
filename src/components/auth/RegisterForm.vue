<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-group">
      <label for="name">이름</label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="홍길동"
        class="glass-input"
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
        class="glass-input"
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
        class="glass-input"
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
        class="glass-input"
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
        class="glass-input"
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
      class="glass-button primary"
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

/* Jelly Glass Input */
.glass-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 14px;
  border: 1px solid var(--nav-btn-border-day, rgba(0, 0, 0, 0.06));
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  color: var(--showroom-text-day, #5D4037);
  box-shadow: var(--nav-btn-shadow-day);
  transition: var(--nav-btn-transition, all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1));
  line-height: 1.5;
}

.glass-input::placeholder {
  color: rgba(93, 64, 55, 0.6);
  font-size: 0.9375rem;
}

.glass-input:hover {
  box-shadow: var(--nav-btn-shadow-day-hover);
  transform: translateY(-1px) scale(1.01);
}

.glass-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 0 4px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.12),
    var(--nav-btn-shadow-day-hover);
  transform: translateY(-1px) scale(1.015);
}

.glass-input.error {
  border-color: #D32F2F;
  background: rgba(254, 242, 242, 0.9);
  box-shadow: 0 6px 14px rgba(211, 47, 47, 0.12);
}

.glass-input.error:focus {
  box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.15);
}

html[data-theme="night"] .glass-input {
  background: var(--nav-btn-bg-night, rgba(255, 255, 255, 0.08));
  border-color: var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  color: var(--showroom-text-night, #F5EDE3);
  box-shadow: var(--nav-btn-shadow-night);
}

html[data-theme="night"] .glass-input::placeholder {
  color: rgba(245, 237, 227, 0.65);
}

html[data-theme="night"] .glass-input:focus {
  border-color: var(--showroom-accent-night, #D4A574);
  background: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 4px rgba(212, 165, 116, 0.14),
    var(--nav-btn-shadow-night-hover, 0 12px 40px rgba(0, 0, 0, 0.5));
}

html[data-theme="night"] .glass-input.error {
  border-color: #D32F2F;
  background: rgba(0, 0, 0, 0.3);
}

/* Autofill 스타일 */
.glass-input:-webkit-autofill,
.glass-input:-webkit-autofill:hover,
.glass-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--showroom-text-day, #5D4037);
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.85) inset;
  transition: background-color 5000s ease-in-out 0s;
  border-radius: 14px;
}

html[data-theme="night"] .glass-input:-webkit-autofill,
html[data-theme="night"] .glass-input:-webkit-autofill:hover,
html[data-theme="night"] .glass-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--showroom-text-night, #F5EDE3);
  -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3) inset;
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

.glass-button {
  width: 100%;
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  border-radius: 16px;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.16) 0%,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.08) 100%
  );
  color: var(--showroom-text-day, #5D4037);
  box-shadow:
    var(--nav-btn-shadow-day),
    0 10px 28px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.18);
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  transition: var(--nav-btn-transition, all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1));
}

.glass-button.primary {
  background: linear-gradient(to right, #fb923c, #f97316);
  color: white;
}

.glass-button:hover:not(:disabled) {
  box-shadow:
    var(--nav-btn-shadow-day-hover),
    0 14px 32px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.24);
  transform: translateY(-2px) scale(1.02);
}

.glass-button:active:not(:disabled) {
  box-shadow: var(--nav-btn-press-shadow-day);
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
}

.glass-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

html[data-theme="night"] .glass-button.primary {
  background: linear-gradient(
    135deg,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.26) 0%,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.16) 100%
  );
  border-color: var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  box-shadow:
    var(--nav-btn-shadow-night),
    0 14px 36px rgba(0, 0, 0, 0.45),
    0 0 36px var(--glass-glow-night, rgba(212, 165, 116, 0.5));
  color: #ffffff;
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
