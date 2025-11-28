<template>
  <div
    class="nav-menu"
    v-show="showNavMenu"
    :class="{ 'menu-open': mobileMenuOpen }"
    @click.stop
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
</template>

<script setup>
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
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  html[data-theme="day"] .nav-menu {
    background: var(--nav-dropdown-bg-day, rgba(255, 255, 255, 0.95));
    border-bottom: 1px solid var(--nav-dropdown-border-day, rgba(0, 0, 0, 0.08));
  }

  html[data-theme="night"] .nav-menu {
    background: var(--nav-dropdown-bg-night, rgba(58, 53, 48, 0.95));
    border-bottom: 1px solid var(--nav-dropdown-border-night, rgba(255, 255, 255, 0.1));
  }

  .nav-menu.menu-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
