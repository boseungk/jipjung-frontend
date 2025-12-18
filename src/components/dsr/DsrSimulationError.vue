<template>
  <Transition name="fade-slide">
    <div v-if="simulationError" class="error-message" role="alert">
      <AppIcon name="warning" :size="20" weight="fill" aria-hidden="true" />
      <span>{{ simulationError }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useDsrStore } from '@/stores/dsrStore'

const dsrStore = useDsrStore()
const { simulationError } = storeToRefs(dsrStore)
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--dsr-danger-bg);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.22);
  color: var(--dsr-danger-fg);
  font-size: 0.875rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1)),
    transform 0.22s var(--easing-smooth, cubic-bezier(0.4, 0, 0.2, 1));
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none;
  }
}
</style>

