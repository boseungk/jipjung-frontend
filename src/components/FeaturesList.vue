<template>
  <div class="features-list">
    <div class="feature-card">
      <div class="icon" aria-hidden="true">🌙</div>
      <h3>Day/Night 모드</h3>
      <p>낮에는 밝게, 밤에는 조명 효과와 함께 감상하세요</p>
    </div>

    <div class="feature-card">
      <div class="icon" aria-hidden="true">💡</div>
      <h3>프리미엄 조명</h3>
      <p>스포트라이트, 글로우, 반짝이는 파티클 효과</p>
    </div>

    <div class="feature-card">
      <div class="icon" aria-hidden="true">🎯</div>
      <h3>마일스톤 시각화</h3>
      <p>저축 목표 달성 시 가구 하나씩 해금</p>
    </div>

    <div class="feature-card">
      <div class="icon" aria-hidden="true">🔄</div>
      <h3>회전 디스플레이</h3>
      <p>마우스를 올려 3D 효과를 경험하세요</p>
    </div>
  </div>
</template>

<style scoped>
.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.feature-card {
  padding: 1.75rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-theme="day"] .feature-card {
  background: var(--minimal-bg-day);
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .feature-card {
  background: var(--minimal-bg-night);
  border: none;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}

.feature-card:hover {
  transform: translateY(-2px);
}

html[data-theme="day"] .feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .feature-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.feature-card .icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.85;
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

html[data-theme="day"] .feature-card h3 {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .feature-card h3 {
  color: var(--minimal-text-night);
}

.feature-card p {
  font-size: 0.875rem;
  line-height: 1.6;
  opacity: 0.75;
  letter-spacing: 0.005em;
}

html[data-theme="day"] .feature-card p {
  color: var(--minimal-text-day);
}

html[data-theme="night"] .feature-card p {
  color: var(--minimal-text-night);
}

@media (max-width: 768px) {
  .features-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
