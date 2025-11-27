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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

html[data-theme="day"] .dropdown-menu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

html[data-theme="night"] .dropdown-menu {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity:0;
  transform: translateY(-8px);
}
</style>
