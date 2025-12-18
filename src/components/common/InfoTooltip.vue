<template>
  <span class="info-tooltip-wrapper">
    <slot />
    <button
      type="button"
      class="info-trigger"
      :id="triggerId"
      :aria-expanded="showTooltip"
      :aria-describedby="tooltipId"
      aria-label="설명 보기"
      @click.stop="toggleTooltip"
      @keydown.esc="closeTooltip"
      @keydown.enter.space.prevent="toggleTooltip"
    >
      <AppIcon name="question" :size="14" />
    </button>
    <Transition name="tooltip-fade">
      <div 
        v-if="showTooltip" 
        :id="tooltipId"
        class="tooltip-content" 
        role="tooltip"
        ref="tooltipRef"
        tabindex="-1"
      >
        <p>{{ description }}</p>
        <button 
          class="close-btn" 
          @click.stop="closeTooltip"
          aria-label="닫기"
        >
          <AppIcon name="x" :size="12" />
        </button>
      </div>
    </Transition>
  </span>
</template>

<script setup>
/**
 * InfoTooltip - 접근성 강화된 정보 툴팁 컴포넌트
 * 
 * 금융 용어나 복잡한 개념에 대한 설명을 제공합니다.
 * 
 * @example
 * <InfoTooltip :description="FINANCE_TERMS.DSR">
 *   DSR 시뮬레이션
 * </InfoTooltip>
 * 
 * @see DSR_SIMULATION_IMPROVEMENT_PLAN.md Phase 1.2
 */
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  /** 툴팁에 표시될 설명 텍스트 */
  description: { 
    type: String, 
    required: true 
  },
  /** 고유 ID (접근성용, 자동 생성 가능) */
  id: { 
    type: String, 
    default: () => `tooltip-${Math.random().toString(36).slice(2, 9)}` 
  }
})

const showTooltip = ref(false)
const tooltipRef = ref(null)

// 접근성을 위한 고유 ID
const triggerId = computed(() => `${props.id}-trigger`)
const tooltipId = computed(() => `${props.id}-content`)

function toggleTooltip() {
  showTooltip.value = !showTooltip.value
}

function closeTooltip() {
  showTooltip.value = false
}

// 외부 클릭 시 닫기
function handleClickOutside(e) {
  const trigger = document.getElementById(triggerId.value)
  if (
    tooltipRef.value && 
    !tooltipRef.value.contains(e.target) &&
    trigger && !trigger.contains(e.target)
  ) {
    closeTooltip()
  }
}

// ESC 키로 닫기 (document 레벨)
function handleEscKey(e) {
  if (e.key === 'Escape' && showTooltip.value) {
    closeTooltip()
  }
}

// 열릴 때만 이벤트 리스너 등록 (성능 최적화)
watch(showTooltip, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscKey)
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscKey)
})
</script>

<style scoped>
.info-tooltip-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}

.info-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--surface-muted, #f3f4f6);
  color: var(--ink-muted, #6b7280);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.info-trigger:hover,
.info-trigger:focus {
  background: var(--brand-accent-soft, #ffe4d9);
  color: var(--brand-accent, #ff6b3d);
  transform: scale(1.1);
  outline: none;
}

.info-trigger:focus-visible {
  box-shadow: 0 0 0 2px var(--brand-accent);
}

.tooltip-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 220px;
  max-width: 300px;
  padding: 0.875rem 1rem;
  padding-right: 2rem;
  background: var(--surface-card-bg, #fff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .tooltip-content {
  background: var(--surface-card-bg, #1f2937);
  border-color: var(--border-soft, #374151);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.tooltip-content p {
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--ink-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--surface-muted);
}

/* 애니메이션 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
