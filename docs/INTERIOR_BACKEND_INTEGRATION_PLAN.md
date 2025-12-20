# 인테리어 백엔드 연동 구현 완료

## 변경 사항 요약

### 백엔드 (8개 파일)

| 파일 | 변경 내용 |
|------|----------|
| `schema-mysql.sql` | `build_track`, `furniture_stage`, `furniture_exp` 컬럼 추가 |
| `schema-h2.sql` | 동일 (H2 호환 문법) |
| `User.java` | 3개 필드 추가 (buildTrack, furnitureStage, furnitureExp) |
| `UserMapper.xml` | ResultMap + `updateFurnitureProgress` 쿼리 |
| `FurnitureProgressRequest.java` | 서버 검증 포함 (validation + clamp) |
| `FurnitureProgressResponse.java` | 저장된 값 반환 |
| `UserController.java` | `PUT /api/users/furniture-progress` |
| `UserService.java` | `updateFurnitureProgress()` 메서드 |
| `DashboardResponse.java` | ShowroomSection에 furniture 필드 추가 |

### 프론트엔드 (4개 파일)

| 파일 | 변경 내용 |
|------|----------|
| `userService.js` | 새로 생성 - `updateFurnitureProgress()` API |
| `index.js` | userService export 추가 |
| `authStore.js` | 대시보드 응답에서 백엔드 furniture 값 우선 처리 |
| `gamificationStore.js` | 서버 동기화 호출 추가 (localStorage + API) |

---

## 다중 기기 동기화 플로우

```
┌─────────────────┐     ┌─────────────────┐
│   Device A      │     │   Device B      │
│ (인테리어 진행)   │     │ (다음날 로그인)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       │
   저축/AI 판결                   │
         │                       │
         ▼                       │
┌─────────────────┐              │
│   API 호출       │              │
│ PUT /furniture- │              │
│    progress     │              │
└────────┬────────┘              │
         │                       │
         ▼                       │
┌─────────────────┐              │
│   DB 저장        │◀─────────────┘
│ build_track,    │   GET /dashboard
│ furniture_stage │   → showroom 응답에
│ furniture_exp   │     furniture 필드 포함
└─────────────────┘
```

---

## 테스트 방법

### 1. DB 마이그레이션
백엔드 재시작 시 자동 실행 (H2) 또는 MySQL에서 수동 실행:
```sql
ALTER TABLE `user` ADD COLUMN build_track VARCHAR(20) NOT NULL DEFAULT 'house';
ALTER TABLE `user` ADD COLUMN furniture_stage INT NOT NULL DEFAULT 0;
ALTER TABLE `user` ADD COLUMN furniture_exp INT NOT NULL DEFAULT 0;
```

### 2. 기능 테스트
1. A 기기에서 집 완공 후 "인테리어 시작하기" 클릭
2. A 기기에서 저축하여 인테리어 3단계까지 진행
3. B 기기에서 로그인
4. **확인**: B 기기에서도 인테리어 3단계 유지
