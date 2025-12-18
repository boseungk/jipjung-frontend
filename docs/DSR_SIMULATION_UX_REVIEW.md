# DSR 시뮬레이션 화면 UX 리뷰 리포트

**리뷰 일자**: 2025-12-17
**리뷰어**: UX Review Agent
**대상 파일**: `src/views/DsrSimulationView.vue`, `src/components/dashboard/bento/DsrGaugeCard.vue`

---

## 요약

| 구분 | 개수 |
|------|------|
| 🚨 Critical (즉시 수정) | 3 |
| ⚠️ Major (중요) | 5 |
| 💡 Minor (개선 권장) | 6 |
| **총계** | **14** |

---

## 🚨 Critical Issues (즉시 수정 필요)

### 1. 게이지 색상과 등급 텍스트 불일치

**현상**: DSR 27.4%로 게이지는 초록색(안전)인데, 상태 뱃지는 "위험"으로 표시

**스크린샷 증거**:
- 게이지: 초록색 (#43A047) - 27.4%
- 뱃지: 빨간색 "위험"

**원인 분석** (`DsrSimulationView.vue:288-293`):
```javascript
// 게이지 색상 로직 - 올바름
const gaugeColor = computed(() => {
  const ratio = dsrRatio.value
  if (ratio <= 40) return '#43A047'  // 초록
  if (ratio <= 70) return '#FBC02D'  // 노랑
  return '#F44336'                    // 빨강
})
```

**문제**: `dsrStatus`가 백엔드에서 오는 값을 그대로 사용하는데, 백엔드 로직과 프론트엔드 게이지 색상 로직이 불일치

**해결 방안** (`dsrStore.js:64-86`):
```javascript
// AS-IS: 백엔드 gradeLabel을 그대로 사용
const dsrStatus = computed(() => {
  if (backendDsr.value) {
    return {
      label: backendDsr.value.gradeLabel || '알 수 없음',
      // ...
    }
  }
})

// TO-BE: 프론트엔드 게이지 색상과 동일한 기준 적용
const dsrStatus = computed(() => {
  const ratio = dsrRatio.value

  // 프론트엔드 통일 기준
  if (ratio <= 40) {
    return { label: '안전', class: 'safe', color: '#43A047' }
  }
  if (ratio <= 70) {
    return { label: '주의', class: 'warning', color: '#FBC02D' }
  }
  return { label: '위험', class: 'danger', color: '#F44336' }
})
```

---

### 2. 금융 전문 용어 설명 전무

**현상**: DSR, LTV, 스트레스 금리, 장래소득 배율 등 초보자가 이해하기 어려운 용어에 설명이 없음

**영향받는 사용자**: 금융 초보자 (타겟 사용자 대부분)

**해결 방안**: 툴팁 컴포넌트 추가

```vue
<!-- 새 컴포넌트: src/components/common/InfoTooltip.vue -->
<template>
  <span class="info-tooltip-wrapper">
    <slot />
    <button
      type="button"
      class="info-trigger"
      @click="showTooltip = !showTooltip"
      :aria-expanded="showTooltip"
      aria-label="설명 보기"
    >
      <AppIcon name="question" :size="14" />
    </button>
    <Transition name="tooltip-fade">
      <div v-if="showTooltip" class="tooltip-content" role="tooltip">
        {{ description }}
        <button class="close-btn" @click="showTooltip = false">
          <AppIcon name="x" :size="12" />
        </button>
      </div>
    </Transition>
  </span>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  description: { type: String, required: true }
})

const showTooltip = ref(false)
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

.info-trigger:hover {
  background: var(--brand-accent-soft, #ffe4d9);
  color: var(--brand-accent, #ff6b3d);
  transform: scale(1.1);
}

.tooltip-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 200px;
  max-width: 280px;
  padding: 0.75rem 1rem;
  background: var(--surface-card-bg, #fff);
  border: 1px solid var(--border-soft, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--ink-base, #1f2937);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
```

**적용 예시** (`DsrSimulationView.vue`):
```vue
<h1 class="view-title">
  <InfoTooltip description="총부채원리금상환비율. 연소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. 낮을수록 대출 여력이 높습니다.">
    DSR 시뮬레이션
  </InfoTooltip>
</h1>
```

**추가할 용어 설명**:
| 용어 | 설명 |
|------|------|
| DSR | 총부채원리금상환비율. 연소득 대비 모든 대출 상환액 비율 (40% 이하 권장) |
| 스트레스 금리 | 금리 인상 시나리오를 반영한 추가 금리. 대출 심사 시 적용 |
| 장래소득 배율 | 청년층의 미래 소득 증가를 반영하는 가산 비율 |
| 수도권/비수도권 | 지역별로 다른 DSR 규제 기준 적용 |

---

### 3. 모순된 안내 메시지

**현상**:
- 최대 대출 가능액: ₩13,924.844만 (약 1.4억원)
- 팁 메시지: "현재 조건으로는 추가 대출이 어려워요"

**문제**: 1.4억원 대출이 가능한데 "어렵다"는 메시지는 사용자를 혼란스럽게 함

**원인**: 백엔드 `simulationTip` 로직이 DSR 40% 기준으로 메시지를 생성하지만, 실제로는 대출 가능

**해결 방안** (`DsrSimulationView.vue:209-212`):
```vue
<!-- AS-IS -->
<div v-if="simulationResult.simulationTip" class="tip-card">
  <AppIcon name="lightbulb" :size="20" weight="fill" class="tip-icon" />
  <span>{{ simulationResult.simulationTip }}</span>
</div>

<!-- TO-BE: 조건부 스타일 + 컨텍스트 인식 메시지 -->
<div
  v-if="simulationResult"
  class="tip-card"
  :class="tipCardClass"
>
  <AppIcon :name="tipIcon" :size="20" weight="fill" class="tip-icon" />
  <div class="tip-content">
    <strong>{{ tipTitle }}</strong>
    <p>{{ contextualTip }}</p>
  </div>
</div>
```

```javascript
// 스크립트 추가
const tipCardClass = computed(() => {
  const maxLoan = simulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return 'tip-positive'  // 1억 이상
  if (maxLoan >= 50000000) return 'tip-neutral'    // 5천만 이상
  return 'tip-warning'
})

const tipIcon = computed(() => {
  const maxLoan = simulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return 'checkCircle'
  if (maxLoan >= 50000000) return 'info'
  return 'warning'
})

const tipTitle = computed(() => {
  const maxLoan = simulationResult.value?.maxLoanAmount || 0
  if (maxLoan >= 100000000) return '대출 가능!'
  if (maxLoan >= 50000000) return '대출 가능 (제한적)'
  return '대출 어려움'
})

const contextualTip = computed(() => {
  const result = simulationResult.value
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

## ⚠️ Major Issues (중요)

### 4. 숫자 표기 가독성 문제

**현상**: `₩13,924.844만` - 읽기 어렵고 혼란스러움

**문제점**:
- 소수점이 포함된 "만" 단위는 직관적이지 않음
- 1.4억인지 139억인지 즉시 파악 어려움

**해결 방안** (`DsrSimulationView.vue:319-322`):
```javascript
// AS-IS
function formatCurrency(value) {
  if (!value) return '₩0'
  return '₩' + (value / 10000).toLocaleString() + '만'
}

// TO-BE: 억/만 단위 자동 변환
function formatCurrency(value) {
  if (!value || value === 0) return '₩0'

  const absValue = Math.abs(value)

  // 1억 이상: 억 단위로 표시
  if (absValue >= 100000000) {
    const eok = absValue / 100000000
    const man = (absValue % 100000000) / 10000

    if (man === 0) {
      return `₩${eok.toLocaleString()}억`
    }
    if (man >= 1000) {
      return `₩${eok.toLocaleString()}억 ${Math.round(man / 1000) * 1000}만`
    }
    return `₩${eok.toFixed(1)}억`
  }

  // 1억 미만: 만 단위로 표시
  const man = Math.round(absValue / 10000)
  return `₩${man.toLocaleString()}만`
}

// 사용 예시:
// 139248440 → "₩1.4억" 또는 "₩1억 3,900만"
// 54750000 → "₩5,475만"
// 690000 → "₩69만"
```

---

### 5. 대출 유형 설명 부재

**현상**: "고정", "주기형", "혼합", "변동" 옵션에 설명이 없음

**해결 방안** (`DsrSimulationView.vue:264-269`):
```javascript
// AS-IS
const loanTypes = [
  { value: 'FIXED', label: '고정' },
  { value: 'PERIODIC', label: '주기형' },
  { value: 'MIXED', label: '혼합' },
  { value: 'VARIABLE', label: '변동' }
]

// TO-BE: 설명 추가
const loanTypes = [
  {
    value: 'FIXED',
    label: '고정',
    description: '대출 기간 동안 금리가 변하지 않아요',
    recommended: true
  },
  {
    value: 'PERIODIC',
    label: '주기형',
    description: '일정 주기(5년 등)마다 금리가 조정돼요'
  },
  {
    value: 'MIXED',
    label: '혼합',
    description: '초기 고정 후 변동금리로 전환돼요'
  },
  {
    value: 'VARIABLE',
    label: '변동',
    description: '시장 금리에 따라 수시로 변해요'
  }
]
```

```vue
<!-- 템플릿 수정 -->
<div class="form-group">
  <label class="form-label">
    대출 유형
    <InfoTooltip description="금리 변동 방식에 따른 분류입니다. 고정금리가 안정적이지만, 초기 금리는 변동보다 높을 수 있어요." />
  </label>
  <div class="radio-group loan-type">
    <label
      v-for="type in loanTypes"
      :key="type.value"
      class="radio-option"
      :class="{ selected: formData.targetLoanType === type.value }"
    >
      <input type="radio" v-model="formData.targetLoanType" :value="type.value" />
      <span class="radio-text">
        {{ type.label }}
        <span v-if="type.recommended" class="recommended-badge">추천</span>
      </span>
      <span class="radio-description">{{ type.description }}</span>
    </label>
  </div>
</div>
```

---

### 6. 시뮬레이션 결과 후 다음 단계 CTA 부재

**현상**: 결과만 보여주고 끝. 사용자가 무엇을 해야 할지 안내 없음

**해결 방안**: 결과 섹션 하단에 CTA 버튼 추가

```vue
<!-- DsrSimulationView.vue 결과 섹션 하단에 추가 -->
<div v-if="simulationResult" class="result-actions">
  <button
    v-if="simulationResult.maxLoanAmount > 0"
    class="action-button primary"
    @click="goToPropertySearch"
  >
    <AppIcon name="house" :size="20" />
    이 예산으로 매물 찾아보기
  </button>

  <button
    class="action-button secondary"
    @click="adjustIncome"
  >
    <AppIcon name="pencil" :size="20" />
    소득/부채 정보 수정하기
  </button>

  <button
    class="action-button tertiary"
    @click="saveResult"
  >
    <AppIcon name="bookmarkSimple" :size="20" />
    결과 저장하기
  </button>
</div>
```

```css
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--dsr-subcard-border);
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent-soft));
  color: white;
  border: none;
  box-shadow: 0 8px 20px -12px rgba(255, 107, 61, 0.5);
}

