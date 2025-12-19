# Collection Feature 구현 현황

> **작성일**: 2025-12-19  
> **기준 문서**: [COLLECTION_FEATURE_PRD.md](./COLLECTION_FEATURE_PRD.md)

---

## 1. 구현 상태 요약

| 기능 영역 | 구현 상태 | 비고 |
|----------|----------|------|
| **CollectionView 화면** | 🟡 부분 완료 | UI 구조 완성, 기능 연동 미완료 |
| **Hero Crystal Section** | 🟡 부분 완료 | 표시만 완료, 클릭 이벤트 미구현 |
| **Mini Crystal Grid** | 🟡 부분 완료 | 선택 기능 완료, 데이터 연동 미완료 |
| **Journey Replay** | 🟢 완료 | JourneyReplayView.vue 구현 완료 |
| **API 연동** | 🔴 미완료 | 플레이스홀더 데이터 사용 중 |
| **Day/Night 테마** | 🟢 완료 | CrystalBall 컴포넌트에서 지원 |

### 범례
- 🟢 완료
- 🟡 부분 완료
- 🔴 미완료

---

## 2. 파일별 구현 상태

### 2.1 CollectionView.vue

**파일 경로**: `src/views/CollectionView.vue`

| 항목 | 상태 | 설명 |
|------|------|------|
| Hero Crystal 표시 | ✅ | CrystalBall 컴포넌트 렌더링 |
| 선택된 집 이름 표시 | ✅ | `selected-name` 클래스로 표시 |
| Mini Crystal Grid | ✅ | 3x2 그리드 레이아웃 완성 |
| 그리드 반응형 | ✅ | 모바일 1열, 태블릿 2열, 데스크탑 3열 |
| 선택 인터랙션 | ✅ | 미니 크리스탈 클릭 시 selectedIndex 변경 |
| 활성 상태 스타일 | ✅ | 황금색 테두리 + 글로우 효과 |
| SnowCanvas 효과 | ✅ | 배경에 눈 내리는 애니메이션 |
| Empty State UI | ✅ | 컬렉션 비어있을 때 안내 메시지 |
| **Hero 클릭 → Journey 이동** | ❌ | 클릭 이벤트 및 라우팅 미구현 |
| **API 데이터 연동** | ❌ | 플레이스홀더 데이터 사용 중 |
| **진행 중인 집 구분 표시** | ❌ | inProgress 항목 UI 미구현 |

#### 현재 사용 중인 플레이스홀더 데이터

```javascript
const collections = ref([
  { id: 1, name: '서울 강남 오피스텔' },
  { id: 2, name: '부산 해운대 아파트' },
  { id: 3, name: '제주 애월 타운하우스' },
  { id: 4, name: '경기 분당 단독주택' },
  { id: 5, name: '인천 송도 신축빌라' },
  { id: 6, name: '대전 유성 전원주택' }
])
```

---

### 2.2 CrystalBall.vue

**파일 경로**: `src/components/CrystalBall.vue`

| 항목 | 상태 | 설명 |
|------|------|------|
| Day/Night 모드 전환 | ✅ | 테마에 따른 스타일 변경 |
| Specular Glare 효과 | ✅ | 상단 왼쪽 하이라이트 반사 |
| Ground Shadow | ✅ | 바닥 그림자 효과 |
| 인테리어 이미지 레이어 | ✅ | background + overlay 레이어 시스템 |
| 이미지 프리로딩 | ✅ | Day/Night 이미지 미리 로드 |
| 로딩/에러 상태 UI | ✅ | 스피너 및 에러 메시지 표시 |
| **themeCode props 연동** | ✅ | 테마별 인테리어 이미지 로드 |

---

### 2.3 JourneyReplayView.vue

**파일 경로**: `src/views/JourneyReplayView.vue`

