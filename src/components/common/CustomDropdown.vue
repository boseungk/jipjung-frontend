<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <button
      type="button"
      @click="toggleOpen"
      @keydown.down.prevent="handleKeyDown"
      @keydown.up.prevent="handleKeyUp"
      @keydown.enter.prevent="toggleOpen"
      @keydown.escape="closeDropdown"
      class="dropdown-trigger"
      :class="{ open: isOpen, disabled: disabled }"
      :aria-expanded="isOpen"
      :aria-label="label"
      :aria-haspopup="true"
      :disabled="disabled"
    >
      <span class="dropdown-value">{{ displayValue }}</span>
      <AppIcon
        name="caretDown"
        :size="16"
        weight="bold"
        color="currentColor"
        class="dropdown-caret"
        :class="{ rotate: isOpen }"
        aria-hidden="true"
      />
    </button>
    
    <Transition name="dropdown-fade">
      <div 
        v-if="isOpen" 
        class="dropdown-menu"
        role="listbox"
        :aria-label="label"
      >
        <div class="dropdown-scroll">
          <button
            v-for="(option, index) in options"
            :key="option.value"
            @click="selectOption(option)"
            @keydown.down.prevent="focusNext(index)"
            @keydown.up.prevent="focusPrev(index)"
            @keydown.enter.prevent="selectOption(option)"
            @keydown.escape="closeDropdown"
            type="button"
            class="dropdown-item"
            :class="{ active: modelValue === option.value, focused: focusedIndex === index }"
            :ref="el => { if (el) itemRefs[index] = el }"
            role="option"
            :aria-selected="modelValue === option.value"
          >
            {{ option.label }}
            <AppIcon
              v-if="modelValue === option.value"
              name="check"
              :size="16"
              weight="bold"
              color="currentColor"
              class="check-icon"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  /**
   * v-model value
   */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  
  /**
   * Array of options { value, label }
   */
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every(opt => opt.hasOwnProperty('value') && opt.hasOwnProperty('label'))
    }
  },
  
  /**
   * Placeholder text when no value selected
   */
  placeholder: {
    type: String,
    default: '선택하세요'
  },
  
  /**
   * Accessible label
   */
  label: {
    type: String,
    default: 'Dropdown'
  },
  
  /**
   * Disabled state
   */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const focusedIndex = ref(-1)
const dropdownRef = ref(null)
const itemRefs = ref([])

/**
 * Display value (selected label or placeholder)
 */
const displayValue = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : props.placeholder
})

/**
 * Toggle dropdown open/close
 */
function toggleOpen() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusedIndex.value = props.options.findIndex(opt => opt.value === props.modelValue)
  }
}

/**
 * Close dropdown
 */
function closeDropdown() {
  isOpen.value = false
  focusedIndex.value = -1
}

/**
 * Select an option
 */
function selectOption(option) {
  emit('update:modelValue', option.value)
  closeDropdown()
}

/**
 * Keyboard navigation - move down
 */
function handleKeyDown() {
  if (!isOpen.value) {
    toggleOpen()
  } else if (focusedIndex.value < props.options.length - 1) {
    focusedIndex.value++
    scrollToFocused()
  }
}

/**
 * Keyboard navigation - move up
 */
function handleKeyUp() {
  if (isOpen.value && focusedIndex.value > 0) {
    focusedIndex.value--
    scrollToFocused()
  }
}

/**
 * Focus next item
 */
function focusNext(currentIndex) {
  if (currentIndex < props.options.length - 1) {
    focusedIndex.value = currentIndex + 1
    scrollToFocused()
  }
}

/**
 * Focus previous item
 */
function focusPrev(currentIndex) {
  if (currentIndex > 0) {
    focusedIndex.value = currentIndex - 1
    scrollToFocused()
  }
}

/**
 * Scroll to focused item
 */
function scrollToFocused() {
  if (focusedIndex.value >= 0 && itemRefs.value[focusedIndex.value]) {
    itemRefs.value[focusedIndex.value].scrollIntoView({ 
      block: 'nearest', 
      behavior: 'smooth' 
    })
  }
}

/**
 * Click outside handler
 */
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Reset refs when options change
watch(() => props.options, () => {
  itemRefs.value = []
})
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  border: none;
  border-radius: var(--onboarding-radius-md);
  
  /* Increased contrast - darker trench background */
  background: var(--onboarding-input-bg);
  color: var(--onboarding-text-primary);
  box-shadow: 
    var(--onboarding-shadow-inset),
    0 0 0 1px rgba(88, 60, 50, 0.08); /* Subtle border for definition */
  
  cursor: pointer;
  transition: var(--onboarding-transition-base);
}

.dropdown-trigger:hover:not(.disabled) {
  background: var(--onboarding-surface);
  box-shadow: var(--onboarding-shadow-floating);
  transform: translateY(-1px);
}

.dropdown-trigger.open {
  box-shadow: var(--onboarding-shadow-inset);
  transform: scale(0.99);
}

.dropdown-trigger.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-caret {
  flex-shrink: 0;
  color: var(--onboarding-text-secondary);
  transition: var(--onboarding-transition-base);
}

.dropdown-caret.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  max-height: 240px;
  background: var(--onboarding-surface);
  border-radius: var(--onboarding-radius-md);
  box-shadow: var(--onboarding-shadow-floating-strong);
  overflow: hidden;
  z-index: 100;
}

.dropdown-scroll {
  max-height: 240px;
  overflow-y: auto;
  padding: 0.5rem;
}

/* Scrollbar styling */
.dropdown-scroll::-webkit-scrollbar {
  width: 6px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: var(--onboarding-text-muted);
  border-radius: 3px;
}

.dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--onboarding-text-secondary);
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--onboarding-text-primary);
  cursor: pointer;
  transition: var(--onboarding-transition-fast);
}

.dropdown-item:hover,
.dropdown-item.focused {
  background: var(--onboarding-primary-soft);
  color: var(--onboarding-primary);
}

.dropdown-item.active {
  background: var(--onboarding-primary-soft);
  color: var(--onboarding-primary);
  font-weight: 600;
}

.check-icon {
  flex-shrink: 0;
  margin-left: 0.5rem;
}

/* Dropdown fade animation */
.dropdown-fade-enter-active {
  animation: dropdown-fade-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-fade-leave-active {
  animation: dropdown-fade-out 0.15s ease-in;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-fade-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}

/* Dark theme */
html[data-theme="night"] .dropdown-trigger,
html[data-theme="night"] .dropdown-menu {
  background: var(--onboarding-surface);
}

html[data-theme="night"] .dropdown-item:hover,
html[data-theme="night"] .dropdown-item.focused {
  background: rgba(255, 127, 80, 0.15);
}
</style>
