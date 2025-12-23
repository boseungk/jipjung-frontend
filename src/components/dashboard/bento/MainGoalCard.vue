<template>
  <div class="bento-card main-goal-card">
    <!-- 로딩 중: 스켈레톤 UI -->
    <template v-if="isLoading">
      <div class="loading-state">
        <div class="skeleton-grid">
          <div class="skeleton-chart"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line long"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- 목표가 있을 때: 정상 UI -->
    <template v-else-if="hasGoal">
      <!-- TRUE 1:1 Grid: Donut Chart | Text + Button -->
      <div class="equal-grid">
        <!-- LEFT: CSS Donut Chart -->
        <div class="chart-column">
          <div class="card-heading">
            <h3 class="card-title">{{ progressLabel }}</h3>
            <button 
              type="button" 
              class="settings-btn" 
              @click="handleEditGoalClick"
              aria-label="목표 설정"
            >
              <AppIcon name="gear" :size="18" />
            </button>
          </div>
          <div class="css-donut-chart">
            <div 
              class="donut-ring" 
              :class="{ 'is-zero': isZeroProgress }"
              :style="{ '--progress': progressPercent + '%' }"
            >
              <div class="donut-hole">
                <template v-if="isZeroProgress">
                  <!-- L-2: 0% 상태 피드백 -->
                  <AppIcon name="sparkles" :size="20" class="zero-icon" />
                  <div class="donut-text zero-text">
                    {{ zeroMessageLines[0] }}<br>{{ zeroMessageLines[1] }}
                  </div>
                </template>
                <template v-else>
                  <div class="donut-label">진행도</div>
                  <div class="donut-text">{{ progressText }}%</div>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- RIGHT: Text + Button (Vertical Stack) -->
        <div class="content-column">
          <div class="text-stack">
            <div class="context-small">목표까지 남은 금액</div>
            <div class="amount-row">
              <div class="amount-huge">{{ formatWon(remainingAmount) }}</div>
            </div>
            <!-- V2: 목표 & 실거래가 정보 -->
            <div class="goal-info-stack">
              <div class="goal-info-row">
                <span class="goal-info-label">저축 목표</span>
                <span class="goal-info-value">
                  <span class="value-text">{{ formatWonCompact(targetAmount) }}</span>
                </span>
              </div>
              <div class="goal-info-row muted" v-if="propertyPriceManwon">
                <span class="goal-info-label">실거래가</span>
                <span class="goal-info-value">
                  <span class="value-text">{{ formatKoreanCurrency(propertyPriceManwon) }}</span>
                </span>
              </div>
            </div>
          </div>
          
          <!-- Full-Width Button -->
          <button class="savings-button" @click="handleSavingClick">
            <span class="btn-text">{{ actionButtonLabel }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- H-2: 목표가 없을 때: Empty State UI -->
    <template v-else>
      <div class="empty-state-content">
        <div class="empty-icon-wrapper">
          <AppIcon name="sparkles" :size="24" :active="true" />
        </div>
        <h4 class="empty-title">아직 목표가 없어요</h4>
        <p class="empty-desc">
          꿈의 집을 선택하고<br>저축 목표를 시작해보세요!
        </p>
        <button class="btn btn-primary" @click="goToProperties">
          <AppIcon name="search" :size="18" />
          <span>매물 둘러보기</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * MainGoalCard
 * 
 * 대시보드 메인 목표 카드.
 * 드림홈 저축 진행률과 저축하기 버튼을 표시합니다.
 * 
 * [C-1 UX 개선] 모달 관리를 부모(BentoGrid)로 위임.
 * "저축하기" 버튼 클릭 시 'open-saving-modal' 이벤트를 emit합니다.
 * 
 * [H-2 UX 개선] 목표 미설정 시 Empty State UI 표시
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useAuthStore } from '@/stores/authStore'
import { formatWon, formatWonCompact, formatKoreanCurrency } from '@/utils/formatters'
import AppIcon from '@/components/common/AppIcon.vue'

const emit = defineEmits(['open-saving-modal', 'open-edit-goal'])
const router = useRouter()

const dreamHomeStore = useDreamHomeStore()
const authStore = useAuthStore()
const {
  dreamHomeId,
  targetAmount,
  propertyName,
  price,
  achievementRate,
  remainingAmount,
  linkedProperty,
  expProgress
} = storeToRefs(dreamHomeStore)

/**
 * 매물 가격 정보 (만원 단위)
 * - linkedProperty.price (원 단위) → 만원 변환
 * - 백엔드에서 linkedProperty가 내려올 때만 표시
 */
