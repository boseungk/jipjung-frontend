<template>
  <div class="achievement-section">
    <!-- Achievement Rate -->
    <div class="achievement-header">
      <div class="achievement-icon">💰</div>
      <h2 class="achievement-title">목표 달성률</h2>
      <div class="achievement-rate">{{ achievementRate }}%</div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div
        class="progress-bar"
        :style="{ width: achievementRate + '%' }"
        role="progressbar"
        :aria-valuenow="achievementRate"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`목표 달성률 ${achievementRate}%`"
      >
        <div class="progress-glow"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">현재 저축액</span>
        <span class="stat-value">₩{{ formatNumber(currentAmount) }}만</span>
      </div>
      <div class="stat-divider">/</div>
      <div class="stat-item">
        <span class="stat-label">목표 금액</span>
        <span class="stat-value">₩{{ formatNumber(targetAmount) }}만</span>
      </div>
    </div>

    <!-- D-Day -->
    <div class="dday-container">
      <span class="dday-icon">📅</span>
      <span class="dday-text">D-{{ daysRemaining }}</span>
      <span class="dday-divider">|</span>
      <span class="dday-date">예상 달성일: {{ targetDate }}</span>
    </div>

    <!-- CTA Buttons -->
    <div class="cta-buttons">
      <button class="cta-btn cta-primary" @click="openSavingModal">
        <span class="btn-icon">💾</span>
        저축하기
      </button>
      <button class="cta-btn cta-secondary" @click="onChangeDreamHome">
        <span class="btn-icon">🏠</span>
        드림홈 변경
      </button>
    </div>
    
    <!-- Saving Input Modal -->
    <SavingInputModal 
      :is-open="savingModalOpen" 
      @close="closeSavingModal"
      @submit="handleSavingSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from "pinia";
import { useDreamHomeStore } from "../../stores/dreamHomeStore";
import { formatNumber } from "../../utils/formatters";
import SavingInputModal from '../modals/SavingInputModal.vue'

const dreamHomeStore = useDreamHomeStore();
const {
  achievementRate,
  currentAmount,
  targetAmount,
  daysRemaining,
  targetDate,
} = storeToRefs(dreamHomeStore);

const emit = defineEmits(["saving", "changeDreamHome"]);

// Modal state
const savingModalOpen = ref(false)

const openSavingModal = () => {
  savingModalOpen.value = true
}

const closeSavingModal = () => {
  savingModalOpen.value = false
}

const handleSavingSubmit = (data) => {
  console.log('저축 데이터:', data)
  // TODO: Integrate with store
  emit("saving", data)
}

const onChangeDreamHome = () => {
  emit("changeDreamHome");
};
</script>

<style scoped>
.achievement-section {
  padding: 2.5rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Remove card background - clean stream layout */
html[data-theme="day"] .achievement-section {
  background: transparent;
}

html[data-theme="night"] .achievement-section {
  background: transparent;
}

/* Header */
.achievement-header {
  text-align: center;
  margin-bottom: 2rem;
}

.achievement-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.achievement-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--showroom-text-day, #5d4037);
}

