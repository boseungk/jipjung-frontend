<template>
  <header class="header">
    <h1>🏠 라이프스타일 쇼룸</h1>
    <p>당신의 저축을 아름다운 공간으로 전시하세요</p>
  </header>
</template>

<style scoped>
.header {
  padding: 2rem;
  text-align: center;
  position: relative;
  z-index: 10;
}

.header h1 {
  font-family: "Fredoka", sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  transition: color 0.5s ease;
}

html[data-theme="day"] .header h1 {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .header h1 {
  color: var(--minimal-text-night);
}

.header p {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.75;
  letter-spacing: 0.01em;
  transition: color 0.5s ease;
}

html[data-theme="day"] .header p {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .header p {
  color: var(--minimal-text-night);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .header p {
    font-size: 1rem;
  }
}
</style>
