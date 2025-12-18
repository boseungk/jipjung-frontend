<template>
  <section class="section" :style="{ '--enter-delay': enterDelay }">
    <slot />
  </section>
</template>

<script setup>
defineProps({
  enterDelay: { type: String, default: '0ms' }
})
</script>

<style scoped>
.section {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--glass-border);
  box-shadow:
    var(--glass-shadow),
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: section-enter 520ms var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1)) both;
  animation-delay: var(--enter-delay, 0ms);
  transform-origin: top center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.15),
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

@keyframes section-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .section {
    animation: none;
    transition: none;
  }

  .section:hover {
    transform: none;
  }
}
</style>

