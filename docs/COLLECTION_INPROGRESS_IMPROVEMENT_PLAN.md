# 컬렉션 진행 중 목표 스크롤 기능 개선 계획안

> **작성일**: 2025-12-18  
> **상태**: 검토 대기  
> **목표**: 진행 중인 드림홈도 현재까지 완료한 단계까지 스크롤로 볼 수 있도록 기능 확장

---

## 0. 검토 메모 (코드 기준)

### 0.1 “완성 후에도 만드는 중 문구”의 실제 출처
- 프론트 코드상 문자열 `"만드는 중"`은 현재 발견되지 않았습니다.
- 다만 `CollectionView.vue`에서 **컬렉션이 0개이고 `activeGoalExists === true`일 때** Empty State로 `"곧 첫 번째 집이 완성돼요! 🏗️"` 문구를 노출합니다.
  - 즉, 사용자 입장에서는 “완성했는데도(혹은 완성했다고 느끼는데도) 계속 만드는 중처럼 보임” 현상이 이 조건에서 발생합니다.

### 0.2 “완성했는데 컬렉션이 0개”가 되는 가능 케이스(추정)
- **실제 목표(드림홈) 100% 달성은 아직인데**(= 컬렉션 등록 트리거 미발생) “집 완성”으로 인지한 경우
- 목표 100% 달성은 했는데 `user_collection` 등록이 실패/누락된 경우(예: completion 트리거 미호출, DB 제약/트랜잭션 등)
  - 이 경우는 백엔드 로그(`DreamHomeService.checkAndUpdateCompletion` → `CollectionService.registerOnCompletion`)로 확인 가능

### 0.3 스크롤 제한 구현(프론트) 관점 메모
- `JourneyReplayView.vue`는 `totalPhases = 11` 고정 + 스크롤 비율로 `currentPhase`를 계산합니다.
- “진행 중은 현재 단계까지만 스크롤” 요구사항은 **백엔드가 별도 필드를 주지 않아도**, 응답의 `phases[].reachedAt`로 `maxUnlockedPhase`를 계산해 **클램프(clamp)** 처리하는 방식으로 구현 가능합니다.

## 1. 현재 상태 분석

### 1.1 기존 동작 방식

| 구분 | 현재 동작 |
|------|----------|
| 컬렉션 목록 | `COMPLETED` 상태의 드림홈만 표시 |
| 진행 중 목표 | Empty State로 "곧 첫 번째 집이 완성돼요! 🏗️" 메시지 표시 |
| 저축 여정 리플레이 | 완성된 컬렉션만 접근 가능 |

### 1.2 관련 파일

#### Frontend
| 파일 | 역할 |
|------|------|
| [CollectionView.vue](../src/views/CollectionView.vue) | 컬렉션 목록 화면 |
| [JourneyReplayView.vue](../src/views/JourneyReplayView.vue) | 저축 여정 스크롤 리플레이 화면 |
| [collectionService.js](../src/api/services/collectionService.js) | 컬렉션 API 서비스 |

#### Backend
| 파일 | 역할 |
|------|------|
| [CollectionService.java](../../jipjung-backend/src/main/java/com/jipjung/project/service/CollectionService.java) | 컬렉션 비즈니스 로직 |
| [CollectionController.java](../../jipjung-backend/src/main/java/com/jipjung/project/controller/CollectionController.java) | 컬렉션 API 엔드포인트 |
| [CollectionMapper.xml](../../jipjung-backend/src/main/resources/mapper/CollectionMapper.xml) | 컬렉션 쿼리 |

### 1.3 발견된 문제점

> [!WARNING]
> **문제 1**: "만드는 중" 문구가 집 완성 후에도 표시됨
> 
> 원인 분석 필요: 실제 코드에서 `"만드는 중"` 문자열은 발견되지 않았으나, Empty State의 `"곧 첫 번째 집이 완성돼요!"` 메시지가 “만드는 중”으로 인지될 수 있음.

> [!IMPORTANT]
> **문제 2**: 진행 중인 목표는 스크롤 리플레이 접근 불가
> 
> 현재 `JourneyReplayView`는 완성된 컬렉션(user_collection)의 ID를 기반으로 조회하므로, 진행 중인 드림홈은 접근 경로가 없음.

---

## 2. 요구사항 변경

### 2.0 용어/완성 정의(합의 필요)
- **“집 완성” = 인테리어 마지막 단계(Phase 11, `TOTAL_PHASES=11`)까지 도달한 상태**로 정의합니다.
- 단, 이번 변경의 핵심은 “집 완성(Phase 11)까지 너무 오래 걸린다”는 문제를 해결하기 위해 **완성 전(진행 중)에도 컬렉션에서 즉시 여정 리플레이를 볼 수 있게 하는 것**입니다.
  - 즉, 컬렉션 진입/리플레이 접근의 기준을 “완성(Phase 11)”이 아니라 **“현재까지 도달한 단계(<=Phase 11)”**로 확장합니다.