const propertyPriceManwon = computed(() => {
  const linkedPrice = linkedProperty.value?.price
  if (linkedPrice && linkedPrice > 0) {
    return Math.round(linkedPrice / 10000)
  }
  return null
})
const { hasDreamHomeGoal, isDashboardLoading, user } = storeToRefs(authStore)

/**
 * 로딩 상태 (캐시 초기화 후 대시보드 로딩 중)
 * - isDashboardLoading이 true이거나
 * - user는 있지만 dreamHome 데이터가 아직 로드되지 않은 경우
 */
const isLoading = computed(() => {
  // 명시적으로 로딩 중인 경우
  if (isDashboardLoading.value) return true
  
  // user가 없으면 아직 초기화 전
  if (!user.value) return true
  
  // user는 있지만 _raw 데이터가 없으면 아직 대시보드 로드 전
  if (!user.value._raw) return true
  
  return false
})

/**
 * 목표 설정 여부 판단
 * dreamHomeId가 설정되어 있으면 목표가 있는 것으로 간주
 */
const hasGoal = computed(() => {
  if (typeof hasDreamHomeGoal.value === 'boolean') return hasDreamHomeGoal.value
  return dreamHomeId.value != null
})

/**
 * 달성률(%) 숫자 값
 * - store는 문자열(예: "28.5")을 반환하므로 UI 계산/비교용 숫자 값을 별도로 둠
 */
const achievementRateNumber = computed(() => {
  const value = Number(achievementRate.value)
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
})

const progressPercent = computed(() => {
  if (expProgress.value != null) {
    const value = Number(expProgress.value)
    if (Number.isFinite(value)) {
      return Math.min(100, Math.max(0, value))
    }
  }
  return achievementRateNumber.value
})

const progressText = computed(() => progressPercent.value.toFixed(1))

const progressLabel = computed(() => (
  expProgress.value != null ? '집 성장 진행도' : '목표 달성률'
))

const zeroMessageLines = computed(() => (
  expProgress.value != null
    ? ['첫 활동을', '시작해보세요!']
    : ['첫 저축을', '시작해보세요!']
))

const isZeroProgress = computed(() => progressPercent.value <= 0)

const showGapInfo = computed(() => {
  const gap = Number(linkedProperty.value?.gap)
  const price = Number(linkedProperty.value?.price)
  return Number.isFinite(gap) && gap > 0 && Number.isFinite(price) && price > 0
})

const isGoalCompleted = computed(() => (
  authStore.userDreamHome?.isCompleted === true
  || user.value?._raw?.goal?.isCompleted === true
))

const actionButtonLabel = computed(() => (
  isGoalCompleted.value ? '다음 목표 설정' : '저축하기'
))

const gapTooltip = computed(() => {
  const linked = linkedProperty.value
  if (!linked?.price) return ''
  const name = linked.name ? ` (${linked.name})` : ''
  return `최근 시세 ${formatWonCompact(linked.price)} 기준${name}`
})

/**
 * 저축하기 버튼 클릭 핸들러
 * 부모 컴포넌트(BentoGrid)에 모달 열기 요청
 */
const handleSavingClick = () => {
  if (isGoalCompleted.value) {
    router.push('/properties')
    return
  }
  emit('open-saving-modal')
}

const handleEditGoalClick = () => {
  emit('open-edit-goal')
}

/**
 * 매물 둘러보기 버튼 클릭 핸들러
 * 매물 검색 페이지로 이동
 */
const goToProperties = () => {
  router.push('/properties')
}
</script>

<style scoped>
.main-goal-card {
  grid-area: main;
  grid-row: auto;
  padding: 1.35rem 1.4rem;
}

/* TRUE 1:1 Grid Layout */
.equal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.15rem;
  align-items: center;
  height: 100%;
}

