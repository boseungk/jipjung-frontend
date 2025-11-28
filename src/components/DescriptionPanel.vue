<template>
  <div class="description-panel">
    <h2>
      <AppIcon name="house" :size="24" />
      라이프스타일 쇼룸
    </h2>
    <p><strong>살고 싶은 공간, 만들어가는 꿈</strong></p>
    <p>진짜 Neumorphism 디자인이 적용되었어요!</p>
    <p>좌측 상단에서 색상 테마를 선택하고, Day/Night 버튼으로 조명 효과를 확인하세요.</p>
    <div class="emoji">☕</div>
  </div>
</template>

<style scoped>
.description-panel {
  max-width: 600px;
  margin: 0 auto;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .description-panel {
  background: var(--minimal-bg-day);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

html[data-theme="night"] .description-panel {
  background: var(--minimal-bg-night);
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.description-panel h2 {
  font-family: "Fredoka", sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

html[data-theme="day"] .description-panel h2 {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .description-panel h2 {
  color: var(--minimal-text-night);
}

.description-panel p {
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 0.5rem;
  opacity: 0.85;
  letter-spacing: 0.01em;
}

html[data-theme="day"] .description-panel p {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .description-panel p {
  color: var(--minimal-text-night);
}

.description-panel .emoji {
  font-size: 2rem;
  margin-top: 1rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .description-panel {
    padding: 1.5rem;
  }

  .description-panel h2 {
    font-size: 1.5rem;
  }
}
</style>
