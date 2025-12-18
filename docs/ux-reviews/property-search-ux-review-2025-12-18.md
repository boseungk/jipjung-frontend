# 매물 탐색 UX 리뷰

## 개요

| 항목 | 내용 |
|------|------|
| 리뷰 일시 | 2025-12-18 |
| 테스트 환경 | Windows, Chrome, localhost:5173 |
| 페르소나 | 김민수 (27세, 사회초년생, 금융 지식 부족) |
| 테스트 시나리오 | 대시보드 -> 매물 탐색 -> 매물 상세 확인 |

### 요약
- 총 발견 이슈: **12개**
  - Critical: 1개
  - High: 4개
  - Medium: 5개
  - Low: 2개

---

## 시나리오 실행 결과

### Step 1: 대시보드 진입
![대시보드](screenshots/01-dashboard.png)

- 로그인 상태에서 대시보드 진입 성공
- "내 집 완공!" 축하 모달이 자동으로 표시됨
- 네비게이션 바에 "매물" 링크가 명확하게 표시됨

### Step 2: 매물 탐색 화면
![매물 목록](screenshots/03-property-list.png)

- 좌측: 카카오맵 기반 지도 (매물 위치 마커)
- 우측: 매물 목록 카드
- 필터 버튼 존재 (지도 좌측, 목록 상단)

### Step 3: 필터 버튼 클릭 시 에러
![필터 에러](screenshots/04-filter-error.png)

- **JavaScript 에러 발생**: `TypeError: filters.value.priceRange is not iterable`
- 필터 모달이 열리지 않음
- 사용자에게 아무런 피드백 없음

### Step 4: 매물 상세 보기
![매물 상세](screenshots/05-property-detail.png)

- 매물 카드 클릭 시 우측 패널에 상세 정보 표시
- 지도가 해당 매물 위치로 줌인
- 기본 정보, 위치, 특징, 중개인 정보 표시

---

## 발견된 문제점

### Critical (기능 사용 불가)

#### 1. 필터 기능 JavaScript 에러
- **위치**: `PropertyFilters.vue`, `propertyStore.js`
- **현상**: 필터 버튼 클릭 시 `TypeError: filters.value.priceRange is not iterable` 에러 발생
- **원인**: `PropertyFilters.vue`에서 `filters.value.priceRange`를 배열로 접근하지만, `propertyStore.js`의 filters 객체에는 `priceRange` 배열이 없고 `priceMin`, `priceMax`로 분리되어 있음
- **영향**: 사용자가 매물 필터링을 전혀 할 수 없음
- **코드 위치**:
  ```javascript
  // PropertyFilters.vue (33행) - 배열로 접근 시도
  가격 범위: {{ formatPrice(localFilters.priceRange[0]) }}

  // propertyStore.js (29-35행) - 실제 구조
  const filters = ref({
      priceMin: null,
      priceMax: null,
      // priceRange 배열이 없음!
  })
  ```
- **개선안**: Store의 filters 구조와 컴포넌트의 localFilters 구조 일치시키기

---

### High (사용은 가능하나 매우 불편)

#### 2. "0만원" 가격 표시 - 의미 불명확
- **위치**: `PropertyCard.vue`, 지도 마커
- **현상**: 다수의 매물이 "0만원" 또는 "가격 미정"으로 표시됨
- **영향**: 초보자 입장에서 "가격이 0원인 건가?", "무료인가?" 혼란 발생
- **코드 위치**: `propertyStore.js` 271-286행
  ```javascript
  function formatPrice(priceInManwon) {
      if (!priceInManwon) return '가격 미정'
      // ...
  }
  ```
- **개선안**:
  - "가격 미정" 대신 "가격 문의" 또는 "시세 확인 필요" 등 행동 유도 문구 사용
  - 가격이 0인 매물은 "가격 정보 없음 - 중개사에 문의하세요" 표시