html[data-theme="night"] .achievement-title {
  color: var(--showroom-text-night, #f5ede3);
}

.achievement-rate {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--showroom-accent-day, #d4a574);
  letter-spacing: -0.02em;
}

html[data-theme="night"] .achievement-rate {
  color: var(--showroom-accent-night, #d4a574);
}

/* Progress Bar - Glassmorphism */
.progress-container {
  position: relative;
  width: 85%;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 1.5rem;
}

html[data-theme="day"] .progress-container {
  background: var(--showroom-card-bg-day);
  box-shadow: inset 4px 4px 8px var(--showroom-shadow-dark-day),
    inset -4px -4px 8px var(--showroom-shadow-light-day);
}

html[data-theme="night"] .progress-container {
  background: rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

.progress-bar {
  position: relative;
  height: 100%;
  border-radius: 8px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  /* Edge lighting effect */
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

html[data-theme="day"] .progress-bar {
  background: var(--showroom-accent-day, #d4a574);
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.4);
}

html[data-theme="night"] .progress-bar {
  background: var(--showroom-accent-night, #d4a574);
  box-shadow: 0 0 20px rgba(212, 165, 116, 0.5);
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Stats */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-divider {
  font-size: 1.25rem;
  color: var(--showroom-text-day, #5d4037);
  opacity: 0.3;
  font-weight: 300;
}

html[data-theme="night"] .stat-divider {
  color: var(--showroom-text-secondary-night, #d7ccc8);
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--showroom-text-day, #5d4037);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

html[data-theme="night"] .stat-label {
  color: var(--showroom-text-night, #f5ede3);
  opacity: 0.6;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--showroom-text-day, #5d4037);
}

html[data-theme="night"] .stat-value {
  color: var(--showroom-text-night, #f5ede3);
}

/* D-Day */
.dday-container {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: var(--showroom-text-day, #5d4037);
}

html[data-theme="night"] .dday-container {
  color: var(--showroom-text-night, #f5ede3);
}

.dday-icon {
  margin-right: 0.5rem;
}

.dday-text {
  font-weight: 700;
  color: var(--showroom-accent-day, #d4a574);
}

html[data-theme="night"] .dday-text {
  color: var(--showroom-accent-night, #d4a574);
}

.dday-divider {
  margin: 0 0.75rem;
  opacity: 0.5;
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Day Mode Buttons - Enhanced Neumorphism */
html[data-theme="day"] .cta-primary {
  background: var(--showroom-accent-day, #d4a574);
  color: white;
  box-shadow: 6px 6px 16px var(--showroom-shadow-dark-day),
    -3px -3px 10px var(--showroom-shadow-light-day);
}

html[data-theme="day"] .cta-primary:hover {
  transform: translateY(-4px);
  box-shadow: 8px 8px 20px var(--showroom-shadow-dark-day),
    -4px -4px 12px var(--showroom-shadow-light-day);
}

html[data-theme="day"] .cta-primary:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: inset 4px 4px 12px rgba(0, 0, 0, 0.2),
    inset -2px -2px 8px rgba(255, 255, 255, 0.3);
}

html[data-theme="day"] .cta-secondary {
  background: var(--showroom-card-bg-day);
  color: var(--showroom-text-day);
  box-shadow: 5px 5px 10px var(--showroom-shadow-dark-day),
    -5px -5px 10px var(--showroom-shadow-light-day);
}

html[data-theme="day"] .cta-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 7px 7px 14px var(--showroom-shadow-dark-day),
    -7px -7px 14px var(--showroom-shadow-light-day);
}

html[data-theme="day"] .cta-secondary:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: inset 3px 3px 8px var(--showroom-shadow-dark-day),
    inset -3px -3px 8px var(--showroom-shadow-light-day);
}

/* Night Mode Buttons - Enhanced Glassmorphism with Tactile Feedback */
html[data-theme="night"] .cta-primary {
  background: rgba(212, 165, 116, 0.2);
  color: var(--showroom-text-night);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.3);
  border-left-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35), 0 0 25px rgba(212, 165, 116, 0.4);
}

html[data-theme="night"] .cta-primary:hover {
  background: rgba(212, 165, 116, 0.25);
  transform: translateY(-4px);
  border-top-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), 0 0 35px rgba(212, 165, 116, 0.5);
}

html[data-theme="night"] .cta-primary:active {
  background: rgba(0, 0, 0, 0.25);
  transform: translateY(2px) scale(0.98);
  box-shadow: inset 4px 4px 12px rgba(0, 0, 0, 0.6),
    inset -2px -2px 8px rgba(255, 255, 255, 0.03);
}

html[data-theme="night"] .cta-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--showroom-text-night);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.12);
  border-left-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

html[data-theme="night"] .cta-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  border-top-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

html[data-theme="night"] .cta-secondary:active {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(2px) scale(0.98);
  box-shadow: inset 3px 3px 10px rgba(0, 0, 0, 0.5);
}

.btn-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 767px) {
  .achievement-section {
    padding: 1.5rem 1rem;
  }

  .progress-container {
    height: 10px;
    border-radius: 6px;
  }

  .progress-bar {
    border-radius: 6px;
  }

  .achievement-rate {
    font-size: 2.25rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-btn {
    width: 100%;
  }

  .stats-row {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-divider {
    display: none;
  }
}
</style>
