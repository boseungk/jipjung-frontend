<template>
  <div class="agent-card">
    <div class="agent-header">
      <div class="agent-avatar">
        <PhUser :size="32" weight="fill" />
      </div>
      <div class="agent-details">
        <h4 class="agent-name">{{ agent?.name || '담당 중개사' }}</h4>
        <p class="agent-company">{{ agent?.company || '공인중개사사무소' }}</p>
      </div>
    </div>
    
    <div class="contact-actions">
      <button class="contact-btn phone" @click="handleCall" :disabled="!agent?.phone">
        <PhPhone :size="20" weight="bold" />
        <span>{{ formatPhoneNumber(agent?.phone) || '연락처 없음' }}</span>
      </button>
      <button class="contact-btn chat">
        <PhChatCircleDots :size="20" weight="bold" />
        <span>채팅 상담</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { PhUser, PhPhone, PhChatCircleDots } from '@phosphor-icons/vue'

const props = defineProps({
  agent: {
    type: Object,
    default: null
  }
})

function formatPhoneNumber(phone) {
  if (!phone) return null
  return phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
}

function handleCall() {
  if (props.agent?.phone) {
    window.location.href = `tel:${props.agent.phone}`
  }
}
</script>

<style scoped>
.agent-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .agent-card {
  background: rgba(58, 53, 48, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.agent-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--showroom-text-day);
  opacity: 0.7;
}

html[data-theme="night"] .agent-avatar {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.agent-details {
  flex: 1;
}

.agent-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--showroom-text-day);
  margin: 0 0 0.25rem 0;
}

html[data-theme="night"] .agent-name {
  color: var(--showroom-text-night);
}

.agent-company {
  font-size: 0.875rem;
  color: var(--showroom-text-day);
  opacity: 0.6;
  margin: 0;
}

html[data-theme="night"] .agent-company {
  color: var(--showroom-text-night);
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.contact-btn.phone {
  background: var(--brand-accent);
  color: white;
}

.contact-btn.phone:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.contact-btn.phone:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.contact-btn.chat {
  background: rgba(0, 0, 0, 0.05);
  color: var(--showroom-text-day);
}

html[data-theme="night"] .contact-btn.chat {
  background: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.contact-btn.chat:hover {
  background: rgba(0, 0, 0, 0.1);
}

html[data-theme="night"] .contact-btn.chat:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
