# 매물 조회/상세조회 화면 UI 개선 구현 계획

> [!IMPORTANT]
> **금액 단위**: 프론트엔드 전체적으로 **만원** 단위 사용 (`propertyStore.js` 기준)
> - 가격 프리셋: `10000` = 1억 (만원 단위)
> - 면적 프리셋: `20` = 20평 (평 단위)
>
> **이미지 스키마(중요)**: 현재 프론트 매물 데이터는 `propertyStore.mapApartmentToProperty()` 기준으로
> - `property.images: Array<{ url: string | null, alt?: string }>` 형태를 사용 중입니다. (`PropertyCard.vue`도 동일 전제)
> - 따라서 `PropertyGallery.vue`/fallback 로직은 **`image.url` 기반**으로 처리해야 안전합니다. (문자열 배열 가정 금지)
>
> **아이콘 사용(가이드)**: 신규 UI 아이콘은 가능하면 `AppIcon` 사용(전역 등록된 Phosphor 아이콘만 동작).
> - `AppIcon`로 쓰려면 `src/main.js`에 해당 `Ph*` 아이콘을 전역 등록하거나, 컴포넌트에서 직접 import로 사용합니다.

## 수정 대상 파일 (7개)

```
src/components/property/
├── PropertyDetailMode.vue      ← P0: 레이아웃 1열로 변경
├── PropertyListMode.vue        ← P1: 검색창 분리 + 퀵필터 + 필터 배지
├── PropertyCard.vue            ← P1: 면적0, feature빈영역, fallback
├── PropertyFilters.vue         ← P1: 전면 재설계
└── detail/
    ├── PropertySpecs.vue       ← P0: "-개", "-층" 조건부 렌더링
    ├── PropertyGallery.vue     ← P0: 이미지 에러 fallback + 빈 배열 처리
    └── PropertyBasicInfo.vue   ← P0: "확인 필요" 조건부 렌더링
```

## 추가로 확인/조정할 파일 (필요 시)

> [!NOTE]
> 아래 파일들은 “UI 개선” 구현 중 **정합성 이슈가 있을 때만** 함께 조정합니다.

- `src/stores/propertyStore.js` (매물 매핑: `images` 스키마/기본값 확인)
- `src/models/Property.js` (주석/필드 정의가 실제 데이터와 불일치하는지 확인)
- `src/main.js` (`AppIcon`로 사용할 아이콘 전역 등록 필요 시)

## Store 필터 스키마 (참조용)

```javascript
// propertyStore.js filters 스키마 (29~43행)
filters: {
  propertyType: null,    // 매물 타입
  transactionType: null, // 거래 유형
  priceMin: null,        // 최소 가격 (만원)
  priceMax: null,        // 최대 가격 (만원)
  areaMin: null,         // 최소 면적 (평)
  areaMax: null,         // 최대 면적 (평)
  sido: '서울특별시',     // 시/도
  sigungu: null,         // 읍/면/동
  rooms: null,           // 방 개수
  bathrooms: null,       // 욕실 개수
  features: [],          // 특징
  keyword: '',           // 검색어
  favoritesOnly: false   // 관심 아파트만
}
```

---

## 1. PropertyDetailMode.vue (P0 - 가장 시급)

### 문제
- `@media (min-width: 1024px)` 조건이 뷰포트 기준이라 정보패널(550px)에서도 2열 적용됨
- 좁은 공간에 특징+버튼, 위치+기본정보가 억지로 들어감

### 해결
1. `content-split` 2열 레이아웃 제거 → 항상 1열
2. 섹션 순서 재배치: 버튼 → 특징 → 위치 → 기본정보

> [!NOTE]
> “2열 유지”가 필요해지면, 뷰포트 미디어쿼리 대신 **컨테이너 쿼리**로 “패널 너비 기준”에서만 2열을 켜는 방식이 더 근본적인 해결입니다.
> 이번 계획에서는 우선 **항상 1열**로 단순화합니다.

