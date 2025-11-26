<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">집-중</h1>
          <p class="auth-subtitle">당신의 꿈의 집을 향한 첫 걸음</p>
        </div>
        
        <RegisterForm @register-success="handleRegisterSuccess" />
        
        <div class="auth-footer">
          <p>이미 계정이 있으신가요? 
            <router-link to="/login" class="auth-link">로그인</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()

function handleRegisterSuccess() {
  // 회원가입 성공 후 온보딩 페이지로 이동
  router.push('/onboarding')
}
</script>

<style scoped>
.auth-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--showroom-bg-day, #F5EDE3);
}

html[data-theme="night"] .auth-view {
  background: var(--showroom-bg-night, #3E3530);
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: var(--showroom-bg-day, #F5EDE3);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    12px 12px 24px rgba(93, 64, 55, 0.15),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
}

html[data-theme="night"] .auth-card {
  background: var(--showroom-bg-night, #4A3F35);
  box-shadow: 
    12px 12px 24px rgba(0, 0, 0, 0.4),
    -12px -12px 24px rgba(255, 255, 255, 0.05);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--showroom-accent-day, #D4A574);
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

html[data-theme="night"] .auth-title {
  color: var(--showroom-accent-night, #D4A574);
}

.auth-subtitle {
  font-size: 1.125rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  font-weight: 500;
}

html[data-theme="night"] .auth-subtitle {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .auth-footer {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.auth-link {
  color: var(--showroom-accent-day, #D4A574);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.auth-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

html[data-theme="night"] .auth-link {
  color: var(--showroom-accent-night, #D4A574);
}

@media (max-width: 640px) {
  .auth-card {
    padding: 2.5rem 1.5rem;
  }

  .auth-title {
    font-size: 2.5rem;
  }

  .auth-subtitle {
    font-size: 1rem;
  }
}
</style>
