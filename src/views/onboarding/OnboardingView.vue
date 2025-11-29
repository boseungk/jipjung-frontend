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
  border-radius: 14px;
  cursor: pointer;
  border: 1px solid var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
  background: var(--nav-btn-bg-day, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day, 12px));
  box-shadow: var(--nav-btn-shadow-day);
  transition: var(--nav-btn-transition, all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1));
}

.nav-button:hover:not(:disabled) {
  box-shadow: var(--nav-btn-shadow-day-hover);
  transform: translateY(-2px) scale(1.02);
}

.nav-button:active:not(:disabled) {
  box-shadow: var(--nav-btn-press-shadow-day);
  transform: translateY(1px) scale(0.98);
}

/* Primary Button (다음/시작하기) - Glass CTA */
.nav-button.primary {
  background: linear-gradient(
    135deg,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.22) 0%,
    rgba(var(--brand-accent-rgb, 255, 127, 80), 0.12) 100%
  );
  color: #ffffff;
  box-shadow:
    var(--nav-btn-shadow-day),
    0 10px 28px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.18);
}

.nav-button.primary:hover:not(:disabled) {
  box-shadow:
    var(--nav-btn-shadow-day-hover),
    0 14px 32px rgba(var(--brand-accent-rgb, 255, 127, 80), 0.24);
}

.nav-button.primary:active:not(:disabled) {
  box-shadow: var(--nav-btn-press-shadow-day);
}

.nav-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

html[data-theme="night"] .nav-button.primary {
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
}

/* Secondary Button (이전) - Glass Neutral */
.nav-button.secondary {
  background: var(--glass-bg-day, rgba(255, 255, 255, 0.85));
  color: var(--showroom-text-day, #5D4037);
  border-color: var(--glass-border-day, rgba(255, 255, 255, 0.4));
}

.nav-button.secondary:hover {
  border-color: var(--nav-btn-border-day, rgba(255, 255, 255, 0.6));
}

.nav-button.secondary:active {
  box-shadow: var(--nav-btn-press-shadow-day);
}

html[data-theme="night"] .nav-button.secondary {
  background: var(--glass-bg-night, rgba(255, 255, 255, 0.08));
  color: var(--showroom-text-night, #F5EDE3);
  border-color: var(--nav-btn-border-night, rgba(255, 255, 255, 0.15));
  box-shadow: var(--nav-btn-shadow-night);
}

html[data-theme="night"] .nav-button.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
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
