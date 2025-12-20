<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <button 
              v-if="currentStep > 1" 
              class="back-button" 
              @click="goBack"
              type="button"
            >
              <AppIcon name="arrowLeft" :size="20" weight="bold" />
            </button>
            <h2 class="modal-title">{{ stepTitle }}</h2>
            <button class="close-button" @click="handleClose" type="button">
              <AppIcon name="x" :size="20" weight="bold" />
            </button>
          </div>

          <!-- Step 1: Mode Selection -->
          <div v-if="currentStep === 1" class="step-content">
            <p class="step-description">지출을 어떻게 입력할까요?</p>
            
            <div class="mode-options">
              <button 
                class="mode-option" 
                @click="selectMode('IMAGE')"
                type="button"
              >
                <span class="mode-icon">📷</span>
                <span class="mode-text">
                  <strong>영수증 촬영하기</strong>
                  <small>카메라로 영수증을 촬영해요</small>
                </span>
              </button>
              
              <button 
                class="mode-option" 
                @click="selectMode('MANUAL')"
                type="button"
              >
                <span class="mode-icon">✏️</span>
                <span class="mode-text">
                  <strong>수기로 입력하기</strong>
                  <small>직접 지출 정보를 입력해요</small>
                </span>
              </button>
            </div>
          </div>

          <!-- Step 2a: Manual Input Form -->
          <div v-else-if="currentStep === 2 && selectedMode === 'MANUAL'" class="step-content">
            <form @submit.prevent="handleManualSubmit" class="input-form">
              <!-- Amount -->
              <div class="form-group">
                <label for="amount" class="form-label">금액 *</label>
                <div class="input-wrapper">
                  <input
                    id="amount"
                    type="text"
                    inputmode="numeric"
                    class="form-input"
                    placeholder="0"
                    :value="formAmountDisplay"
                    @input="handleFormAmountInput"
                    @blur="handleFormAmountBlur"
                    @focus="handleFormAmountFocus"
                  />
                  <span class="input-suffix">원</span>
                </div>
              </div>

              <!-- Store Name -->
              <div class="form-group">
                <label for="storeName" class="form-label">가게명 *</label>
                <input
                  id="storeName"
                  v-model="form.storeName"
                  type="text"
                  class="form-input"
                  placeholder="예: 치킨플러스"
                  required
                />
              </div>

              <!-- Category -->
              <div class="form-group">
                <label class="form-label">카테고리 *</label>
                <div class="category-chips">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    type="button"
                    class="category-chip"
                    :class="{ active: form.category === cat.value }"
                    @click="form.category = cat.value"
                  >
                    {{ cat.emoji }} {{ cat.label }}
                  </button>
                </div>
              </div>

              <!-- Payment Date -->
              <div class="form-group">
                <label for="paymentDate" class="form-label">결제일 *</label>
                <input
                  id="paymentDate"
                  v-model="form.paymentDate"
                  type="date"
                  class="form-input"
                  required
                  :max="today"
                />
              </div>

              <!-- Memo (Optional) -->
              <div class="form-group">
                <label for="memo" class="form-label">메모 (선택)</label>
                <input
                  id="memo"
                  v-model="form.memo"
                  type="text"
                  class="form-input"
                  placeholder="예: 야식"
                />
              </div>

              <button 
                type="submit" 
                class="submit-button"
                :disabled="!isManualFormValid"
              >
                분석 요청하기 →
              </button>
            </form>
          </div>

          <!-- Step 2b: Image Upload -->
          <div v-else-if="currentStep === 2 && selectedMode === 'IMAGE'" class="step-content">
            <div class="image-upload-area">
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="file-input"
                @change="handleFileSelect"
              />
              
              <div 
                v-if="!imagePreview" 
                class="upload-placeholder"
                @click="triggerFileInput"
              >
                <AppIcon name="image" :size="48" weight="duotone" />
                <p>영수증 이미지를 선택하세요</p>
                <small>JPG, PNG, WebP (최대 10MB)</small>
              </div>
              
              <div v-else class="image-preview-container">
                <img :src="imagePreview" alt="영수증 미리보기" class="image-preview" />
                <button 
                  type="button" 
                  class="remove-image-button"
                  @click="clearImage"
                >
                  <AppIcon name="x" :size="16" weight="bold" />
                </button>
              </div>
            </div>

            <button 
              type="button"
              class="submit-button"
              :disabled="!selectedFile"
              @click="handleImageSubmit"
            >
              이미지 분석하기 →
            </button>
          </div>

          <!-- Step 3: Extraction Confirm (IMAGE mode) -->
          <div v-else-if="currentStep === 3" class="step-content">
            <div v-if="aiMessage" class="ai-message-box">
              <span class="ai-icon">🔍</span>
              <p>{{ aiMessage }}</p>
            </div>

            <div class="extraction-results">
              <h3 class="results-title">추출 결과</h3>
              
              <form @submit.prevent="handleConfirmSubmit" class="input-form">
                <!-- Amount -->
                <div class="form-group" :class="{ missing: isMissing('amount') }">
                  <label for="confirmAmount" class="form-label">
                    금액 *
                    <span v-if="isMissing('amount')" class="missing-badge">누락</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      id="confirmAmount"
                      type="text"
                      inputmode="numeric"
                      class="form-input"
                      :value="confirmAmountDisplay"
                      @input="handleConfirmAmountInput"
                      @blur="handleConfirmAmountBlur"
                      @focus="handleConfirmAmountFocus"
                    />
                    <span class="input-suffix">원</span>
                  </div>
                </div>

                <!-- Store Name -->
                <div class="form-group" :class="{ missing: isMissing('storeName') }">
                  <label for="confirmStoreName" class="form-label">
                    가게명 *
                    <span v-if="isMissing('storeName')" class="missing-badge">누락</span>
                  </label>
                  <input
                    id="confirmStoreName"
                    v-model="confirmForm.storeName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>

                <!-- Category -->
                <div class="form-group" :class="{ missing: isMissing('category') }">
                  <label class="form-label">
                    카테고리 *
                    <span v-if="isMissing('category')" class="missing-badge">누락</span>
                  </label>
                  <div class="category-chips">
                    <button
                      v-for="cat in categories"
                      :key="cat.value"
                      type="button"
                      class="category-chip"
                      :class="{ active: confirmForm.category === cat.value }"
                      @click="confirmForm.category = cat.value"
                    >
                      {{ cat.emoji }} {{ cat.label }}
                    </button>
                  </div>
                </div>

                <!-- Payment Date -->
                <div class="form-group" :class="{ missing: isMissing('paymentDate') }">
                  <label for="confirmPaymentDate" class="form-label">
                    결제일 *
                    <span v-if="isMissing('paymentDate')" class="missing-badge">누락</span>
                  </label>
                  <input
                    id="confirmPaymentDate"
                    v-model="confirmForm.paymentDate"
                    type="date"
                    class="form-input"
                    required
                    :max="today"
                  />
                </div>

                <button 
                  type="submit" 
                  class="submit-button"
                  :disabled="!isConfirmFormValid"
                >
                  확인하고 분석 진행
                </button>
              </form>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <AppIcon name="warningCircle" :size="16" weight="fill" />
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { SPENDING_CATEGORIES } from '@/constants/spendingCategories'
import { useAiManagerStore } from '@/stores/aiManagerStore'
import { useMoneyInput } from '@/composables/useMoneyInput'

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'analyzed'])

