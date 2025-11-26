<template>
  <div class="onboarding-view">
    <div class="onboarding-container">
      <div class="onboarding-card">
        <div class="onboarding-header">
          <h1 class="onboarding-title">
            환영합니다!
            <PhConfetti :size="32" weight="fill" color="#FF7F50" />
          </h1>
          <p class="onboarding-description">
            시작하기 전에 몇 가지 정보를 알려주세요
          </p>
        </div>

        <StepIndicator :current-step="currentStep" :total-steps="4" />

        <div class="step-content">
          <transition name="slide-fade" mode="out-in">
            <component
              :is="currentStepComponent"
              v-model="onboardingData[stepDataKeys[currentStep - 1]]"
              @next="handleNext"
            />
          </transition>
        </div>

        <div class="onboarding-actions">
          <button
            v-if="currentStep > 1"
            @click="handlePrev"
            class="nav-button secondary"
          >
            이전
          </button>

          <button
            v-if="currentStep < 4"
            @click="handleNext"
            class="nav-button primary"
            :disabled="!canProceed"
          >
            다음
          </button>

          <button
            v-else
            @click="handleComplete"
            class="nav-button primary"
            :disabled="!canProceed || isSubmitting"
          >
            {{ isSubmitting ? '저장 중...' : '시작하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { PhConfetti } from '@phosphor-icons/vue'
import StepIndicator from '@/components/onboarding/StepIndicator.vue'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1.vue'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2.vue'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3.vue'
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const isSubmitting = ref(false)

const onboardingData = ref({
  birthYear: null,
  annualIncome: 5000, // 만원 단위
  existingLoanMonthly: 0,
  preferredAreas: []
})

const stepDataKeys = ['birthYear', 'annualIncome', 'existingLoanMonthly', 'preferredAreas']

const stepComponents = {
  1: markRaw(OnboardingStep1),
  2: markRaw(OnboardingStep2),
  3: markRaw(OnboardingStep3),
  4: markRaw(OnboardingStep4)
}

const currentStepComponent = computed(() => stepComponents[currentStep.value])

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      const year = onboardingData.value.birthYear
      const currentYear = new Date().getFullYear()
      return year && year >= 1900 && year <= currentYear
    case 2:
      return onboardingData.value.annualIncome >= 2000 && onboardingData.value.annualIncome <= 10000
    case 3:
      return true // 기존 대출은 0도 가능
    case 4:
      return onboardingData.value.preferredAreas.length > 0 && onboardingData.value.preferredAreas.length <= 3
    default:
      return false
  }
})

function handleNext() {
  if (canProceed.value && currentStep.value < 4) {
    currentStep.value++
  }
}

function handlePrev() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function handleComplete() {
  if (!canProceed.value) return

  isSubmitting.value = true

  try {
    await authStore.completeOnboarding(onboardingData.value)
    router.push('/')
  } catch (error) {
    console.error('Onboarding submission failed:', error)
    alert('온보딩 정보 저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.onboarding-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--showroom-bg-day, #F5EDE3);
}

html[data-theme="night"] .onboarding-view {
  background: var(--showroom-bg-night, #3E3530);
}

.onboarding-container {
  width: 100%;
  max-width: 700px;
}

.onboarding-card {
  background: var(--showroom-bg-day, #F5EDE3);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow:
    12px 12px 24px rgba(93, 64, 55, 0.15),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
}

html[data-theme="night"] .onboarding-card {
  background: var(--showroom-bg-night, #4A3F35);
  box-shadow:
    12px 12px 24px rgba(0, 0, 0, 0.4),
    -12px -12px 24px rgba(255, 255, 255, 0.05);
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;
}

.onboarding-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--showroom-accent-day, #D4A574);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

html[data-theme="night"] .onboarding-title {
  color: var(--showroom-accent-night, #D4A574);
}

.onboarding-description {
  font-size: 1.125rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  font-weight: 500;
}

html[data-theme="night"] .onboarding-description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.step-content {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  width: 100%;
}

.step-content > * {
  width: 100%;
}

.onboarding-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.nav-button {
  min-width: 120px;
  padding: 0.75rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Primary Button (다음/시작하기) - Neumorphic */
.nav-button.primary {
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  box-shadow:
    4px 4px 8px rgba(93, 64, 55, 0.2),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.nav-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    6px 6px 12px rgba(93, 64, 55, 0.25),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
}

.nav-button.primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    inset 3px 3px 6px rgba(93, 64, 55, 0.3),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
}

.nav-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="night"] .nav-button.primary {
  background: var(--showroom-accent-night, #D4A574);
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.05);
}

/* Secondary Button (이전) - Neumorphic Same Style */
.nav-button.secondary {
  background: rgba(255, 255, 255, 0.6);
  color: var(--showroom-text-day, #5D4037);
  box-shadow:
    4px 4px 8px rgba(93, 64, 55, 0.15),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.nav-button.secondary:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow:
    6px 6px 12px rgba(93, 64, 55, 0.2),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
}

.nav-button.secondary:active {
  transform: translateY(0);
  box-shadow:
    inset 3px 3px 6px rgba(93, 64, 55, 0.2),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .nav-button.secondary {
  background: rgba(0, 0, 0, 0.2);
  color: var(--showroom-text-night, #F5EDE3);
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.25),
    -4px -4px 8px rgba(255, 255, 255, 0.05);
}

html[data-theme="night"] .nav-button.secondary:hover {
  background: rgba(0, 0, 0, 0.3);
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.3),
    -6px -6px 12px rgba(255, 255, 255, 0.08);
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .onboarding-card {
    padding: 2.5rem 1.5rem;
  }

  .onboarding-title {
    font-size: 2rem;
  }

  .onboarding-description {
    font-size: 1rem;
  }

  .step-content {
    min-height: 300px;
  }

  .nav-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
  }
}
</style>