> [!NOTE]
> 기존 “우측 sticky CTA”가 사라지므로, 1열 전환 후에도 CTA UX를 아래 중 하나로 유지할지 결정합니다.
> - A안: CTA를 상단 섹션으로 이동(스크롤 초반에 바로 노출)
> - B안: CTA 영역에 `position: sticky` 적용(스크롤 중에도 노출되도록)

### 변경 코드

**template 부분 (약 53~66행):**
```vue
<!-- 기존 content-split 삭제하고 아래로 교체 -->
<div class="content-stack">
  <!-- CTA 먼저 -->
  <PropertyActions :property="selectedProperty" />

  <!-- 상세 정보 -->
  <PropertyMainContent :property="selectedProperty" />

  <!-- 기본 정보 마지막 -->
  <PropertyBasicInfo :property="selectedProperty" />
</div>
```

**style 부분 (약 246~266행):**
```css
/* 기존 content-split 관련 스타일 삭제하고 아래로 교체 */
.content-stack {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* @media (min-width: 1024px) 블록 삭제 */
```

---

## 2. PropertySpecs.vue (P0)

### 문제
- 데이터 없을 때 "0평", "-개", "-층" 표시

### 해결
- computed로 유효성 검사 후 조건부 렌더링
- 모든 스펙 없으면 대체 메시지

> [!NOTE]
> 값 유효성 규칙을 통일합니다.
> - `area/rooms/bathrooms`: `Number(value) > 0`일 때만 렌더링
> - `floor`: `'-'`, `'0'`, 빈 문자열은 미표시(표준화 `cleanFloor` 사용)

### 변경 코드

**script 부분 전체 교체:**
```vue
<script setup>
import { computed } from 'vue'
import { PhRuler, PhBed, PhBathtub, PhBuildings, PhQuestion } from '@phosphor-icons/vue'

const props = defineProps({
  property: { type: Object, required: true }
})

function cleanFloor(floor) {
  if (!floor || floor === '-' || floor === '0') return null
  const cleaned = String(floor).replace(/['"]/g, '').trim()
  return cleaned || null
}

const specs = computed(() => {
  const p = props.property
  return {
    area: p.area > 0 ? `${p.area}평` : null,
    rooms: p.rooms > 0 ? `${p.rooms}개` : null,
    bathrooms: (p.bath || p.bathrooms) > 0 ? `${p.bath || p.bathrooms}개` : null,
    floor: cleanFloor(p.floor) ? `${cleanFloor(p.floor)}층` : null
  }
})

const hasAnySpec = computed(() => Object.values(specs.value).some(v => v))
</script>
```

**template 부분 전체 교체:**
```vue
<template>
  <div class="specs-grid" v-if="hasAnySpec">
    <div class="spec-item" v-if="specs.area">
      <div class="spec-icon-wrapper"><PhRuler :size="24" weight="light" /></div>
      <div class="spec-content">
        <span class="spec-label">전용면적</span>
        <span class="spec-value">{{ specs.area }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.rooms">
      <div class="spec-icon-wrapper"><PhBed :size="24" weight="light" /></div>
      <div class="spec-content">
        <span class="spec-label">방</span>
        <span class="spec-value">{{ specs.rooms }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.bathrooms">
      <div class="spec-icon-wrapper"><PhBathtub :size="24" weight="light" /></div>
      <div class="spec-content">
        <span class="spec-label">욕실</span>
        <span class="spec-value">{{ specs.bathrooms }}</span>
      </div>
    </div>

    <div class="spec-item" v-if="specs.floor">
      <div class="spec-icon-wrapper"><PhBuildings :size="24" weight="light" /></div>
      <div class="spec-content">
        <span class="spec-label">층수</span>
        <span class="spec-value">{{ specs.floor }}</span>
      </div>
    </div>
  </div>

  <div class="specs-empty" v-else>
    <PhQuestion :size="20" weight="light" />
    <span>상세 정보가 등록되지 않았습니다</span>
  </div>
</template>
```

