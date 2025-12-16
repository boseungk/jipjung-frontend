<template>
  <transition name="dropdown">
    <div 
      v-if="isOpen" 
      class="dropdown-menu" 
      :class="menuClass"
    >
      <slot />
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  menuClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--nav-dropdown-shadow);
}

html[data-theme="day"] .dropdown-menu {
  background: var(--nav-dropdown-bg-day);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--nav-dropdown-border-day);
}

html[data-theme="night"] .dropdown-menu {
  background: var(--nav-dropdown-bg-night);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--nav-dropdown-border-night);
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity:0;
  transform: translateY(-8px);
}
</style>
