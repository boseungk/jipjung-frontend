<template>
  <div class="onboarding-step">
    <h2 class="step-title">연소득을 알려주세요</h2>
    <p class="step-description">
      정확한 대출 한도 계산을 위해 필요합니다
    </p>

    <!-- Income Display - Click to Edit -->
    <div 
      v-if="!isEditing"
      class="income-display" 
      @click="enableEditing"
      role="button"
      tabindex="0"
      @keyup.enter="enableEditing"
      aria-label="연소득 직접 입력하려면 클릭"
    >
      <span class="income-value">{{ formattedIncome }}</span>
      <PhPencilSimple :size="20" weight="bold" class="edit-icon" />
    </div>

    <!-- Income Edit Mode -->
    <div v-else class="income-input-group">
      <input
        ref="editInput"
        v-model.number="editableIncome"
        type="number"
        class="income-edit-input"
        :min="VALIDATION.ANNUAL_INCOME.MIN"
        :max="VALIDATION.ANNUAL_INCOME.MAX"
        placeholder="금액 입력"
        aria-label="연소득 직접 입력"
        @blur="disableEditing"
        @keyup.enter="disableEditing"
        @keyup.esc="cancelEditing"
      />
      <span class="input-suffix">만원</span>
    </div>

    <!-- Slider -->
    <div class="slider-container">
      <input
        v-model.number="localIncome"
        type="range"
        :min="VALIDATION.ANNUAL_INCOME.MIN"
        :max="VALIDATION.ANNUAL_INCOME.MAX"
        :step="VALIDATION.ANNUAL_INCOME.STEP"
        :style="{ '--fill-percent': `${fillPercent}%` }"
        class="income-slider"
        aria-label="연소득 선택"
        :aria-valuemin="VALIDATION.ANNUAL_INCOME.MIN"
        :aria-valuemax="VALIDATION.ANNUAL_INCOME.MAX"
        :aria-valuenow="localIncome"
        :aria-valuetext="formattedIncome"
      />
    </div>

    <div class="slider-labels">
      <span>{{ VALIDATION.ANNUAL_INCOME.LABEL_MIN }}</span>
      <span>{{ VALIDATION.ANNUAL_INCOME.LABEL_MAX }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { PhPencilSimple } from '@phosphor-icons/vue'
import { 
  VALIDATION, 
  formatIncome, 
  calculateSliderFillPercent 
} from '@/constants/onboardingConstants'

const props = defineProps({
  modelValue: {
    type: Number,
    default: VALIDATION.ANNUAL_INCOME.DEFAULT
  }
})

const emit = defineEmits(['update:modelValue'])

const isEditing = ref(false)
const editableIncome = ref(props.modelValue)
const editInput = ref(null)

const localIncome = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

const formattedIncome = computed(() => {
  return formatIncome(localIncome.value)
})

const fillPercent = computed(() => {
  return calculateSliderFillPercent(
    localIncome.value,
    VALIDATION.ANNUAL_INCOME.MIN,
    VALIDATION.ANNUAL_INCOME.MAX
  )
})

function enableEditing() {
  isEditing.value = true
  editableIncome.value = localIncome.value
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

function disableEditing() {
  // Validate before saving
  if (editableIncome.value >= VALIDATION.ANNUAL_INCOME.MIN && 
      editableIncome.value <= VALIDATION.ANNUAL_INCOME.MAX) {
    localIncome.value = editableIncome.value
  }
  isEditing.value = false
}

function cancelEditing() {
  editableIncome.value = localIncome.value
  isEditing.value = false
}
</script>

<style scoped>
.onboarding-step {
  text-align: center;
  padding: 1rem 0;
  max-width: 600px;
  margin: 0 auto;
}

.step-title {
  font-size: var(--onboarding-font-title-size);
  font-weight: var(--onboarding-font-title-weight);
  letter-spacing: var(--onboarding-font-title-spacing);
  color: var(--onboarding-text-primary);
  margin-bottom: 1rem;
}

.step-description {
  font-size: var(--onboarding-font-body-size);
  font-weight: var(--onboarding-font-body-weight);
  color: var(--onboarding-text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

/* Click-to-Edit Income Display */
.income-display {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--onboarding-radius-md);
  cursor: pointer;
  transition: var(--onboarding-transition-base);
}

.income-display:hover {
  background: rgba(88, 60, 50, 0.04);
}

.income-display:hover .edit-icon {
  opacity: 0.8;
  transform: scale(1.1);
}

.income-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--onboarding-primary);
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.edit-icon {
  opacity: 0.3;
  color: var(--onboarding-text-secondary);
  transition: all 0.2s ease;
}

/* Income Edit Input */
.income-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 auto 2.5rem;
  max-width: 350px;
}

.income-edit-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  border: none;
  border-radius: var(--onboarding-radius-md);
  
  /* Trench style */
  background: var(--onboarding-input-bg);
  box-shadow: var(--onboarding-shadow-inset);
  color: var(--onboarding-primary);
  
  font-family: 'Poppins', 'Montserrat', -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  transition: var(--onboarding-transition-base);
}

