<template>
  <transition name="nav-slide">
    <div
      class="nav-menu"
      v-show="showNavMenu"
      :class="{ 'menu-open': mobileMenuOpen }"
      @click.stop
      ref="rootRef"
    >
      <NavMenuItem
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        :icon="item.icon"
        :label="item.label"
        @click="$emit('item-selected')"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import NavMenuItem from '../common/NavMenuItem.vue'

defineProps({
  items: {
    type: Array,
    required: true
  },
  showNavMenu: {
    type: Boolean,
    required: true
  },
  mobileMenuOpen: {
    type: Boolean,
    required: true
  }
})

defineEmits(['item-selected'])

const rootRef = ref(null)
defineExpose({ rootEl: rootRef })
</script>

<style scoped>
.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    top: var(--nav-height, 64px);
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    padding: 1rem;
  }

  html[data-theme="day"] .nav-menu {
    background: var(--nav-dropdown-bg-day, rgba(255, 255, 255, 0.95));
    border-bottom: 1px solid var(--nav-dropdown-border-day, rgba(0, 0, 0, 0.08));
  }

  html[data-theme="night"] .nav-menu {
    background: var(--nav-dropdown-bg-night, rgba(58, 53, 48, 0.95));
    border-bottom: 1px solid var(--nav-dropdown-border-night, rgba(255, 255, 255, 0.1));
  }

  .nav-slide-enter-active,
  .nav-slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-slide-enter-from,
  .nav-slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }
}
</style>
