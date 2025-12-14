# 활동 기반 스트릭 시스템 구현 계획서

> **문서 버전:** 1.0  
> **작성일:** 2025-12-12  
> **프로젝트:** JipJung (집중) - 감성 저축 게이미피케이션 앱

---

## 1. 개요

### 1.1 배경

기존 스트릭 시스템은 **매일 저축**을 해야만 유지되는 구조였습니다. 하지만 현실적으로:
- 월급은 월 1~2회
- 매일 저축은 부담스러움
- 연속 100일 저축은 비현실적

### 1.2 변경 목표

**활동 기반 스트릭**으로 전환하여:
- 저축 외에도 앱 활동으로 스트릭 유지 가능
- 자주 방문하도록 동기 부여
- 더 빈번한 마일스톤으로 성취감 제공

---

## 2. 핵심 규칙

### 2.1 스트릭 조건

| 항목 | 값 |
|-----|---|
| 유지 조건 | 하루에 **1개 이상 활동** 시 스트릭 유지 |
| 리셋 조건 | 하루 동안 **아무 활동도 없으면** 다음 날 리셋 |
| 기준 시간 | **KST (Asia/Seoul)** 00:00:00 ~ 23:59:59 |

> [!IMPORTANT]
> **타임존 규칙**: `activity_date`는 반드시 **KST (Asia/Seoul)** 기준으로 계산/저장합니다.
> 서버가 UTC로 운영되더라도 `Clock.system(ZoneId.of("Asia/Seoul"))`을 사용하여 KST 날짜를 산출합니다.

### 2.2 인정되는 활동 및 1일 제한 정책

| 활동 유형 | 코드 | EXP | 1일 제한 | 설명 |
|----------|------|-----|---------|------|
| 대시보드 접속 | `DASHBOARD` | 10 | ✅ 1회 | 매일 첫 접속 시에만 |
| AI 지출 분석 | `AI_ANALYSIS` | 30 | ✅ 1회 | 분석 완료 시 |
| AI 판결 완료 | `AI_JUDGMENT` | 20 | ✅ 1회 | 판결 완료 시 |
| 저축 기록 | `SAVINGS` | 50 | ✅ 1회 | 첫 저축만 EXP 지급 |

> [!NOTE]
> **1일 1회 정책**: 모든 활동 유형은 **하루에 1회만** EXP를 지급합니다.
> 같은 날 같은 활동을 반복해도 추가 EXP는 없습니다 (스키마 UNIQUE 제약과 일치).
> 단, 스트릭 유지 조건은 "1개 이상 활동"이므로 동일 활동 반복은 스트릭에 영향 없음.

### 2.3 마일스톤 보상

| 마일스톤 | 보너스 EXP | 메시지 |
|---------|-----------|--------|
| 7일 연속 | +50 EXP | 🔥 1주일 연속 접속! 꾸준함의 시작! |
| 14일 연속 | +100 EXP | 🌟 2주 연속! 습관이 되어가고 있어요! |
| 21일 연속 | +150 EXP | 💪 3주 연속! 이제 습관입니다! |
| 28일 연속 | +200 EXP | 🏆 4주 연속! 당신은 진정한 저축왕! |

### 2.4 일일 EXP 상한

| 항목 | 값 |
|-----|---|
| 하루 최대 EXP | **160 EXP** |
| 설명 | 마일스톤 보상은 별도 (상한에 불포함) |

---

## 3. 데이터 모델

### 3.1 신규 테이블: `daily_activity`

```sql
-- H2 / MySQL 공통
CREATE TABLE daily_activity (
    activity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(30) NOT NULL,
    exp_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 복합 유니크: 같은 날 같은 활동 유형은 1회만
    CONSTRAINT uk_user_activity_date_type 
        UNIQUE (user_id, activity_date, activity_type),
    
    FOREIGN KEY (user_id) REFERENCES `user`(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
```

### 3.2 기존 테이블 변경

#### `streak_milestone_reward` 마일스톤 변경

```sql
-- 기존: 7, 30, 100
-- 변경: 7, 14, 21, 28
-- 데이터 마이그레이션 불필요 (코드 상수만 변경)
```

#### `user` 테이블 (변경 없음)

기존 필드 그대로 사용:
- `streak_count` - 현재 연속일수
- `max_streak` - 최대 연속일수
- `last_streak_date` - 마지막 스트릭 참여일

---

## 4. 백엔드 구현

### 4.1 신규 파일

| # | 파일 경로 | 설명 |
|---|----------|------|
| 1 | `domain/ActivityType.java` | 활동 유형 enum |
| 2 | `domain/DailyActivity.java` | 일일 활동 도메인 |
| 3 | `repository/DailyActivityMapper.java` | Mapper 인터페이스 |
| 4 | `resources/mapper/DailyActivityMapper.xml` | MyBatis XML |

