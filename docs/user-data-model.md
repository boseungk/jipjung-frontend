# User 데이터 모델 (Mock 기준)

프런트가 참조하는 사용자 객체를 한 곳(authStore.user)에서 관리하기 위한 필드 정의입니다. 백엔드 연동 시 동일/유사 구조로 내려주면 대시보드·프로필·DSR 등의 UI가 바로 붙습니다.

## 최상위 필드
- `id`: 고유 식별자
- `email`: 로그인 계정
- `name`: 표시 이름
- `birthYear`: 출생 연도
- `annualIncome`: 연소득(만원)
- `existingLoanMonthly`: 기존 대출 월 상환액(만원)
- `preferredAreas`: `{ sido, sigungu }` 배열
- `onboardingCompleted`: 온보딩 완료 여부
- `createdAt`, `updatedAt`: 생성/갱신 시각
- `dreamHome`: 주택 목표 데이터 (아래 별도 섹션)
- `gamification`: 레벨/XP 등 게이미피케이션 데이터 (아래 별도 섹션)

## dreamHome (대시보드 목표 카드/히어로에서 사용)
- `dreamHomeId`: 목표 ID
- `propertyName`: 매물 이름/타이틀
- `location`: 지역 문자열
- `price`: 매물 가격(만원)
- `targetAmount`: 목표 금액(만원, 보통 계약금)
- `monthlyGoal`: 월 저축 목표(만원)
- `targetDate`: 목표 달성 예정일(YYYY-MM-DD)
- `currentAmount`: 현재 모인 금액(만원)

## gamification (프로필 카드, 경험치/레벨)
- `currentLevel`: 현재 레벨
- `levelTitle`: 레벨 이름 (없으면 기본 매핑 사용)
- `experiencePoints`: 현재 경험치
- `nextLevelExp`: 다음 레벨까지 필요한 경험치
- `currentStreak`: 현재 연속 달성 일수
- `longestStreak`: 최장 연속 일수
- `treesCollected`: 수집한 트리 수 등 배지 데이터

## 기본 Mock 값
`src/constants/user.js`에 `DEFAULT_DREAM_HOME`, `DEFAULT_GAMIFICATION`로 정의되어 있으며, `mockAuthService`에서 초기 사용자와 신규 가입자 모두에게 채워줍니다. 프런트는 값이 없을 때 이 기본값을 사용해 UI를 유지합니다.