#### 3. "필요 계약금" 금액 오류
- **위치**: `PropertyActions.vue`
- **현상**: "필요 계약금: 21,900원 (보유: 41,500,000원)" - 7억 3천만원 매물의 계약금이 2만원대로 표시됨
- **원인**: 가격 단위(만원) 처리 누락 - 백엔드에서 만원 단위로 오는 데이터를 그대로 30% 계산
- **영향**: 초보자가 "2만원이면 살 수 있나?"라고 오해할 수 있음
- **코드 위치**: `PropertyActions.vue` 115-118행
  ```javascript
  const formatDownPayment = computed(() => {
      const downPayment = Math.ceil(props.property.price * 0.3)
      return downPayment.toLocaleString()  // 단위 미표시
  })
  ```
- **개선안**:
  - 만원 단위 명시: "필요 계약금: 약 2억 1,900만원"
  - 또는 원 단위로 변환 후 표시

#### 4. "방 0개" 표시 - 데이터 누락
- **위치**: `PropertyCard.vue`, `PropertyInfo.vue`
- **현상**: 대부분의 매물이 "방 0개 / 욕실 0개"로 표시됨
- **영향**: 초보자 입장에서 "방이 하나도 없는 집인가?" 혼란
- **개선안**:
  - 데이터가 0이거나 없으면 해당 항목 숨기기
  - 또는 "정보 없음" 표시

#### 5. 층수 표시 문제 - 따옴표 포함
- **위치**: `PropertyCard.vue`, `PropertyInfo.vue`
- **현상**: 층수가 `"11"` 처럼 따옴표와 함께 표시됨
- **코드 위치**: `PropertyCard.vue` 45행
  ```html
  <span>{{ property.floor }}</span>
  ```
- **개선안**: 데이터 파싱 시 문자열 처리 또는 표시 시 "층" 접미사 추가

---

### Medium (개선하면 좋음)

#### 6. 용어 설명 부재 - "매매", "거래 유형"
- **위치**: `PropertyInfo.vue`, `PropertyFilters.vue`
- **현상**: "매매", "전세", "월세" 등 거래 유형에 대한 설명 없음
- **영향**: 금융 초보자가 매매와 전세의 차이를 모를 수 있음
- **개선안**:
  - 각 용어 옆에 `?` 아이콘 추가
  - 툴팁으로 간단한 설명 제공
  - 예: "매매 - 집을 완전히 구매하는 방식"

#### 7. 면적 단위 혼용 - 평/제곱미터
- **위치**: `PropertyInfo.vue`
- **현상**: "26평 (84.83m2)"로 표시되어 있으나 초보자에게 직관적이지 않음
- **영향**: "26평이 얼마나 큰 건지?" 감이 안 옴
- **개선안**:
  - 비교 기준 제공: "약 8평 = 원룸 크기", "약 25평 = 소형 아파트"
  - 또는 "침대 X개 들어갈 크기" 같은 직관적 표현

#### 8. 이미지 로딩 실패 시 대체 콘텐츠 미흡
- **위치**: `PropertyCard.vue`
- **현상**: 이미지 로드 실패 시 이모지(🏠)와 매물 유형만 표시
- **영향**: 시각적으로 빈약해 보임
- **코드 위치**: `PropertyCard.vue` 20-23행
  ```html
  <div v-else class="image-fallback">
      <span class="fallback-icon">🏠</span>
      <span class="fallback-text">{{ property.propertyType }}</span>
  </div>
  ```
- **개선안**:
  - 플레이스홀더 이미지 사용
  - "이미지 준비 중" 문구 추가

#### 9. 빈 중개인 정보 표시
- **위치**: `PropertyInfo.vue`
- **현상**: "중개인 정보" 섹션에 "이름"만 표시되고 값이 비어있음
- **코드 위치**: `PropertyInfo.vue` 64-79행
- **개선안**:
  - 중개인 정보가 없으면 섹션 자체를 숨기기
  - 또는 "중개인 정보가 등록되지 않았습니다" 메시지 표시

#### 10. 저장 버튼 이모지 사용
- **위치**: `PropertyCard.vue`
- **현상**: 저장 버튼이 🤍/❤️ 이모지로만 표시됨
- **영향**: 접근성 문제 (스크린 리더), 기능 불명확
- **코드 위치**: `PropertyCard.vue` 25-27행
  ```html
  <button class="save-btn">
      {{ isSaved ? '❤️' : '🤍' }}
  </button>
  ```
- **개선안**:
  - aria-label 추가: `aria-label="관심 매물로 저장"`
  - 호버 시 툴팁 표시

