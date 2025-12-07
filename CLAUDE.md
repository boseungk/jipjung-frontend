# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**You are a Vue 3 senior developer with expertise in clean architecture, design systems, and performance optimization.**

## Project Overview

**집-중 (Jip-joong)** - 감성 저축 게이미피케이션 앱. **"감성이 먼저, 기능은 그 다음"**

## Commands

```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (localhost:5173, Vite 프록시 → localhost:8080)
npm run build   # 프로덕션 빌드
```

## Architecture

```
src/
├── api/
│   ├── client.js          # Axios + JWT 인터셉터 + 토큰 자동 갱신
│   ├── endpoints.js       # API 엔드포인트 상수
│   ├── errors.js          # ApiError, NetworkError, TimeoutError
│   └── services/          # API 서비스 레이어
│       ├── authService.js         # 인증 (login, register, onboarding)
│       ├── dashboardService.js    # 대시보드 통합 데이터
│       ├── propertyService.js     # 매물 CRUD
│       ├── dreamHomeService.js    # 드림홈 변경/저축
│       ├── gamificationService.js # 경험치/스트릭
│       ├── receiptService.js      # 영수증 심문
│       ├── statisticsService.js   # 지출/프로필 통계
│       └── collectionService.js   # 드림홈 컬렉션
├── stores/
│   ├── authStore.js       # 인증 + 사용자 데이터 (Single Source of Truth)
│   ├── dreamHomeStore.js  # 드림홈 상태
│   ├── propertyStore.js   # 매물 상태
│   ├── gamificationStore.js
│   ├── dsrStore.js
│   └── receiptStore.js
└── constants/
    ├── user.js            # DEFAULT_DREAM_HOME, DEFAULT_GAMIFICATION
    └── ...
```

## API Integration

**서비스 레이어 패턴**:
```javascript
// 서비스: API 호출만 담당
const response = await authService.login(email, password)

// 스토어: 상태 관리
authStore.login(email, password)  // → authService.login() 호출

// 컴포넌트: UI만 담당
await authStore.login(email, password)
```

**프록시 설정** (vite.config.js):
- 개발: `/api` → `localhost:8080` (Vite 프록시)
- 프로덕션: Nginx 리버스 프록시 (`nginx.conf.example`)

## Code Guidelines

1. **상수 추출** - `src/constants/`, `src/api/endpoints.js`
2. **컴포넌트 200줄 이하** - 초과 시 composables/서비스로 분리
3. **서비스 레이어** - API 호출은 반드시 `src/api/services/` 경유
4. **JSDoc 타입** - `@typedef`, `@param`, `@returns`로 문서화
5. **에러 처리** - `ApiError` 클래스 활용, try/catch 필수
6. **CSS 변수** - 하드코딩 금지, `src/assets/css/core/variables.css`

## State Management

**사용자 데이터 Single Source of Truth**:
```javascript
// ✅ 올바른 방법
const authStore = useAuthStore()
authStore.userDreamHome  // computed에서 읽기
authStore.updateUserData({ ... })  // 업데이트

// ❌ 잘못된 방법
authStore.user.dreamHome = { ... }  // 직접 수정 금지
```

**대시보드 데이터 로드**:
```javascript
// DashboardView.vue
onMounted(() => {
  authStore.loadDashboard()  // GET /users/dashboard → 모든 상태 업데이트
})
```

## Critical Rules

1. API 호출 → 서비스 레이어 → 스토어 → 컴포넌트
2. 사용자 데이터는 `authStore.user` 단일 소스
3. 에러는 `ApiError` 클래스로 표준화
4. 엔드포인트는 `endpoints.js`에서 관리
5. Mock 서비스는 유지 (개발/테스트용)
