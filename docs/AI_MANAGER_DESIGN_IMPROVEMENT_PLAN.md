# AI 관리실 디자인 개선 계획 (v2)

## 개요

**목표**: AI 관리실(AiManagerView)의 디자인을 서비스 전체와 일관성 있게 개선하고, 깔끔하고 세련된 UI로 리팩토링합니다.

**문제점 요약**:
1. **색상 불일치**: 보라색/남색(`#6366f1`) 사용 → 서비스 CTA 색상인 당근색(`#FF6B3D`)으로 통일 필요
2. **알록달록한 chat-content**: 너무 많은 색상 사용으로 가독성 저하
3. **대시보드와의 일관성 부족**: Bento Grid 스타일과 동떨어진 디자인
4. **다크모드 미지원**: 대부분의 AI 관련 컴포넌트에서 다크모드 스타일 누락

---

## 상세 분석 (컴포넌트별)

### 1. ExcuseSelector.vue (변명 선택 컴포넌트)

| 요소 | 현재 색상 | 문제점 |
|------|-----------|--------|
| `.excuse-chip:hover` | `#6366f1` (보라색) | 브랜드 색상 불일치 |
| `.excuse-chip.active` | `#6366f1` 배경 | CTA 색상과 불일치 |
| `.custom-input:focus` | `#6366f1` 테두리 | focus 상태도 보라색 |
| `.selector-title` | `#333` | 다크모드 미지원 |
| `.excuse-selector` 배경 | `#f8f9fa` | 하드코딩, 다크모드 미지원 |

---

### 2. JudgmentResult.vue (판결 결과 컴포넌트)

| 요소 | 현재 색상 | 문제점 |
|------|-----------|--------|
| `.progress-fill` | `#6366f1 → #8b5cf6` 그라데이션 | 보라색 계열 |
| `.character-script` | `#f0f9ff` 배경, `#1e40af` 텍스트 | 파란색 계열 |
| `.result-comment` | `#f8f9fa` 배경 | 너무 회색/무채색 |
| `.judgment-result` 배경 | `white` 하드코딩 | 다크모드 미지원 |
| 전체 텍스트 색상 | 하드코딩값 | 다크모드 미지원 |

---

### 3. HistoryList.vue (히스토리 목록) **새로 발견**

| 요소 | 현재 색상 | 문제점 |
|------|-----------|--------|
| `.history-list` 배경 | `white` 하드코딩 | 다크모드 미지원 |
| `.loading-spinner` | `#6366f1` | 보라색 스피너 |
| `.history-title` | `#6b7280` | 다크모드 미지원 |
| `.history-item` 배경 | `#f8f9fa` | 다크모드 미지원 |
| 전체 텍스트 색상들 | 하드코딩값 | 다크모드 미지원 |

---

### 4. LoadingOverlay.vue (로딩 오버레이) **새로 발견**

| 요소 | 현재 색상 | 문제점 |
|------|-----------|--------|
| `@keyframes pulse` | `rgba(99, 102, 241, 0.4)` | 보라색 펄스 효과 |
| `.loading-icon` 배경 | `rgba(255, 255, 255, 0.1)` | 적절함 (유지) |

---

### 5. SpendingInputModal.vue (지출 입력 모달) **새로 발견**

| 요소 | 현재 색상 | 문제점 |
|------|-----------|--------|
| `.mode-option:hover` | `#6366f1` 테두리, 보라색 그림자 | 보라색 hover 효과 |
| `.form-input:focus` | `#6366f1` | 보라색 focus 상태 |
| `.category-chip.active` | `#6366f1` 배경 | 보라색 활성 상태 |
| `.upload-placeholder:hover` | `#6366f1`, `#f0f0ff` | 보라색 hover |
| `.ai-message-box` | `#f0f9ff` 배경 | 파란색 배경 |
| `.modal-content` 배경 | `white` 하드코딩 | 다크모드 미지원 |
| 전체 텍스트/배경 | 하드코딩값 | 다크모드 미지원 |

---

## 개선 계획

### Phase 1: 색상 토큰 통일 (브랜드 일관성)

#### 1.1 보라색 → 당근색 교체 대상 총 정리

```css
/* 변경 전 - 보라색 (#6366f1) 사용 위치 */

/* ExcuseSelector.vue */
.excuse-chip:hover { border-color: #6366f1; background: #f0f0ff; }
.excuse-chip.active { background: #6366f1; }
.custom-input:focus { border-color: #6366f1; box-shadow: ... rgba(99, 102, 241, 0.1); }

/* JudgmentResult.vue */
.progress-fill { background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); }

/* HistoryList.vue */
.loading-spinner { border-top-color: #6366f1; }

/* LoadingOverlay.vue */
@keyframes pulse { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }

/* SpendingInputModal.vue */
.mode-option:hover { border-color: #6366f1; box-shadow: ... rgba(99, 102, 241, 0.2); }
.form-input:focus { border-color: #6366f1; box-shadow: ... rgba(99, 102, 241, 0.1); }
.category-chip.active { background: #6366f1; border-color: #6366f1; }
.upload-placeholder:hover { border-color: #6366f1; background: #f0f0ff; }
```

