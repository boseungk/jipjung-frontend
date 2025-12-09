<template>
  <div class="onboarding-view">
    <!-- Toast Notification -->
    <Toast />
    
    <div class="onboarding-container">
      <div class="onboarding-card">
        <div class="onboarding-header">
          <p class="onboarding-eyebrow" v-if="currentStep === 1">
            {{ MESSAGES.WELCOME }}
            <PhConfetti :size="24" weight="fill" />
          </p>
          <h1 class="onboarding-title" :class="{ compact: currentStep > 1 }">
            {{ currentStep === 1 ? MESSAGES.INTRO : '정보를 입력해주세요' }}
          </h1>
        </div>

        <StepIndicator :current-step="currentStep" :total-steps="TOTAL_STEPS" />

        <div class="step-content">
          <transition name="slide-fade" mode="out-in">
            <component
              :is="currentStepComponent"
              v-model="currentStepModel"
              @next="handleNext"
            />
          </transition>
        </div>

        <div class="onboarding-actions">
          <button
            v-if="currentStep > 1"
            @click="handlePrev"
            type="button"
            class="nav-button secondary"
            aria-label="이전 단계로"
          >
            {{ MESSAGES.PREV }}
          </button>

          <button
            v-if="currentStep < TOTAL_STEPS"
            @click="handleNext"
            type="button"
            class="nav-button primary"
            :disabled="!canProceed"
            aria-label="다음 단계로"
          >
            {{ MESSAGES.NEXT }}
          </button>

          <button
            v-else
            @click="handleComplete"
            type="button"
            class="nav-button primary"
            :disabled="!canProceed || isSubmitting"
            :aria-label="isSubmitting ? MESSAGES.LOADING : MESSAGES.START"
          >
            {{ isSubmitting ? MESSAGES.LOADING : MESSAGES.START }}
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
import { useOnboardingValidation } from '@/composables/useOnboardingValidation'
import { useToast } from '@/composables/useToast'
import { TOTAL_STEPS, MESSAGES, VALIDATION } from '@/constants/onboardingConstants'
import Toast from '@/components/common/Toast.vue'
import StepIndicator from '@/components/onboarding/StepIndicator.vue'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1.vue'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2.vue'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3.vue'
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useToast()

const currentStep = ref(1)
const isSubmitting = ref(false)

const onboardingData = ref({
  birthYear: null,
  annualIncome: VALIDATION.ANNUAL_INCOME.DEFAULT,
  existingLoanMonthly: VALIDATION.EXISTING_LOAN.DEFAULT,
  currentAssets: 0,
  preferredAreas: []
})

const stepDataKeys = ['birthYear', 'annualIncome', 'financialInfo', 'preferredAreas']

const stepComponents = {
  1: markRaw(OnboardingStep1),
  2: markRaw(OnboardingStep2),
  3: markRaw(OnboardingStep3),
  4: markRaw(OnboardingStep4)
}

const currentStepComponent = computed(() => stepComponents[currentStep.value])

const { canProceed } = useOnboardingValidation(onboardingData, currentStep)

// Computed for Step 3 (financial info object binding)
const financialInfo = computed({
  get: () => ({
    existingLoanMonthly: onboardingData.value.existingLoanMonthly,
    currentAssets: onboardingData.value.currentAssets
  }),
  set: (val) => {
    onboardingData.value.existingLoanMonthly = val.existingLoanMonthly ?? 0
    onboardingData.value.currentAssets = val.currentAssets ?? 0
  }
})

// Unified model for v-model binding based on current step
const currentStepModel = computed({
  get: () => {
    if (currentStep.value === 3) {
      return financialInfo.value
    }
    return onboardingData.value[stepDataKeys[currentStep.value - 1]]
  },
  set: (val) => {
    if (currentStep.value === 3) {
      financialInfo.value = val
    } else {
      onboardingData.value[stepDataKeys[currentStep.value - 1]] = val
    }
  }
})

function handleNext() {
  if (canProceed.value && currentStep.value < TOTAL_STEPS) {
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
    // preferredAreas를 백엔드 형식(문자열 배열)으로 변환
    const requestData = {
      ...onboardingData.value,
      preferredAreas: onboardingData.value.preferredAreas.map(
        area => `${area.sido} ${area.sigungu}`
      )
    }
    
    await authStore.completeOnboarding(requestData)
    showSuccess(MESSAGES.SUBMIT_SUCCESS)
    
    // Delay navigation to show success toast
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    console.error('Onboarding submission failed:', error)
    showError(MESSAGES.SUBMIT_ERROR)
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
  background: var(--onboarding-bg);
}

.onboarding-container {
  width: 100%;
  max-width: 700px;
}

.onboarding-card {
  background: var(--onboarding-surface);
  padding: 3rem 2.5rem;
  border-radius: var(--onboarding-radius-lg);
  box-shadow: var(--onboarding-shadow-soft);
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;
}

.onboarding-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: var(--onboarding-font-eyebrow-size);
  font-weight: var(--onboarding-font-eyebrow-weight);
  letter-spacing: var(--onboarding-font-eyebrow-spacing);
  color: var(--onboarding-primary);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.onboarding-title {
  font-size: var(--onboarding-font-title-size);
  font-weight: var(--onboarding-font-title-weight);
  letter-spacing: var(--onboarding-font-title-spacing);
  color: var(--onboarding-text-primary);
  line-height: 1.3;
  transition: all 0.3s ease;
}

.onboarding-title.compact {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
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

/* Navigation Buttons - Tactile Design */
.nav-button {
  min-width: 120px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--onboarding-radius-md);
  cursor: pointer;
  border: none;
  transition: var(--onboarding-transition-bounce);
}

/* Secondary Button (이전) - Tactile Visible Button */
.nav-button.secondary {
  background: rgba(88, 60, 50, 0.06); /* Subtle beige/gray */
  color: var(--onboarding-text-primary);
  border: 1px solid rgba(88, 60, 50, 0.12);
  box-shadow: var(--onboarding-shadow-soft);
}

.nav-button.secondary:hover {
  background: rgba(88, 60, 50, 0.08);
  border-color: rgba(88, 60, 50, 0.18);
  transform: translateY(-1px);
}

.nav-button.secondary:active {
  /* Inset press effect - feels like pushing into surface */
  background: rgba(88, 60, 50, 0.04);
  box-shadow: var(--onboarding-shadow-pressed);
  transform: scale(0.97);
  border-color: rgba(88, 60, 50, 0.15);
}

/* Primary Button (다음/시작하기) - Coral with Glow */
.nav-button.primary {
  flex: 1;
  background: var(--onboarding-primary);
  color: white;
  box-shadow: var(--onboarding-shadow-glow);
}

.nav-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--onboarding-shadow-glow-strong);
}

.nav-button.primary:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: var(--onboarding-shadow-soft);
}

.nav-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
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
  .onboarding-view {
    padding: 1.5rem 1rem;
  }
  
  .onboarding-card {
    padding: 2.5rem 1.5rem;
  }

  .onboarding-eyebrow {
    font-size: 0.8125rem;
  }

  .onboarding-title {
    font-size: 1.5rem;
  }

  .step-content {
    min-height: 300px;
  }

  .nav-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
  }

  .onboarding-actions {
    flex-direction: column;
  }
  
  .nav-button.secondary {
    order: 2;
  }
  
  .nav-button.primary {
    order: 1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active,
  .nav-button {
    transition: none;
  }
}
</style>