.action-button.secondary {
  background: var(--surface-muted);
  color: var(--ink-base);
  border: 1px solid var(--border-soft);
}

.action-button.tertiary {
  background: transparent;
  color: var(--ink-muted);
  border: 1px dashed var(--border-soft);
}
```

---

### 7. 입력값 유효성 검증 부재

**현상**: 금리 100%, 만기 100년 등 비현실적 값 입력 가능

**해결 방안**:
```vue
<!-- 템플릿 수정 -->
<div class="form-group">
  <label class="form-label">예상 대출 금리 (%)</label>
  <div class="input-row">
    <input
      type="number"
      v-model.number="formData.targetLoanRate"
      class="form-input"
      :class="{ 'input-error': rateError }"
      step="0.1"
      min="1"
      max="15"
      placeholder="4.0"
      @blur="validateRate"
    />
    <span class="input-suffix">%</span>
  </div>
  <span v-if="rateError" class="error-hint">{{ rateError }}</span>
  <span v-else class="input-hint">일반적으로 3~7% 범위입니다</span>
</div>
```

```javascript
// 스크립트 추가
const rateError = ref('')
const maturityError = ref('')

function validateRate() {
  const rate = formData.targetLoanRate
  if (rate < 1) {
    rateError.value = '금리는 1% 이상이어야 해요'
  } else if (rate > 15) {
    rateError.value = '금리가 너무 높아요. 15% 이하로 입력해주세요'
  } else {
    rateError.value = ''
  }
}