#### 1.2 통일된 교체 값

```css
/* 변경 후 - 당근색 (brand-accent) 사용 */

/* 공통 hover/active 스타일 */
--accent-hover-bg: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08);
--accent-hover-border: var(--brand-accent, #ff6b3d);
--accent-focus-ring: 0 0 0 3px rgba(var(--brand-accent-rgb, 255, 107, 61), 0.12);
--accent-active-bg: var(--brand-accent, #ff6b3d);
```

---

### Phase 2: 파란색 계열 제거

#### 2.1 Character Script / AI Message Box

```css
/* 변경 전 */
.character-script { background: #f0f9ff; }
.character-script p { color: #1e40af; }
.ai-message-box { background: #f0f9ff; }

/* 변경 후 - 뉴트럴 + 당근색 액센트 */
.character-script, 
.ai-message-box {
  background: var(--surface-muted, #F5F5F5);
  border-left: 3px solid var(--brand-accent, #ff6b3d);
}

html[data-theme="night"] .character-script,
html[data-theme="night"] .ai-message-box {
  background: rgba(255, 255, 255, 0.06);
}

.character-script p,
.ai-message-box p {
  color: var(--showroom-text-day, #2C2420);
}

html[data-theme="night"] .character-script p,
html[data-theme="night"] .ai-message-box p {
  color: var(--showroom-text-night, #F5EDE3);
}
```

---

### Phase 3: 다크모드 지원 추가

#### 3.1 공통 카드/컨테이너 배경

```css
/* 모든 AI 관련 카드/컨테이너에 적용 */
.excuse-selector,
.judgment-result,
.history-list,
.modal-content {
  background: var(--bento-card-bg, #ffffff);
  border: 1px solid var(--bento-card-border, #e5e7eb);
}

html[data-theme="night"] .excuse-selector,
html[data-theme="night"] .judgment-result,
html[data-theme="night"] .history-list,
html[data-theme="night"] .modal-content {
  background: var(--showroom-card-bg-night, #2a2520);
  border-color: rgba(255, 255, 255, 0.08);
}
```

#### 3.2 텍스트 색상 통일

```css
/* 제목/라벨 */
.selector-title,
.history-title,
.results-title,
.modal-title,
.form-label {
  color: var(--bento-card-title, #1f2937);
}

html[data-theme="night"] .selector-title,
html[data-theme="night"] .history-title,
html[data-theme="night"] .results-title,
html[data-theme="night"] .modal-title,
html[data-theme="night"] .form-label {
  color: var(--showroom-text-night, #F5EDE3);
}

/* 본문 텍스트 */
.store-name,
.item-amount,
.mode-text strong {
  color: var(--bento-text, #1f2937);
}

html[data-theme="night"] .store-name,
html[data-theme="night"] .item-amount,
html[data-theme="night"] .mode-text strong {
  color: var(--showroom-text-night, #F5EDE3);
}

/* 보조 텍스트 */
.item-date,
.mode-text small,
.step-description {
  color: var(--bento-text-muted, #6b7280);
}

html[data-theme="night"] .item-date,
html[data-theme="night"] .mode-text small,
html[data-theme="night"] .step-description {
  color: rgba(245, 237, 227, 0.7);
}
```

#### 3.3 입력 필드 다크모드

```css
.form-input {
  background: var(--bento-card-bg, #ffffff);
  border-color: var(--bento-card-border, #e5e7eb);
  color: var(--bento-text, #1f2937);
}

html[data-theme="night"] .form-input {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--showroom-text-night, #F5EDE3);
}
```

#### 3.4 히스토리 아이템 다크모드

```css
.history-item {
  background: var(--surface-muted, #f8f9fa);
}

html[data-theme="night"] .history-item {
  background: rgba(255, 255, 255, 0.04);
}

.history-item:hover {
  background: rgba(var(--brand-accent-rgb, 255, 107, 61), 0.06);
}
```

---

### Phase 4: 버튼 스타일 통일

> [!TIP]
> 기존 `buttons.css`의 클래스를 활용하면 CTA 스타일이 자동 적용됩니다.

- `submit-button` → Primary CTA (당근색)
- `action-button.primary` → Primary CTA
- `action-button.secondary` → Secondary (화이트)
- `refresh-button` → 기존 아이콘 버튼 스타일 유지하되 hover에 당근색 적용

---

## 검토 결과 및 보완 제안

### 1) 토큰 정의 위치 명시
- `--brand-accent`, `--brand-accent-soft`, `--brand-accent-rgb`가 정의된 공용 토큰 파일을 문서에 명시하고, 없으면 추가합니다.
- 다크모드는 `html[data-theme="night"]`에서 토큰만 오버라이드하도록 정리합니다.