// ============================================================================
// Store
// ============================================================================

const aiManagerStore = useAiManagerStore()

// ============================================================================
// State
// ============================================================================

const currentStep = ref(1)
const selectedMode = ref(null) // 'MANUAL' | 'IMAGE'

// Manual input form
const form = ref({
  amount: null,
  storeName: '',
  category: null,
  paymentDate: '',
  memo: ''
})

// Image upload
const fileInput = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)

// Confirm form (for IMAGE extraction)
const confirmForm = ref({
  amount: null,
  storeName: '',
  category: null,
  paymentDate: '',
  memo: ''
})

// AI response message
const aiMessage = ref('')

// Error
const errorMessage = ref('')

// ============================================================================
// Money Input Composables
// ============================================================================

const formAmountRef = computed({
  get: () => form.value.amount,
  set: (val) => { form.value.amount = val }
})
const confirmAmountRef = computed({
  get: () => confirmForm.value.amount,
  set: (val) => { confirmForm.value.amount = val }
})

const { displayValue: formAmountDisplay, handleInput: handleFormAmountInput, handleBlur: handleFormAmountBlur, handleFocus: handleFormAmountFocus } = useMoneyInput(formAmountRef)
const { displayValue: confirmAmountDisplay, handleInput: handleConfirmAmountInput, handleBlur: handleConfirmAmountBlur, handleFocus: handleConfirmAmountFocus } = useMoneyInput(confirmAmountRef)

// ============================================================================
// Computed
// ============================================================================

const categories = computed(() => SPENDING_CATEGORIES)

