# AI 매니저 감정 기반 캐릭터 및 알림 로직 설계

이 문서는 AI 매니저(레제)의 감정에 따라 캐릭터 이미지가 변경되고, 감정 변화를 사용자에게 알리는 로직에 대해 상세히 설명합니다.

## 1. 감정 및 이미지 매핑 (Emotion Mapping)

백엔드에서 전달되는 `mood` 값을 기반으로 `src/assets/images/characters` 디렉토리의 적절한 이미지를 매핑합니다.

| 백엔드 Mood | 캐릭터 이미지 | 상황 (Context) |
| :--- | :--- | :--- |
| `NORMAL` | `normal.webp` | 평범한 대화, 대기 중, 합리적 지출 판결 후 |
| `STRICT` | `strict.webp` | 큰 금액 지출 시 심문 과정 |
| `CURIOUS` | `curious.webp` | 영수증 이미지 분석 시 (성공), 긍정적 반응 |
| `CONFUSED` | `confuse.webp` | 영수증 정보가 불명확할 때 (Partial Success) |
| `ANNOYED` | `upset.webp` | 영수증 분석 실패 또는 부적절한 이미지 |
| `ANGRY` | `upset.webp` | 낭비 판결 후 또는 불만 상태 |
| `HAPPY` | `curious.webp` | (예정) 매우 긍정적인 상황 |

## 2. 감정 변화 알림 (Emotion Change Notification)

사용자가 레제의 감정 변화를 즉각적으로 체감할 수 있도록 애니메이션 알림창을 추가합니다.

### 애니메이션 흐름
1. **상태 감지**: `aiManagerStore`의 `currentMood`가 변경되는 것을 `watch`로 감지.
2. **알림창 노출**: 화면 하단 또는 캐릭터 근처에 `EmotionChangeOverlay` 컴포넌트 등장.
3. **GSAP 애니메이션**:
   - 알림창: 아래에서 위로 `y: 30` → `y: 0`, `opacity: 0` → `opacity: 1` (0.6초)
   - 캐릭터 이미지: 감정이 바뀔 때 살짝 튀어오르는 효과(`scale: 1.1`, 0.3초)를 주어 시각적 피드백 강화.
4. **자동 소멸**: 2~3초 후 부드럽게 사라짐.

### 수치적 설계 (GSAP)
- `duration`: 0.8s
- `ease`: `back.out(1.7)` (반동 효과)
- `stagger`: 아이콘과 텍스트가 순차적으로 등장

## 3. 구현 단계별 계획

### 3-1. 프론트엔드 데이터 구조 개선
- `aiManagerStore.js` 내부에 `moodImageMap` 정의.
- `currentMoodImageUrl` Getter 추가하여 뷰에서 쉽게 이미지 경로를 얻을 수 있게 함.

### 3-2. 알림 컴포넌트 제작
- `src/components/ai/EmotionChangeOverlay.vue` 신규 생성.
- `props`로 `moodLabel`과 `mood` 값을 전달받아 메시지 구성.

### 3-3. 뷰 연동 및 고도화
- `AiManagerView.vue`에 알림 컴포넌트 삽입.
- 캐릭터 이미지에 `transition` 또는 GSAP 애니메이션 적용.

---

> [!TIP]
> **디자인 참고**: 집 이미지(Showroom)가 바뀔 때의 `StageUpgradeModal`의 생동감 넘치는 느낌을 살려, 레제와의 대화가 더욱 역동적으로 느껴지도록 구현합니다.