### 2) 인터랙션 상태 정합성
- hover/active/focus/disabled 상태 규칙을 문서화하고 적용 여부를 체크리스트로 관리합니다.
- 키보드 포커스 링 대비가 충분한지(최소 3:1) 확인합니다.

### 3) 타이포그래피와 간격
- `chat-content` 영역의 본문/강조/캡션 폰트 크기와 라인 높이 기준을 정리합니다.
- 카드 내부 padding 및 섹션 간 gap을 Bento 카드 기준으로 맞춥니다.

### 4) 접근성 및 대비
- `character-script`, `result-comment`의 텍스트 대비를 WCAG AA(4.5:1) 기준으로 확인합니다.
- 야간 모드에서 border/box-shadow 농도를 과하지 않게 조정합니다.

### 5) 모션 제어
- `prefers-reduced-motion`을 고려해 `level-up`과 로딩 애니메이션을 축소 또는 비활성화합니다.

### 6) 적용 범위 점검
- `#6366f1`, `#8b5cf6` 하드코딩이 AI 관리실 외에 남아 있는지 전역 검색 후 정리합니다.

---

## 수정 대상 파일 (총 5개)

| 파일 경로 | 수정 항목 수 | 우선순위 |
|-----------|-------------|---------|
| `src/components/ai/ExcuseSelector.vue` | 5개 | 높음 |
| `src/components/ai/JudgmentResult.vue` | 6개 | 높음 |
| `src/components/ai/SpendingInputModal.vue` | 8개 | 높음 |
| `src/components/ai/HistoryList.vue` | 7개 | 중간 |
| `src/components/ai/LoadingOverlay.vue` | 1개 | 낮음 |

---

## 디자인 원칙 요약

| 원칙 | 적용 방법 |
|------|-----------|
| **CTA 색상 통일** | 모든 인터랙티브 요소에 `--brand-accent` (#FF6B3D) 사용 |
| **다크모드 지원** | `html[data-theme="night"]` 셀렉터로 야간 스타일 분리 |
| **토큰 기반 스타일링** | 하드코딩 색상 대신 CSS 변수 활용 |
| **Bento Grid 일관성** | `--bento-card-*` 변수 활용으로 대시보드와 통일 |
| **색상 최소화** | 뉴트럴 배경 + 단일 액센트 색상으로 정리 |

---

## 색상 매핑 참조표 (확장)

| 이전 색상 | 용도 | 대체 색상 (CSS 변수) |
|-----------|------|---------------------|
| `#6366f1` | 호버/액티브/포커스 | `var(--brand-accent, #ff6b3d)` |
| `#8b5cf6` | 그라데이션 끝 | `var(--brand-accent-soft, #ff9a75)` |
| `#f0f9ff` | 메시지 박스 배경 | `var(--surface-muted, #F5F5F5)` |
| `#f0f0ff` | hover 배경 | `rgba(var(--brand-accent-rgb, 255, 107, 61), 0.08)` |
| `#1e40af` | 스크립트 텍스트 | `var(--showroom-text-day, #2C2420)` |
| `#f8f9fa` | 카드/아이템 배경 | `var(--bento-card-bg, #ffffff)` |
| `#333` | 제목 텍스트 | `var(--bento-card-title, #1f2937)` |
| `white` | 모달/카드 배경 | `var(--bento-card-bg, #ffffff)` |
| `rgba(99,102,241,0.x)` | 보라 투명 | `rgba(var(--brand-accent-rgb), 0.x)` |

---

## 유지할 색상 (변경 불필요)

| 색상 | 용도 | 이유 |
|------|------|------|
| `#059669` (녹색) | REASONABLE 판정 | 의미론적 (긍정) |
| `#10b981` (밝은 녹색) | 합리적 소비 타이틀 | 의미론적 (긍정) |
| `#dc2626` / `#ef4444` (적색) | WASTE 판정, 에러 | 의미론적 (부정/경고) |
| `#fef3c7` ~ `#f59e0b` (노란색) | 레벨업 축하 | 축하 효과 |
| `#d1fae5` | reasonable 뱃지 배경 | 성공 상태 표시 |
| `#fee2e2` | waste 뱃지 배경 | 실패 상태 표시 |

---

## 예상 결과

### Before (현재)
- 보라색/파란색 계열 혼용 (약 15곳)
- 알록달록한 색상으로 산만함
- 다크모드 거의 미지원
- 하드코딩된 색상값 다수

### After (개선 후)
- 당근색(CTA) 중심의 일관된 액센트
- 깔끔한 뉴트럴 배경 + 포인트 컬러
- 대시보드와 동일한 다크모드 지원
- CSS 변수 기반 유지보수 용이
- Bento Card 스타일 통일