function validateMaturity() {
  const years = formData.maturityYears
  if (years < 1) {
    maturityError.value = '대출 기간은 최소 1년이에요'
  } else if (years > 50) {
    maturityError.value = '대출 기간은 최대 50년이에요'
  } else {
    maturityError.value = ''
  }
}
```

```css
.input-error {
  border-color: var(--dsr-danger-fg) !important;
}

.error-hint {
  font-size: 0.75rem;
  color: var(--dsr-danger-fg);
  margin-top: 0.25rem;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--dsr-ink-muted);
  margin-top: 0.25rem;
}
```

---

### 8. 로딩 상태 피드백 부족

**현상**: "실행 중..." 텍스트만 표시. 진행 상황이나 예상 시간 없음

**해결 방안**:
```vue
<!-- 향상된 로딩 상태 -->
<button
  type="submit"
  class="submit-button"
  :disabled="isSimulating || hasValidationErrors"
>
  <template v-if="isSimulating">
    <div class="loading-indicator">
      <div class="loading-spinner"></div>
      <div class="loading-text">
        <span class="loading-title">분석 중...</span>
        <span class="loading-subtitle">2026년 정책 기준으로 계산하고 있어요</span>
      </div>
    </div>
  </template>
  <span v-else>시뮬레이션 실행</span>
