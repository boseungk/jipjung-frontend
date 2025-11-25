<template>
  <div class="profile-view">
    <div class="profile-container">
      <h1 class="page-title">👤 프로필 설정</h1>
      <p class="page-subtitle">내 정보를 관리하세요</p>
      
      <div class="coming-soon">
        <div class="coming-soon-icon">⚙️</div>
        <h2>준비 중입니다</h2>
        <p>곧 프로필 관리 기능이 제공될 예정입니다!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder component - actual implementation coming soon
</script>

<style scoped>
.profile-view {
  width: 100%;
  min-height: 100vh;
  padding: 4rem 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .page-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.page-subtitle {
  text-align: center;
  font-size: 1.125rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
  margin-bottom: 3rem;
}

html[data-theme="night"] .page-subtitle {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.coming-soon {
  text-align: center;
  padding: 6rem 2rem;
}

.coming-soon-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
}

.coming-soon h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .coming-soon h2 {
  color: var(--showroom-accent-night, #D4A574);
}

.coming-soon p {
  font-size: 1.125rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .coming-soon p {
  color: var(--showroom-text-night, #F5EDE3);
}
</style>