/* LEFT: Chart Column */
.chart-column {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.35rem;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: flex-start;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .card-title {
  color: var(--showroom-text-night, #F5EDE3);
}

/* Settings Button */
.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--bento-text-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: var(--surface-muted, #f3f4f6);
  color: var(--brand-accent, #ff6b3d);
  transform: rotate(45deg);
}

html[data-theme="night"] .settings-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--showroom-accent-night, #D4A574);
}

/* CSS Donut Chart */
.css-donut-chart {
  width: 100%;
  max-width: 180px;
  aspect-ratio: 1;
}

.donut-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--brand-accent, #ff6b3d) 0%,
    var(--brand-accent, #ff6b3d) var(--progress, 28%),
    var(--donut-track, #e5e7eb) var(--progress, 28%),
    var(--donut-track, #e5e7eb) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform: rotate(-90deg);
  transition: all 0.3s ease;
  cursor: pointer;
  --donut-track: #e5e7eb;
}

html[data-theme="night"] .donut-ring {
  --donut-track: rgba(255, 255, 255, 0.12);
  background: conic-gradient(
    var(--showroom-accent-night, #D4A574) 0%,
    var(--showroom-accent-night, #D4A574) var(--progress, 28%),
    var(--donut-track) var(--progress, 28%),
    var(--donut-track) 100%
  );
}

.donut-ring:hover {
  background: conic-gradient(
    #ff8559 0%,
    #ff8559 var(--progress, 28%),
    var(--donut-track, #e5e7eb) var(--progress, 28%),
    var(--donut-track, #e5e7eb) 100%
  );
}

html[data-theme="night"] .donut-ring:hover {
  background: conic-gradient(
    #e8c4a0 0%,
    #e8c4a0 var(--progress, 28%),
    var(--donut-track) var(--progress, 28%),
    var(--donut-track) 100%
  );
}

.donut-hole {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid var(--border-soft, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  flex-direction: column;
}

html[data-theme="night"] .donut-hole {
  background: rgba(32, 36, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.donut-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bento-text-muted, #6b7280);
}

.donut-text {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .donut-text {
  color: var(--showroom-text-night, #f5f6f7);
}

/* L-2: Zero progress state */
.donut-ring.is-zero {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  animation: gentle-pulse 2.5s ease-in-out infinite;
}

html[data-theme="night"] .donut-ring.is-zero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
}

@keyframes gentle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.zero-icon {
  color: var(--brand-accent, #ff6b3d);
  margin-bottom: 0.25rem;
}

.zero-text {
  font-size: 0.8125rem !important;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
  color: var(--bento-text-muted, #6b7280);
}

/* RIGHT: Content Column - Vertical Stack */
.content-column {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  justify-content: center;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Text Stack */
.text-stack {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* Small Context Text */
.context-small {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--bento-text-muted, #6b7280);
  line-height: 1.2;
}

/* HUGE Amount - The Star */
.amount-huge {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 0.25rem 0;
}

html[data-theme="night"] .amount-huge {
  color: var(--showroom-text-night, #F5EDE3);
}

.unit-small {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bento-text-muted, #6b7280);
  margin-left: 0.2rem;
}

/* Subtitle Info */
.subtitle-info {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  margin-top: 0.25rem;
}

html[data-theme="night"] .subtitle-info {
  color: var(--showroom-text-night, #F5EDE3);
}

.muted {
  font-weight: 400;
  color: var(--bento-text-muted, #6b7280);
}

/* V2: 목표 & 실거래가 정보 - 미니멀 디자인 */
.goal-info-stack {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 0.65rem;
  padding: 0.5rem 0;
  border-top: 1px dashed var(--border-soft, #e0e2e5);
}

.goal-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0;
}

.goal-info-row.muted .goal-info-label {
  color: var(--bento-text-muted, #9ca3af);
}

.goal-info-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--bento-text-muted, #6b7280);
}

.goal-info-value {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.goal-info-value .value-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  letter-spacing: -0.01em;
}

.goal-info-row:first-child .goal-info-value .value-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
}

.goal-info-row.muted .goal-info-value .value-text {
  color: var(--ink-muted, #6b7280);
}

/* Night Mode */
html[data-theme="night"] .goal-info-stack {
  border-top-color: rgba(255, 255, 255, 0.1);
}

html[data-theme="night"] .goal-info-label {
  color: rgba(245, 237, 227, 0.5);
}

html[data-theme="night"] .goal-info-value .value-text {
  color: var(--showroom-text-night, #F5EDE3);
}

html[data-theme="night"] .goal-info-row:first-child .goal-info-value .value-text {
  color: var(--showroom-accent-night, #D4A574);
}

/* V2: 매물 시세 정보 - 프리미엄 디자인 */
.property-price-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08) 0%,
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.02) 100%
  );
  border: 1px solid rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  transition: all 0.2s ease;
}

.property-price-info:hover {
  background: linear-gradient(135deg,
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12) 0%,
    rgba(var(--brand-accent-rgb, 255, 107, 61), 0.04) 100%
  );
  border-color: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.2);
}

.price-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  color: var(--brand-accent, #ff6b3d);
  flex-shrink: 0;
}

.price-info-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 0.5rem;
}

.price-info-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--bento-text-muted, #6b7280);
}

.price-info-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--brand-accent, #ff6b3d);
  letter-spacing: -0.02em;
}

/* Night Mode */
html[data-theme="night"] .property-price-info {
  background: linear-gradient(135deg,
    rgba(212, 165, 116, 0.12) 0%,
    rgba(212, 165, 116, 0.04) 100%
  );
  border-color: rgba(212, 165, 116, 0.18);
}

html[data-theme="night"] .property-price-info:hover {
  background: linear-gradient(135deg,
    rgba(212, 165, 116, 0.18) 0%,
    rgba(212, 165, 116, 0.08) 100%
  );
  border-color: rgba(212, 165, 116, 0.25);
}

html[data-theme="night"] .price-info-icon {
  background: rgba(212, 165, 116, 0.18);
  color: var(--showroom-accent-night, #D4A574);
}

html[data-theme="night"] .price-info-label {
  color: rgba(245, 237, 227, 0.6);
}

html[data-theme="night"] .price-info-value {
  color: var(--showroom-accent-night, #D4A574);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
  color: var(--brand-accent, #ff6b3d);
  font-weight: 700;
  font-size: 0.875rem;
}

.pill.ghost {
  background: var(--surface-muted, #f3f4f6);
  color: var(--bento-text-muted, #6b7280);
  border: 1px solid var(--border-soft, #e5e7eb);
}

html[data-theme="night"] .pill.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(245, 246, 247, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Button visuals (.savings-button / .explore-button) live in src/assets/css/components/buttons.css */

.btn-text {
  letter-spacing: 0.03em;
}

.edit-goal-button {
  --app-btn-min-height: 40px;
  --app-btn-padding-y: 0.6rem;
  --app-btn-padding-x: 1.1rem;
  --app-btn-font-size: 0.9rem;
  --app-btn-font-weight: 600;
  --app-btn-bg: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
  --app-btn-color: var(--brand-accent, #ff6b3d);
  --app-btn-shadow: none;
  --app-btn-shadow-hover: none;
  --app-btn-shadow-active: none;
  --app-btn-ring: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.22);

  border-color: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.35);
  margin-top: 0.55rem;
}

html[data-theme="night"] .edit-goal-button {
  --app-btn-bg: rgba(212, 165, 116, 0.16);
  --app-btn-color: var(--showroom-accent-night, #D4A574);
  border-color: rgba(212, 165, 116, 0.35);
}

/* Responsive */
@media (max-width: 1039px) {
  .equal-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .css-donut-chart {
    max-width: 180px;
  }

  .text-stack {
    text-align: center;
  }

  .amount-row {
    justify-content: center;
  }

  .amount-huge {
    font-size: 2.25rem;
  }
}

  @media (max-width: 767px) {
  .main-goal-card {
    padding: 1.25rem;
  }

  .equal-grid {
    gap: 1.25rem;
  }

  .css-donut-chart {
    max-width: 140px;
  }

  .donut-text {
    font-size: 1.5rem;
  }

  .content-column {
    gap: 1.1rem;
  }

  .context-small {
    font-size: 0.875rem;
  }

  .amount-huge {
    font-size: 1.75rem;
  }

  .unit-small {
    font-size: 1.1rem;
  }

  .subtitle-info {
    font-size: 0.875rem;
  }

  /* Keep global button sizing for consistency */
  }

/* Extra small devices */
@media (max-width: 374px) {
  .amount-huge {
    font-size: 1.6rem;
  }

  .css-donut-chart {
    max-width: 130px;
  }
}

/* H-2: Empty State UI */
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem;
  height: 100%;
  min-height: 280px;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.1), rgba(255, 154, 117, 0.06));
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
  margin: 0 0 0.5rem;
}

html[data-theme="night"] .empty-title {
  color: var(--showroom-text-night, #f5f6f7);
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--ink-muted, #6b7280);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

/* Loading State Skeleton UI */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1.35rem 1.4rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.15rem;
  width: 100%;
  align-items: center;
}

.skeleton-chart {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
  height: 14px;
}

.skeleton-line.long {
  width: 100%;
  height: 24px;
}

.skeleton-line.medium {
  width: 80%;
  height: 14px;
}

.skeleton-button {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  margin-top: 0.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

html[data-theme="night"] .skeleton-chart,
html[data-theme="night"] .skeleton-line,
html[data-theme="night"] .skeleton-button {
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
}

@media (max-width: 1039px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .skeleton-content {
    width: 100%;
    align-items: center;
  }

  .skeleton-line.short,
  .skeleton-line.medium {
    width: 50%;
  }

  .skeleton-line.long {
    width: 70%;
  }
}

</style>

