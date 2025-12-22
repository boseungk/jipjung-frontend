<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="handleClose">
      <div class="modal-container" @click.stop>
        <div class="badge">🎉 목표 달성</div>
        <h2 class="modal-title">저축 목표를 완성했어요!</h2>
        <p class="modal-message">
          {{ formatMoney(totalSaved) }}원을 모아
          {{ formatMoney(targetAmount) }} 목표를 달성했습니다.
        </p>

        <div class="summary">
          <div class="summary-item">
            <span class="label">누적 저축</span>
            <span class="value">{{ formatMoney(totalSaved) }}원</span>
          </div>
          <div class="summary-item">
            <span class="label">목표 금액</span>
            <span class="value">{{ formatMoney(targetAmount) }}원</span>
          </div>
        </div>

        <div class="actions">
          <button class="secondary-button" @click="handleViewCollection">컬렉션 보기</button>
          <button class="primary-button" @click="handleSetNextGoal">다음 목표 설정</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  targetAmount: {
    type: Number,
    default: 0
  },
  totalSaved: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'viewCollection', 'setNextGoal'])

const formatMoney = (value) => {
  if (!value) return '0'
  return Number(value).toLocaleString('ko-KR')
}

const handleClose = () => {
  emit('close')
}

const handleViewCollection = () => {
  emit('viewCollection')
}

const handleSetNextGoal = () => {
  emit('setNextGoal')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

html[data-theme="day"] .modal-overlay {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

html[data-theme="night"] .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.modal-container {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 2.25rem 2rem;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

html[data-theme="day"] .modal-container {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

html[data-theme="night"] .modal-container {
  background: rgba(58, 53, 48, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  background: rgba(255, 193, 7, 0.2);
  color: #b26a00;
}

html[data-theme="night"] .badge {
  background: rgba(255, 193, 7, 0.15);
  color: #ffd27a;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .modal-title {
  color: var(--showroom-text-night, #F5EDE3);
}

.modal-message {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .modal-message {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.summary {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
}

html[data-theme="night"] .summary-item {
  background: rgba(255, 255, 255, 0.08);
}

.summary-item .label {
  font-size: 0.9rem;
  color: var(--showroom-text-secondary-day, #8D6E63);
}

html[data-theme="night"] .summary-item .label {
  color: var(--showroom-text-secondary-night, #D7CCC8);
}

.summary-item .value {
  font-weight: 600;
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .summary-item .value {
  color: var(--showroom-text-night, #F5EDE3);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.primary-button,
.secondary-button {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.primary-button {
  background: #ffb74d;
  color: #4e342e;
}

.secondary-button {
  background: transparent;
  border: 1px solid rgba(141, 110, 99, 0.4);
  color: var(--showroom-text-day, #5D4037);
}

html[data-theme="night"] .secondary-button {
  border-color: rgba(215, 204, 200, 0.4);
  color: var(--showroom-text-night, #F5EDE3);
}

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
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(10px) scale(0.98);
}
</style>