### 2.1 변경 전 (AS-IS)

```
사용자 → 목표 완전 달성 → user_collection 저장 → 컬렉션에서 여정 리플레이
```

### 2.2 변경 후 (TO-BE)

```
사용자 → 저축 진행 중 → 현재까지 도달한 단계까지 스크롤 리플레이 가능
        ↓
      목표 완전 달성 → 전체 여정 리플레이 (기존과 동일)
```

---

## 3. 제안하는 설계 옵션

### 옵션 A: 진행 중 드림홈을 컬렉션 목록에 포함 (권장)

컬렉션 목록 API 응답에 **활성 드림홈(ACTIVE)도 포함**하되, `status` 필드로 구분합니다.

> [!NOTE]
> **리스크(검토 포인트)**: 현재 프론트는 `v-for :key="item.collectionId"`로 렌더링합니다. 진행 중 항목의 `collectionId = null`은 키 충돌/경고를 유발할 수 있어, 설계 시 `dreamHomeId` 기반 key 또는 별도 필드 분리가 필요합니다.

> [!RECOMMENDATION]
> **권장 계약**: `collections[]`는 “완성된 컬렉션(user_collection)”만 유지하고, 진행 중은 `inProgress` 필드로 **별도 제공(additive)** 합니다(키 충돌/정렬/분기 비용 최소화).

```json
{
  "collections": [ /* 기존 completed 목록 */ ],
  "activeGoalExists": true,
  "inProgress": {
    "dreamHomeId": 15,
    "themeCode": "CLASSIC",
    "currentPhase": 4,
    "totalPhases": 11,
    "propertyName": "강남 오피스텔",
    "location": "서울 강남구"
  }
}
```

**장점:**
- 기존 UI 흐름 재사용 가능
- 사용자가 진행 중 목표도 컬렉션에서 확인 가능

**단점:**
- API 응답 구조 변경 필요
- 프론트엔드 분기 처리 추가

---

### 옵션 B: 대시보드에서 직접 여정 리플레이 진입점 추가

대시보드의 `IsometricRoomHero` 컴포넌트에서 클릭 시 현재 진행 상황 리플레이 화면으로 이동합니다.

**장점:**
- 컬렉션 API 변경 최소화
- 대시보드에서 자연스러운 진입

**단점:**
- 새로운 라우트 및 API 필요

---

## 4. 상세 변경 계획 (옵션 A 기준)

### 4.1 Backend 변경

#### [MODIFY] CollectionMapper.xml
- (권장) `findByUserId`는 기존대로 `user_collection` 기준 유지
- (권장) 별도 조회 추가:
  - 현재 목표(진행 중 드림홈) 요약 조회: `dream_home` + `apartment` + `dongcode` join
  - 진행 중 여정 이벤트 조회: 기존 `findJourneyEvents(dreamHomeId)` 재사용 가능

#### [MODIFY] CollectionService.java
- `getCollections()`: 기존 `collections`는 유지하되, **진행 중 요약(inProgress)을 선택적으로 포함**(additive change)

#### [MODIFY] CollectionController.java
- 기존 `/api/collection` 응답 확장(예: `inProgress` 필드 추가) 또는 진행 중 전용 엔드포인트 신설

#### [NEW] 진행 중 여정 엔드포인트 (권장)
- 예: `GET /api/collection/in-progress/journey`
  - 응답은 기존 `JourneyResponse`와 동일 형식(프론트 재사용 목적)
  - 접근 제어: 로그인 사용자 기준 “현재 목표(진행 중 드림홈)”만 조회 가능

#### [NEW] InProgressJourneyService.java (선택)
- 진행 중 드림홈의 여정 데이터 조회 로직 분리

---

### 4.2 Frontend 변경

#### [MODIFY] CollectionView.vue

**변경 내용:**
1. 진행 중 드림홈 표시 UI 추가 (컬렉션 그리드 최상단)
2. Empty State 조건 수정: 활성 목표도 없을 때만 표시
3. 진행 중 아이템 스타일 차별화 (예: 글로우 효과, 진행률 표시)

```vue
<!-- 진행 중인 드림홈 (가장 위에 표시) -->
<div v-if="inProgressHome" class="in-progress-item" @click="goToInProgressJourney">
  <CrystalBall class="crystal-in-progress" />
  <div class="progress-badge">{{ inProgressHome.currentPhase }}/{{ inProgressHome.totalPhases }}</div>
  <span class="label">🏗️ 진행 중</span>
</div>
```

#### [MODIFY] JourneyReplayView.vue

