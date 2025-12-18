# DSR 시뮬레이션 UX 개선 구현 계획

**문서 버전**: v1.1 (리뷰 반영)  
**작성일**: 2025-12-18  
**기반 문서**: [DSR_SIMULATION_UX_REVIEW.md](./DSR_SIMULATION_UX_REVIEW.md)  
**담당 컴포넌트**: `DsrSimulationView.vue`, `DsrGaugeCard.vue`, `dsrStore.js`

---

## 개요

DSR 시뮬레이션 화면의 UX 개선을 위한 상세 구현 계획입니다. 총 14개의 개선 사항을 3개의 Phase로 나누어 단계적으로 구현합니다.

### 우선순위 요약

| Phase | 범위 | 이슈 수 | 예상 소요 |
|-------|------|---------|----------|
| **Phase 1** | Critical Issues | 3개 | 3.5시간 |
| **Phase 2** | Major Issues | 5개 | 4.5시간 |
| **Phase 3** | Minor Issues | 6개 | 4시간 |
| **총계** | | 14개 | **12시간** |

---

## User Review Required

> [!IMPORTANT]  
> **Critical Issue #1 (게이지/등급 불일치)** 해결 방안 확정:
> - **선택**: Option A (프론트엔드 독립 처리) - 백엔드 의존성 제거
> - **추가 조치**: `DSR_THRESHOLDS` 상수 + `getDsrGrade()` 헬퍼 함수를 만들어 `dsrStore.js`, `DsrSimulationView.vue`, `DsrGaugeCard.vue`가 모두 동일한 기준을 공유하도록 구조화