### 4.2 수정 파일

| # | 파일 경로 | 변경 내용 |
|---|----------|----------|
| 1 | `service/StreakService.java` | `participate(userId, ActivityType)` 시그니처 변경, 일일 상한 적용 |
| 2 | `service/DreamHomeService.java` | `ActivityType.SAVINGS` 전달 |
| 3 | `service/AiManagerService.java` | `analyze()` → `ActivityType.AI_ANALYSIS`, `judgment()` → `ActivityType.AI_JUDGMENT` |
| 4 | `service/DashboardService.java` | `getDashboard()` → `ActivityType.DASHBOARD` (1일 1회) |
| 5 | `resources/schema-h2.sql` | `daily_activity` 테이블 추가 |
| 6 | `resources/schema-mysql.sql` | `daily_activity` 테이블 추가 |

---

## 5. 상세 구현

### 5.1 ActivityType.java

```java
package com.jipjung.project.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 스트릭 인정 활동 유형
 */
@Getter
@RequiredArgsConstructor
public enum ActivityType {
    DASHBOARD("대시보드 접속", 10),
    GOAL_SETTING("목표 설정", 20),
    AI_ANALYSIS("AI 지출 분석", 30),
    AI_JUDGMENT("AI 판결", 20),
    SAVINGS("저축", 50);

    private final String label;
    private final int baseExp;
}
```

### 5.2 DailyActivity.java

```java
package com.jipjung.project.domain;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivity {
    private Long activityId;
    private Long userId;
    private LocalDate activityDate;
    private String activityType;
    private Integer expEarned;
    private LocalDateTime createdAt;
}
```

### 5.3 StreakService 변경 (핵심 로직)

> [!IMPORTANT]
> **동시성/멱등성 전략**:
> - `@Transactional` + DB UNIQUE 제약으로 멱등성 보장 (동일 활동 중복 삽입 시 예외)
> - 상한/스트릭 처리는 사용자 단위로 원자적 실행 (`user` 테이블 갱신이 직렬화 포인트)
> - 마일스톤 중복 방지는 `streak_milestone_reward` 테이블 UNIQUE로 보장

```java
// 상수 변경
private static final int DAILY_EXP_CAP = 160;  // 일일 상한
private static final Map<Integer, Integer> MILESTONE_REWARDS = Map.of(
    7, 50,
    14, 100,
    21, 150,
    28, 200
);

// KST 타임존 명시
private static final ZoneId ZONE_KST = ZoneId.of("Asia/Seoul");
private final Clock clock = Clock.system(ZONE_KST);

/**
 * 활동 기반 스트릭 참여
 * <p>
 * 멱등성 보장: 같은 날 같은 활동 유형은 DB UNIQUE로 중복 방지.
 * 동시성 안전: 트랜잭션 내에서 user row 갱신으로 직렬화.
 *
 * @param userId 사용자 ID
 * @param activityType 활동 유형
 * @return 스트릭 결과 (획득 EXP, 레벨업 여부 등)
 */
@Transactional
public StreakResult participate(Long userId, ActivityType activityType) {
    LocalDate today = LocalDate.now(clock);  // KST 기준

    // 1. 이 활동 유형으로 오늘 이미 참여했는지 확인 (멱등성)
    if (dailyActivityMapper.existsByUserIdAndDateAndType(userId, today, activityType.name())) {
        return StreakResult.alreadyParticipated();
    }

    // 2. 오늘 총 획득 EXP 확인 (상한 체크)
    int todayTotalExp = dailyActivityMapper.sumExpByUserIdAndDate(userId, today);
    int remainingCap = Math.max(0, DAILY_EXP_CAP - todayTotalExp);
    int earnedExp = Math.min(activityType.getBaseExp(), remainingCap);

    // 3. 활동 기록 저장 (UNIQUE 제약으로 중복 시 예외 발생 → 멱등성)
    DailyActivity activity = DailyActivity.builder()
            .userId(userId)
            .activityDate(today)
            .activityType(activityType.name())
            .expEarned(earnedExp)
            .build();
    dailyActivityMapper.insert(activity);

    // 4. 오늘 첫 활동인지 확인 (스트릭 증가 여부)
    boolean isFirstActivityToday = dailyActivityMapper.countByUserIdAndDate(userId, today) == 1;
    
    User user = userMapper.findById(userId);
    int newStreakCount = nullToZero(user.getStreakCount());
    int newMaxStreak = nullToZero(user.getMaxStreak());
    
    if (isFirstActivityToday) {
        newStreakCount = calculateNewStreakCount(user, today);
        newMaxStreak = Math.max(newStreakCount, newMaxStreak);
        userMapper.updateStreak(userId, newStreakCount, newMaxStreak, today);
    }

    // 5. EXP 적용 및 레벨업 체크
    if (earnedExp > 0) {
        int oldLevel = nullToDefault(user.getCurrentLevel(), 1);
        userMapper.addExp(userId, earnedExp);
        User updatedUser = userMapper.findById(userId);
        boolean isLevelUp = checkAndApplyLevelUp(userId, oldLevel, updatedUser.getCurrentExp());
        
        return new StreakResult(
            newStreakCount, newMaxStreak, earnedExp, isLevelUp, false, activityType
        );
    }

    // 상한 도달 (EXP 0이지만 스트릭은 유지됨)
    return new StreakResult(newStreakCount, newMaxStreak, 0, false, false, activityType);
}
```

