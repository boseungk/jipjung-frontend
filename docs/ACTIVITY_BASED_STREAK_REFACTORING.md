# 활동 기반 스트릭 시스템 리팩토링 문서

> **작성일**: 2025-12-12  
> **목적**: 저축 전용 스트릭 → 활동 기반 스트릭(대시보드/AI분석/AI판결/저축) 전환

---

## 변경 요약

| 항목 | Before | After |
|------|--------|-------|
| 스트릭 인정 | 저축만 | 모든 활동 (대시보드/AI분석/AI판결/저축) |
| 일일 EXP 상한 | 없음 | 160 EXP |
| 마일스톤 | 7/30/100일 | 7/14/21/28일 |
| 데이터 저장 | `streak_history` | `daily_activity` + `streak_history` (호환) |

---

## 신규 파일

### 1. `ActivityType.java`
**경로**: `domain/ActivityType.java`

```java
public enum ActivityType {
    DASHBOARD("대시보드 접속", 10),
    AI_ANALYSIS("AI 지출 분석", 30),
    AI_JUDGMENT("AI 판결", 20),
    SAVINGS("저축", 50);
}
```

### 2. `DailyActivity.java`
**경로**: `domain/DailyActivity.java`

일일 활동 기록 도메인. UNIQUE(user_id, activity_date, activity_type) 제약으로 하루 1회만 기록.

### 3. `DailyActivityMapper.java` / `.xml`
**경로**: `repository/DailyActivityMapper.java`, `resources/mapper/DailyActivityMapper.xml`

주요 메서드:
- `existsByUserIdAndDateAndType()` - 중복 체크
- `countByUserIdAndDate()` - 오늘 첫 활동 여부
- `sumExpByUserIdAndDate()` - 일일 EXP 합계 (상한 체크용)
- `insert()` - 활동 기록

### 4. 스키마 변경
**경로**: `resources/schema-h2.sql`, `resources/schema-mysql.sql`

```sql
CREATE TABLE daily_activity (
    activity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(30) NOT NULL,
    exp_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_user_activity_date_type 
        UNIQUE (user_id, activity_date, activity_type)
);
```

---

## 수정 파일

### 1. `StreakService.java` (핵심 리팩토링)

#### 변경된 시그니처
```diff
- public StreakResult participate(Long userId)
+ public StreakResult participate(Long userId, ActivityType activityType)
```

#### 주요 로직 변경

| 기능 | 구현 |
|-----|-----|
| **일일 EXP 상한** | `DAILY_EXP_CAP = 160` 체크 후 초과분 미지급 |
| **멱등성 보장** | DB UNIQUE + try-catch(`DuplicateKeyException`) |
| **streak_history 호환** | 첫 활동 시 `streak_history`에도 insert |
| **마일스톤** | `Map.of(7,50, 14,100, 21,150, 28,200)` |

#### 의존성 추가
```diff
+ private final StreakHistoryMapper streakHistoryMapper;
```

---

### 2. `DashboardService.java`

#### 트랜잭션 수정
```diff
- @Transactional
+ @Transactional(readOnly = false)
  public DashboardResponse getDashboard(Long userId)
```

> **이유**: 클래스 레벨 `@Transactional(readOnly = true)` 오버라이드 필요

#### 스트릭 참여 추가
```java
// 11. 대시보드 접속 스트릭 참여 (1일 1회)
try {
    streakService.participate(userId, ActivityType.DASHBOARD);
} catch (Exception e) {
    log.warn("Dashboard streak participation failed", e);
}
```

---

### 3. `DreamHomeService.java`

```diff
  if (request.saveType() == SaveType.DEPOSIT) {
-     streakResult = streakService.participate(userId);
+     streakResult = streakService.participate(userId, ActivityType.SAVINGS);
  }
```

---

### 4. `AiManagerService.java`

#### 의존성 추가
```diff
+ private final StreakService streakService;
```

#### AI 분석 완료 시
```java
// processManualAnalysis() 마지막
try {
    streakService.participate(user.getId(), ActivityType.AI_ANALYSIS);
} catch (Exception e) {
    log.warn("AI analysis streak participation failed", e);
}
```

#### AI 판결 완료 시
```java
// processJudgment() 마지막
try {
    streakService.participate(userId, ActivityType.AI_JUDGMENT);
} catch (Exception e) {
    log.warn("AI judgment streak participation failed", e);
}
```

---

### 5. `MilestoneRewardResponse.java`

```diff
  private static String generateCelebrationMessage(int milestoneDays) {
      return switch (milestoneDays) {
-         case 7 -> "🔥 7일 연속 저축 달성!";
-         case 30 -> "🌟 30일 연속 저축!";
-         case 100 -> "🏆 100일 연속 저축!";
+         case 7 -> "🔥 7일 연속 활동 달성! 1주 완료!";
+         case 14 -> "🌟 14일 연속 활동! 2주 완료!";
+         case 21 -> "💪 21일 연속 활동! 습관 형성 완료!";
+         case 28 -> "🏆 28일 연속 활동! 한 달 완료!";
          default -> "🎉 마일스톤 보상 획득!";
      };
  }
```

---

### 6. 프론트엔드 변경

#### `WeeklyStreakCard.vue`
```diff
- <span>저축하면 불꽃이 켜지고 +50 XP를 받을 수 있어요!</span>
+ <span>매일 앱을 방문하면 불꽃이 켜지고 EXP를 받아요!</span>
```

#### `constants/user.js`
```javascript
export const STREAK_MILESTONES = [
  { days: 7, exp: 50, label: '1주일 연속 접속!', emoji: '🔥' },
  { days: 14, exp: 100, label: '2주 연속!', emoji: '🌟' },
  { days: 21, exp: 150, label: '3주 연속!', emoji: '💪' },
  { days: 28, exp: 200, label: '4주 연속!', emoji: '🏆' }
]
```

---

## 코드 리뷰 이슈 대응

### 해결된 이슈

| 이슈 | 원인 | 해결 |
|-----|-----|------|
| readOnly 트랜잭션 | 클래스 레벨 `readOnly=true` | `getDashboard()`에 `readOnly=false` 명시 |
| streak_history 미사용 | 새 로직이 daily_activity만 사용 | 첫 활동 시 streak_history도 insert |
| UNIQUE 예외 미처리 | 동시 요청 시 트랜잭션 실패 | try-catch(`DuplicateKeyException`) |
| 마일스톤 불일치 | 7/30/100 → 7/14/21/28 | 4개 파일 일괄 수정 |
| 정렬 미보장 | Map.of 순서 불안정 | `.sorted(Map.Entry.comparingByKey())` |

### 미해결/추후 검토

| 이슈 | 설명 |
|-----|-----|
| EXP 밸런스 | 기존 exp(저축/AI) + 활동 exp 중복 지급 가능 - 밸런스 검토 필요 |
| Grace Period | 배포 직후 스트릭 리셋 방지 로직 미구현 |
| Frontend CTA | "연속 저축" → "연속 활동" 문구 추가 정리 필요 |

---

## 테스트 권장 케이스

1. **대시보드 접속 → EXP 10 지급** 확인
2. **같은 날 재접속 → 중복 지급 없음** 확인
3. **모든 활동 완료 → 110 EXP (160 상한 미초과)** 확인
4. **7일 연속 → 마일스톤 수령 가능** 확인
5. **동시 요청 시 → 예외 없이 멱등 처리** 확인