const today = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return '지출 등록하기'
    case 2: return selectedMode.value === 'MANUAL' ? '수기 입력' : '영수증 촬영'
    case 3: return '추출 결과 확인'
    default: return '지출 등록'
  }
})

const isManualFormValid = computed(() => {
  const { amount, storeName, category, paymentDate } = form.value
  return amount > 0 && storeName.trim() && category && paymentDate
})

const isConfirmFormValid = computed(() => {
  const { amount, storeName, category, paymentDate } = confirmForm.value
  return amount > 0 && storeName?.trim() && category && paymentDate
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Reset all form state
 */
const resetState = () => {
  currentStep.value = 1
  selectedMode.value = null
  form.value = {
    amount: null,
    storeName: '',
    category: null,
    paymentDate: '',
    memo: ''
  }
  selectedFile.value = null
  imagePreview.value = null
  confirmForm.value = {
    amount: null,
    storeName: '',
    category: null,
    paymentDate: '',
    memo: ''
  }
  aiMessage.value = ''
  errorMessage.value = ''
}

/**
 * Handle modal close
 */
const handleClose = () => {
  resetState()
  emit('close')
}

/**
 * Go back to previous step
 */
const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    errorMessage.value = ''
  }
}

/**
 * Select input mode and go to step 2
 */
const selectMode = (mode) => {
  selectedMode.value = mode
  currentStep.value = 2
  
  // Set default date to today
  form.value.paymentDate = today.value
}

/**
 * Check if field is in missing fields list
 */
const isMissing = (fieldName) => {
  return aiManagerStore.missingFields.includes(fieldName)
}

// ============================================================================
// Image Upload
// ============================================================================

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = '파일 크기는 10MB 이하여야 합니다'
    return
  }

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    errorMessage.value = 'JPG, PNG, WebP 형식만 지원됩니다'
    return
  }

  selectedFile.value = file
  errorMessage.value = ''

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  selectedFile.value = null
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// ============================================================================
// Form Submission
// ============================================================================

/**
 * Submit manual input form
 */
const handleManualSubmit = async () => {
  if (!isManualFormValid.value) return

  try {
    errorMessage.value = ''
    await aiManagerStore.analyzeManual(form.value)
    
    emit('analyzed')
    handleClose()
  } catch (e) {
    errorMessage.value = aiManagerStore.error || '분석 중 오류가 발생했습니다'
  }
}

/**
 * Submit image for analysis
 */
const handleImageSubmit = async () => {
  if (!selectedFile.value) return

  try {
    errorMessage.value = ''
    const result = await aiManagerStore.analyzeImage(selectedFile.value)
    
    // Update AI message
    aiMessage.value = aiManagerStore.currentScript

    // Fill confirm form with extracted data
    if (result.extractedData) {
      confirmForm.value = {
        amount: result.extractedData.amount ?? null,
        storeName: result.extractedData.storeName ?? '',
        category: result.extractedData.category ?? null,
        paymentDate: result.extractedData.paymentDate ?? '',
        memo: ''
      }
    }

    // If extraction failed completely, start with empty form
    if (result.extractionStatus === 'FAILED') {
      confirmForm.value.paymentDate = today.value
    }

    // Go to confirmation step
    currentStep.value = 3
  } catch (e) {
    errorMessage.value = aiManagerStore.error || '이미지 분석 중 오류가 발생했습니다'
  }
}

/**
 * Submit confirmed extraction data
 */
const handleConfirmSubmit = async () => {
  if (!isConfirmFormValid.value) return

  try {
    errorMessage.value = ''
    await aiManagerStore.confirmExtraction(confirmForm.value)
    
    emit('analyzed')
    handleClose()
  } catch (e) {
    errorMessage.value = aiManagerStore.error || '확인 중 오류가 발생했습니다'
  }
}

// ============================================================================
// Watchers
// ============================================================================