### 5.4 DashboardService 통합

```java
@Transactional
public DashboardResponse getDashboard(Long userId) {
    // 기존 로직...
    
    // 대시보드 접속 시 스트릭 참여 (1일 1회)
    try {
        streakService.participate(userId, ActivityType.DASHBOARD);
    } catch (Exception e) {
        log.warn("Dashboard streak participation failed", e);
        // 실패해도 대시보드 조회는 진행
    }
    
    // 기존 응답 생성 로직...
}
```

### 5.5 AiManagerService 통합

```java
// analyze 메서드 마지막에 추가
streakService.participate(userId, ActivityType.AI_ANALYSIS);

// judgment 메서드 마지막에 추가
streakService.participate(userId, ActivityType.AI_JUDGMENT);
```

---

## 6. 프론트엔드 변경

### 6.1 WeeklyStreakCard.vue

```vue
<!-- 힌트 문구 변경 -->
<p class="streak-hint">
  <AppIcon name="info" :size="16" :active="true" class="hint-icon" />
  <span>매일 앱을 방문하면 불꽃이 켜지고 EXP를 받아요!</span>
</p>
```

### 6.2 constants/user.js

마일스톤 상수 추가 (프론트 표시용):

```javascript
export const STREAK_MILESTONES = [
  { days: 7, exp: 50, label: '1주일 연속 접속!' },
  { days: 14, exp: 100, label: '2주 연속!' },
  { days: 21, exp: 150, label: '3주 연속!' },
  { days: 28, exp: 200, label: '4주 연속!' }
]
```

---

## 7. API 변경사항

### 7.1 저축 응답 (변경 없음)

`POST /api/dream-home/savings` 응답의 `streakInfo`는 그대로 유지.

### 7.2 마일스톤 클레임 흐름

> [!NOTE]
> **마일스톤 지급 방식**: 기존 클레임 API 기반 유지 (자동 지급 아님)
> - 사용자가 `POST /api/streak/reward`로 직접 클레임
> - `streak_milestone_reward` 테이블로 중복 방지
> - 프론트에서 `claimable: true`인 마일스톤에 "수령" 버튼 표시

#### 마일스톤 조회

`GET /api/streak/milestones` 응답 마일스톤 변경:

```json
{
  "data": [
    { "days": 7, "expReward": 50, "claimable": true, "claimed": false },
    { "days": 14, "expReward": 100, "claimable": false, "claimed": false },
    { "days": 21, "expReward": 150, "claimable": false, "claimed": false },
    { "days": 28, "expReward": 200, "claimable": false, "claimed": false }
  ]
}
```

#### 마일스톤 클레임

`POST /api/streak/reward`는 기존과 동일하게 유지.
마일스톤 상수만 변경 (7/14/21/28).

---

## 8. 마이그레이션 전략

### 8.1 기존 데이터 처리

| 항목 | 전략 |
|-----|------|
| 기존 `streak_history` | 유지 (하위 호환), 새 로직은 `daily_activity` 사용 |
| 기존 `streak_milestone_reward` | 7일 보상 수령자는 새 7일 보상 수령 불가 (중복 방지) |
| `user.streak_count` | 그대로 유지, 새 로직으로 갱신 |

### 8.2 배포 시 스트릭 보존 (그레이스 기간)

> [!WARNING]
> **문제**: 기존 `last_streak_date`는 "저축 기반"으로만 갱신되었습니다.
> 배포 후 첫 활동에서 "어제 저축 안 했으니 리셋"이 발생할 수 있습니다.

**해결 방안 (택1):**

| 방안 | 설명 | 권장 |
|-----|------|------|
| A. 그레이스 기간 | 배포 후 7일간은 스트릭 리셋 안 함 | ⭐ 추천 |
| B. 일괄 보정 | 배포 시점에 `last_streak_date = 배포일-1`로 업데이트 | 간단 |
| C. 리셋 허용 | 기존 스트릭 리셋 (공지 필요) | 리스크 |

