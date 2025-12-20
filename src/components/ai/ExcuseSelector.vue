<template>
  <div class="excuse-selector">
    <h3 class="selector-title">변명을 선택하세요</h3>

    <!-- Suggested Excuses -->
    <div class="excuse-chips">
      <button
        v-for="excuse in excuses"
        :key="excuse.id"
        type="button"
        class="excuse-chip"
        :class="{ 
          active: selectedExcuseId === excuse.id,
          'give-up': excuse.type === 'GIVE_UP'
        }"
        @click="selectExcuse(excuse.id)"
      >
        {{ excuse.text }}
      </button>
    </div>

    <!-- Custom Input -->
    <div class="custom-input-section">
      <label class="custom-label">또는 직접 입력:</label>
      <div class="custom-input-wrapper">
        <input
          v-model="customExcuse"
          type="text"
          class="custom-input"
          placeholder="나만의 변명을 입력하세요..."
          maxlength="100"
          @input="handleCustomInput"
        />
        <span class="char-count">{{ customExcuse.length }}/100</span>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      type="button"
      class="submit-button"
      :disabled="!canSubmit || isLoading"
      @click="handleSubmit"
    >
      <span v-if="isLoading" class="loading-spinner"></span>
      <span v-else>판결 받기 →</span>
    </button>

    <!-- Error Message -->
    <p v-if="errorMessage" class="error-message">
      <AppIcon name="warningCircle" :size="14" weight="fill" />
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useAiManagerStore } from '@/stores/aiManagerStore'

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  /** 변명 선택지 배열 */
  excuses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submitted'])

// ============================================================================
// Store
// ============================================================================

const aiManagerStore = useAiManagerStore()

// ============================================================================
// State
// ============================================================================

const selectedExcuseId = ref(null)
const customExcuse = ref('')
const errorMessage = ref('')

// ============================================================================
// Computed
// ============================================================================

const isLoading = computed(() => aiManagerStore.isActionLoading)

const canSubmit = computed(() => {
  return selectedExcuseId.value || customExcuse.value.trim()
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Select a suggested excuse
 */
const selectExcuse = (excuseId) => {
  selectedExcuseId.value = excuseId
  customExcuse.value = '' // Clear custom input when selecting suggested
  errorMessage.value = ''
}

/**
 * Handle custom input change
 */
const handleCustomInput = () => {
  if (customExcuse.value.trim()) {
    selectedExcuseId.value = null // Clear selection when typing custom
  }
  errorMessage.value = ''
}

/**
 * Submit judgment request
 */
const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return

  try {
    errorMessage.value = ''
    
    // Determine excuse to send
    const excuseId = selectedExcuseId.value ?? 'CUSTOM'
    const customText = customExcuse.value.trim()

    await aiManagerStore.submitJudgment(excuseId, customText)
    
    emit('submitted')
  } catch (e) {
    errorMessage.value = aiManagerStore.error || '판결 중 오류가 발생했습니다'
  }
}

// ============================================================================
// Watchers
// ============================================================================

// Reset state when excuses change (new analysis)
watch(() => props.excuses, () => {
  selectedExcuseId.value = null
  customExcuse.value = ''
  errorMessage.value = ''
}, { deep: true })
</script>

<style scoped>
.excuse-selector {
  padding: 1.5rem;
  background: var(--bento-card-bg, #ffffff);
  border: 1px solid var(--bento-card-border, #e5e7eb);
  border-radius: 16px;
}

html[data-theme="night"] .excuse-selector {
  background: var(--bento-card-bg);
  border-color: var(--bento-card-border);
}

.selector-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bento-card-title, #1f2937);
  margin: 0 0 1rem;
}

html[data-theme="night"] .selector-title {
  color: var(--bento-card-title);
}

/* Excuse Chips */
.excuse-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.excuse-chip {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  background: var(--bento-card-bg, #ffffff);
  border: 2px solid var(--bento-card-border, #e5e7eb);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--bento-text, #374151);
}

html[data-theme="night"] .excuse-chip {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--bento-text);
}

.excuse-chip:hover {
  border-color: var(--brand-accent, #ff6b3d);
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
}

html[data-theme="night"] .excuse-chip:hover {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.15);
  border-color: var(--brand-accent);
}

.excuse-chip.active {
  background: var(--brand-accent, #ff6b3d);
  border-color: var(--brand-accent, #ff6b3d);
  color: white;
}

.excuse-chip.give-up {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #92400e;
}

html[data-theme="night"] .excuse-chip.give-up {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.excuse-chip.give-up:hover {
  background: #fde68a;
  border-color: #f59e0b;
}

html[data-theme="night"] .excuse-chip.give-up:hover {
  background: rgba(251, 191, 36, 0.3);
  border-color: #f59e0b;
}

.excuse-chip.give-up.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

/* Custom Input */
.custom-input-section {
  margin-bottom: 1.25rem;
}

.custom-label {
  display: block;
  font-size: 0.875rem;
  color: var(--bento-text-muted, #6b7280);
  margin-bottom: 0.5rem;
}

html[data-theme="night"] .custom-label {
  color: var(--bento-text-muted);
}

.custom-input-wrapper {
  position: relative;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 4rem;
  font-size: 0.875rem;
  background: var(--bento-card-bg, #ffffff);
  border: 1px solid var(--bento-card-border, #e5e7eb);
  border-radius: 8px;
  outline: none;
  color: var(--bento-text, #1f2937);
  transition: border-color 0.2s, box-shadow 0.2s;
}

html[data-theme="night"] .custom-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--bento-text);
}

.custom-input:focus {
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
}

html[data-theme="night"] .custom-input:focus {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

.char-count {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: var(--bento-text-muted, #9ca3af);
}

html[data-theme="night"] .char-count {
  color: var(--bento-text-muted);
}

/* Submit Button styles live in src/assets/css/components/buttons.css */

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: #ef4444;
}

html[data-theme="night"] .error-message {
  color: #fca5a5;
}
</style>
