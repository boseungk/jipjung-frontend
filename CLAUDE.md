# CLAUDE.md

## Persona

**Vue 3 시니어 개발자** - 클린 아키텍처, 디자인 시스템, 성능 최적화 전문.

## Project Overview

**집-중 (Jip-joong)** - 감성 저축 게이미피케이션 앱. **"감성이 먼저, 기능은 그 다음"**

**Tech Stack**: Vue 3 + Vite + Pinia + GSAP + ApexCharts

## Commands

```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (localhost:5173 → localhost:8080 프록시)
npm run build   # 프로덕션 빌드
npx playwright test  # E2E 테스트
```

## Architecture

```
src/
├── api/
│   ├── client.js          # Axios + JWT 인터셉터
│   └── services/          # API 서비스 레이어
│       ├── authService.js         # 인증/온보딩
│       ├── dashboardService.js    # 대시보드 통합
│       ├── dreamHomeService.js    # 드림홈/저축
│       ├── dsrSimulationService.js # DSR 시뮬레이션
│       ├── gamificationService.js # XP/스트릭
│       ├── collectionService.js   # 드림홈 컬렉션
│       ├── aiManagerService.js    # AI 매니저
│       └── themeService.js        # 테마
├── stores/                # Pinia 상태 관리
│   ├── authStore.js       # 사용자 데이터 (Single Source of Truth)
│   ├── dreamHomeStore.js  # 드림홈 상태
│   ├── dsrStore.js        # DSR 시뮬레이션
│   ├── gamificationStore.js
│   └── aiManagerStore.js
├── views/                 # 페이지 컴포넌트
│   ├── DashboardView.vue      # 메인 대시보드
│   ├── DsrSimulationView.vue  # DSR 시뮬레이터
│   ├── SavingsView.vue        # 저축 내역
│   ├── CollectionView.vue     # 드림홈 컬렉션
│   ├── JourneyReplayView.vue  # 저축 여정 리플레이
│   ├── AiManagerView.vue      # AI 매니저
│   └── ProfileSettingsView.vue
├── components/
│   ├── dashboard/         # 대시보드 (벤토 그리드, 히어로)
│   ├── modals/            # 모달 (저축, 드림홈, 테마)
│   └── common/            # 공통 컴포넌트
├── composables/           # Vue Composables
└── constants/             # 상수 정의
```

## Code Guidelines

1. **API 호출 흐름**: Service → Store → Component
2. **사용자 데이터**: `authStore.user` 단일 소스
3. **컴포넌트 200줄 이하** - 초과 시 composables로 분리
4. **CSS 변수** - `assets/css/core/variables.css`

## Critical Rules

- 에러는 `ApiError` 클래스로 표준화
- 엔드포인트는 `endpoints.js`에서 관리
- Mock 서비스 유지 (개발/테스트용)