---

### Low (사소한 개선)

#### 11. 지도 컨트롤 아이콘만 표시
- **위치**: `PropertyMapPanel.vue`
- **현상**: 필터, 현재 위치, 지도 초기화 버튼이 아이콘만으로 표시
- **영향**: 처음 사용하는 사람은 각 버튼의 기능을 모를 수 있음
- **개선안**: 호버 시 툴팁 표시

#### 12. 날짜 형식 불일치
- **위치**: 지도 마커, 차트
- **현상**: 일부는 "19 Nov", 일부는 "12월"로 표시
- **개선안**: 한국어 날짜 형식으로 통일 ("11월 19일", "12월")

---

## 코드 분석 결과

### 하드코딩 이슈

| 파일 | 위치 | 내용 | 권장 조치 |
|------|------|------|-----------|
| PropertyFilters.vue | 14-27행 | 지역 옵션이 하드코딩됨 | 상수 파일 또는 API로 분리 |
| PropertyFilters.vue | 131행 | 가격 범위 기본값 `[0, 999999]` | 상수 파일로 분리 |
| propertyStore.js | 244행 | `sido: '서울특별시'` 하드코딩 | 사용자 설정 또는 GPS 기반으로 변경 |

### 에러 핸들링 이슈

| 파일 | 이슈 | 권장 조치 |
|------|------|-----------|
| PropertyFilters.vue | Store와 컴포넌트 간 데이터 구조 불일치로 런타임 에러 | 타입 검증 추가, 구조 통일 |
| PropertyCard.vue | 이미지 에러만 처리, 다른 에러는 미처리 | 전역 에러 핸들러 추가 |
| propertyStore.js | API 에러 시 사용자 피드백 부족 | 토스트 메시지로 에러 표시 |

### 접근성(a11y) 이슈

| 파일 | 이슈 | 권장 조치 |
|------|------|-----------|
| PropertyCard.vue | 저장 버튼에 aria-label 없음 | `aria-label="관심 매물로 저장/해제"` 추가 |
| PropertyCard.vue | 이모지 버튼은 스크린 리더에서 의미 전달 안됨 | 숨겨진 텍스트 또는 aria-label 추가 |
| PropertyFilters.vue | 모달에 focus trap 없음 | focus-trap 라이브러리 적용 |
| PropertyInfo.vue | heading 레벨 점프 (h1 -> h3) | 시맨틱 구조 개선 |

---

## 긍정적인 부분

1. **직관적인 레이아웃**: 지도와 목록의 분할 화면이 부동산 앱의 표준 패턴을 따름
2. **가격 포맷팅**: "7억 3천만원" 형식으로 한국인이 이해하기 쉬운 표기
3. **구매 가능 여부 표시**: 현재 보유 금액 대비 구매 가능 여부를 시각적으로 표시
4. **반응형 디자인**: 모바일/태블릿 대응 CSS 구현
5. **다크 모드 지원**: 야간 테마 완벽 지원

---

## 개선 우선순위

### 즉시 수정 필요 (Critical)
1. **필터 기능 에러 수정** - `PropertyFilters.vue`와 `propertyStore.js` 간 데이터 구조 일치

### 단기 개선 (1-2주)
2. 가격 "0만원" 표시 개선 - "가격 문의" 또는 의미 있는 문구로 변경
3. 계약금 계산 단위 오류 수정 - 만원 단위 명시
4. "방 0개" 등 빈 데이터 처리 개선
5. 층수 따옴표 제거

### 중기 개선 (1개월)
6. 부동산 용어 툴팁 추가 (매매, 전세, 평 등)
7. 면적에 비교 기준 제공
8. 접근성 개선 (aria-label, focus trap)
9. 이미지 플레이스홀더 개선

### 장기 개선
10. 지역 옵션 동적 로딩 (하드코딩 제거)
11. 초보자 온보딩 가이드 추가
12. 매물 비교 기능

---

## 부록: 테스트 환경

- **프론트엔드**: Vue 3 + Vite + Pinia
- **브라우저**: Chrome (Playwright 자동화)
- **해상도**: 1456 x 811
- **테스트 도구**: Playwright MCP