</button>
```

```css
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
}

.loading-title {
  font-weight: 700;
  font-size: 0.9375rem;
}

.loading-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
}
```

---

## 💡 Minor Issues (개선 권장)

### 9. 접근성(A11y) 개선

```vue
<!-- 스크린 리더 지원 추가 -->
<section
  class="section simulation-result"
  aria-live="polite"
  aria-label="시뮬레이션 결과"
>
  <!-- 시각적으로 숨겨진 결과 요약 -->
  <div class="sr-only">
    최대 대출 가능액 {{ formatCurrency(simulationResult.maxLoanAmount) }},
    현재 DSR {{ simulationResult.currentDsrPercent }}퍼센트,
    등급 {{ getGradeLabel(simulationResult.userGrade) }}
  </div>
  <!-- 기존 UI -->
</section>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

### 10. 폼 상태 유지 (세션 스토리지)

```javascript
// 페이지 이탈 시 폼 데이터 저장
import { watch, onMounted } from 'vue'

const STORAGE_KEY = 'dsr-simulation-form'

// 폼 데이터 변경 시 저장
watch(formData, (newData) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
}, { deep: true })

// 페이지 로드 시 복원
onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(formData, parsed)
    } catch (e) {
      console.warn('Failed to restore form data:', e)
    }
  }
})
```

---

### 11. 결과 공유 기능

```vue
<button class="share-button" @click="shareResult">
  <AppIcon name="share" :size="18" />
  결과 공유하기
</button>
```

