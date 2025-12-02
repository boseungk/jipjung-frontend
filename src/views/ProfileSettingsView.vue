<template>
  <div class="profile-view">
    <div class="profile-container">
      <h1 class="page-title">
        <AppIcon name="user" :size="24" />
        프로필 설정
      </h1>
      <p class="page-subtitle">내 정보를 관리하세요</p>

      <div v-if="user" class="settings-sections">
        <!-- Personal Info Section -->
        <section class="settings-section">
          <h2 class="section-title">
            <AppIcon name="person" :size="20" />
            개인 정보
          </h2>
          
          <div class="form-field">
            <label class="field-label">이름</label>
            <input
              v-model="editableUser.name"
              type="text"
              class="field-input"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div class="form-field">
            <label class="field-label">생년월일</label>
            <input
              v-model.number="editableUser.birthYear"
              type="number"
              class="field-input"
              placeholder="예: 1995"
              :min="1950"
              :max="new Date().getFullYear() - 19"
            />
          </div>
        </section>

        <!-- Financial Info Section -->
        <section class="settings-section">
          <h2 class="section-title">
            <AppIcon name="cashStack" :size="20" />
            금융 정보
          </h2>

          <div class="form-field">
            <label class="field-label">
              연소득
              <span class="field-hint">(만원 단위)</span>
            </label>
            <div class="income-input-wrapper">
              <input
                v-model.number="editableUser.annualIncome"
                type="number"
                class="field-input income-input"
                placeholder="연소득을 입력하세요"
                :min="0"
                :max="50000"
              />
              <span class="input-suffix">만원</span>
            </div>
            <div class="field-description">
              정확한 대출 한도 계산을 위해 필요합니다
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">
              기존 대출 월 상환금
              <span class="field-hint">(만원 단위)</span>
            </label>
            <div class="income-input-wrapper">
              <input
                v-model.number="editableUser.existingLoanMonthly"
                type="number"
                class="field-input income-input"
                placeholder="월 상환금을 입력하세요"
                :min="0"
                :max="1000"
              />
              <span class="input-suffix">만원</span>
            </div>
          </div>
        </section>

        <!-- Account Info Section -->
        <section class="settings-section">
          <h2 class="section-title">
            <AppIcon name="envelope" :size="20" />
            계정 정보
          </h2>

          <div class="form-field">
            <label class="field-label">이메일</label>
            <div class="field-input readonly">{{ user.email }}</div>
            <div class="field-description">이메일은 변경할 수 없습니다</div>
          </div>

          <div class="form-field">
            <label class="field-label">가입일</label>
            <div class="field-input readonly">{{ formatDate(user.createdAt) }}</div>
          </div>
        </section>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            @click="handleCancel"
            type="button"
            class="btn btn-secondary"
            :disabled="isSaving"
          >
            취소
          </button>
          <button
            @click="handleSave"
            type="button"
            class="btn btn-primary"
            :disabled="isSaving || !hasChanges"
          >
            {{ isSaving ? '저장 중...' : '변경사항 저장' }}
          </button>
        </div>

        <!-- Save Success Message -->
        <transition name="fade">
          <div v-if="showSuccessMessage" class="success-message">
            <AppIcon name="checkCircle" :size="20" />
            변경사항이 저장되었습니다!
          </div>
        </transition>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const editableUser = ref({})
const isSaving = ref(false)
const showSuccessMessage = ref(false)

// Check if there are unsaved changes
const hasChanges = computed(() => {
  if (!user.value) return false
  
  return (
    editableUser.value.name !== user.value.name ||
    editableUser.value.birthYear !== user.value.birthYear ||
    editableUser.value.annualIncome !== user.value.annualIncome ||
    editableUser.value.existingLoanMonthly !== user.value.existingLoanMonthly
  )
})

