# 코드 스타일 및 컨벤션

## Vue 컴포넌트 스타일

### 파일 구조
- **SFC (Single File Component)** 형식 사용
- `<script setup>` Composition API 문법 사용
- `<template>`, `<script>`, `<style>` 순서

### 네이밍 컨벤션
- **컴포넌트 파일명**: PascalCase (예: `CrystalBall.vue`, `ShowroomHeader.vue`)
- **컴포넌트 디렉토리**: 
  - 범용 컴포넌트: `src/components/`
  - 도메인별 컴포넌트: `src/components/dashboard/`
- **변수/함수명**: camelCase (예: `handleSaving`, `loadSVG`)
- **상수명**: UPPER_SNAKE_CASE (필요시)

### Composition API 패턴
```javascript
// ref, reactive 사용
const loading = ref(false)
const svgWrapper = ref(null)

// 함수는 화살표 함수 또는 function 선언 모두 사용
const loadSVG = async () => { ... }
function handleSaving() { ... }

// onMounted, onUnmounted 등 lifecycle hooks 사용
onMounted(() => { ... })
```

### Composables
- `src/composables/` 디렉토리에 위치
- `use*` 네이밍 패턴 (예: `useTheme.js`, `useMousePosition.js`)
- 재사용 가능한 로직을 추출

### Pinia Stores
- `src/stores/` 디렉토리에 위치
- `*Store.js` 네이밍 (예: `userStore.js`, `dreamHomeStore.js`)
- `use*Store` 함수 export (예: `useUserStore`)
- Composition API 스타일 (setup store 패턴)

## JavaScript 스타일

### Import 순서
1. Vue 관련 (vue, vue-router, pinia 등)
2. 외부 라이브러리
3. 내부 모듈 (@/ 별칭 사용)
4. 상대 경로

### 문법
- **모듈 시스템**: ESM (`import`/`export`)
- **따옴표**: 싱글 쿼트 (`'`) 선호 (일부 더블 쿼트 혼용)
- **세미콜론**: 일관성 없음 (있거나 없거나)
- **들여쓰기**: 4 스페이스

## CSS/Tailwind 스타일

### Tailwind 사용
- 유틸리티 클래스 우선 사용
- 커스텀 플러그인: `src/assets/css/plugins/`
  - `glassmorphism.js`

### 컬러 테마
- CSS 변수 기반 테마 시스템
- Day/Night 모드 지원
- LocalStorage에 테마 상태 저장

### 스타일 파일 구조
- 메인: `src/assets/styles/main.css`
- 디자인 시스템: `src/assets/css/clay-design-system.css`
- Tailwind 설정: `tailwind.config.js`

## 프로젝트 특화 규칙

### 감성 우선 원칙
- 비주얼 효과 > 데이터 표시
- 사용자 경험 중심 설계

### 컴포넌트 분리
- 재사용 가능한 UI 컴포넌트 추출
- 도메인별 컴포넌트 별도 디렉토리 관리

### 상태 관리
- 전역 상태: Pinia stores
- 로컬 상태: ref/reactive
- Props/Emits로 부모-자식 통신

## 린팅/포매팅
- **현재 상태**: ESLint, Prettier 설정 없음
- 코드 스타일은 개발자 재량에 따름
- 향후 도입 시 표준 Vue 3 규칙 권장