| 항목 | 상태 | 설명 |
|------|------|------|
| 스크롤 기반 Phase 전환 | ✅ | 스크롤 비율로 currentPhase 계산 |
| 11단계 Phase 시스템 | ✅ | totalPhases = 11 고정 |
| Phase 이미지 표시 | ✅ | 단계별 이미지 렌더링 |
| 타임라인 UI | ✅ | 현재 Phase 표시 |
| **maxUnlockedPhase 처리** | ❌ | 진행 중인 집의 잠금 처리 미구현 |
| **API 연동** | ❌ | 플레이스홀더 또는 임시 데이터 사용 |

---

### 2.4 API 서비스

**파일 경로**: `src/api/services/collectionService.js`

| 항목 | 상태 | 설명 |
|------|------|------|
| getCollections() | 🟡 | 구현됨, 실제 API 연동 확인 필요 |
| getCollectionJourney(id) | 🟡 | 구현됨, 실제 API 연동 확인 필요 |
| **getActiveJourney()** | ❌ | 진행 중인 집 여정 조회 미구현 |

---

## 3. 미구현 기능 목록

### 3.1 우선순위 High

| 기능 | 설명 | 예상 작업량 |
|------|------|-----------|
| Hero Crystal 클릭 이벤트 | 클릭 시 Journey Replay로 라우팅 | 1시간 |
| API 데이터 연동 | 플레이스홀더 → 실제 API 호출 | 2시간 |
| 진행 중인 집 표시 | inProgress 항목 UI 및 스타일 | 2시간 |

### 3.2 우선순위 Medium

| 기능 | 설명 | 예상 작업량 |
|------|------|-----------|
| Journey 잠금 처리 | 미도달 Phase 스크롤 제한 | 2시간 |
| Journey 진입점 분기 | collectionId vs in-progress 라우팅 | 1시간 |

### 3.3 우선순위 Low

| 기능 | 설명 | 예상 작업량 |
|------|------|-----------|
| 스크롤 힌트 UI | 사용자 가이드 토스트/툴팁 | 1시간 |
| 공유하기 기능 | 완성된 집 이미지 공유 | 3시간 |

---

## 4. 다음 단계 (Recommended Actions)

### Phase 1: Hero → Journey 연결 (필수)

1. `CollectionView.vue`에 Hero Crystal 클릭 핸들러 추가
2. `router`를 통해 `JourneyReplayView`로 이동
3. 선택된 컬렉션 ID 또는 "in-progress" 플래그 전달

```vue
<!-- 예시 코드 -->
<div class="main-crystal-container" @click="goToJourney">
  <CrystalBall :key="selectedIndex" />
</div>

<script setup>
const goToJourney = () => {
  const item = collections.value[selectedIndex.value]
  router.push(`/collection/${item.id}/journey`)
}
</script>
```

### Phase 2: API 연동

1. `collectionService.getCollections()` 호출
2. 응답 데이터로 `collections` 및 `inProgress` 상태 업데이트
3. 에러/로딩 상태 처리

### Phase 3: 진행 중인 집 구분

1. `inProgress` 항목을 그리드 최상단에 표시
2. 🏗️ 뱃지 및 진행률 표시
3. Journey Replay에서 잠금 처리 구현

---

## 5. 관련 라우트

| 라우트 | 컴포넌트 | 상태 |
|--------|---------|------|
| `/collection` | CollectionView | ✅ 등록됨 |
| `/collection/:id/journey` | JourneyReplayView | ⚠️ 확인 필요 |
| `/journey/active` | JourneyReplayView | ❌ 미등록 |

---

## 6. 현재 디자인 스크린샷

> 현재 구현된 디자인은 예전 디자인으로 복원된 상태입니다.
>
> - Hero Crystal: 큰 유리구슬 + Day/Night 인테리어 이미지
> - Mini Grid: 3열 그리드 + 호버 효과 + 선택 시 황금 테두리
> - 배경: SnowCanvas 눈 효과

---

_Last Updated: 2025-12-19_
