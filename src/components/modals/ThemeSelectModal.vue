<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">🏠 완성 테마 선택</h2>
            <button class="close-button" @click="closeModal">✕</button>
          </div>

          <p class="step-indicator">Step 1 / 2</p>
          <p class="description">완성된 모습(스테이지 6)으로 미리 보고, 저축 여정을 함께할 집을 골라보세요</p>

          <!-- Theme Grid with Large Images -->
          <div class="theme-grid">
            <button
              v-for="theme in themes"
              :key="theme.themeId"
              type="button"
              class="theme-card"
              :class="{ selected: selectedThemeId === String(theme.themeId) }"
              @click="selectTheme(theme.themeId)"
            >
              <div class="theme-image-wrapper">
                <img 
                  v-if="theme.previewImageUrl" 
                  :src="theme.previewImageUrl" 
                  :alt="theme.themeName"
                  class="theme-image"
                />
                <div v-else class="theme-image-placeholder">
                  <span class="placeholder-icon">🏠</span>
                </div>
              </div>
              <span class="theme-name">{{ theme.themeName }}</span>
              <span v-if="theme.description" class="theme-description">{{ theme.description }}</span>
            </button>
          </div>

          <!-- Loading / Empty State -->
          <div v-if="isLoading" class="loading-state">
            <span class="spinner"></span>
            <p>테마를 불러오는 중...</p>
          </div>

          <div v-if="!isLoading && themes.length === 0" class="empty-state">
            <p>사용 가능한 테마가 없습니다</p>
          </div>

          <!-- Next Button -->
          <button 
            class="next-button" 
            :disabled="selectedThemeId == null || isLoading"
            @click="goToNextStep"
          >
            다음: 목표 설정 →
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
/**
 * ThemeSelectModal
 * 
 * 드림홈 설정 Step 1: 테마 선택 모달
 * 큰 이미지 카드로 테마를 선택하고 다음 단계로 진행
 */
import { ref, onMounted, watch } from 'vue'
import { themeService } from '@/api/services/themeService'
import { getExteriorStageUrl, resolveThemeCode } from '@/constants/showroomWebp'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialThemeId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close', 'next'])

// State
const themes = ref([])
const selectedThemeId = ref(null)
const isLoading = ref(false)

const THEME_STAGE_PREVIEW = 6
const THEME_COPY = {
  CLASSIC: {
    themeName: '클래식 하우스',
    description: '따뜻한 우드 톤의 아늑한 집'
  },
  HANOK: {
    themeName: '한옥',
    description: '고즈넉한 한옥의 멋과 여백'
  },
  SANTORINI: {
    themeName: '산토리니',
    description: '맑은 지중해 감성의 화이트 하우스'
  }
}

const getThemeIdentityText = (theme) => {
  const candidates = [
    theme?.themeCode,
    theme?.theme_code,
    theme?.code,
    theme?.themeName,
    theme?.name,
    theme?.title
  ]

  return candidates
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
}

const decorateThemeForStage6 = (theme) => {
  const identityText = getThemeIdentityText(theme)
  const resolvedCode = resolveThemeCode(identityText)
  const copy = THEME_COPY[resolvedCode]
  return {
    ...theme,
    previewImageUrl: getExteriorStageUrl(resolvedCode, THEME_STAGE_PREVIEW),
    themeName: copy?.themeName ?? theme?.themeName,
    description: copy?.description ?? theme?.description
  }
}

/**
 * 테마 목록 로드
 */
const loadThemes = async () => {
  isLoading.value = true
  try {
    const fetchedThemes = await themeService.getActiveThemes()
    themes.value = (Array.isArray(fetchedThemes) ? fetchedThemes : []).map(decorateThemeForStage6)

    if (themes.value.length === 0) return

    // 기본/현재 테마 선택 (themeId가 0일 수 있어 truthy 체크 금지)
    const currentId = selectedThemeId.value != null ? String(selectedThemeId.value) : null
    const currentExists = currentId != null && themes.value.some((theme) => String(theme.themeId) === currentId)

    if (currentExists) {
      selectedThemeId.value = currentId
      return
    }

    const initialId = props.initialThemeId != null ? String(props.initialThemeId) : null
    const initialExists = initialId != null && themes.value.some((theme) => String(theme.themeId) === initialId)
    selectedThemeId.value = initialExists ? initialId : String(themes.value[0].themeId)
  } catch (error) {
    console.error('테마 목록 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 테마 선택
 */
const selectTheme = (themeId) => {
  selectedThemeId.value = String(themeId)
}

/**
 * 다음 단계로 이동
 */
const goToNextStep = () => {
  const selectedTheme = themes.value.find((theme) => String(theme.themeId) === selectedThemeId.value)
  emit('next', {
    themeId: selectedTheme?.themeId ?? null,
    theme: selectedTheme
  })
}

/**
 * 모달 닫기
 */
const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

// 모달 열릴 때 테마 로드
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && themes.value.length === 0) {
    loadThemes()
  }

  if (props.initialThemeId != null) {
    const candidateId = String(props.initialThemeId)
    const exists = themes.value.some((theme) => String(theme.themeId) === candidateId)
    selectedThemeId.value = exists ? candidateId : (themes.value[0] ? String(themes.value[0].themeId) : null)
  }
}, { immediate: true })

onMounted(() => {
  if (props.isOpen) {
    loadThemes()
  }
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Modal Container */
.modal-container {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(212, 165, 116, 0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  background: transparent;
  color: var(--showroom-text-day, #5D4037);
  transition: all 0.2s ease;
}

html[data-theme="night"] .close-button {
  color: var(--showroom-text-night, #F5EDE3);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .close-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Step Indicator */
.step-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--brand-accent, #ff6b3d);
  margin: 0 0 0.5rem 0;
}

.description {
  font-size: 0.9375rem;
  color: var(--bento-text-muted, #6b7280);
  margin: 0 0 1.5rem 0;
}

html[data-theme="night"] .description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Theme Grid - Large Cards */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.theme-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 16px;
  border: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.theme-card.selected {
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 0 0 0 4px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

html[data-theme="night"] .theme-card.selected {
  border-color: var(--showroom-accent-night, #D4A574);
  box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.25);
}

/* Theme Image */
.theme-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.05);
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.theme-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.1) 0%, 
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.05) 100%
  );
}

html[data-theme="night"] .theme-image-placeholder {
  background: linear-gradient(135deg, 
    rgba(212, 165, 116, 0.15) 0%, 
    rgba(212, 165, 116, 0.05) 100%
  );
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.6;
}

/* Theme Info */
.theme-name {
  padding: 0.875rem 1rem 0.25rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5D4037);
  text-align: center;
}

html[data-theme="night"] .theme-name {
  color: var(--showroom-text-night, #F5EDE3);
}

.theme-description {
  padding: 0 1rem 0.875rem;
  font-size: 0.8125rem;
  color: var(--bento-text-muted, #6b7280);
  text-align: center;
  line-height: 1.4;
}

html[data-theme="night"] .theme-description {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

/* Loading / Empty State */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--bento-text-muted, #6b7280);
}

.loading-state p,
.empty-state p {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
}

/* .next-button visuals live in src/assets/css/components/buttons.css */

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
  border-top-color: var(--brand-accent, #ff6b3d);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }

  .modal-container {
    padding: 1.5rem;
  }

  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