**변경 내용:**
1. 라우트 파라미터 확장: `collectionId` 기반(기존) + `in-progress` 기반(신규) 지원
2. 진행 중 여정은 현재 도달한 단계까지만 스크롤 가능
3. 미완료 단계는 잠금 표시 (자물쇠 아이콘 + 반투명)

```javascript
// 라우트: /collection/:id/journey 또는 /journey/active
const collectionId = route.params.id
const isActiveJourney = route.query.active === 'true'
```

#### [MODIFY] collectionService.js

**변경 내용:**
- `getActiveJourney()` 메서드 추가
- 진행 중 드림홈의 여정 데이터 조회

---

### 4.3 UI/UX 변경 사항

| 항목 | 완성된 컬렉션 | 진행 중 드림홈 |
|------|-------------|--------------|
| 위치 | 그리드 내 정렬 | **그리드 최상단 고정** |
| 투명도 | 100% | 90% + 펄스 애니메이션 |
| 뱃지 | ⭐ 대표 설정 | 🏗️ 진행 중 |
| 클릭 동작 | 전체 여정 리플레이 | 현재까지 단계 리플레이 |
| 스크롤 범위 | 1~11 전체 | 1~현재 단계 |

---

## 5. 검증 계획

### 5.1 자동화 테스트

현재 컬렉션 관련 E2E 테스트는 없음. 수동 테스트 우선 진행합니다.

### 5.2 수동 테스트

| 테스트 ID | 시나리오 | 예상 결과 |
|----------|---------|----------|
| T-01 | 진행 중 드림홈이 있는 사용자가 컬렉션 화면 진입 | 진행 중 드림홈이 그리드 최상단에 표시됨 |
| T-02 | 진행 중 드림홈 클릭 | 현재 도달 단계까지 스크롤 리플레이 가능 |
| T-03 | 미도달 단계로 스크롤 시도 | 잠금 상태 표시, 스크롤 멈춤 |
| T-04 | 완성된 컬렉션만 있는 사용자 | 기존과 동일하게 동작 |
| T-05 | 드림홈이 전혀 없는 사용자 | Empty State 표시 |

### 5.3 테스트 방법

1. **개발 서버 실행**
   ```bash
   cd jipjung-frontend && npm run dev
   cd jipjung-backend && ./mvnw spring-boot:run
   ```

2. **테스트 계정 로그인**: test@example.com

3. **컬렉션 화면 진입**: 좌측 메뉴 > 컬렉션

---

## 6. 결정 필요 사항

구현 전 다음 사항에 대한 결정이 필요합니다:

1. **옵션 선택**: 옵션 A(컬렉션에 진행 중 포함) vs 옵션 B(대시보드 진입점)
2. **미도달 단계 표시**: 잠금 아이콘 vs 흐리게 표시 vs 숨김
3. **진행 중 아이템 디자인**: 펄스 애니메이션 강도, 색상 등
4. **"만드는 중" 문구 정확한 위치**: 추가 조사 필요 시 알려주세요

---
## 7. 예상 작업량

| 단계 | 예상 시간 |
|------|----------|
| Backend API 확장 | 2시간 |
| Frontend 컬렉션 뷰 수정 | 2시간 |
| Frontend 여정 리플레이 수정 | 2시간 |
| 테스트 및 버그 수정 | 2시간 |
| **총계** | **8시간** |

---

## 8. `./goal-gamification-policy-v1.md`와의 정합성(검토)

> 결론: **관련 있음(상태/“현재 목표” 정의가 겹침)**. 다만 본 개선은 “컬렉션/리플레이 UX” 범위로도 독립적으로 진행 가능.

### 8.1 현 코드와 정책 문서의 불일치 지점(요약)
- 정책 문서(`./goal-gamification-policy-v1.md`)는 “현재 목표”를 `ACTIVE 우선, 없으면 최신 COMPLETED`로 정의합니다.
- 하지만 현 백엔드 구현은 `DreamHomeService.recordSavings()`가 `ACTIVE`만 허용하고, 목표 달성 시 `COMPLETED`로 전환합니다.
  - 이 구조에서는 “목표 달성 이후(>=100%)에도 계속 저축(초과 저축)”이 불가능합니다.
  - `CollectionResponse.activeGoalExists`도 `ACTIVE`만 검사(`hasActiveDreamHome`)하므로, 달성 이후 UI 판정에 영향을 줄 수 있습니다.

### 8.2 본 작업(진행 중 리플레이)에서 추천하는 안전한 방향
- “진행 중”을 `DreamHomeStatus.ACTIVE`로 한정해도 되지만, **향후 정책(v1) 반영 시 깨지지 않게** 하려면:
  - 백엔드에서 “현재 목표(currentGoal)” 조회 규칙을 공통화(정책 5.1)하고,
  - 컬렉션 화면의 `activeGoalExists`를 “현재 목표 존재 여부”로 재정의(필요 시 필드명 변경)하는 편이 안전합니다.