**구현 (방안 A):**
```java
private static final LocalDate DEPLOYMENT_DATE = LocalDate.of(2025, 12, 15);
private static final int GRACE_PERIOD_DAYS = 7;

private int calculateNewStreakCount(User user, LocalDate today) {
    LocalDate lastDate = user.getLastStreakDate();
    
    // 그레이스 기간 중이면 리셋하지 않음
    if (today.isBefore(DEPLOYMENT_DATE.plusDays(GRACE_PERIOD_DAYS))) {
        return nullToZero(user.getStreakCount()) + 1;
    }
    
    // 기존 로직...
}
```

---

## 9. 구현 순서

### Phase 1: 스키마 & 도메인 (1단계)
- [ ] `daily_activity` 테이블 추가 (schema-h2.sql, schema-mysql.sql)
- [ ] `ActivityType.java` enum 생성
- [ ] `DailyActivity.java` 도메인 생성
- [ ] `DailyActivityMapper.java` + XML 생성

### Phase 2: 서비스 로직 (2단계)
- [ ] `StreakService.java` 리팩토링
  - `participate(userId, ActivityType)` 메서드 변경
  - 일일 EXP 상한 로직
  - 마일스톤 상수 변경 (7/14/21/28)
- [ ] `StreakResult` record에 `activityType` 필드 추가

### Phase 3: 서비스 통합 (3단계)
- [ ] `DreamHomeService.java` - `ActivityType.SAVINGS` 전달
- [ ] `AiManagerService.java` - analyze/judgment 통합
- [ ] `DashboardService.java` - 대시보드 접속 시 DASHBOARD 활동

### Phase 4: 프론트엔드 (4단계)
- [ ] `WeeklyStreakCard.vue` 문구 변경
- [ ] `constants/user.js` 마일스톤 상수 추가

### Phase 5: 검증 (5단계)
- [ ] 빌드 확인
- [ ] Swagger UI 테스트
- [ ] 대시보드 접속 → 스트릭 증가 확인
- [ ] 일일 상한 150 EXP 확인

### Phase 6: 자동화 테스트 (6단계)

> [!TIP]
> 회귀 방지를 위해 최소 아래 테스트 케이스 작성 권장

| # | 테스트 케이스 | 검증 항목 |
|---|-------------|----------|
| 1 | `calculateNewStreakCount` 연속 판정 | 어제 활동 → 연속+1, 이틀 전 → 리셋=1 |
| 2 | 일일 EXP 상한 (150) | 50+30+20+10=110 < 150 OK, 50+50+50+10 → 마지막 10은 0 |
| 3 | 동일 활동 중복 참여 | 같은 날 SAVINGS 2회 → 두 번째는 `alreadyParticipated` |
| 4 | 마일스톤 경계 (6→7일) | 6일 → claimable=false, 7일 → claimable=true |
| 5 | 마일스톤 중복 클레임 방지 | 7일 보상 수령 후 재시도 → 에러 |
| 6 | KST 날짜 경계 | 23:59:59 KST 활동 → 오늘, 00:00:00 KST 활동 → 내일 |

---

## 10. 리스크 및 완화 방안

| 리스크 | 완화 방안 |
|-------|---------|
| 대시보드만 조회해도 스트릭 유지 → 너무 쉬움 | 로그인 EXP(10)를 낮게 설정, 마일스톤 보상으로 동기 부여 |
| 기존 100일 마일스톤 수령자 | 새 28일 마일스톤은 별도로 수령 가능 |
| 트랜잭션 성능 | 대시보드는 읽기 작업이 많으므로 스트릭 참여 실패해도 진행 |

---

## 11. 예상 작업량

| 영역 | 예상 시간 |
|-----|----------|
| Phase 1: 스키마 & 도메인 | 20분 |
| Phase 2: StreakService 리팩토링 | 30분 |
| Phase 3: 서비스 통합 | 20분 |
| Phase 4: 프론트엔드 | 10분 |
| Phase 5: 검증 | 20분 |
| **총계** | **~1시간 40분** |

---

## 12. 결론

활동 기반 스트릭 시스템으로 전환하면:

1. ✅ **접근성 향상**: 저축 없이도 앱 방문만으로 스트릭 유지
2. ✅ **자주 방문 유도**: 7/14/21/28일 마일스톤으로 빈번한 보상
3. ✅ **다양한 참여**: 저축, AI 분석, 목표 설정 등 모든 기능 활용 유도
4. ✅ **공정한 상한**: 일일 100 EXP 제한으로 밸런스 유지