**style에 추가:**
```css
.specs-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  color: var(--showroom-text-day);
  opacity: 0.5;
  font-size: 0.875rem;
}

html[data-theme="night"] .specs-empty {
  background: rgba(255, 255, 255, 0.02);
  color: var(--showroom-text-night);
}

/* 동적 그리드 */
.specs-grid {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}
```

---

## 3. PropertyGallery.vue (P0)

### 문제
- 이미지 로드 실패 시 빈 박스만 표시
- `props.images`가 빈 배열일 때 처리 없음

### 해결
- Set으로 에러 상태 추적
- fallback UI 표시
- 빈 배열/모든 이미지 에러 시 갤러리 네비게이션 숨김
- **이미지 스키마 정합성**: `images`는 `[{ url, alt }]` 객체 배열(또는 `url: null`)을 전제로 처리

### 변경 코드

**script에 추가:**
```javascript
import { ref, computed, watch } from 'vue'
// 아이콘은 AppIcon 사용 권장(또는 PhImage 로컬 import / main.js 전역 등록)

const imageErrors = ref(new Set())

function getImageUrl(image) {
  if (!image) return null
  if (typeof image === 'string') return image
  return image.url || null
}

function getImageAlt(image) {
  if (!image) return props.title
  if (typeof image === 'string') return props.title
  return image.alt || props.title
}

// 빈 배열 또는 모든 이미지 에러 상태 체크
const hasNoImages = computed(() => !props.images || props.images.length === 0)
const currentImageUrl = computed(() => getImageUrl(props.images?.[currentIndex.value]))
const currentImageAlt = computed(() => getImageAlt(props.images?.[currentIndex.value]))
const hasCurrentImageError = computed(() => {
  if (hasNoImages.value) return true
  if (!currentImageUrl.value) return true
  return imageErrors.value.has(currentIndex.value)
})
const allImagesHaveError = computed(() => {
  if (hasNoImages.value) return true
  return props.images.every((img, idx) => !getImageUrl(img) || imageErrors.value.has(idx))
})

watch(() => props.images, () => {
  imageErrors.value = new Set()
  currentIndex.value = 0
})

function handleImageError(index) {
  imageErrors.value = new Set([...imageErrors.value, index])
}
```

**template main-image 부분 교체:**
```vue
<div class="main-image">
  <img
    v-if="!hasCurrentImageError"
    :src="currentImageUrl"
    :alt="currentImageAlt"
    @error="handleImageError(currentIndex)"
  />

  <div v-else class="image-fallback">
    <!-- AppIcon 권장: <AppIcon name="image" :size="64" weight="thin" /> (전역 등록 필요) -->
    <span class="fallback-text">이미지를 불러올 수 없습니다</span>
    <span class="fallback-title">{{ title }}</span>
  </div>

  <!-- 네비게이션 버튼: 모든 이미지 에러시 숨김 -->
  <template v-if="!allImagesHaveError && images.length > 1">
    <!-- 기존 네비게이션 버튼 유지 -->
  </template>
</div>
```

**style에 추가:**
```css
.image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.03), rgba(0, 0, 0, 0.02));
  color: var(--showroom-text-day);
  opacity: 0.5;
}

html[data-theme="night"] .image-fallback {
  color: var(--showroom-text-night);
}

.fallback-text { font-size: 0.875rem; font-weight: 500; }
.fallback-title { font-size: 0.75rem; opacity: 0.7; }
```

---

## 4. PropertyBasicInfo.vue (P0)

### 문제
- "확인 필요" 텍스트가 너무 많음

### 해결
- 데이터 있는 항목만 표시
- computed로 동적 생성

> [!NOTE]
> 숫자/문자 혼합 데이터가 들어올 수 있으므로, 표시 조건은 `Number(...) > 0` / `'-'` 배제 등으로 통일합니다.

### 변경 코드

