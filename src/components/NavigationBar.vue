<template>
  <nav class="navigation-bar">
    <router-link
      to="/"
      class="nav-button"
      :class="{ active: $route.path === '/' }"
      aria-label="대시보드로 이동"
    >
      <span class="nav-icon">📊</span>
      <span class="nav-label">대시보드</span>
    </router-link>
    
    <router-link
      to="/collection"
      class="nav-button"
      :class="{ active: $route.path === '/collection' }"
      aria-label="컬렉션으로 이동"
    >
      <span class="nav-icon">🔮</span>
      <span class="nav-label">컬렉션</span>
    </router-link>
  </nav>
</template>

<script setup>
// No additional logic needed - Vue Router handles active state
</script>

<style scoped>
.navigation-bar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  z-index: 9999;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 32px;
}

/* Day Mode - Neumorphism */
html[data-theme="day"] .navigation-bar {
  background: var(--showroom-card-bg-day, #F5EDE3);
  box-shadow:
    8px 8px 16px var(--showroom-shadow-dark-day, #D4C8BD),
    -8px -8px 16px var(--showroom-shadow-light-day, #FFFFFF);
}

/* Night Mode - Glassmorphism */
html[data-theme="night"] .navigation-bar {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.15);
  border-left-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 30px var(--showroom-glow-night, rgba(212, 165, 116, 0.3));
}

/* Navigation Buttons */
.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  outline: none;
}

/* Day Mode Buttons */
html[data-theme="day"] .nav-button {
  background: var(--showroom-card-bg-day, #F5EDE3);
  color: var(--showroom-text-day, #5D4037);
  box-shadow:
    4px 4px 8px var(--showroom-shadow-dark-day, #D4C8BD),
    -4px -4px 8px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .nav-button:hover {
  transform: translateY(-2px);
  box-shadow:
    6px 6px 12px var(--showroom-shadow-dark-day, #D4C8BD),
    -6px -6px 12px var(--showroom-shadow-light-day, #FFFFFF);
}

html[data-theme="day"] .nav-button.active {
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  box-shadow:
    inset 2px 2px 6px rgba(0, 0, 0, 0.2),
    inset -2px -2px 6px rgba(255, 255, 255, 0.3),
    0 4px 12px rgba(212, 165, 116, 0.5);
}

/* Night Mode Buttons */
html[data-theme="night"] .nav-button {
  background: rgba(255, 255, 255, 0.06);
  color: var(--showroom-text-night, #F5EDE3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  border-top-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 0 20px var(--showroom-glow-night, rgba(212, 165, 116, 0.4));
}

html[data-theme="night"] .nav-button.active {
  background: rgba(212, 165, 116, 0.25);
  border-color: var(--showroom-accent-night, #D4A574);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.6),
    inset 0 2px 8px rgba(255, 255, 255, 0.1);
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-label {
  font-family: 'Noto Sans KR', sans-serif;
}

/* Focus State */
.nav-button:focus {
  outline: 2px solid var(--showroom-accent-day, #D4A574);
  outline-offset: 4px;
}

html[data-theme="night"] .nav-button:focus {
  outline-color: var(--showroom-accent-night, #D4A574);
}

/* Responsive */
@media (max-width: 767px) {
  .navigation-bar {
    bottom: 1rem;
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
  
  .nav-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }
  
  .nav-icon {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .nav-button .nav-label {
    display: none;
  }
  
  .nav-button {
    padding: 0.875rem;
  }
}
</style>
