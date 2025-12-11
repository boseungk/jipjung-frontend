<template>
  <div class="property-actions">
    <div class="actions-container">
      <button
        @click="handleSave"
        class="action-btn save-btn"
        :class="{ saved: isSaved }"
      >
        {{ isSaved ? '❤️ 저장됨' : '🤍 저장하기' }}
      </button>

      <button
        @click="handleSetAsDreamHome"
        class="action-btn dream-home-btn"
      >
        🏠 내 집으로 설정
      </button>

      <button
        @click="handleContact"
        class="action-btn contact-btn"
        v-if="property.agentInfo?.phone"
      >
        📞 문의하기
      </button>
    </div>

    <!-- 구매 가능 여부 표시 -->
    <div class="affordability-info" v-if="targetAmount">
      <div class="affordability-badge" :class="{ affordable: isAffordable }">
        <span class="badge-icon">{{ isAffordable ? '✓' : '✗' }}</span>
        <div class="badge-content">
          <p class="badge-title">
            {{ isAffordable ? '구매 가능' : '예산 초과' }}
          </p>
          <p class="badge-detail">
            필요 계약금: {{ property.getDownPayment().toLocaleString() }}만원
            (보유: {{ targetAmount.toLocaleString() }}만원)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { showSuccess, showError, showInfo } = useToast()
const { savedPropertyIds } = storeToRefs(propertyStore)
const { targetAmount } = storeToRefs(dreamHomeStore)

const isSaved = computed(() => savedPropertyIds.value.includes(props.property.id))
const isAffordable = computed(() => {
  if (!targetAmount.value) return false
  return props.property.price * 0.3 <= targetAmount.value
})

function handleSave() {
  const wasSaved = isSaved.value
  propertyStore.toggleSaveProperty(props.property.id)

  if (wasSaved) {
    showInfo('저장 목록에서 제거되었습니다')
  } else {
    showSuccess('저장 목록에 추가되었습니다')
  }
}

function handleSetAsDreamHome() {
  // dreamHomeStore 업데이트
  dreamHomeStore.changeDreamHome({
    propertyName: props.property.title,
    location: `${props.property.sido} ${props.property.sigungu}`,
    price: props.property.price
  })

  // 성공 메시지
  showSuccess(`"${props.property.title}"을(를) 내 집으로 설정했습니다! 대시보드에서 저축 진행 상황을 확인하세요.`, 4000)

  // 1초 후 대시보드로 이동
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

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

.action-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateZ(0);
}

.save-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  box-shadow: var(--nav-btn-shadow-day);
  color: var(--showroom-text-day);
}

html[data-theme="night"] .save-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  border-color: var(--nav-btn-border-night);
  box-shadow: var(--nav-btn-shadow-night);
  color: var(--showroom-text-night);
}

.save-btn.saved {
  background: linear-gradient(135deg, #FF7F50 0%, #FF6347 100%);
  color: white;
  border-color: transparent;
}

.dream-home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 52px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(90deg, var(--brand-accent, #ff6b3d), var(--brand-accent-soft, #ff9a75));
  color: #ffffff;
  box-shadow: 0 14px 24px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.45);
}

.contact-btn {
  background: linear-gradient(135deg, #4285f4 0%, #357ae8 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3);
}

.action-btn:hover {
  transform: translateY(-1px);
}

.dream-home-btn:hover {
  box-shadow: 0 16px 26px -14px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.55);
}

.dream-home-btn:active {
  transform: translateY(1px) scale(0.99);
  opacity: 0.9;
  box-shadow: inset 0 2px 6px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
}

.contact-btn:hover {
  box-shadow: 0 10px 30px rgba(66, 133, 244, 0.5);
}

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