**script 전체 교체:**
```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  property: { type: Object, required: true }
})

const infoItems = computed(() => {
  const p = props.property
  const items = []

  // 필수 항목
  if (p.propertyType) items.push({ label: '매물 유형', value: p.propertyType })
  if (p.transactionType) items.push({ label: '거래 유형', value: p.transactionType })

  // 선택 항목 (데이터 있을 때만)
  if (p.area > 0 || p.sqm > 0) {
    items.push({ label: '공급/전용', value: `${p.area || '-'}평 / ${p.sqm || '-'}㎡` })
  }

  if (p.rooms > 0 || p.bathrooms > 0) {
    const parts = []
    if (p.rooms > 0) parts.push(`방 ${p.rooms}개`)
    if (p.bathrooms > 0) parts.push(`욕실 ${p.bathrooms}개`)
    items.push({ label: '방/욕실', value: parts.join(' / ') })
  }

  if (p.floor && p.floor !== '-') {
    items.push({ label: '해당층', value: `${p.floor}층` })
  }

  if (p.buildYear && p.buildYear > 1900) {
    items.push({ label: '사용승인일', value: `${p.buildYear}년` })
  }

  if (p.maintenanceFee > 0) {
    items.push({ label: '관리비', value: `${p.maintenanceFee}만원` })
  }

  return items
})
</script>
```

**template 전체 교체:**
```vue
<template>
  <div class="basic-info-card">
    <h3 class="card-title">기본 정보</h3>

    <div class="info-list">
      <div v-for="(item, index) in infoItems" :key="index" class="info-row">
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>

    <div v-if="infoItems.length < 3" class="info-notice">
      일부 정보가 등록되지 않았습니다
    </div>
  </div>
</template>
```

**style에 추가:**
```css
.info-notice {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--showroom-text-day);
  opacity: 0.5;
  text-align: center;
}

html[data-theme="night"] .info-notice {
  background: rgba(255, 255, 255, 0.02);
  color: var(--showroom-text-night);
}
```

---

## 5. PropertyCard.vue (P1)

### 문제
- 면적 0일 때 "0평" 표시
- feature 없으면 빈 영역
- 이미지 fallback 단순함
- 카드 높이 불일관

### 해결

> [!NOTE]
> `property.images`는 `[{ url, alt }]` 기준이므로, 카드에서는 `property.images?.[0]?.url` 식으로 안전 접근합니다.

**script에 computed 추가:**
```javascript
const displayArea = computed(() => {
  const area = props.property.area
  return area && area > 0 ? `${area}평` : null
})

const hasValidSpecs = computed(() =>
  displayArea.value || props.property.rooms || cleanFloor(props.property.floor)
)

const hasFeatures = computed(() =>
  props.property.features && props.property.features.length > 0
)
```

**template card-specs 부분 교체:**
```vue
<div class="card-specs" v-if="hasValidSpecs">
  <template v-if="displayArea">
    <div class="spec-item">
      <PhRuler :size="14" />
      <span>{{ displayArea }}</span>
    </div>
    <div class="spec-divider" v-if="property.rooms || cleanFloor(property.floor)">•</div>
  </template>
  <!-- rooms, floor 기존 로직 유지 -->
</div>

<div class="card-features" v-if="hasFeatures">
  <!-- 기존 유지 -->
</div>
```

**image-fallback 스타일 개선:**
```css
.image-fallback {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 107, 61, 0.05), transparent);
}

.fallback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

/* 카드 높이 일관성 */
.card-content {
  min-height: 140px;
}

.card-features {
  margin-top: auto;
}
```

---

## 6. PropertyListMode.vue (P1)

### 변경사항
1. 검색창 헤더로 분리
2. 퀵 필터 스타일 개선
3. 필터 적용 개수 배지
4. 빈 상태 UI 개선

### import 추가
```javascript
import { ref, computed } from 'vue'
import { PhMagnifyingGlass, PhX, PhSliders } from '@phosphor-icons/vue'
```

> [!NOTE]
> `@vueuse/core`는 현재 `package.json`에 없음. 의존성 추가를 피하려면 `setTimeout` 기반 간단 디바운스를 사용합니다.
>
> 또한 “검색이 서버 재조회인지 / 클라이언트 필터인지”를 아래 중 하나로 확정합니다.
> - A안(서버 재조회): 디바운스 후 `propertyStore.searchProperties(keyword)` 또는 `updateFilters + fetchProperties()` 호출
> - B안(클라이언트 필터): `updateFilters({ keyword })`만으로 충분(추가 의존성/디바운스 불필요)

