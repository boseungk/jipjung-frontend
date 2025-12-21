<template>
  <header class="header">
    <h1>
      <AppIcon name="house" :size="24" />
      라이프스타일 쇼룸
    </h1>
    <p>당신의 저축을 아름다운 공간으로 전시하세요</p>
  </header>
</template>

<style scoped>
.header {
  padding: 1.5rem 1.25rem 0.5rem;
  text-align: center;
  position: relative;
  z-index: 10;
}

.header h1 {
  font-family: var(--font-family-display);
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
  transition: color 0.35s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="day"] .header h1 {
  color: var(--ink-base, var(--minimal-text-day));
}

html[data-theme="night"] .header h1 {
  color: var(--minimal-text-night);
}

.header p {
  font-family: var(--font-family-body);
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.85;
  letter-spacing: 0.005em;
  transition: color 0.35s ease;
}

html[data-theme="day"] .header p {
  color: var(--ink-muted, var(--minimal-text-day));
}

html[data-theme="night"] .header p {
  color: var(--minimal-text-night);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .header p {
    font-size: 0.95rem;
  }
}
</style>
