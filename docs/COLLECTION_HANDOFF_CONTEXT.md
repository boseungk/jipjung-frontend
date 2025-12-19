# Collection Feature - 현재 상황 컨텍스트

> **작성**: 2025-12-19 13:53  
> **목적**: 다른 AI/개발자가 현재 상황을 빠르게 이해할 수 있도록 정리

---

## 1. 프로젝트 개요

**집-중 (jipjung)** - 드림홈 저축 앱
- **Frontend**: Vue 3 + Pinia + Vue Router (`jipjung-frontend/`)
- **Backend**: Spring Boot (`jipjung-backend/`)

---

## 2. Collection Feature 설명

### 화면 구조
```
/collection (CollectionView.vue)
    ├── Hero Crystal Section (큰 크리스탈 볼 - 클릭하면 Journey로 이동)
    └── Mini Crystal Grid (완성된 컬렉션 목록)

/collection/:id/journey (JourneyReplayView.vue)
    └── 스크롤 기반 집짓기 애니메이션 (11단계)
```

### 데이터 흐름
```
CollectionView
    └── collectionStore.fetchCollections()
        └── collectionService.getCollections()
            └── GET /api/collection
                └── 응답: { collections: [], inProgress: null }
```

---

## 3. 현재 문제

### 증상
- `/collection` 페이지에서 Hero Crystal 클릭 시 **아무 반응 없음**
- Journey 화면(`/collection/:id/journey`)으로 이동하지 않음

### 원인
Console 로그 확인 결과:
```
[goToJourney] selectedIndex: -1
[goToJourney] inProgress: null
[goToJourney] collections: [] (빈 배열)
[goToJourney] No valid journey target
```

**→ API에서 데이터가 반환되지 않음** (collections가 빈 배열, inProgress가 null)

### 가능한 원인
1. **백엔드 API 미구현** 또는 데이터 없음
2. **API 응답 형식 불일치**
3. **인증 문제** (토큰 없음 등)

---

## 4. 관련 파일

### Frontend
| 파일 | 역할 |
|------|------|
| `src/views/CollectionView.vue` | 컬렉션 목록 화면 |
| `src/views/JourneyReplayView.vue` | 여정 애니메이션 화면 |
| `src/stores/collectionStore.js` | Pinia 스토어 (상태 관리) |
| `src/api/services/collectionService.js` | API 호출 서비스 |
| `src/api/endpoints.js` | API 엔드포인트 상수 |
| `src/router/index.js` | 라우터 설정 |

### Backend (확인 필요)
- `/api/collection` - GET: 컬렉션 목록
- `/api/collection/{id}/journey` - GET: 여정 상세
- `/api/collection/in-progress/journey` - GET: 진행 중 여정

---

## 5. 구현 완료된 부분

### Frontend ✅
- [x] `--bento-*` CSS 변수 전역화 (`core/variables.css`)
- [x] CollectionView API 연동 (collectionStore 사용)
- [x] `goToJourney()` 라우팅 로직
- [x] 진행 중 집 UI (🏗️ 뱃지)
- [x] JourneyReplayView `route.query.mode` 분기
- [x] JourneyReplayView CSS 디자인 시스템 통일

### 미확인 ❓
- [ ] Backend `/api/collection` 엔드포인트 구현 상태
- [ ] 테스트 데이터 존재 여부

---

## 6. 다음 단계 (선택)

### Option A: Mock 데이터로 테스트
- Frontend에서 임시 데이터로 Journey 화면이 작동하는지 확인

### Option B: Backend API 확인
- `/api/collection` 응답 형식 확인
- 컨트롤러/서비스 구현 상태 확인

---

## 7. API 응답 기대 형식

```typescript
// GET /api/collection
{
  collections: [
    {
      collectionId: 1,
      themeCode: "CLASSIC",
      propertyName: "서울 강남 오피스텔",
      completedAt: "2025-01-01"
    }
  ],
  inProgress: {
    dreamHomeId: 2,
    themeCode: "HANOK",
    propertyName: "부산 해운대 아파트",
    currentPhase: 5,
    totalPhases: 11
  },
  totalCount: 1,
  activeGoalExists: true
}
```

---

## 8. 주요 코드 스니펫

### goToJourney (CollectionView.vue)
```javascript
function goToJourney() {
  if (selectedIndex.value === -1 && inProgress.value) {
    router.push({
      path: `/collection/${inProgress.value.dreamHomeId}/journey`,
      query: { mode: 'active' }
    })
    return
  }
  
  const item = collections.value[selectedIndex.value]
  if (item?.collectionId) {
    router.push(`/collection/${item.collectionId}/journey`)
    return
  }
  
  console.warn('[goToJourney] No valid journey target')
}
```

### collectionStore.fetchCollections()
```javascript
async function fetchCollections() {
  const data = await collectionService.getCollections()
  collections.value = data?.collections ?? []
  inProgress.value = data?.inProgress ?? null
}
```
