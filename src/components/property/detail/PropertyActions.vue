<template>
  <div class="property-actions">
    <div class="actions-container">
      <button
        @click="handleSave"
        class="action-btn save-btn"
        :class="{ saved: isSaved }"
      >
        {{ isSaved ? '저장됨' : '저장하기' }}
      </button>

      <button
        @click="handleSetAsDreamHome"
        class="action-btn dream-home-btn"
      >
        내 집으로 설정
      </button>

      <button
        @click="handleContact"
        class="action-btn contact-btn"
        v-if="property.agentInfo?.phone"
      >
        문의하기
      </button>
    </div>

    <!-- 구매 가능 여부 표시 -->
    <div class="affordability-info" v-if="currentAmount">
      <div class="affordability-badge" :class="{ affordable: isAffordable }">
        <span class="badge-icon">{{ isAffordable ? '✓' : '✗' }}</span>
        <div class="badge-content">
          <p class="badge-title">
            {{ isAffordable ? '구매 가능' : '예산 초과' }}
          </p>
          <p class="badge-detail">
            필요 계약금: {{ formatDownPayment }}원
            (보유: {{ currentAmount.toLocaleString() }}원)
          </p>
        </div>
      </div>
    </div>

    <!-- Step 1: Theme Selection Modal -->
    <ThemeSelectModal
      :is-open="showThemeModal"
      :initial-theme-id="selectedThemeId"
      @close="closeAllModals"
      @next="handleThemeSelected"
    />

    <!-- Step 2: Dream Home Set Modal -->
    <DreamHomeSetModal
      :is-open="showDreamHomeModal"
      :property="property"
      :selected-theme="selectedTheme"
      @close="closeAllModals"
      @back="goBackToThemeSelect"
      @success="handleDreamHomeSet"
    />
  </div>
</template>

<script setup>
/**
 * PropertyActions
 * 
 * 매물 상세 페이지의 액션 버튼 컴포넌트.
 * 저장하기, 내 집으로 설정, 문의하기 버튼을 제공합니다.
 * 
 * "내 집으로 설정" 버튼 클릭 시:
 * Step 1: ThemeSelectModal - 테마 선택
 * Step 2: DreamHomeSetModal - 목표 설정
 */
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useToast } from '@/composables/useToast'
import ThemeSelectModal from '@/components/modals/ThemeSelectModal.vue'
import DreamHomeSetModal from '@/components/modals/DreamHomeSetModal.vue'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { showSuccess, showError, showInfo } = useToast()
const { savedPropertyIds } = storeToRefs(propertyStore)
const { currentAmount } = storeToRefs(dreamHomeStore)

// 모달 상태
const showThemeModal = ref(false)
const showDreamHomeModal = ref(false)
const selectedTheme = ref(null)
const selectedThemeId = ref(null)

// 저장 여부
const isSaved = computed(() => {
  const aptSeq = props.property.aptSeq || props.property.id
  return savedPropertyIds.value.includes(aptSeq)
})

// 구매 가능 여부 (보유 금액이 계약금 30%보다 많은지)
const isAffordable = computed(() => {
  if (!currentAmount.value || !props.property.price) return false
  return props.property.price * 0.3 <= currentAmount.value
})

// 필요 계약금 포맷
const formatDownPayment = computed(() => {
  if (!props.property.price) return '0'
  const downPayment = Math.ceil(props.property.price * 0.3)
  return downPayment.toLocaleString()
})

/**
 * 저장/저장 취소 토글
 */
async function handleSave() {
  try {
    const aptSeq = props.property.aptSeq || props.property.id
    const wasSaved = isSaved.value
    await propertyStore.toggleSaveProperty(aptSeq)

    if (wasSaved) {
      showInfo('저장 목록에서 제거되었습니다')
    } else {
      showSuccess('저장 목록에 추가되었습니다')
    }
  } catch (error) {
    showError(error.message || '저장 처리에 실패했습니다')
  }
}

/**
 * 드림홈 설정 시작 - Step 1: 테마 선택 모달 열기
 */
function handleSetAsDreamHome() {
  showThemeModal.value = true
}

/**
 * 테마 선택 완료 - Step 2로 이동
 */
function handleThemeSelected({ themeId, theme }) {
  selectedThemeId.value = themeId
  selectedTheme.value = theme
  showThemeModal.value = false
  showDreamHomeModal.value = true
}

/**
 * Step 2에서 테마 변경하러 Step 1로 돌아가기
 */
function goBackToThemeSelect() {
  showDreamHomeModal.value = false
  showThemeModal.value = true
}

/**
 * 모든 모달 닫기
 */
function closeAllModals() {
  showThemeModal.value = false
  showDreamHomeModal.value = false
}

/**
 * 드림홈 설정 성공 핸들러
 */
function handleDreamHomeSet(response) {
  closeAllModals()
  console.log('드림홈 설정 완료:', response)
}

/**
 * 연락하기
 */
function handleContact() {
  if (props.property.agentInfo?.phone) {
    window.location.href = `tel:${props.property.agentInfo.phone}`
  } else {
    showError('중개인 연락처 정보가 없습니다')
  }
}
</script>

<style scoped>
.property-actions {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

html[data-theme="night"] .property-actions {
  background: rgba(58, 53, 48, 0.85);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.actions-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

/* Action button visuals live in src/assets/css/components/buttons.css */

/* 구매 가능 정보 */
.affordability-info {
  margin-top: 1rem;
}

.affordability-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(239, 83, 80, 0.1);
  border: 2px solid rgba(239, 83, 80, 0.3);
}

.affordability-badge.affordable {
  background: rgba(102, 187, 106, 0.1);
  border-color: rgba(102, 187, 106, 0.3);
}

.badge-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 83, 80, 0.2);
  border-radius: 50%;
}

.affordability-badge.affordable .badge-icon {
  background: rgba(102, 187, 106, 0.2);
}

.badge-content {
  flex: 1;
}

.badge-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #EF5350;
  margin: 0 0 0.25rem 0;
}

.affordability-badge.affordable .badge-title {
  color: #66BB6A;
}

.badge-detail {
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.8;
  margin: 0;
}

html[data-theme="night"] .badge-detail {
  color: var(--showroom-text-night);
}

@media (max-width: 767px) {
  .property-actions {
    padding: 1.5rem;
  }

  .actions-container {
    grid-template-columns: 1fr;
  }

  .affordability-badge {
    flex-direction: column;
    text-align: center;
  }
}
</style>