> [!WARNING]  
> **CTA 버튼 (Issue #6)** 관련:
> - "매물 찾기" 기능: 이미 `/properties` 경로 존재, 활성화 가능
> - 라우터 경로 수정: `/settings/profile` → `/profile` (실제 경로)

> [!NOTE]
> **통화 포맷 정책**:
> - `formatCurrencyKorean(원 단위)`: 신규 추가 (원 단위 → 억/만 변환)
> - `formatKoreanCurrency(만원 단위)`: 기존 유지
> - **표준**: "₩1억 3,900만" 형태 (소수점 억 표기 지양)

---

## Phase 1: Critical Issues (즉시 수정)

### 1.1 게이지 색상과 등급 텍스트 불일치 해결

**문제**: DSR 27.4%에서 게이지는 초록색(안전)인데 뱃지는 "위험"으로 표시

**원인 분석**:
- `DsrGaugeCard.vue`는 자체 40/70 기준
- `dsrStore.js` fallback은 40/50 기준
- `DsrSimulationView.vue`는 40/70 기준
- 세 곳의 기준이 불일치하여 문제 재발 가능성 높음

**해결 전략**: 단일 소스 오브 트루스(Single Source of Truth) 구현

---

#### [NEW] [dsrGrade.js](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/constants/dsrGrade.js)

**DSR 등급 기준 상수 및 헬퍼 함수**

```javascript
/**
 * DSR 등급 기준 - 단일 소스 오브 트루스
 * 이 파일의 기준을 dsrStore, DsrSimulationView, DsrGaugeCard가 공유
 */

export const DSR_THRESHOLDS = {
  SAFE: 40,      // 40% 이하: 안전
  WARNING: 70    // 70% 이하: 주의, 초과: 위험
}

export const DSR_GRADES = {
  SAFE: {
    label: '안전',
    class: 'safe',
    color: '#43A047',
    description: '대출 승인에 유리해요'
  },
  WARNING: {
    label: '주의',
    class: 'warning',
    color: '#FBC02D',
    description: '추가 대출 시 신중하게 검토하세요'
  },
  DANGER: {
    label: '위험',
    class: 'danger',
    color: '#F44336',
    description: '대출 승인이 어려울 수 있어요'
  }
}

/**
 * DSR 비율에 따른 등급 반환
 * @param {number} ratio - DSR 비율 (0-100)
 * @returns {Object} { label, class, color, description }
 */
export function getDsrGrade(ratio) {
  if (ratio <= DSR_THRESHOLDS.SAFE) {
    return { ...DSR_GRADES.SAFE }
  }
  if (ratio <= DSR_THRESHOLDS.WARNING) {
    return { ...DSR_GRADES.WARNING }
  }
  return { ...DSR_GRADES.DANGER }
}

/**
 * DSR 비율에 따른 게이지 색상 반환
 * @param {number} ratio - DSR 비율 (0-100)
 * @returns {string} HEX 색상 코드
 */
export function getDsrGaugeColor(ratio) {
  return getDsrGrade(ratio).color
}
```

---

#### [MODIFY] [dsrStore.js](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/stores/dsrStore.js)

**변경 내용**: `dsrStatus` computed를 공통 헬퍼 사용으로 변경

```diff
+import { getDsrGrade } from '@/constants/dsrGrade'

 const dsrStatus = computed(() => {
-    if (backendDsr.value) {
-        const colorMap = {
-            'GREEN': '#66BB6A',
-            'YELLOW': '#FFA726',
-            'RED': '#EF5350',
-            'GRAY': '#9E9E9E'
-        }
-        return {
-            label: backendDsr.value.gradeLabel || '알 수 없음',
-            class: /* ... */,
-            color: colorMap[backendDsr.value.gradeColor] || '#9E9E9E'
-        }
-    }
-    const ratio = dsrRatio.value
-    if (ratio < 40) return { label: '안전', class: 'safe', color: '#66BB6A' }
-    if (ratio < 50) return { label: '주의', class: 'warning', color: '#FFA726' }
-    return { label: '위험', class: 'danger', color: '#EF5350' }
+    // 프론트엔드 통일 기준 사용 (DSR_THRESHOLDS 기반)
+    return getDsrGrade(dsrRatio.value)
 })
```

---

#### [MODIFY] [DsrGaugeCard.vue](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/components/dashboard/bento/DsrGaugeCard.vue)

**변경 내용**: 공통 헬퍼 사용

```diff
+import { getDsrGrade, getDsrGaugeColor, DSR_THRESHOLDS } from '@/constants/dsrGrade'

-const statusMessage = computed(() => {
-  if (dsrRatio.value <= 40) return '대출 승인 매우 안전'
-  if (dsrRatio.value <= 70) return '대출 승인 주의 필요'
-  return '대출 승인 어려움'
-})
+const dsrGradeInfo = computed(() => getDsrGrade(dsrRatio.value))
+const statusMessage = computed(() => dsrGradeInfo.value.description)

-const statusTone = computed(() => {
-  if (dsrRatio.value <= 40) return 'tone-safe'
-  if (dsrRatio.value <= 70) return 'tone-warning'
-  return 'tone-danger'
-})
+const statusTone = computed(() => `tone-${dsrGradeInfo.value.class}`)

-const gaugeColor = computed(() => {
-  if (dsrRatio.value <= 40) return '#43A047'
-  if (dsrRatio.value <= 70) return '#FBC02D'
-  return '#F44336'
-})
+const gaugeColor = computed(() => getDsrGaugeColor(dsrRatio.value))
```

---

#### [MODIFY] [DsrSimulationView.vue](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/views/DsrSimulationView.vue)

**변경 내용**: 공통 헬퍼 사용

```diff
+import { getDsrGrade, getDsrGaugeColor } from '@/constants/dsrGrade'

 const gaugeColor = computed(() => {
-  const ratio = dsrRatio.value
-  if (ratio <= 40) return '#43A047'
-  if (ratio <= 70) return '#FBC02D'
-  return '#F44336'
+  return getDsrGaugeColor(dsrRatio.value)
 })
```

---

### 1.2 금융 용어 설명 툴팁 컴포넌트 추가

**문제**: DSR, 스트레스 금리 등 초보자가 이해하기 어려운 용어에 설명 없음

**구현 참고**: `ThemeToggle.vue`의 CSS hover 기반 툴팁 패턴 참조

---

#### [NEW] [InfoTooltip.vue](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/components/common/InfoTooltip.vue)

**새 컴포넌트**: 접근성 강화된 용어 설명 툴팁

```vue
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
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  description: { type: String, required: true },
  id: { type: String, default: () => `tooltip-${Math.random().toString(36).slice(2, 9)}` }
})

const showTooltip = ref(false)
const tooltipRef = ref(null)

// 고유 ID 생성 (접근성용)
const triggerId = computed(() => `${props.id}-trigger`)
const tooltipId = computed(() => `${props.id}-content`)

function toggleTooltip() {
  showTooltip.value = !showTooltip.value
}

function closeTooltip() {
  showTooltip.value = false
}

// 외부 클릭 시 닫기 - 열릴 때만 이벤트 바인딩
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
}

.close-btn:hover {
  background: var(--surface-muted);
}

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
```

**접근성 개선 사항**:
- ✅ `aria-describedby`로 트리거 ↔ 툴팁 연결
- ✅ ESC 키로 닫기
- ✅ 키보드 Enter/Space로 토글
- ✅ 포커스 상태 시각적 표시 (`:focus-visible`)
- ✅ 인스턴스별 이벤트 리스너 최적화 (열릴 때만 바인딩)

---

#### [NEW] [financeTerms.js](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/constants/financeTerms.js)

**용어 정의 상수 파일**

```javascript
/**
 * 금융 용어 설명 상수
 * InfoTooltip 컴포넌트에서 사용
 */
export const FINANCE_TERMS = {
  DSR: '총부채원리금상환비율(Debt Service Ratio). 연소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. 40% 이하가 대출에 유리해요.',
  
  STRESS_RATE: '스트레스 금리는 미래 금리 인상 가능성을 반영한 추가 금리입니다. 대출 심사 시 실제 금리보다 높게 적용되어요.',
  
  FUTURE_INCOME_RATIO: '장래소득 배율은 청년층의 미래 소득 증가 가능성을 반영하는 가산 비율입니다. 만 34세 이하에게 적용돼요.',
  
  REGION: '수도권과 비수도권은 DSR 규제 기준이 다릅니다. 수도권이 더 엄격한 기준이 적용돼요.',
  
  LOAN_TYPE_FIXED: '대출 기간 동안 금리가 고정되어 이자 부담을 예측할 수 있어요. 금리 상승기에 유리합니다.',
  
  LOAN_TYPE_PERIODIC: '일정 주기(보통 5년)마다 금리가 재산정됩니다. 초기에는 고정금리보다 낮을 수 있어요.',
  
  LOAN_TYPE_MIXED: '초기 일정 기간은 고정금리, 이후에는 변동금리가 적용됩니다.',
  
  LOAN_TYPE_VARIABLE: '시장 금리에 따라 수시로 이자율이 변동합니다. 금리 하락기에 유리하지만 예측이 어려워요.',
  
  JEONSE_LOAN: '전세금 마련을 위한 대출입니다. 주택담보대출과 함께 DSR 계산에 포함돼요.',
  
  DSR_LIMIT: 'DSR 40%는 은행권 대출 기준입니다. 이를 초과하면 대출 승인이 어려울 수 있어요.'
}
```

---

### 1.3 모순된 안내 메시지 수정

**문제**: 1.4억원 대출 가능한데 "추가 대출이 어려워요" 메시지 표시

---

#### [MODIFY] [DsrSimulationView.vue](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/views/DsrSimulationView.vue)

**변경 내용**: 컨텍스트 인식 Tip 카드로 교체

**Script 추가** (simulationResult 기반 동적 메시지):
```javascript
// 대출 가능 여부에 따른 Tip 스타일
const tipCardClass = computed(() => {
  const maxLoan = lastSimulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return 'tip-positive'  // 1억 이상
  if (maxLoan >= 50000000) return 'tip-neutral'    // 5천만 이상
  return 'tip-warning'
})

// 상황에 맞는 아이콘
const tipIcon = computed(() => {
  const maxLoan = lastSimulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return 'checkCircle'
  if (maxLoan >= 50000000) return 'info'
  return 'warning'
})

// 상황에 맞는 제목
const tipTitle = computed(() => {
  const maxLoan = lastSimulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return '대출 가능!'
  if (maxLoan >= 50000000) return '대출 가능 (제한적)'
  return '대출 어려움'
})

// 상황에 맞는 상세 메시지
const contextualTip = computed(() => {
  const result = lastSimulationResult.value
  if (!result) return ''
  
  const maxLoan = result.maxLoanAmount || 0
  const dsrAfter = result.dsrAfterMaxLoanPercent || 0
  
  if (maxLoan >= 100000000) {
    return `최대 ${formatCurrency(maxLoan)}까지 대출 가능해요. DSR ${dsrAfter.toFixed(1)}%로 안정적인 수준입니다.`
  }
  if (maxLoan >= 50000000) {
    return `${formatCurrency(maxLoan)}까지 대출 가능하지만, 기존 대출을 줄이면 한도가 늘어날 수 있어요.`
  }
  return result.simulationTip || '기존 대출 상환을 우선 검토해보세요.'
})
```

---

## Phase 2: Major Issues (중요)

### 2.1 숫자 표기 가독성 개선

**문제**: `₩13,924.844만` 표기가 읽기 어려움

**정책 결정**:
| 함수명 | 입력 단위 | 출력 예시 | 용도 |
|--------|----------|----------|------|
| `formatWon(amount)` | **원** | "150,000,000원" | 정확한 원 단위 표시 |
| `formatKoreanCurrency(amount)` | **만원** | "1억 5,000만원" | 만원 단위 입력 시 사용 |
| `formatCurrencyKorean(amount)` | **원** | "₩1억 3,900만" | 원 단위 → 억/만 자동 변환 (신규) |

**반올림 규칙**: 만원 미만 반올림, 1억 3,925만 형태 (소수점 억 표기 지양)

---

#### [MODIFY] [formatters.js](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/utils/formatters.js)

**변경 내용**: `formatCurrencyKorean` 함수 추가

```javascript
/**
 * 원 단위 금액을 한국식 억/만 단위로 변환
 * @param {number} value - 원 단위 금액
 * @returns {string} 포맷된 문자열 (예: "₩1억 3,900만", "₩5,475만")
 * 
 * @example
 * formatCurrencyKorean(139248440) // "₩1억 3,925만"
 * formatCurrencyKorean(100000000) // "₩1억"
 * formatCurrencyKorean(54750000)  // "₩5,475만"
 * formatCurrencyKorean(690000)    // "₩69만"
 * 
 * @note 기존 formatKoreanCurrency(만원 단위)와 구분
 *       - formatKoreanCurrency: 만원 단위 입력 → "1억 5,000만원"
 *       - formatCurrencyKorean: 원 단위 입력 → "₩1억 3,900만"
 */
export const formatCurrencyKorean = (value) => {
  if (!value || value === 0) return '₩0'
  
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  // 1억 이상: 억 + 만 단위로 표시
  if (absValue >= 100000000) {
    const eok = Math.floor(absValue / 100000000)
    const remainingMan = Math.round((absValue % 100000000) / 10000)
    
    if (remainingMan === 0) {
      return `${sign}₩${eok.toLocaleString()}억`
    }
    // 1천만 이상: 만 단위도 표시
    return `${sign}₩${eok}억 ${remainingMan.toLocaleString()}만`
  }
  
  // 1억 미만: 만 단위로 표시
  const man = Math.round(absValue / 10000)
  return `${sign}₩${man.toLocaleString()}만`
}
```

---

### 2.2 대출 유형 설명 추가

**(기존 계획과 동일 - 생략)**

---

### 2.3 시뮬레이션 결과 후 CTA 버튼 추가

**수정**: 라우터 경로 수정 + Store action 사용

---

#### [MODIFY] [DsrSimulationView.vue](file:///c:/Users/gds05/OneDrive/바탕%20화면/jipjung/jipjung-frontend/src/views/DsrSimulationView.vue)

**Template 추가**:
```vue
<!-- Result Actions -->
<div v-if="lastSimulationResult" class="result-actions">
  <button
    v-if="lastSimulationResult.maxLoanAmount > 0"
    class="action-button primary"
    @click="goToProperties"
  >
    <AppIcon name="house" :size="20" />
    이 예산으로 매물 찾아보기
  </button>
  
  <button
    class="action-button secondary"
    @click="goToProfile"
  >
    <AppIcon name="pencil" :size="20" />
    소득/부채 정보 수정하기
  </button>
  
  <button
    class="action-button tertiary"
    @click="resetSimulation"
  >
    <AppIcon name="arrowCounterClockwise" :size="20" />
    다른 조건으로 다시 계산
  </button>
</div>
```

**Script 수정** (라우터 경로 + Store action):
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()

function goToProfile() {
  router.push('/profile')  // 수정: /settings/profile → /profile
}

function goToProperties() {
  router.push('/properties')  // 매물 검색 페이지
}

function resetSimulation() {
  // Store의 clearSimulationResult action 사용
  dsrStore.clearSimulationResult()
  // 필요 시 폼 초기화 로직 추가
}
```

---

### 2.4 입력값 유효성 검증 추가

**(기존 계획과 동일 - 생략)**

---

### 2.5 로딩 상태 피드백 개선

**(기존 계획과 동일 - 생략)**

---

## Phase 3: Minor Issues (개선 권장)

### 3.1 접근성(A11y) 개선

**(기존 계획과 동일)**

---

### 3.2 폼 상태 유지 (세션 스토리지)

**보완**: 데이터 저장 범위 및 정책 명시

**저장 정책**:
- **저장 대상**: 시뮬레이션 폼 필드만 (region, loanType, rate, maturity, jeonse 옵션)
- **저장 제외**: 사용자 소득/부채 정보 (보안상 제외, Store에서 관리)
- **만료**: 세션 종료 시 삭제 (sessionStorage 사용)
- **로그아웃 시**: 별도 클리어 로직 불필요 (세션 기반)

```javascript
const STORAGE_KEY = 'dsr-simulation-form'

// 저장할 필드만 선별 (민감 정보 제외)
const STORABLE_FIELDS = ['region', 'targetLoanType', 'targetLoanRate', 'maturityYears']

watch(formData, (newData) => {
  const toStore = {}
  STORABLE_FIELDS.forEach(key => {
    toStore[key] = newData[key]
  })
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}, { deep: true })

onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 저장된 필드만 복원
      STORABLE_FIELDS.forEach(key => {
        if (parsed[key] !== undefined) {
          formData[key] = parsed[key]
        }
      })
    } catch (e) {
      console.warn('Failed to restore form data')
    }
  }
})
```

---

### 3.3 결과 공유 기능

**(기존 계획과 동일)**

---

### 3.4 다크모드 대비 개선

**(기존 계획과 동일)**

---

### 3.5 슬라이더 입력 옵션

**(기존 계획과 동일 - 선택적)**

---

### 3.6 결과 히스토리 (추후 구현)

**(Phase 3 이후 별도 Sprint로 연기)**

---

## 추가 제안 사항

### 🌟 Enhanced UX 제안

#### 1. 실시간 미리보기 (Real-time Preview)

입력값 변경 시 **실시간으로 대략적인 결과를 미리보기**

**의존성 선택**:
- **Option A**: 자체 debounce 유틸 구현 (의존성 추가 없음) ✅ **권장**
- **Option B**: `lodash-es` 패키지 추가 (`npm install lodash-es`)

**자체 debounce 유틸** (권장):
```javascript
// src/utils/debounce.js
export function debounce(fn, delay = 300) {
  let timeoutId = null
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

---

## Verification Plan

### E2E 테스트 (Playwright)

> [!NOTE]
> 현재 프로젝트는 **Playwright만 설정**되어 있습니다 (Vitest 미설치).
> 단위 테스트는 추후 Vitest 도입 시 추가 예정.

**기존 테스트 파일 위치**: `tests/*.spec.js`

#### 신규 테스트: `tests/dsr-simulation.spec.js`

```javascript
import { test, expect } from '@playwright/test'

test.describe('DSR Simulation Page', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 후 DSR 시뮬레이션 페이지 이동
    await page.goto('/login')
    // ... 로그인 로직 (기존 auth.spec.js 참조)
    await page.goto('/dsr-simulation')
  })

  test('should display consistent status badge for safe DSR', async ({ page }) => {
    // 뱃지 텍스트와 클래스 일치 확인 (SVG 색상 대신 안정적인 단언)
    const badge = page.locator('.status-chip')
    
    // DSR이 40% 이하일 때 "안전" 표시
    await expect(badge).toContainText('안전')
    await expect(badge).toHaveClass(/tone-safe/)
  })

  test('should show validation error for rate > 15%', async ({ page }) => {
    // 금리 입력 필드에 비정상 값 입력
    await page.fill('input[placeholder="4.0"]', '20')
    await page.locator('body').click() // blur 트리거
    
    // 에러 힌트 표시 확인
    await expect(page.locator('.error-hint')).toBeVisible()
    await expect(page.locator('.error-hint')).toContainText('금리')
  })

  test('should show InfoTooltip on click', async ({ page }) => {
    // 툴팁 트리거 클릭
    await page.click('.info-trigger')
    
    // 툴팁 콘텐츠 표시 확인
    await expect(page.locator('.tooltip-content')).toBeVisible()
    
    // ESC로 닫기
    await page.keyboard.press('Escape')
    await expect(page.locator('.tooltip-content')).not.toBeVisible()
  })

  test('should navigate to profile on CTA click', async ({ page }) => {
    // 시뮬레이션 실행 후 CTA 버튼 클릭
    await page.click('button:has-text("시뮬레이션 실행")')
    await page.waitForSelector('.result-actions')
    
    await page.click('button:has-text("소득/부채 정보 수정")')
    await expect(page).toHaveURL('/profile')
  })
})
```

**실행 명령어**:
```bash
npx playwright test tests/dsr-simulation.spec.js --headed
```

---

### Manual Verification Checklist

사용자가 직접 수행할 수동 테스트:

#### Phase 1 검증
- [ ] DSR 40% 이하: 게이지 초록색 + 뱃지 "안전" 일치
- [ ] DSR 41-70%: 게이지 노랑색 + 뱃지 "주의" 일치  
- [ ] DSR 70% 초과: 게이지 빨강색 + 뱃지 "위험" 일치
- [ ] InfoTooltip: 클릭 시 설명 표시, ESC로 닫기, 키보드 접근 가능
- [ ] Tip 카드: 대출 1억 이상 시 "대출 가능!" 메시지

#### Phase 2 검증
- [ ] 139,248,440원 → "₩1억 3,925만" 표시
- [ ] 대출 유형에 설명 + "추천" 뱃지 표시
- [ ] CTA "소득/부채 수정" 클릭 → `/profile` 이동
- [ ] CTA "매물 찾아보기" 클릭 → `/properties` 이동
- [ ] 금리 20% 입력 시 에러 메시지 표시
- [ ] 제출 버튼 유효성 에러 시 비활성화

---

## 파일 변경 요약

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/constants/dsrGrade.js` | **NEW** | DSR 등급 기준 상수 및 헬퍼 함수 |
| `src/constants/financeTerms.js` | **NEW** | 금융 용어 정의 |
| `src/components/common/InfoTooltip.vue` | **NEW** | 접근성 강화 툴팁 컴포넌트 |
| `src/utils/formatters.js` | MODIFY | `formatCurrencyKorean` 함수 추가 |
| `src/utils/debounce.js` | **NEW** (선택) | 자체 debounce 유틸 |
| `src/stores/dsrStore.js` | MODIFY | 공통 `getDsrGrade` 사용 |
| `src/components/dashboard/bento/DsrGaugeCard.vue` | MODIFY | 공통 헬퍼 사용 |
| `src/views/DsrSimulationView.vue` | MODIFY | 전체 개선사항 적용 |
| `tests/dsr-simulation.spec.js` | **NEW** | Playwright E2E 테스트 |

---

## 일정 (예상)

| Phase | 작업 내용 | 예상 소요 |
|-------|----------|----------|
| Phase 1 | Critical 이슈 3개 (dsrGrade.js 포함) | 1일 (4시간) |
| Phase 2 | Major 이슈 5개 | 1.5일 (6시간) |
| Phase 3 | Minor 이슈 6개 (선택적) | 1일 (4시간) |
| QA & Testing | Playwright E2E + 수동 테스트 | 0.5일 |
| **총 예상** | | **4일** |

---

*이 문서는 DSR_SIMULATION_UX_REVIEW.md 기반으로 생성되었으며, v1.1에서 리뷰 피드백을 반영하여 보완되었습니다.*
