<template>
  <div class="history-list">
    <div class="history-header">
      <h3 class="history-title">최근 분석 내역</h3>
      <button 
        v-if="!isLoading && history.length > 0"
        type="button" 
        class="refresh-button"
        @click="handleRefresh"
      >
        <AppIcon name="arrowClockwise" :size="16" weight="bold" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-spinner"></span>
      <p>내역을 불러오는 중...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="history.length === 0" class="empty-state">
      <span class="empty-icon">📋</span>
      <p class="empty-text">아직 분석 내역이 없습니다</p>
      <p class="empty-subtext">첫 지출을 등록해보세요!</p>
    </div>

    <!-- History Items -->
    <ul v-else class="history-items">
      <li 
        v-for="item in history" 
        :key="item.conversationId"
        class="history-item"
      >
        <div class="item-left">
          <span class="category-emoji">{{ getCategoryEmoji(item.receiptInfo?.category) }}</span>
          <div class="item-info">
            <span class="store-name">{{ item.receiptInfo?.storeName || '알 수 없음' }}</span>
            <span class="item-date">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>

        <div class="item-right">
          <span class="item-amount">{{ formatAmount(item.receiptInfo?.amount) }}</span>
          <span 
            class="judgment-badge"
            :class="item.judgmentResult?.toLowerCase()"
          >
            {{ getJudgmentLabel(item.judgmentResult) }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <AppIcon name="warningCircle" :size="16" weight="fill" />
      <span>{{ error }}</span>
      <button type="button" class="retry-button" @click="handleRefresh">
        재시도
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { getCategoryEmoji } from '@/constants/spendingCategories'
import { useAiManagerStore } from '@/stores/aiManagerStore'

// ============================================================================
// Store
// ============================================================================

const aiManagerStore = useAiManagerStore()

// ============================================================================
// Computed
// ============================================================================

const history = computed(() => aiManagerStore.history)
const isLoading = computed(() => aiManagerStore.isHistoryLoading)
const error = computed(() => aiManagerStore.historyError)

// ============================================================================
// Methods
// ============================================================================

/**
 * Format amount with comma separator
 */
const formatAmount = (amount) => {
  if (!amount) return '₩0'
  return `₩${amount.toLocaleString()}`
}

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}월 ${day}일`
}

/**
 * Get judgment result label
 */
const getJudgmentLabel = (result) => {
  switch (result) {
    case 'REASONABLE': return '합리적'
    case 'WASTE': return '낭비'
    default: return '대기중'
  }
}

/**
 * Refresh history list
 */
const handleRefresh = async () => {
  try {
    await aiManagerStore.fetchHistory()
  } catch (e) {
    // Error is handled by store
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Fetch history on mount if not already loaded
  if (history.value.length === 0 && !isLoading.value) {
    handleRefresh()
  }
})
</script>

<style scoped>
.history-list {
  background: var(--bento-card-bg, #ffffff);
  border: 1px solid var(--bento-card-border, #e5e7eb);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* Header */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.history-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.refresh-button {
  padding: 0.375rem;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--bento-text-muted, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover {
  background: var(--surface-muted, #f3f4f6);
  color: var(--brand-accent, #ff6b3d);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--bento-text-muted, #6b7280);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--bento-card-border, #e5e7eb);
  border-top-color: var(--brand-accent, #ff6b3d);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--bento-text, #374151);
}

.empty-subtext {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--bento-text-muted, #9ca3af);
}

/* History Items */
.history-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--surface-muted, #f8f9fa);
  border-radius: 10px;
  transition: background 0.2s;
}

.history-item:hover {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.06);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-emoji {
  font-size: 1.5rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.store-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--bento-text, #374151);
}

.item-date {
  font-size: 0.75rem;
  color: var(--bento-text-muted, #9ca3af);
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.item-amount {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--bento-text, #111827);
}

.judgment-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  text-transform: uppercase;
}

.judgment-badge.reasonable {
  background: #d1fae5;
  color: #059669;
}

.judgment-badge.waste {
  background: #fee2e2;
  color: #dc2626;
}

/* Error State */
.error-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #dc2626;
  margin-top: 0.75rem;
}

.retry-button {
  margin-left: auto;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}
</style>
