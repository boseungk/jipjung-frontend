<template>
  <div class="onboarding-view">
    <div class="onboarding-container">
      <div class="onboarding-card">
        <h1 class="onboarding-title">환영합니다! 🎉</h1>
        <p class="onboarding-description">
          집-중에 오신 것을 환영합니다!<br>
          시작하기 전에 몇 가지 정보를 알려주세요.
        </p>
        
        <div class="coming-soon">
          <div class="coming-soon-icon">🏗️</div>
          <h2>온보딩 프로세스 준비 중입니다</h2>
          <p>4단계 온보딩 플로우가 곧 제공될 예정입니다!</p>
          
          <button @click="skipOnboarding" class="neomorphic-button primary">
            일단 둘러보기 (임시)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 임시: 온보딩 건너뛰기 (테스트용)
async function skipOnboarding() {
  try {
    // 임시 데이터로 온보딩 완료
    await authStore.completeOnboarding({
      birthYear: 1995,
      annualIncome: 5000,
      existingLoanMonthly: 0,
      preferredAreas: [
        { sido: '서울특별시', sigungu: '강남구' }
      ]
    })
    router.push('/')
  } catch (error) {
    console.error('Onboarding skip failed:', error)
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
  max-width: 600px;
}

.onboarding-card {
  background: var(--showroom-bg-day, #F5EDE3);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    12px 12px 24px rgba(93, 64, 55, 0.15),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
  text-align: center;
}

html[data-theme="night"] .onboarding-card {
  background: var(--showroom-bg-night, #4A3F35);
  box-shadow: 
    12px 12px 24px rgba(0, 0, 0, 0.4),
    -12px -12px 24px rgba(255, 255, 255, 0.05);
}

.onboarding-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--showroom-accent-day, #D4A574);
  margin-bottom: 1rem;
}

html[data-theme="night"] .onboarding-title {
  color: var(--showroom-accent-night, #D4A574);
}

.onboarding-description {
  font-size: 1.125rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 3rem;
  line-height: 1.6;
}

html[data-theme="night"] .onboarding-description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.coming-soon {
  padding: 2rem 0;
}

.coming-soon-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.coming-soon h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .coming-soon h2 {
  color: var(--showroom-text-night, #F5EDE3);
}

.coming-soon p {
  font-size: 1rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 2rem;
}

html[data-theme="night"] .coming-soon p {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.neomorphic-button {
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.neomorphic-button.primary {
  background: var(--showroom-accent-day, #D4A574);
  color: #FFFFFF;
  box-shadow: 
    4px 4px 8px rgba(93, 64, 55, 0.2),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.neomorphic-button.primary:hover {
  box-shadow: 
    6px 6px 12px rgba(93, 64, 55, 0.25),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.neomorphic-button.primary:active {
  box-shadow: 
    inset 3px 3px 6px rgba(93, 64, 55, 0.3),
    inset -3px -3px 6px rgba(255, 255, 255, 0.5);
  transform: translateY(0);
}

html[data-theme="night"] .neomorphic-button.primary {
  background: var(--showroom-accent-night, #D4A574);
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.05);
}
</style>