.income-edit-input:focus {
  outline: none;
  background: var(--onboarding-input-focus);
  box-shadow: var(--onboarding-shadow-floating);
  transform: translateY(-2px);
}

.income-edit-input::-webkit-input-placeholder {
  color: var(--onboarding-text-muted);
  font-size: 1.5rem;
}

.income-edit-input::placeholder {
  color: var(--onboarding-text-muted);
  font-size: 1.5rem;
}

.input-suffix {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--onboarding-text-secondary);
  font-family: 'Pretendard', -apple-system, sans-serif;
}

/* Remove number input arrows */
.income-edit-input::-webkit-inner-spin-button,
.income-edit-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.income-edit-input[type=number] {
  -moz-appearance: textfield;
}

.slider-container {
  position: relative;
  max-width: 500px;
  margin: 0 auto 1rem;
  padding: 0 0.5rem;
}

/* Tactile Slider - Trench Track + Floating Thumb */
.income-slider {
  width: 100%;
  height: 16px;
  border-radius: var(--onboarding-radius-full);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: grab;
  
  /* Trench background with gradient fill */
  background: linear-gradient(
    to right,
    var(--onboarding-primary) 0%,
    var(--onboarding-primary-light) var(--fill-percent, 50%),
    var(--onboarding-input-bg) var(--fill-percent, 50%),
    var(--onboarding-input-bg) 100%
  );
  box-shadow: var(--onboarding-shadow-inset-deep);
  
  transition: var(--onboarding-transition-base);
}

.income-slider:active {
  cursor: grabbing;
}

/* Webkit Slider Thumb - Floating Ball */
.income-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: grab;
  box-shadow: var(--onboarding-shadow-floating);
  transition: var(--onboarding-transition-base);
}

.income-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: var(--onboarding-shadow-floating-strong);
}

.income-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(0.95);
  box-shadow: var(--onboarding-shadow-soft);
}

/* Firefox Slider Thumb */
.income-slider::-moz-range-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: grab;
  box-shadow: var(--onboarding-shadow-floating);
  transition: var(--onboarding-transition-base);
}

.income-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: var(--onboarding-shadow-floating-strong);
}

.income-slider::-moz-range-thumb:active {
  cursor: grabbing;
  transform: scale(0.95);
  box-shadow: var(--onboarding-shadow-soft);
}

/* Firefox - Remove default track styling */
.income-slider::-moz-range-track {
  background: transparent;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--onboarding-text-secondary);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .income-value {
    font-size: 2.5rem;
  }
  
  .income-edit-input {
    font-size: 2.5rem;
  }
  
  .slider-container {
    padding: 0 0.25rem;
  }
  
  .slider-labels {
    padding: 0 0.25rem;
    font-size: 0.8125rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .income-slider,
  .income-slider::-webkit-slider-thumb,
  .income-slider::-moz-range-thumb,
  .edit-icon {
    transition: none;
  }
}
</style>
