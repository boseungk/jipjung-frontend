<template>
  <div class="theme-controls">
    <div class="nav-color-theme" ref="colorMenuRef">
      <button
        class="color-theme-btn nav-btn-base"
        type="button"
        @click="$emit('toggle-color-dropdown')"
        aria-label="색상 테마 선택"
        :aria-expanded="isColorOpen"
      >
        <AppIcon name="palette" :size="20" :active="isColorOpen" class="theme-icon" />
        <PhCaretDown :size="10" weight="bold" class="dropdown-arrow" :class="{ open: isColorOpen }" />
      </button>

      <DropdownMenu :is-open="isColorOpen">
        <button
          v-for="theme in normalizedColorThemes"
          :key="theme.value"
          class="dropdown-item-base"
          :class="{ active: currentColorTheme === theme.value }"
          @click="$emit('select-color-theme', theme.value)"
        >
          <span class="color-dot" :style="{ background: theme.color }"></span>
          <span class="color-label">{{ theme.label }}</span>
          <span class="check-slot">
            <PhCheck v-if="currentColorTheme === theme.value" :size="16" weight="bold" class="check-icon" />
          </span>
        </button>
      </DropdownMenu>
    </div>

    <button
      class="theme-toggle-btn nav-btn-base"
      type="button"
      @click="$emit('toggle-theme')"
      aria-label="테마 전환"
      title="Day/Night 모드 전환"
    >
      <ThemeIcons :type="isNight ? 'moon' : 'sun'" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhCaretDown, PhCheck } from '@phosphor-icons/vue'
import { COLOR_THEMES as DEFAULT_COLOR_THEMES } from '@/constants/navigation'
import AppIcon from '../common/AppIcon.vue'
import DropdownMenu from '../common/DropdownMenu.vue'
import ThemeIcons from '../common/ThemeIcons.vue'

const props = defineProps({
  colorThemes: {
    type: Array,
    default: () => DEFAULT_COLOR_THEMES
  },
  currentColorTheme: {
    type: String,
    required: true
  },
  isColorOpen: {
    type: Boolean,
    required: true
  },
  isNight: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-color-dropdown', 'select-color-theme', 'toggle-theme'])

const colorMenuRef = ref(null)
const allowedThemeValues = new Set(DEFAULT_COLOR_THEMES.map((theme) => theme.value))
const normalizedColorThemes = computed(() => {
  const source = Array.isArray(props.colorThemes) && props.colorThemes.length
    ? props.colorThemes
    : DEFAULT_COLOR_THEMES
  const seen = new Set()
  return source.filter((theme) => {
    const keep = allowedThemeValues.has(theme.value) && !seen.has(theme.value)
    if (keep) seen.add(theme.value)
    return keep
  })
})

defineExpose({ colorMenuEl: colorMenuRef })
</script>

<style scoped>
.theme-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-color-theme {
  position: relative;
  flex-shrink: 0;
}

.color-theme-btn {
  width: auto;
  height: 40px;
  padding: 0 0.875rem;
  gap: 0.25rem;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-label {
  flex: 1;
}

.check-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
}

.check-icon {
  font-size: 1rem;
  color: var(--showroom-accent-day, #D4A574);
}

html[data-theme="night"] .check-icon {
  color: var(--showroom-accent-night, #D4A574);
}

.dropdown-arrow {
  font-size: 0.625rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}
</style>
