<template>
  <div class="bento-card main-goal-card">
    <!-- 목표가 있을 때: 정상 UI -->
    <template v-if="hasGoal">
      <!-- TRUE 1:1 Grid: Donut Chart | Text + Button -->
      <div class="equal-grid">
        <!-- LEFT: CSS Donut Chart -->
        <div class="chart-column">
          <div class="card-heading">
            <h3 class="card-title">목표 달성률</h3>
          </div>
          <div class="css-donut-chart">
            <div 
              class="donut-ring" 
              :class="{ 'is-zero': isZeroProgress }"
              :style="{ '--progress': achievementRateNumber + '%' }"
            >
              <div class="donut-hole">
                <template v-if="isZeroProgress">
                  <!-- L-2: 0% 상태 피드백 -->
                  <AppIcon name="sparkles" :size="20" class="zero-icon" />
                  <div class="donut-text zero-text">첫 저축을<br>시작해보세요!</div>
                </template>
                <template v-else>
                  <div class="donut-label">진행도</div>
                  <div class="donut-text">{{ achievementRate }}%</div>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- RIGHT: Text + Button (Vertical Stack) -->
        <div class="content-column">
          <div class="text-stack">
            <div class="context-small">입주까지</div>
            <div class="amount-row">
              <div class="amount-huge">{{ formatWon(remainingAmount) }}</div>
              <span class="pill ghost">남은 금액</span>
            </div>
            <div class="subtitle-info">
              목표: {{ propertyName }} <span class="muted">(총 {{ formatWon(targetAmount) }})</span>
            </div>
          </div>
          
          <!-- Full-Width Button -->
          <button class="savings-button" @click="handleSavingClick">
            <span class="btn-text">저축하기</span>
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
        <button class="explore-button" @click="goToProperties">
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
import { formatWon } from '@/utils/formatters'
import AppIcon from '@/components/common/AppIcon.vue'

const emit = defineEmits(['open-saving-modal'])
const router = useRouter()

const dreamHomeStore = useDreamHomeStore()
const authStore = useAuthStore()
const {
  dreamHomeId,
  targetAmount,
  propertyName,
  achievementRate,
  remainingAmount
} = storeToRefs(dreamHomeStore)
const { hasDreamHomeGoal } = storeToRefs(authStore)

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

const isZeroProgress = computed(() => achievementRateNumber.value <= 0)

/**
 * 저축하기 버튼 클릭 핸들러
 * 부모 컴포넌트(BentoGrid)에 모달 열기 요청
 */
const handleSavingClick = () => {
  emit('open-saving-modal')
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
  gap: 1.5rem;
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

/* CSS Donut Chart */
.css-donut-chart {
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
}

.donut-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--brand-accent, #ff6b3d) 0%,
    var(--brand-accent, #ff6b3d) var(--progress, 28%),
    #e5e7eb var(--progress, 28%),
    #e5e7eb 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform: rotate(-90deg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.donut-ring:hover {
  background: conic-gradient(
    #ff8559 0%,
    #ff8559 var(--progress, 28%),
    #e5e7eb var(--progress, 28%),
    #e5e7eb 100%
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
  background: rgba(32, 36, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.08);
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
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
  gap: 1.25rem;
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
  font-size: 2.15rem;
  font-weight: 800;
  color: var(--ink-base, #1f2937);
  letter-spacing: -0.03em;
  line-height: 1;
  margin: 0.4rem 0;
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
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  margin-top: 0.5rem;
}

html[data-theme="night"] .subtitle-info {
  color: var(--showroom-text-night, #F5EDE3);
}

.muted {
  font-weight: 400;
  color: var(--bento-text-muted, #6b7280);
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

</style>