```javascript
async function shareResult() {
  const result = simulationResult.value
  if (!result) return

  const shareData = {
    title: '집-중 DSR 시뮬레이션 결과',
    text: `최대 대출 가능액: ${formatCurrency(result.maxLoanAmount)}\nDSR: ${result.currentDsrPercent}%`,
    url: window.location.href
  }

  if (navigator.share) {
    await navigator.share(shareData)
  } else {
    await navigator.clipboard.writeText(shareData.text)
    // 토스트 알림: "클립보드에 복사되었어요"
  }
}
```

---

### 12. 다크모드 대비 개선

현재 다크모드에서 일부 텍스트 대비가 부족합니다.

```css
/* 개선된 다크모드 스타일 */
html[data-theme="night"] .result-card.highlight {
  background: linear-gradient(
    135deg,
    var(--brand-accent, #ff6b3d),
    var(--brand-accent-light, #ff9a75)
  );
  /* 텍스트 가독성을 위한 그림자 추가 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

html[data-theme="night"] .policy-detail,
html[data-theme="night"] .update-detail {
  color: var(--dsr-ink);  /* 더 밝은 색상 사용 */
}

html[data-theme="night"] .tip-card {
  background: rgba(251, 192, 45, 0.12);
  border-color: rgba(251, 192, 45, 0.2);
}
```

---

### 13. 슬라이더 입력 옵션

금리와 만기 입력에 슬라이더 추가로 직관성 향상:

```vue
<div class="form-group">
  <label class="form-label">예상 대출 금리 (%)</label>
  <div class="slider-input-group">
    <input
      type="range"
      v-model.number="formData.targetLoanRate"
      class="form-slider"
      min="1"
      max="10"
      step="0.1"
    />
    <div class="input-row compact">
      <input
        type="number"
        v-model.number="formData.targetLoanRate"
        class="form-input small"
        step="0.1"
        min="1"
        max="10"
      />
      <span class="input-suffix">%</span>
    </div>
  </div>
  <div class="slider-labels">
    <span>1%</span>
    <span>10%</span>
  </div>
</div>
```

---

### 14. 결과 히스토리

여러 시뮬레이션 결과를 비교할 수 있도록:

```javascript
// dsrStore.js에 추가
const simulationHistory = ref([])
const MAX_HISTORY = 5

async function runSimulation(request) {
  // ... 기존 로직

  // 히스토리에 추가
  if (result) {
    simulationHistory.value.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      request: { ...request },
      result: { ...result }
    })

    // 최대 개수 유지
    if (simulationHistory.value.length > MAX_HISTORY) {
      simulationHistory.value.pop()
    }
  }

  return result
}
```

---

## 구현 우선순위

| 순위 | 이슈 | 예상 작업량 | 영향도 |
|------|------|-------------|--------|
| 1 | 게이지/등급 불일치 수정 | 30분 | 🔴 Critical |
| 2 | 용어 툴팁 추가 | 2시간 | 🔴 Critical |
| 3 | 모순된 메시지 수정 | 1시간 | 🔴 Critical |
| 4 | 숫자 표기 개선 | 30분 | 🟠 Major |
| 5 | 대출 유형 설명 | 1시간 | 🟠 Major |
| 6 | 결과 후 CTA 추가 | 1시간 | 🟠 Major |
| 7 | 입력값 유효성 검증 | 1시간 | 🟠 Major |
| 8 | 로딩 상태 개선 | 30분 | 🟠 Major |

---

## 결론

DSR 시뮬레이션 화면의 핵심 기능은 잘 구현되어 있으나, **초보자 관점에서 이해하기 어려운 부분**이 많습니다. 특히:

1. **시각적 일관성** 부족 (게이지 색상 vs 등급 텍스트)
2. **금융 용어 설명** 부재
3. **다음 행동 유도(CTA)** 부족

위 3가지를 우선 해결하면 사용자 경험이 크게 개선될 것입니다.

---

*이 리포트는 UX Review Agent에 의해 자동 생성되었습니다.*
