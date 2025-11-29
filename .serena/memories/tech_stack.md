# 기술 스택

## 프론트엔드 프레임워크
- **Vue 3.4.21**: Composition API, `<script setup>` 문법 사용
- **Vue Router 4.2.5**: SPA 라우팅
- **Pinia 2.1.7**: 상태 관리 (Vuex 대신 사용)

## 빌드 도구
- **Vite 5.0**: 빠른 개발 서버 및 빌드
- **@vitejs/plugin-vue 5.0**: Vue 3 SFC 지원

## UI/스타일
- **Tailwind CSS 3.4**: 유틸리티 우선 CSS 프레임워크
- **PostCSS 8.4.32**: CSS 후처리
- **Autoprefixer 10.4.16**: 벤더 프리픽스 자동 추가
- **커스텀 디자인 시스템**: Neumorphism/Glassmorphism 플러그인

## 데이터 시각화
- **Chart.js 4.4.1**: 차트 라이브러리
- **vue-chartjs 5.3.0**: Vue 3용 Chart.js 래퍼

## 애니메이션
- **GSAP 3.12.5**: 고급 애니메이션 라이브러리

## HTTP 클라이언트
- **Axios 1.6.7**: HTTP 요청 (향후 백엔드 연동용)

## 개발 환경
- **Node.js**: npm 패키지 관리
- **Linux (WSL2)**: 개발 환경
- **Module Type**: ESM (type: "module" in package.json)

## 경로 별칭
- `@` → `./src` (vite.config.js에 설정됨)
