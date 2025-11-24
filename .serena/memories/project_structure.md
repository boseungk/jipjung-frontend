# 프로젝트 구조

## 전체 구조
```
jipjung-frontend/
├── .git/                      # Git 저장소
├── .serena/                   # Serena 설정
├── .vscode/                   # VSCode 설정
├── docs/                      # 문서
│   ├── requirements.md
│   └── 기획안.md
├── node_modules/              # 의존성
├── public/                    # 정적 파일
│   └── figure.svg             # 3D 룸 SVG 에셋
├── src/                       # 소스 코드 (아래 상세)
├── .gitignore
├── index.html                 # HTML 엔트리 포인트
├── package.json               # 패키지 설정
├── package-lock.json
├── postcss.config.js          # PostCSS 설정
├── README.md                  # 프로젝트 문서
├── tailwind.config.js         # Tailwind 설정
└── vite.config.js             # Vite 설정
```

## src/ 디렉토리 구조
```
src/
├── assets/                    # 에셋 (CSS, 이미지 등)
│   ├── css/                   # Tailwind + 커스텀 CSS
│   │   ├── archive/           # 백업/마이그레이션 파일
│   │   ├── plugins/           # Tailwind 플러그인
│   │   │   ├── neumorphism.js
│   │   │   └── glassmorphism.js
│   │   ├── clay-design-system.css
│   │   ├── input.css          # Tailwind 입력
│   │   └── output.css         # Tailwind 출력
│   └── styles/
│       └── main.css           # 메인 스타일시트
├── components/                # Vue 컴포넌트
│   ├── dashboard/             # 대시보드 전용 컴포넌트
│   │   ├── CrystalBallHero.vue      # 최상단 Crystal Ball 히어로
│   │   ├── AchievementSection.vue   # 달성률 섹션
│   │   ├── GamificationPanel.vue    # 게이미피케이션 패널
│   │   ├── DsrSummaryCard.vue       # DSR 계산 요약
│   │   └── DreamHomePanel.vue       # 드림홈 상세 정보
│   ├── BackgroundEffects.vue        # 배경 효과
│   ├── ColorThemeManager.vue        # 컬러 테마 선택
│   ├── CrystalBall.vue              # 3D 글래스 스피어
│   ├── DescriptionPanel.vue         # 설명 패널
│   ├── FeaturesList.vue             # 기능 목록
│   ├── ShowroomHeader.vue           # 헤더
│   ├── ShowroomSamples.vue          # 샘플 카드
│   ├── SnowCanvas.vue               # 눈 효과 캔버스
│   └── ThemeToggle.vue              # Day/Night 토글
├── composables/               # Composition API 재사용 로직
│   ├── useMousePosition.js          # 마우스 위치 추적
│   └── useTheme.js                  # 테마 상태 관리
├── router/                    # Vue Router 설정 (디렉토리만 존재)
├── stores/                    # Pinia 상태 관리
│   ├── userStore.js                 # 사용자 정보
│   ├── dreamHomeStore.js            # 드림홈 데이터
│   ├── dsrStore.js                  # DSR 계산 데이터
│   └── gamificationStore.js         # 게이미피케이션 데이터
├── utils/                     # 유틸리티 함수
│   └── formatters.js                # 데이터 포매팅 (숫자, 날짜 등)
├── views/                     # 라우트 뷰 컴포넌트 (디렉토리만 존재)
├── App.vue                    # 루트 컴포넌트
└── main.js                    # 앱 엔트리 포인트
```

## 주요 파일 설명

### 진입점
- `index.html`: HTML 진입점, Vue 앱 마운트 포인트
- `src/main.js`: JavaScript 진입점, Vue 앱 초기화, Pinia/Router 설정

### 설정 파일
- `vite.config.js`: Vite 빌드 설정, 경로 별칭 (`@` → `./src`)
- `tailwind.config.js`: Tailwind CSS 설정, 테마, 플러그인
- `postcss.config.js`: PostCSS 설정 (Tailwind, Autoprefixer)
- `package.json`: 의존성, 스크립트, 프로젝트 메타데이터

### 핵심 컴포넌트
- `App.vue`: 메인 대시보드 레이아웃
- `components/dashboard/*`: 대시보드 섹션별 컴포넌트
- `components/CrystalBall.vue`: 3D SVG 비주얼 컴포넌트
- `components/SnowCanvas.vue`: 인터랙티브 눈 효과
- `components/ThemeToggle.vue`: Day/Night 모드 전환

### 상태 관리 (Pinia)
- `userStore`: 사용자 기본 정보
- `dreamHomeStore`: 목표 주택 정보, 저축 목표
- `dsrStore`: DSR(총부채상환비율) 계산 관련
- `gamificationStore`: 레벨, 경험치, 스트릭, 뱃지

### 재사용 로직 (Composables)
- `useTheme`: Day/Night 모드, 컬러 테마 상태 관리
- `useMousePosition`: 마우스 위치 추적 (조명 효과용)

### 유틸리티
- `formatters.js`: 숫자/날짜/통화 포매팅 헬퍼 함수

## 디렉토리 명명 규칙
- 컴포넌트 디렉토리: 단수형 (`component`, `store`)
- 복수형 디렉토리: 복수의 항목 (`components`, `composables`, `utils`)
- 도메인별 서브디렉토리: `components/dashboard/`

## 향후 확장 예정
- `src/router/`: Vue Router 라우트 설정 (현재 미사용)
- `src/views/`: 페이지 레벨 컴포넌트 (현재 미사용, SPA 확장 시)
- API 서비스 레이어 추가 가능 (`src/services/` 또는 `src/api/`)
