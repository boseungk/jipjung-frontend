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
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.2s ease;
  border: none;
  background: none;
  position: relative;
}

/* Day Mode */
html[data-theme="day"] .nav-menu-item {
  color: var(--showroom-text-day);
}

html[data-theme="day"] .nav-menu-item.active {
  color: var(--brand-accent);
}

/* Night Mode */
html[data-theme="night"] .nav-menu-item {
  color: var(--showroom-text-night);
}

html[data-theme="night"] .nav-menu-item.active {
  color: var(--brand-accent);
}

.nav-menu-item.active::after {
  content: '';
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: -8px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(60% 60% at 50% 50%, rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35), rgba(255, 255, 255, 0));
  filter: blur(6px);
  pointer-events: none;
}

.nav-menu-item.active {
  text-shadow: 0 4px 18px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

.menu-icon {
  font-size: 1.125rem;
}
</style>
