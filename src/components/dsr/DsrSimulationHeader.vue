<template>
  <header class="view-header">
    <button class="back-button" @click="$emit('back')" aria-label="뒤로 가기">
      <AppIcon name="arrowLeft" :size="24" weight="bold" aria-hidden="true" />
    </button>
    <div class="header-text">
      <h1 class="view-title">
        <InfoTooltip :description="FINANCE_TERMS.DSR" id="dsr-title">
          DSR 시뮬레이션
        </InfoTooltip>
      </h1>
      <p class="view-subtitle">내 소득과 부채로 2026년 정책 기반 PRO 분석</p>
    </div>
  </header>
</template>

<script setup>
import { FINANCE_TERMS } from '@/constants/financeTerms'
import InfoTooltip from '@/components/common/InfoTooltip.vue'

defineEmits(['back'])
</script>

<style scoped>
.view-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--dsr-ink);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.18s var(--easing-bounce, cubic-bezier(0.68, -0.55, 0.265, 1.55)),
    background 0.2s ease;
}

.back-button:hover {
  background: var(--dsr-subcard-bg);
  transform: translateY(-1px);
}

.back-button:active {
  transform: translateY(1px) scale(0.98);
}

.back-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.18);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.15rem;
}

.view-title {
  font-family: var(--font-family-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--dsr-ink);
  margin: 0;
}

.view-subtitle {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dsr-ink-muted);
}
</style>

