<template>
  <div class="onboarding-view">
    <div class="onboarding-container">
      <div class="onboarding-card">
        <div class="onboarding-header">
          <h1 class="onboarding-title">
            환영합니다!
            <PhConfetti :size="32" weight="fill" :color="brandAccent" />
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
import { BRAND_ACCENT } from '@/constants/colors'
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
const brandAccent = BRAND_ACCENT

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
  background: radial-gradient(circle at center, var(--showroom-bg-day, #F5EDE3) 0%, #EBE0D6 100%);
}

html[data-theme="night"] .onboarding-view {
  background: var(--showroom-bg-night, #3E3530);
}

.onboarding-container {
  width: 100%;
  max-width: 700px;
}

.onboarding-card {
  background: #FFFFFF;
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 24px 48px -12px rgba(44, 36, 32, 0.25);
}

html[data-theme="night"] .onboarding-card {
  background: var(--showroom-bg-night, #4A3F35);
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.4);
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
  background: var(--brand-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.3);
  font-weight: 700;
}

.nav-button.primary:hover:not(:disabled) {
  background: var(--brand-accent-hover);
  box-shadow: 0 6px 16px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.4);
  transform: translateY(-2px);
}

.nav-button.primary:active:not(:disabled) {
  background: var(--brand-accent-press);
  box-shadow: 0 2px 8px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.2);
  transform: translateY(0);
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

/* Secondary Button (이전) - Solid Beige Style */
.nav-button.secondary {
  background: #E8DFD5;
  color: var(--showroom-text-day, #5D4037);
  border: 1px solid rgba(93, 64, 55, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.nav-button.secondary:hover {
  background: #DDD4CA;
  border-color: rgba(93, 64, 55, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.nav-button.secondary:active {
  background: #D2C9BF;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .nav-button.secondary {
  background: rgba(0, 0, 0, 0.25);
  color: var(--showroom-text-night, #F5EDE3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

html[data-theme="night"] .nav-button.secondary:hover {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