### 검색 관련 로직 추가 (디바운스 적용)
```javascript
const searchKeyword = ref('')

// (A안) 300ms 디바운스로 API 호출 최적화 (의존성 없이 구현)
let searchTimer = null
function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    // 서버 재조회 방식 중 택1
    // 1) propertyStore.searchProperties(searchKeyword.value)
    // 2) propertyStore.updateFilters({ keyword: searchKeyword.value }); await propertyStore.fetchProperties()
  }, 300)
}

function handleSearch() {
  debouncedSearch()
}

function clearSearch() {
  searchKeyword.value = ''
  // 서버 재조회 방식 중 택1
  // 1) propertyStore.searchProperties('')
  // 2) propertyStore.updateFilters({ keyword: '' }); await propertyStore.fetchProperties()
}

const activeFilterCount = computed(() => {
  let count = 0
  // 기준: store.hasActiveFilters 로직과 동일하게 맞추되, sido 기본값은 제외
  if (filters.value.sigungu) count++
  if (filters.value.priceMin || filters.value.priceMax) count++
  if (filters.value.areaMin || filters.value.areaMax) count++
  if (filters.value.propertyType) count++
  if (filters.value.transactionType) count++
  if (filters.value.rooms) count++
  if (filters.value.bathrooms) count++
  if (filters.value.features && filters.value.features.length > 0) count++
  if (filters.value.keyword) count++
  if (filters.value.favoritesOnly) count++
  return count
})
```

### template 구조
```vue
<template>
  <div class="property-list-mode">
    <!-- 헤더 -->
    <div class="list-header">
      <h2 class="list-title">매물 목록 ({{ filteredProperties.length }})</h2>
      <button @click="$emit('openFilters')" class="filter-icon-btn">
        <PhSliders :size="20" weight="bold" />
        <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- 검색창 (NEW) -->
    <div class="search-bar">
      <PhMagnifyingGlass :size="20" class="search-icon" />
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="아파트명, 지역 검색..."
        class="search-input"
        @input="handleSearch"
      />
      <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">
        <PhX :size="16" />
      </button>
    </div>

    <!-- 퀵 필터 기존 유지 -->
    <!-- 그리드 기존 유지 -->
  </div>
</template>
```

### 추가 스타일
```css
/* 검색바 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  margin: 0 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

html[data-theme="night"] .search-bar {
  background: rgba(60, 60, 60, 0.5);
  border-color: rgba(255, 255, 255, 0.05);
}

.search-icon { color: var(--showroom-text-day); opacity: 0.5; }
html[data-theme="night"] .search-icon { color: var(--showroom-text-night); }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .search-input { color: var(--showroom-text-night); }

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--showroom-text-day);
  opacity: 0.5;
}

/* 필터 배지 */
.filter-icon-btn { position: relative; }

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand-accent);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 퀵 필터 개선 */
.chip-btn {
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1.5px solid rgba(0, 0, 0, 0.08);
}

.chip-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.chip-btn.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 107, 61, 0.3);
}
```

---

## 7. PropertyFilters.vue (P1)

### 전면 재설계
1. 검색 필드 제거 (헤더로 이동됨)
2. 섹션 그룹화 (카드 형태)
3. 가격/면적 프리셋 버튼 추가

> [!NOTE]
> 검색 필드를 제거하더라도, 모달에서 `handleReset()` 시 `keyword`까지 초기화할지 여부를 정합니다.
> - A안: 필터 초기화=검색어도 초기화(일관성)
> - B안: 검색어는 헤더 UI에서만 관리(모달 초기화에서 제외)

### import 추가 (아이콘)
```javascript
import { PhMapPin, PhCurrencyKrw, PhRuler, PhHeart, PhSortAscending } from '@phosphor-icons/vue'
```

