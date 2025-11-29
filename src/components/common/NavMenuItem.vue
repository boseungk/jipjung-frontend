<template>
  <router-link
    :to="to"
    class="nav-menu-item"
    :class="{ active: isActive }"
    :aria-current="isActive ? 'page' : null"
    @click="$emit('click')"
  >
    <AppIcon 
      :name="icon" 
      :size="18" 
      :active="isActive" 
      :is-major-cta="true" 
      class="menu-icon" 
    />
    <span class="menu-label">{{ label }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})

defineEmits(['click'])

const route = useRoute()
const router = useRouter()

const resolvedPath = computed(() => router.resolve(props.to).path)
const isActive = computed(() => {
  const target = resolvedPath.value
  const current = route.path
  return current === target || current.startsWith(`${target}/`)
})
</script>

<style scoped>
.nav-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy spring */
  border: 1px solid transparent;
}

/* Day Mode - Refined Glassmorphism Style */
html[data-theme="day"] .nav-menu-item {
  color: var(--showroom-text-day, #2C2420);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(88, 60, 50, 0.08), 
              inset 0 1px 1px rgba(255, 255, 255, 0.8);
}

html[data-theme="day"] .nav-menu-item:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(88, 60, 50, 0.12), 
              inset 0 1px 1px rgba(255, 255, 255, 0.9);
}

html[data-theme="day"] .nav-menu-item:active {
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
  box-shadow: inset 0 2px 8px rgba(88, 60, 50, 0.15);
}

html[data-theme="day"] .nav-menu-item.active {
  background: var(--nav-menu-active-bg-day, rgba(255, 127, 80, 0.15));
  color: var(--brand-accent, #FF7F50);
  border: 1px solid rgba(255, 127, 80, 0.3);
  box-shadow: inset 0 2px 6px rgba(255, 127, 80, 0.2),
              0 2px 8px rgba(255, 127, 80, 0.1);
}

/* Night Mode */
html[data-theme="night"] .nav-menu-item {
  color: var(--showroom-text-night, #F5EDE3);
  background: transparent;
}

html[data-theme="night"] .nav-menu-item:hover {
  background: var(--nav-menu-hover-bg-night, rgba(255, 255, 255, 0.08));
  transform: translateY(-2px);
  box-shadow: var(--nav-menu-hover-shadow-night, 0 4px 12px rgba(0, 0, 0, 0.2));
}

html[data-theme="night"] .nav-menu-item:active {
  background: rgba(0, 0, 0, 0.2);
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.4);
}

html[data-theme="night"] .nav-menu-item.active {
  background: var(--nav-menu-active-bg-night, rgba(212, 165, 116, 0.2));
  color: var(--showroom-accent-night, #D4A574);
  box-shadow: var(--nav-menu-active-shadow-night, inset 0 2px 8px rgba(0, 0, 0, 0.2));
}

.menu-icon {
  font-size: 1.125rem;
}
</style>