// Reset state when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetState()
    // Reset conversation if starting fresh
    if (aiManagerStore.isIdle) {
      aiManagerStore.resetConversation()
    }
  }
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Modal Content */
.modal-content {
  background: var(--bento-card-bg, #ffffff);
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .modal-content {
  background: var(--bento-card-bg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--bento-card-border, #e5e7eb);
  position: sticky;
  top: 0;
  background: var(--bento-card-bg, #ffffff);
  z-index: 10;
}

html[data-theme="night"] .modal-header {
  border-bottom-color: var(--bento-card-border);
  background: var(--bento-card-bg);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-align: center;
  color: var(--bento-card-title, #1f2937);
}

html[data-theme="night"] .modal-title {
  color: var(--bento-card-title);
}

.back-button,
.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  color: var(--bento-text-muted, #666666);
  transition: all 0.2s;
}

.back-button:hover,
.close-button:hover {
  background: var(--surface-muted, #f3f4f6);
  color: var(--bento-text, #333333);
}

html[data-theme="night"] .back-button:hover,
html[data-theme="night"] .close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--bento-text);
}

/* Step Content */
.step-content {
  padding: 1.5rem 1.25rem;
}

.step-description {
  text-align: center;
  color: var(--bento-text-muted, #666666);
  margin: 0 0 1.5rem;
  font-size: 1rem;
}

html[data-theme="night"] .step-description {
  color: var(--bento-text-muted);
}

/* Mode Options */
.mode-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface-muted, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

html[data-theme="night"] .mode-option {
  background: rgba(255, 255, 255, 0.05);
}

.mode-option:hover {
  background: var(--bento-card-bg, #ffffff);
  border-color: var(--brand-accent, #ff6b3d);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

html[data-theme="night"] .mode-option:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.3);
}

.mode-icon {
  font-size: 2rem;
}

.mode-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mode-text strong {
  font-size: 1rem;
  color: var(--bento-text, #333333);
}

html[data-theme="night"] .mode-text strong {
  color: var(--bento-text);
}

.mode-text small {
  font-size: 0.875rem;
  color: var(--bento-text-muted, #888888);
}

html[data-theme="night"] .mode-text small {
  color: var(--bento-text-muted);
}

/* Form Styles */
.input-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.missing .form-label {
  color: #ef4444;
}

.form-group.missing .form-input {
  border-color: #ef4444;
  background: #fef2f2;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bento-text, #333333);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

html[data-theme="night"] .form-label {
  color: var(--bento-text);
}

.missing-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: #ef4444;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--bento-card-border, #dddddd);
  border-radius: 8px;
  outline: none;
  background: var(--bento-card-bg, #ffffff);
  color: var(--bento-text, #1f2937);
  transition: border-color 0.2s, box-shadow 0.2s;
}

html[data-theme="night"] .form-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--bento-text);
}

.form-input:focus {
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
}

html[data-theme="night"] .form-input:focus {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: var(--bento-text-muted, #888888);
  font-size: 0.875rem;
}

/* Remove number input arrows */
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Category Chips */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-chip {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  background: var(--surface-muted, #f5f5f5);
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  color: var(--bento-text, #374151);
  transition: all 0.2s;
}

html[data-theme="night"] .category-chip {
  background: rgba(255, 255, 255, 0.05);
  color: var(--bento-text);
}

.category-chip:hover {
  background: var(--bento-card-border, #eeeeee);
}

html[data-theme="night"] .category-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-chip.active {
  background: var(--brand-accent, #ff6b3d);
  color: white;
  border-color: var(--brand-accent, #ff6b3d);
}

/* Submit Button styles live in src/assets/css/components/buttons.css */

/* Image Upload */
.image-upload-area {
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  background: var(--surface-muted, #f3f4f6);
  border: 2px dashed var(--bento-card-border, #dddddd);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--bento-text-muted, #888888);
}

html[data-theme="night"] .upload-placeholder {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--bento-text-muted);
}

.upload-placeholder:hover {
  border-color: var(--brand-accent, #ff6b3d);
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
}

.image-preview-container {
  position: relative;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  background: #f5f5f5;
}

.remove-image-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-button:hover {
  background: rgba(239, 68, 68, 0.9);
}

/* AI Message Box */
.ai-message-box {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-muted, #f3f4f6);
  border-left: 3px solid var(--brand-accent, #ff6b3d);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

html[data-theme="night"] .ai-message-box {
  background: rgba(255, 255, 255, 0.05);
}

.ai-icon {
  font-size: 1.25rem;
}

.ai-message-box p {
  margin: 0;
  color: var(--bento-text, #333333);
  line-height: 1.5;
}

html[data-theme="night"] .ai-message-box p {
  color: var(--bento-text);
}

/* Extraction Results */
.results-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bento-text-muted, #666666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem;
}

html[data-theme="night"] .results-title {
  color: var(--bento-text-muted);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.875rem;
  border-top: 1px solid #fee2e2;
}

html[data-theme="night"] .error-message {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-top-color: rgba(254, 226, 226, 0.2);
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    max-height: 100vh;
    border-radius: 16px 16px 0 0;
    margin-top: auto;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
}
</style>