### 프리셋 데이터
```javascript
// 가격 단위: 만원 (propertyStore.js 기준)
const pricePresets = [
  { label: '1억 이하', min: null, max: 10000 },
  { label: '1~3억', min: 10000, max: 30000 },
  { label: '3~5억', min: 30000, max: 50000 },
  { label: '5~10억', min: 50000, max: 100000 },
  { label: '10억 이상', min: 100000, max: null }
]

// 면적 단위: 평 (propertyStore.js 기준)
const areaPresets = [
  { label: '10평대', min: 10, max: 19 },
  { label: '20평대', min: 20, max: 29 },
  { label: '30평대', min: 30, max: 39 },
  { label: '40평 이상', min: 40, max: null }
]

function applyPricePreset(preset) {
  localFilters.value.priceMin = preset.min
  localFilters.value.priceMax = preset.max
}

function applyAreaPreset(preset) {
  localFilters.value.areaMin = preset.min
  localFilters.value.areaMax = preset.max
}

function isPricePresetActive(preset) {
  return localFilters.value.priceMin === preset.min &&
         localFilters.value.priceMax === preset.max
}

function isAreaPresetActive(preset) {
  return localFilters.value.areaMin === preset.min &&
         localFilters.value.areaMax === preset.max
}
```

### template 구조
```vue
<div class="filters-body">
  <!-- 지역 섹션 -->
  <section class="filter-section">
    <h3 class="section-title"><PhMapPin :size="20" /> 지역</h3>
    <div class="filter-content">
      <!-- 기존 select 유지 -->
    </div>
  </section>

  <!-- 가격 섹션 -->
  <section class="filter-section">
    <h3 class="section-title"><PhCurrencyKrw :size="20" /> 가격</h3>
    <div class="preset-buttons">
      <button
        v-for="preset in pricePresets"
        :key="preset.label"
        :class="{ active: isPricePresetActive(preset) }"
        @click="applyPricePreset(preset)"
      >{{ preset.label }}</button>
    </div>
    <div class="range-inputs">
      <!-- 기존 input 유지 -->
    </div>
  </section>

  <!-- 면적 섹션 -->
  <section class="filter-section">
    <h3 class="section-title"><PhRuler :size="20" /> 면적</h3>
    <div class="preset-buttons">
      <button
        v-for="preset in areaPresets"
        :key="preset.label"
        :class="{ active: isAreaPresetActive(preset) }"
        @click="applyAreaPreset(preset)"
      >{{ preset.label }}</button>
    </div>
    <div class="range-inputs">
      <!-- 기존 input 유지 -->
    </div>
  </section>

  <!-- 매물유형/관심매물/정렬 섹션들... -->
</div>
```

### 추가 스타일
```css
.filter-section {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

html[data-theme="night"] .filter-section {
  background: rgba(60, 60, 60, 0.4);
  border-color: rgba(255, 255, 255, 0.03);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .section-title {
  color: var(--showroom-text-night);
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--showroom-text-day);
}

html[data-theme="night"] .preset-buttons button {
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--showroom-text-night);
}

.preset-buttons button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.preset-buttons button.active {
  background: var(--brand-accent);
  border-color: var(--brand-accent);
  color: white;
}
```

---

## 구현 순서 체크리스트

- [ ] 1. PropertyDetailMode.vue - 1열 레이아웃
- [ ] 2. PropertySpecs.vue - 조건부 렌더링
- [ ] 3. PropertyGallery.vue - 이미지 fallback
- [ ] 4. PropertyBasicInfo.vue - 조건부 렌더링
- [ ] 5. PropertyCard.vue - 면적/feature/fallback
- [ ] 6. PropertyListMode.vue - 검색창 + 필터배지
- [ ] 7. PropertyFilters.vue - 전면 재설계

---

## 테스트 체크리스트

- [ ] Day 모드에서 모든 UI 확인
- [ ] Night 모드에서 모든 UI 확인
- [ ] 데이터 없는 매물 카드 표시 확인
- [ ] 이미지 로드 실패 시 fallback 확인
- [ ] 검색 기능 동작 확인
- [ ] 필터 프리셋 버튼 동작 확인
- [ ] 필터 적용 개수 배지 표시 확인
