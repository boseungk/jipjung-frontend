<template>
  <div class="skeleton-card">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-price"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-location"></div>
      <div class="skeleton-tags">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .skeleton-card {
  background: rgba(58, 53, 48, 0.8);
  border-color: rgba(255, 255, 255, 0.05);
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.1);
  animation: pulse 1.5s infinite;
}

html[data-theme="night"] .skeleton-image {
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-price {
  width: 50%;
  height: 24px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  animation: pulse 1.5s infinite;
}

.skeleton-title {
  width: 80%;
  height: 20px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
  animation: pulse 1.5s infinite;
}

.skeleton-location {
  width: 60%;
  height: 16px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  animation: pulse 1.5s infinite;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.skeleton-tag {
  width: 60px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  animation: pulse 1.5s infinite;
}

html[data-theme="night"] .skeleton-price,
html[data-theme="night"] .skeleton-title,
html[data-theme="night"] .skeleton-location,
html[data-theme="night"] .skeleton-tag {
  background: rgba(255, 255, 255, 0.05);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
