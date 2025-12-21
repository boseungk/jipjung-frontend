# AI 매니저 감정 기반 이미지 구현 계획서

## 1. 개요
레제 캐릭터의 감정(`mood`)에 따라 이미지를 동적으로 변경하고, 감정 변화 시 시각적 피드백을 제공합니다.

## 2. 핵심 변경 사항

### 2.1 이모지 뱃지 제거
- 기존 `character-badge` (😐😠😊 등) 요소 삭제
- 완성도 향상을 위해 캐릭터 이미지 자체로 감정 표현

### 2.2 감정-이미지 매핑
| Mood | Filename | Context |
|:---|:---|:---|
| `NORMAL` | `normal.webp` | 평상시, 대기 중 |
| `STRICT` | `strict.webp` | 고액 지출 심문 |
| `CURIOUS` | `curious.webp` | 영수증 분석 성공 |
| `CONFUSED` | `confuse.webp` | 정보 추출 미흡 |
| `ANNOYED` / `ANGRY` | `upset.webp` | 분석 실패, 낭비 판결 |

### 2.3 감정 변화 시각 효과
1. **이미지 전환 애니메이션**: scale `1.0 → 1.15 → 1.0` + 테두리 glow (0.5초)
2. **상태 텍스트 강조**: 감정별 색상 + 펄스 애니메이션

## 3. 수정 파일
- `aiManagerStore.js`: `currentMoodImageUrl` getter 추가
- `AiManagerView.vue`: 이미지 바인딩, 뱃지 제거, 애니메이션 적용

## 4. 검증
- 수기 입력(큰 금액) → STRICT 이미지 + 빨간 상태 텍스트
- 영수증 업로드(흐릿한 이미지) → CONFUSED 이미지
- 판결 완료 → NORMAL/ANGRY 이미지 전환 애니메이션 확인
