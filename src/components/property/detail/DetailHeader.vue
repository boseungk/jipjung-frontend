<template>
  <header
    class="detail-header"
    :class="{ scrolled: isScrolled }"
  >
    <div class="header-left">
      <button class="icon-btn back-btn" @click="$emit('back')" aria-label="Go back">
        <PhArrowLeft :size="24" weight="bold" />
      </button>
      <transition name="fade-slide">
        <h2 v-if="isScrolled" class="header-title">{{ title }}</h2>
      </transition>
    </div>

    <div class="header-actions">
      <button 
        class="icon-btn action-btn" 
        :class="{ active: isSaved }"
        @click="$emit('toggle-save')"
        aria-label="Save property"
        title="관심 매물"
      >
        <PhHeart :size="24" :weight="isSaved ? 'fill' : 'regular'" />
      </button>
      <button 
        class="icon-btn action-btn" 
        aria-label="Share property"
        title="공유하기"
      >
        <PhShareNetwork :size="24" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { PhArrowLeft, PhHeart, PhShareNetwork } from '@phosphor-icons/vue'

defineProps({
  title: {
    type: String,
    default: ''
  },
  isScrolled: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back', 'toggle-save'])
</script>

<style scoped>
.detail-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  /* Default transparent background */
  background: transparent;
}

.detail-header.scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

html[data-theme="night"] .detail-header.scrolled {
  background: rgba(58, 53, 48, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0; /* Text truncation fix */
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--showroom-text-day);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[data-theme="night"] .header-title {
  color: var(--showroom-text-night);
}

.icon-btn {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--showroom-text-day);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .icon-btn {
  background: rgba(40, 40, 40, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.icon-btn:hover {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .icon-btn:hover {
  background: rgba(60, 60, 60, 0.8);
}

.action-btn.active {
  color: #ef4444; /* Heart color */
  background: rgba(255, 240, 240, 0.9);
  border-color: rgba(239, 68, 68, 0.2);
}

html[data-theme="night"] .action-btn.active {
  background: rgba(60, 20, 20, 0.6);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
