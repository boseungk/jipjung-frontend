<template>
  <router-link
    :to="to"
    class="nav-menu-item"
    :class="{ active: isActive }"
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
import { useRoute } from 'vue-router'
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
const isActive = computed(() => route.path === props.to)
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode */
html[data-theme="day"] .nav-menu-item {
  color: var(--showroom-text-day, #5D4037);
  background: transparent;
}

html[data-theme="day"] .nav-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="day"] .nav-menu-item.active {
  background: var(--showroom-accent-day, #D4A574);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

/* Night Mode */
html[data-theme="night"] .nav-menu-item {
  color: var(--showroom-text-night, #F5EDE3);
  background: transparent;
}

html[data-theme="night"] .nav-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

html[data-theme="night"] .nav-menu-item.active {
  background: rgba(212, 165, 116, 0.2);
  color: var(--showroom-accent-night, #D4A574);
  box-shadow: 0 2px 12px rgba(212, 165, 116, 0.3);
}

.menu-icon {
  font-size: 1.125rem;
}
</style>
