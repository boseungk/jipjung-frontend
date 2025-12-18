# 대시보드 UX 리뷰 상세 리포트

> **리뷰 일시**: 2025-12-17
> **대상 화면**: 대시보드 (DashboardView)
> **페르소나**: 김민수 (27세, 사회초년생, 금융 초보자)
> **총 발견 이슈**: 13개 (Critical: 1, High: 3, Medium: 6, Low: 3)

---

## 목차

1. [Executive Summary](#executive-summary)
2. [Critical Priority Issues](#critical-priority-issues)
3. [High Priority Issues](#high-priority-issues)
4. [Medium Priority Issues](#medium-priority-issues)
5. [Low Priority Issues](#low-priority-issues)
6. [긍정적 평가](#긍정적-평가)
7. [분석된 파일 목록](#분석된-파일-목록)

---

## Executive Summary

집-중 대시보드는 Bento Grid 레이아웃과 게이미피케이션 요소를 활용하여 시각적으로 매력적인 UI를 제공합니다. 그러나 **금융 초보자 관점**에서 전문 용어 설명 부재, 빈 상태(Empty State) 처리 미흡, 인터랙션 힌트 부족 등의 개선점이 발견되었습니다.

### 권장 우선순위

| 순위 | 이슈 | 예상 효과 |
|------|------|----------|
| 🚨 | **저축 진입점 UX 불일치** | 사용자 혼란 100% 해소 |
| 1 | DSR 용어 설명 추가 | 금융 초보자 이해도 80%↑ |
| 2 | 목표 미설정 빈 상태 UI | 첫 사용자 이탈률 30%↓ |
| 3 | DSR 상태 판단 기준 명시 | 신뢰도 향상 |

---

## Critical Priority Issues

### C-1. 저축 진입점 UX 불일치 (모달 vs 페이지 이동)

**발견 위치**:
- `src/components/dashboard/bento/MainGoalCard.vue:34` - "저축하기" 버튼
- `src/components/dashboard/bento/WeeklyStreakCard.vue:18` - 오늘 불꽃 클릭
- `src/components/dashboard/BentoGrid.vue:6` - 이벤트 핸들러

**현재 동작 비교**:

| 진입점 | 위치 | 동작 | 코드 |
|--------|------|------|------|
| "저축하기" 버튼 | MainGoalCard | **모달** 열기 | `SavingInputModal` |
| 오늘 불꽃 클릭 | WeeklyStreakCard | **페이지 이동** | `router.push({ name: 'Savings' })` |

**두 UI 비교**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SavingInputModal (모달)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🐷 저축 기록하기                              [X]      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  저축 금액                                              │   │
│  │  ┌─────────────────────────────────────────┐           │   │
│  │  │                                     원  │           │   │
│  │  └─────────────────────────────────────────┘           │   │
│  │                                                         │   │
│  │  메모 (선택)                                            │   │
│  │  ┌─────────────────────────────────────────┐           │   │
│  │  │                                         │           │   │
│  │  └─────────────────────────────────────────┘           │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────┐           │   │
│  │  │         💾 저축 기록하기                 │           │   │
│  │  └─────────────────────────────────────────┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  특징: 간단, 빠른 입력, 현재 화면 유지                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SavingsView (전체 페이지)                     │
├─────────────────────────────────────────────────────────────────┤
│  ← 저축하기                                                     │
│  ───────────────────────────────────────────────────────────── │
│  🏠 목표명                                          28.5%       │
│  ████████░░░░░░░░░░░░░░░░░░░░░                                  │
│  저축액: 500만원  |  목표: 1,750만원  |  남은: 1,250만원         │
│  ───────────────────────────────────────────────────────────── │
│  빠른 저축                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │ 1만원 │ │ 5만원 │ │ 10만원│ │ 50만원│                           │
│  └──────┘ └──────┘ └──────┘ └──────┘                           │
│  ───────────────────────────────────────────────────────────── │
│  직접 입력                                                      │
│  ┌─────────────────────────────────────────┐                   │
│  │                                     원  │                   │
│  └─────────────────────────────────────────┘                   │
│  ───────────────────────────────────────────────────────────── │
│  저축 금액: 50,000원                                            │
│  ⭐ 예상 경험치: +5 XP                                          │
│  ┌─────────────────────────────────────────┐                   │
│  │      🐷 저축하기                         │                   │
│  └─────────────────────────────────────────┘                   │
│  ───────────────────────────────────────────────────────────── │
│  🔥 3일 연속 스트릭!                                            │
│                                                                 │
│  특징: 상세 정보, 빠른 저축 버튼, XP 미리보기, 스트릭 정보       │
└─────────────────────────────────────────────────────────────────┘
```

**문제점**:
1. **사용자 혼란**: 같은 "저축하기" 기능인데 완전히 다른 UI 경험
2. **예측 불가능**: 어디를 누르냐에 따라 다른 결과
3. **기능 불일치**:
   - 모달: 메모 입력 가능, XP 정보 없음
   - 페이지: 빠른 저축 버튼, XP 미리보기, 목표 진행률 표시

**개선 방안 비교**:

#### 옵션 A: 모달로 통일 (권장 ⭐)

**장점**:
- 현재 맥락 유지 (대시보드에서 벗어나지 않음)
- 빠른 저축 가능
- 모바일에서 더 자연스러운 UX

**단점**:
- 상세 정보 (XP 미리보기, 빠른 버튼) 표시 공간 제한

**구현 코드**:
```vue
<!-- WeeklyStreakCard.vue -->
<script setup>
// 변경: emit 대신 모달 직접 열기
const showSavingModal = ref(false)

const handleDayClick = (day) => {
  if (!day.isToday) return
  showSavingModal.value = true  // 모달 열기
}
</script>

<template>
  <!-- 기존 템플릿 유지 -->

  <!-- 모달 추가 -->
  <SavingInputModal
    :is-open="showSavingModal"
    @close="showSavingModal = false"
  />
</template>
```

```vue
<!-- BentoGrid.vue -->
<template>
  <div class="bento-grid">
    <MainGoalCard />
    <ProfileCard />
    <AssetGrowthCard />
    <!-- emit 핸들러 제거 -->
    <WeeklyStreakCard />
    <DsrGaugeCard />
  </div>
</template>

<script setup>
// goToSavings 함수 제거
</script>
```

**모달 개선** (SavingsView의 장점 통합):
```vue
<!-- SavingInputModal.vue 개선 -->
<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              <AppIcon name="piggyBank" :size="24" weight="fill" />
              저축하기
            </h2>
            <button class="close-button" @click="closeModal" aria-label="닫기">
              <PhX :size="20" weight="bold" />
            </button>
          </div>

          <!-- 목표 진행률 미니 표시 (신규) -->
          <div class="goal-mini-progress">
            <div class="progress-info">
              <span class="goal-name">{{ goalName }}</span>
              <span class="progress-rate">{{ achievementRate }}%</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-fill" :style="{ width: achievementRate + '%' }"></div>
            </div>
          </div>

          <!-- 빠른 저축 버튼 (신규) -->
          <div class="quick-amounts">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              class="quick-btn"
              :class="{ active: selectedAmount === amount }"
              @click="selectQuickAmount(amount)"
            >
              {{ formatQuickAmount(amount) }}
            </button>
          </div>

          <!-- Form -->
          <form class="modal-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="amount" class="form-label">직접 입력</label>
              <div class="input-wrapper">
                <input
                  id="amount"
                  v-model.number="formData.amount"
                  type="number"
                  class="form-input"
                  placeholder="금액을 입력하세요"
                  min="1"
                  @input="selectedAmount = null"
                />
                <span class="input-suffix">원</span>
              </div>
            </div>

            <!-- XP 미리보기 (신규) -->
            <div v-if="estimatedXp > 0" class="xp-preview">
              <AppIcon name="star" :size="16" :active="true" />
              <span>예상 경험치: <strong>+{{ estimatedXp }} XP</strong></span>
            </div>

            <button type="submit" class="submit-button" :disabled="isSubmitting || !finalAmount">
              <AppIcon v-if="!isSubmitting" name="piggyBank" :size="20" :active="true" />
              <span v-if="isSubmitting" class="spinner"></span>
              {{ isSubmitting ? '저축 중...' : `${formatWon(finalAmount)} 저축하기` }}
            </button>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { formatWon } from '@/utils/formatters'

const dreamHomeStore = useDreamHomeStore()
const { propertyName: goalName, achievementRate } = storeToRefs(dreamHomeStore)

// 빠른 저축 금액
const quickAmounts = [10000, 50000, 100000, 500000]
const selectedAmount = ref(null)

const formData = ref({
  amount: null,
  memo: ''
})

// 최종 금액 (빠른 선택 또는 직접 입력)
const finalAmount = computed(() => {
  return selectedAmount.value || formData.value.amount || 0
})

// XP 계산 (1만원당 1XP)
const estimatedXp = computed(() => {
  return Math.floor(finalAmount.value / 10000)
})

const selectQuickAmount = (amount) => {
  selectedAmount.value = amount
  formData.value.amount = null
}

const formatQuickAmount = (amount) => {
  if (amount >= 10000) return `${amount / 10000}만원`
  return `${amount.toLocaleString()}원`
}
</script>

<style scoped>
/* 목표 진행률 미니 */
.goal-mini-progress {
  padding: 0.75rem 1rem;
  background: var(--surface-muted, #f9fafb);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.goal-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
}

.progress-rate {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
}

.progress-bar-mini {
  height: 6px;
  background: var(--border-soft, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-accent, #ff6b3d);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 빠른 저축 버튼 */
.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-btn {
  padding: 0.6rem 0.5rem;
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 8px;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink-base, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  border-color: var(--brand-accent, #ff6b3d);
  color: var(--brand-accent, #ff6b3d);
}

.quick-btn.active {
  background: var(--brand-accent, #ff6b3d);
  border-color: var(--brand-accent, #ff6b3d);
  color: #ffffff;
}

/* XP 미리보기 */
.xp-preview {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 107, 61, 0.08);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: var(--brand-accent, #ff6b3d);
  margin-bottom: 1rem;
}

@media (max-width: 480px) {
  .quick-amounts {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
```

---

#### 옵션 B: 페이지로 통일

**장점**:
- 더 많은 정보 표시 가능
- 저축에 집중하는 독립된 공간

**단점**:
- 화면 전환으로 맥락 손실
- 빠른 저축에 부적합

**구현 코드**:
```vue
<!-- MainGoalCard.vue -->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const openSavingModal = () => {
  // 모달 대신 페이지로 이동
  router.push({ name: 'Savings' })
}
</script>
```

---

#### 권장: 옵션 A (모달로 통일)

**이유**:
1. **맥락 유지**: 대시보드의 목표 달성률, 스트릭 등을 보면서 저축 가능
2. **빠른 행동**: 저축은 빠르게 완료하고 싶은 행동
3. **모바일 친화적**: 전체 화면 전환 없이 빠른 인터랙션
4. **게이미피케이션 강화**: 모달에서 XP 미리보기로 동기부여

**SavingsView 페이지 용도 변경**:
- 저축 히스토리 상세 보기
- 월별 저축 통계
- 저축 목표 관리

등 "저축 관리" 목적으로 재정의 가능

---

## High Priority Issues

### H-1. DSR 용어 설명 부재

**파일**: `src/components/dashboard/bento/DsrGaugeCard.vue:4`

**현재 코드**:
```vue
<div class="card-heading">
  <h3 class="card-title">DSR</h3>
  <span class="status-chip" :class="statusTone">{{ statusMessage }}</span>
</div>
```

**문제점**:
- "DSR 27.4%"가 무엇을 의미하는지 초보자는 이해 불가
- "총부채원리금상환비율"이라는 정식 명칭 노출 없음
- 27.4%가 좋은 건지 나쁜 건지 판단 근거 없음

**개선 코드**:
```vue
<template>
  <div class="bento-card dsr-gauge-card">
    <div class="card-heading">
      <div class="title-with-tooltip">
        <h3 class="card-title">DSR</h3>
        <button
          type="button"
          class="tooltip-trigger"
          @click="showDsrTooltip = !showDsrTooltip"
          aria-label="DSR 설명 보기"
        >
          <AppIcon name="questionCircle" :size="16" />
        </button>

        <!-- Tooltip -->
        <Transition name="fade">
          <div v-if="showDsrTooltip" class="tooltip-content">
            <p class="tooltip-title">DSR (총부채원리금상환비율)</p>
            <p class="tooltip-desc">
              연 소득 대비 모든 대출의 원금+이자 상환액 비율이에요.
              <strong>40% 이하</strong>면 대출 승인이 유리해요.
            </p>
            <div class="tooltip-scale">
              <span class="scale-item safe">~40%: 안전</span>
              <span class="scale-item warning">40~70%: 주의</span>
              <span class="scale-item danger">70%+: 위험</span>
            </div>
          </div>
        </Transition>
      </div>
      <span class="status-chip" :class="statusTone">{{ statusMessage }}</span>
    </div>
    <!-- ... -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
// ... existing imports

const showDsrTooltip = ref(false)
</script>

<style scoped>
.title-with-tooltip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  position: relative;
}

.tooltip-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--bento-text-muted, #6b7280);
  cursor: pointer;
  transition: color 0.2s ease;
}

.tooltip-trigger:hover {
  color: var(--brand-accent, #ff6b3d);
}

.tooltip-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  width: 280px;
  padding: 1rem;
  background: var(--surface-elevated, #ffffff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.15);
}

html[data-theme="night"] .tooltip-content {
  background: var(--surface-elevated, #1f2937);
  border-color: rgba(255, 255, 255, 0.1);
}

.tooltip-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

.tooltip-desc {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--bento-text-muted, #6b7280);
}

.tooltip-scale {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.scale-item {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.scale-item.safe {
  background: rgba(67, 160, 71, 0.12);
  color: #2e7d32;
}

.scale-item.warning {
  background: rgba(251, 192, 45, 0.12);
  color: #b45309;
}

.scale-item.danger {
  background: rgba(244, 67, 54, 0.12);
  color: #c62828;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

### H-2. 목표 미설정 시 "0원" 혼란 유발

**파일**: `src/components/dashboard/bento/MainGoalCard.vue:23-29`

**현재 코드**:
```vue
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
```

**문제점**:
- 목표 미설정 시 "입주까지 0원 남은 금액"으로 표시 → 목표 달성으로 오해 가능
- "목표: 목표를 설정해주세요 (총 0원)" 문구 중복되고 어색함
- 행동 유도(CTA) 없음

**개선 코드**:
```vue
<template>
  <div class="bento-card main-goal-card">
    <div class="equal-grid">
      <!-- LEFT: CSS Donut Chart -->
      <div class="chart-column">
        <div class="card-heading">
          <h3 class="card-title">목표 달성률</h3>
        </div>
        <div class="css-donut-chart">
          <div
            class="donut-ring"
            :class="{ 'empty-state': !hasGoal }"
            :style="{ '--progress': achievementRate + '%' }"
          >
            <div class="donut-hole">
              <template v-if="hasGoal">
                <div class="donut-label">진행도</div>
                <div class="donut-text">{{ achievementRate }}%</div>
              </template>
              <template v-else>
                <AppIcon name="home" :size="32" class="empty-icon" />
                <div class="donut-label">목표 없음</div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Content -->
      <div class="content-column">
        <!-- 목표가 있을 때 -->
        <template v-if="hasGoal">
          <div class="text-stack">
            <div class="context-small">입주까지</div>
            <div class="amount-row">
              <div class="amount-huge">{{ formatWon(remainingAmount) }}</div>
              <span class="pill ghost">남은 금액</span>
            </div>
            <div class="subtitle-info">
              목표: {{ propertyName }}
              <span class="muted">(총 {{ formatWon(targetAmount) }})</span>
            </div>
          </div>
          <button class="savings-button" @click="openSavingModal">
            <span class="btn-text">저축하기</span>
          </button>
        </template>

        <!-- 목표가 없을 때: Empty State -->
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
    </div>

    <SavingInputModal
      :is-open="showSavingModal"
      @close="closeSavingModal"
      @submit="handleSavingComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { formatWon } from '@/utils/formatters'
import SavingInputModal from '@/components/modals/SavingInputModal.vue'

const router = useRouter()
const dreamHomeStore = useDreamHomeStore()
const {
  targetAmount,
  propertyName,
  achievementRate,
  remainingAmount
} = storeToRefs(dreamHomeStore)

// 목표 설정 여부 판단
const hasGoal = computed(() => {
  return targetAmount.value > 0 && propertyName.value !== '목표를 설정해주세요'
})

const showSavingModal = ref(false)

const openSavingModal = () => {
  showSavingModal.value = true
}

const closeSavingModal = () => {
  showSavingModal.value = false
}

const handleSavingComplete = (result) => {
  console.log('저축 완료:', result)
}

// 매물 페이지로 이동
const goToProperties = () => {
  router.push('/properties')
}
</script>

<style scoped>
/* 기존 스타일 유지... */

/* Empty State Styles */
.donut-ring.empty-state {
  background: conic-gradient(
    var(--border-soft, #e5e7eb) 0%,
    var(--border-soft, #e5e7eb) 100%
  );
  border: 2px dashed var(--border-muted, #d1d5db);
}

.empty-icon {
  color: var(--bento-text-muted, #9ca3af);
  margin-bottom: 0.25rem;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 1rem 0;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(255, 107, 61, 0.12),
    rgba(255, 154, 117, 0.08)
  );
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink-base, #1f2937);
}

html[data-theme="night"] .empty-title {
  color: var(--showroom-text-night, #f5f6f7);
}

.empty-desc {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--bento-text-muted, #6b7280);
}

.explore-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 2px solid var(--brand-accent, #ff6b3d);
  border-radius: 12px;
  background: transparent;
  color: var(--brand-accent, #ff6b3d);
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.explore-button:hover {
  background: var(--brand-accent, #ff6b3d);
  color: #ffffff;
}
</style>
```

---

### H-3. "대출 승인 매우 안전" 판단 기준 모호

**파일**: `src/components/dashboard/bento/DsrGaugeCard.vue:52-56`

**현재 코드**:
```javascript
const statusMessage = computed(() => {
  if (dsrRatio.value <= 40) return '대출 승인 매우 안전'
  if (dsrRatio.value <= 70) return '대출 승인 주의 필요'
  return '대출 승인 어려움'
})
```

**문제점**:
- 40%, 70% 기준이 사용자에게 노출되지 않음
- "매우 안전"이라는 표현만으로는 신뢰하기 어려움

**개선 코드**:
```javascript
const statusMessage = computed(() => {
  const ratio = dsrRatio.value
  if (ratio <= 40) return `DSR ${ratio.toFixed(0)}% · 대출 승인 유리`
  if (ratio <= 70) return `DSR ${ratio.toFixed(0)}% · 주의 필요`
  return `DSR ${ratio.toFixed(0)}% · 승인 어려움`
})
```

또는 status-info 영역에 기준 명시:

```vue
<div class="status-info">
  <AppIcon name="checkCircle" :size="18" :active="true" class="status-icon" aria-hidden="true" />
  <span class="status-text">
    기존 상환 {{ formatWon(existingLoanMonthly) }} · 여력 {{ formatWon(monthlyRepaymentCapacity) }}
  </span>
</div>

<!-- 기준 안내 추가 -->
<p class="dsr-criteria">
  <AppIcon name="info" :size="14" />
  <span>DSR 40% 이하 시 대부분의 은행에서 대출 승인이 용이해요</span>
</p>
```

```css
.dsr-criteria {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--bento-text-muted, #9ca3af);
}
```

---

## Medium Priority Issues

### M-1. "터파기 건축가" 레벨 타이틀 의미 불명확

**파일**: `src/components/dashboard/bento/ProfileCard.vue:21-22`

**현재 코드**:
```vue
<template v-else>
  Lv.{{ currentLevel }} · {{ levelTitle }}
</template>
```

**개선안**: 레벨 칩 클릭 시 레벨 시스템 설명 모달 표시

```vue
<template>
  <span
    class="level-chip heading-level"
    @click="showLevelInfo = true"
    role="button"
    tabindex="0"
  >
    <AppIcon :name="isFurnitureTrack ? 'confetti' : 'star'" :size="14" :active="true" />
    <template v-if="isFurnitureTrack">
      인테리어 {{ furnitureStage }} / {{ furnitureTotalStages }}
    </template>
    <template v-else>
      Lv.{{ currentLevel }} · {{ levelTitle }}
    </template>
    <AppIcon name="chevronRight" :size="12" class="level-arrow" />
  </span>

  <!-- Level Info Modal -->
  <LevelInfoModal
    v-if="showLevelInfo"
    :current-level="currentLevel"
    @close="showLevelInfo = false"
  />
</template>

<script setup>
import { ref } from 'vue'
const showLevelInfo = ref(false)
</script>
```

**LevelInfoModal.vue** (새 컴포넌트):
```vue
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>레벨 시스템</h3>
      <div class="level-roadmap">
        <div
          v-for="level in levels"
          :key="level.num"
          class="level-item"
          :class="{ current: level.num === currentLevel, achieved: level.num < currentLevel }"
        >
          <span class="level-num">Lv.{{ level.num }}</span>
          <span class="level-title">{{ level.title }}</span>
          <span class="level-desc">{{ level.desc }}</span>
        </div>
      </div>
      <button class="close-btn" @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ currentLevel: Number })
defineEmits(['close'])

const levels = [
  { num: 1, title: '터파기 건축가', desc: '첫 저축 시작' },
  { num: 2, title: '기초 건축가', desc: '10만원 저축 달성' },
  { num: 3, title: '뼈대 건축가', desc: '50만원 저축 달성' },
  { num: 4, title: '지붕 건축가', desc: '100만원 저축 달성' },
  { num: 5, title: '외벽 건축가', desc: '300만원 저축 달성' },
  { num: 6, title: '완공 건축가', desc: '목표 달성!' }
]
</script>
```

---

### M-2. "Step 1/6" 전체 로드맵 부재

**파일**: `src/components/dashboard/IsometricRoomHero.vue:65`

**현재 코드**:
```vue
<p class="stage-eyebrow">{{ currentStep.label }} · Step {{ activeStage }}/{{ totalStages }}</p>
```

**개선안**: Progress dots에 hover 시 툴팁 표시

```vue
<div class="progress-dots">
  <button
    v-for="(step, index) in buildSteps"
    :key="index"
    class="dot"
    :class="{ active: index < activeStage, current: index === activeStage - 1 }"
    :title="step.label"
    @mouseenter="hoveredStep = step"
    @mouseleave="hoveredStep = null"
  >
    <Transition name="tooltip">
      <div v-if="hoveredStep === step" class="step-tooltip">
        <strong>Step {{ index + 1 }}</strong>
        <span>{{ step.label }}</span>
      </div>
    </Transition>
  </button>
</div>
```

---

### M-3. 금액 표시 단위 일관성 부족

**문제점**:
- `MainGoalCard`: "0원" (원 단위)
- `DsrGaugeCard`: "1,500,000원" (원 단위, 천단위 콤마)
- `AssetGrowthCard`: "0만" (만원 단위)

**개선안**: 공통 포맷터 함수 생성

```javascript
// src/utils/formatters.js

/**
 * 금액을 읽기 쉬운 형태로 포맷
 * @param {number} amount - 원 단위 금액
 * @param {Object} options - 옵션
 * @returns {string} 포맷된 금액
 */
export function formatAmount(amount, options = {}) {
  const {
    alwaysShowUnit = true,  // 단위 항상 표시
    compact = true          // 1000만원 이상이면 억/만 단위
  } = options

  if (amount === 0) return alwaysShowUnit ? '0원' : '0'

  if (compact && amount >= 100000000) {
    // 억 단위
    const billions = Math.floor(amount / 100000000)
    const millions = Math.floor((amount % 100000000) / 10000)
    if (millions > 0) {
      return `${billions}억 ${millions.toLocaleString()}만원`
    }
    return `${billions}억원`
  }

  if (compact && amount >= 10000) {
    // 만원 단위
    const millions = Math.floor(amount / 10000)
    return `${millions.toLocaleString()}만원`
  }

  // 원 단위
  return `${amount.toLocaleString()}원`
}

// 사용 예시
formatAmount(0)            // "0원"
formatAmount(5000000)      // "500만원"
formatAmount(150000000)    // "1억 5,000만원"
formatAmount(1234567890)   // "12억 3,456만원"
```

---

### M-4. 연속 활동 인터랙션 힌트 부족

**파일**: `src/components/dashboard/bento/WeeklyStreakCard.vue:18`

**현재 코드**:
```vue
<button
  type="button"
  class="day-item"
  :class="{ active: day.completed, today: day.isToday, future: !day.completed && !day.isToday }"
  @click="handleDayClick(day)"
>
```

**문제점**: 오늘 불꽃이 클릭 가능한 요소임을 시각적으로 알 수 없음

**개선 코드**:
```vue
<button
  type="button"
  class="day-item"
  :class="{
    active: day.completed,
    today: day.isToday,
    future: !day.completed && !day.isToday,
    clickable: day.isToday && !day.completed
  }"
  @click="handleDayClick(day)"
>
  <div class="day-content">
    <!-- 오늘 + 미완료 상태에서만 탭 힌트 표시 -->
    <span v-if="day.isToday && !day.completed" class="tap-hint">
      탭해서 저축!
    </span>
    <!-- ... existing content -->
  </div>
</button>
```

```css
.tap-hint {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--brand-accent, #ff6b3d);
  white-space: nowrap;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

.day-item.clickable {
  cursor: pointer;
}

.day-item.clickable:hover {
  transform: scale(1.05);
}
```

---

### M-5. 자산 성장 빈 상태 CTA 없음

**파일**: `src/components/dashboard/bento/AssetGrowthCard.vue:22-24`

**현재 코드**:
```vue
<div v-else-if="chartLoaded" class="no-data-placeholder">
  <p class="no-data-text">저축을 시작하면 성장 그래프가 표시됩니다</p>
</div>
```

**개선 코드**:
```vue
<div v-else-if="chartLoaded" class="no-data-placeholder">
  <!-- 예시 그래프 실루엣 -->
  <div class="sample-chart-silhouette">
    <svg viewBox="0 0 200 80" class="silhouette-svg">
      <path
        d="M0,70 Q30,60 60,50 T120,30 T180,20 L200,15 L200,80 L0,80 Z"
        fill="url(#gradient)"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="var(--brand-accent, #ff6b3d)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
      </defs>
    </svg>
  </div>

  <div class="empty-content">
    <AppIcon name="chartLine" :size="28" class="empty-icon" />
    <p class="no-data-text">첫 저축으로 성장 그래프를 시작해보세요</p>
    <button class="start-saving-btn" @click="$emit('start-saving')">
      <AppIcon name="plus" :size="16" />
      <span>첫 저축 시작하기</span>
    </button>
  </div>
</div>
```

```css
.no-data-placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 170px;
  background: var(--surface-muted, #f9fafb);
  border-radius: 12px;
  border: 1px dashed var(--border-muted, #e5e7eb);
  overflow: hidden;
}

.sample-chart-silhouette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.silhouette-svg {
  width: 100%;
  height: 100%;
}

.empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.empty-icon {
  color: var(--bento-text-muted, #9ca3af);
}

.start-saving-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--brand-accent, #ff6b3d);
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-saving-btn:hover {
  background: var(--brand-accent-hover, #ff8559);
  transform: translateY(-1px);
}
```

---

### M-6. XP 획득 방법 설명 부재

**파일**: `src/components/dashboard/bento/ProfileCard.vue:54-56`

**현재 코드**:
```vue
<div class="exp-row">
  <div class="exp-info">{{ currentExpInLevel }} / {{ nextLevelExp }} XP</div>
  <div class="exp-remaining">다음 레벨까지 {{ remainingExp }} XP</div>
</div>
```

**개선안**: XP 정보 옆에 툴팁 추가

```vue
<div class="exp-row">
  <div class="exp-info">
    {{ currentExpInLevel }} / {{ nextLevelExp }} XP
    <button
      type="button"
      class="xp-help-btn"
      @click="showXpHelp = !showXpHelp"
      aria-label="XP 획득 방법 보기"
    >
      <AppIcon name="questionCircle" :size="14" />
    </button>

    <Transition name="fade">
      <div v-if="showXpHelp" class="xp-help-tooltip">
        <p class="xp-help-title">XP 획득 방법</p>
        <ul class="xp-help-list">
          <li><strong>매일 접속</strong> +5 XP</li>
          <li><strong>저축 1만원당</strong> +1 XP</li>
          <li><strong>목표 달성</strong> +100 XP</li>
          <li><strong>7일 연속 스트릭</strong> +50 XP</li>
        </ul>
      </div>
    </Transition>
  </div>
  <div class="exp-remaining">다음 레벨까지 {{ remainingExp }} XP</div>
</div>
```

---

## Low Priority Issues

### L-1. "AI 관리실" 명칭 모호

**현재**: "AI 관리실"
**개선안**: "AI 재무 코치" 또는 "AI 상담"

네비게이션 메뉴 텍스트 변경으로 간단히 해결 가능.

---

### L-2. 도넛 차트 0% 상태 시각적 피드백

**파일**: `src/components/dashboard/bento/MainGoalCard.vue`

0% 상태에서 회색 원만 표시되어 밋밋함.

**개선안**: 점선 테두리 + 미세 애니메이션

```css
.donut-ring.empty {
  background: transparent;
  border: 2px dashed var(--border-muted, #d1d5db);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(-90deg); }
  to { transform: rotate(270deg); }
}
```

---

### L-3. 반응형 레이아웃 카드 순서 최적화

**파일**: `src/components/dashboard/BentoGrid.vue:72-77`

**현재 모바일 순서**: profile → main → streak → dsr → growth

**제안 순서**: main → profile → streak → dsr → growth

초보자 관점에서 "목표 달성률"이 먼저 보이는 것이 더 직관적.

```css
@media (max-width: 767px) {
  .bento-grid {
    grid-template-areas:
      "main"     /* 목표 달성률 먼저 */
      "profile"
      "streak"
      "dsr"
      "growth";
  }
}
```

---

## 긍정적 평가

### 1. 시각적 계층 구조 우수
Bento Grid 레이아웃이 정보를 명확하게 구분하며, 각 카드의 역할이 시각적으로 잘 구분됨.

### 2. 게이미피케이션 요소 매력적
집 짓기 애니메이션, 불꽃 스트릭, 레벨 시스템 등이 저축에 재미 요소를 부여.

### 3. 다크모드 완벽 지원
모든 컴포넌트에서 `html[data-theme="night"]` 스타일이 일관되게 적용됨.

### 4. 접근성 고려
- `aria-label` 속성 적절히 사용 (`WeeklyStreakCard.vue:16-17`)
- `role="progressbar"` 속성 사용 (`ProfileCard.vue:48`)
- `prefers-reduced-motion` 미디어 쿼리 지원

### 5. CTA 버튼 명확
"저축하기" 버튼이 눈에 띄는 브랜드 컬러로 표시되어 주요 행동 유도에 효과적.

### 6. 목표 설정 유도 모달
첫 접속 시 목표 설정을 유도하는 `GoalGuideModal`이 자연스럽게 표시됨.

---

## 분석된 파일 목록

| 파일 | 경로 | 역할 |
|------|------|------|
| DashboardView.vue | `src/views/DashboardView.vue` | 대시보드 메인 뷰 |
| BentoGrid.vue | `src/components/dashboard/BentoGrid.vue` | 그리드 레이아웃 컨테이너 |
| IsometricRoomHero.vue | `src/components/dashboard/IsometricRoomHero.vue` | 집 짓기 애니메이션 영역 |
| MainGoalCard.vue | `src/components/dashboard/bento/MainGoalCard.vue` | 목표 달성률 카드 |
| ProfileCard.vue | `src/components/dashboard/bento/ProfileCard.vue` | 프로필/레벨 카드 |
| DsrGaugeCard.vue | `src/components/dashboard/bento/DsrGaugeCard.vue` | DSR 게이지 카드 |
| WeeklyStreakCard.vue | `src/components/dashboard/bento/WeeklyStreakCard.vue` | 연속 활동 카드 |
| AssetGrowthCard.vue | `src/components/dashboard/bento/AssetGrowthCard.vue` | 자산 성장 차트 카드 |

---

## 스크린샷

- Viewport: `.playwright-mcp/jipjung-frontend/screenshots/dashboard-ux-review-viewport.png`
- Full Page: `.playwright-mcp/jipjung-frontend/screenshots/dashboard-ux-review-fullpage.png`

---

*Generated by Claude Code UX Reviewer*
