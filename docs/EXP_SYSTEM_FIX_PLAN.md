# EXP 시스템 수정 완료

## 변경 사항 요약

### Phase 1: AI 판결 EXP 반영 ✅

| 파일 | 변경 내용 |
|------|----------|
| `constants/exp.js` | 새로 생성 - EXP 관련 상수 통합 |
| `aiManagerStore.js` | `applyJudgmentGrowth()` 호출 추가 |
| `gamificationStore.js` | `applyJudgmentGrowth()` 함수 추가 (house/furniture 트랙 모두 지원) |

### Phase 2: AI 판결 EXP 정책 조정 ✅

| 항목 | 이전 | 변경 후 |
|------|------|---------|
| 합리적 소비 EXP | +50 | +20 |
| 낭비 EXP | -30 | -10 |
| 음수 EXP 처리 | 무제한 감소 | 0 이하 방지 |

**변경 파일**: `AiManagerService.java`

### Phase 3: 프론트엔드 예상 EXP Max 적용 ✅

| 파일 | 변경 내용 |
|------|----------|
| `SavingsView.vue` | `calculateEstimatedExp()` 사용 (500 max) |
| `SavingInputModal.vue` | `calculateEstimatedExp()` 사용 (500 max) |

---

## 테스트 방법

### AI 판결 EXP 반영 테스트
1. 대시보드에서 현재 EXP 확인
2. AI 관리실 → 지출 분석 → 변명 선택 → 판결
3. **확인**: 대시보드 EXP가 즉시 업데이트됨

### 음수 EXP 0 이하 방지 테스트
1. EXP가 낮은 계정 (예: 5 EXP)
2. 낭비 판결 받기 (-10 EXP)
3. **확인**: EXP가 0에서 멈춤 (음수 아님)

### 예상 EXP 최대치 테스트
1. 저축 화면에서 1000만원 입력
2. **확인**: "예상 경험치: +500 XP" (1000 아님)