// Initialize editable user data
function initializeEditableUser() {
  if (user.value) {
    editableUser.value = {
      name: user.value.name || '',
      birthYear: user.value.birthYear || null,
      annualIncome: user.value.annualIncome || 0,
      existingLoanMonthly: user.value.existingLoanMonthly || 0
    }
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Handle save
async function handleSave() {
  if (!hasChanges.value) return

  isSaving.value = true
  
  try {
    await authStore.updateProfile({
      name: editableUser.value.name,
      birthYear: editableUser.value.birthYear,
      annualIncome: editableUser.value.annualIncome,
      existingLoanMonthly: editableUser.value.existingLoanMonthly
    })

    initializeEditableUser()

    // Show success message
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to save profile:', error)
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSaving.value = false
  }
}

// Handle cancel
function handleCancel() {
  if (hasChanges.value) {
    if (confirm('변경사항이 저장되지 않았습니다. 취소하시겠습니까?')) {
      initializeEditableUser()
    }
  } else {
    router.push('/')
  }
}

watch(user, (newUser) => {
  if (newUser) {
    initializeEditableUser()
  } else {
    editableUser.value = {}
  }
}, { immediate: true })
</script>

<style scoped>
.profile-view {
  width: 100%;
  min-height: 100vh;
  padding: 4rem 2rem 2rem;
  background: var(--showroom-bg-day, #F9F8F6);
}

html[data-theme="night"] .profile-view {
  background: var(--showroom-bg-night, #3a3530);
}

.profile-container {
  max-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--showroom-text-day, #2C2420);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

html[data-theme="night"] .page-title {
  color: var(--showroom-text-night, #F9F8F6);
}

.page-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: var(--showroom-text-day, #2C2420);
  opacity: 0.7;
  margin-bottom: 3rem;
}

html[data-theme="night"] .page-subtitle {
  color: var(--showroom-text-night, #F9F8F6);
}

/* Settings Sections - Glassmorphism */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  padding: 2rem;
  border-radius: 20px;
  
  /* Glassmorphism - Day */
  background: var(--glass-bg-day, rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border-day, rgba(255, 255, 255, 0.3));
  box-shadow: 
    0 8px 32px rgba(88, 60, 50, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

html[data-theme="night"] .settings-section {
  background: var(--glass-bg-night, rgba(74, 69, 64, 0.4));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-night, rgba(255, 127, 80, 0.2));
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-accent-day, var(--brand-accent));
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="night"] .section-title {
  color: var(--showroom-accent-night, var(--brand-accent));
}

/* Form Fields */
.form-field {
  margin-bottom: 1.5rem;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--showroom-text-day, #2C2420);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .field-label {
  color: var(--showroom-text-night, #F9F8F6);
}

.field-hint {
  font-size: 0.8125rem;
  font-weight: 400;
  opacity: 0.6;
  margin-left: 0.25rem;
}

.field-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border-radius: 12px;
  color: var(--showroom-text-day, #2C2420);
  transition: all 0.2s ease;
  
  /* Glassmorphism Input - Day */
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 
    inset 0 1px 3px rgba(88, 60, 50, 0.08),
    0 2px 8px rgba(88, 60, 50, 0.04);
}

html[data-theme="night"] .field-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night, #F9F8F6);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.field-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 
    inset 0 1px 3px rgba(88, 60, 50, 0.08),
    0 0 0 3px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.15),
    0 4px 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.1);
}

html[data-theme="night"] .field-input:focus {
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.3),
    0 4px 16px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
}

.field-input.readonly {
  background: rgba(141, 110, 99, 0.08);
  cursor: not-allowed;
  opacity: 0.7;
}

html[data-theme="night"] .field-input.readonly {
  background: rgba(255, 255, 255, 0.03);
}

/* Income Input with Suffix */
.income-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.income-input {
  flex: 1;
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
}

.input-suffix {
  font-size: 1rem;
  font-weight: 600;
  color: var(--showroom-text-day, #2C2420);
  opacity: 0.6;
  min-width: 3rem;
}

html[data-theme="night"] .input-suffix {
  color: var(--showroom-text-night, #F9F8F6);
}

/* Remove number input arrows */
.field-input[type=number]::-webkit-inner-spin-button,
.field-input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field-input[type=number] {
  -moz-appearance: textfield;
}

.field-description {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--showroom-text-day, #2C2420);
  opacity: 0.6;
  line-height: 1.4;
}

html[data-theme="night"] .field-description {
  color: var(--showroom-text-night, #F9F8F6);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  color: var(--showroom-text-day, #2C2420);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 
    0 4px 12px rgba(88, 60, 50, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

html[data-theme="night"] .btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-text-night, #F9F8F6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 16px rgba(88, 60, 50, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

html[data-theme="night"] .btn-secondary:hover:not(:disabled) {
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
  box-shadow: 
    inset 0 3px 8px rgba(88, 60, 50, 0.15),
    0 2px 6px rgba(88, 60, 50, 0.08);
}

html[data-theme="night"] .btn-secondary:active:not(:disabled) {
  box-shadow:
    inset 0 4px 16px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand-accent), #FF6347);
  color: white;
  border: none;
  box-shadow: 
    0 4px 16px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 20px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px) scale(0.97);
  opacity: 0.85;
  box-shadow: 
    inset 0 3px 12px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
}

/* Success Message - Glassmorphism */
.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #2E7D32;
  font-weight: 600;
  box-shadow: 
    0 4px 16px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .success-message {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.4);
  color: #81C784;
  box-shadow:
    0 4px 16px rgba(76, 175, 80, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--showroom-text-day, #2C2420);
}

html[data-theme="night"] .loading-state {
  color: var(--showroom-text-night, #F9F8F6);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1.5rem;
  border: 4px solid transparent;
  border-top-color: var(--brand-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .profile-view {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .settings-section {
    padding: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
