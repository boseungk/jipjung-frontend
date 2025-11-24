# Vue Jip-joong Dashboard 완성! 🎉

design-sample을 Vue 3 + Vite + Pinia로 완전히 리팩토링한 **감성 우선(Emotional-First) 대시보드**입니다!

## ⚡ 빠른 시작

### 1. PowerShell 실행 정책 설정 (필요시)

PowerShell 권한 문제가 있다면, PowerShell을 **관리자 권한**으로 실행 후:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 의존성 설치
```bash
cd c:\Users\SSAFY\Desktop\jipjung-frontend
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저가 자동으로 `http://localhost:5173`을 엽니다.

---

## 🎨 감성 우선(Emotional-First) 디자인

### 정보 우선순위
```
1순위: Crystal Ball (꿈의 시각화) ← 감성 ⭐⭐⭐
2순위: 달성률 (Achievement) ← 동기 ⭐⭐
3순위: 게이미피케이션 ← 재미 ⭐
4순위: 데이터 (통계, DSR) ← 이성
5순위: 드림홈 상세 ← 정보
```

### 사용자 여정
```
방문 → "와, 예쁜 쇼룸이다!" (Crystal Ball)
     → "28.3%나 모았네!" (Achievement)
     → "레벨 3, 7일 연속!" (Gamification)
     → [저축하기] 클릭!
```

---

## 📁 프로젝트 구조

```
jipjung-frontend/
├── src/
│   ├── stores/              # Pinia stores (상태 관리)
│   │   ├── userStore.js
│   │   ├── dreamHomeStore.js
│   │   └── gamificationStore.js
│   ├── components/
│   │   ├── dashboard/       # 대시보드 전용 컴포넌트
│   │   │   ├── CrystalBallHero.vue ⭐
│   │   │   ├── AchievementSection.vue ⭐
│   │   │   ├── GamificationPanel.vue
│   │   │   ├── DsrSummaryCard.vue
│   │   │   └── DreamHomePanel.vue
│   │   ├── BackgroundEffects.vue
│   │   ├── SnowCanvas.vue
│   │   ├── ColorThemeManager.vue
│   │   ├── ThemeToggle.vue
│   │   ├── ShowroomHeader.vue
│   │   └── CrystalBall.vue
│   ├── composables/
│   │   ├── useTheme.js
│   │   └── useMousePosition.js
│   ├── assets/
│   │   ├── css/             # design-sample CSS
│   │   └── styles/
│   │       └── main.css
│   ├── App.vue              # 메인 대시보드
│   └── main.js
└── public/
    └── figure.svg
```

---

## ✨ 구현된 기능

### 감성적 요소 (Emotional)
- ✅ **Crystal Ball Full Hero** - 최상단, 100% 크기
- ✅ "나만의 꿈의 쇼룸" 메시지
- ✅ 눈 내리는 효과 (마우스 반응)
- ✅ Day/Night 조명 시스템

### 동기 부여 (Motivation)
- ✅ **큰 달성률 표시** (28.3%)
- ✅ 애니메이션 Progress Bar
- ✅ D-Day 카운터
- ✅ **CTA 버튼** (저축하기, 드림홈 변경)

### 게이미피케이션 (Gamification)
- ✅ 레벨 시스템 (Level 3: 꾸준한 실천가)
- ✅ 경험치 프로그레스바
- ✅ 🔥 연속 저축 스트릭 (7일)

### 데이터 (Information)
- ✅ DSR 계산 요약 (2x2 그리드)
- ✅ 드림홈 정보 (접기/펴기)
- ⏳ 저축 통계 차트 (placeholder - Chart.js 설치 후 구현)

### 디자인 시스템
- ✅ Neumorphism (Day 모드)
- ✅ Glassmorphism (Night 모드)
- ✅ 4가지 컬러 테마
- ✅ 완벽한 반응형 레이아웃

---

## 🔧 기술 스택

- **Vue 3.4**: Composition API, `<script setup>`
- **Pinia 2.1**: 상태 관리 (stores)
- **Vite 5**: 빌드 도구
- **Tailwind CSS 3.4**: UI 프레임워크
- **GSAP 3.12**: 애니메이션
- **Chart.js 4.4** (설치됨, 구현 대기)

---

## 📊 Mock 데이터

현재는 하드코딩된 Mock 데이터로 동작합니다:

- **드림홈**: 래미안 아파트, ₩5억, 목표 ₩1.5억
- **달성률**: 28.3% (₩425만 / ₩1,500만)
- **레벨**: 3 (꾸준한 실천가, 320/500 EXP)
- **연속 저축**: 7일 (최장 15일)

---

## 🎯 다음 단계

### 즉시 가능
1. ✅ `npm install` (의존성 설치)
2. ✅ `npm run dev` (개발 서버 실행)
3. ✅ 브라우저에서 확인

### 향후 작업
- [ ] Chart.js 월별 저축 통계 차트 구현
- [ ] 저축하기 모달 구현
- [ ] 드림홈 변경 모달 구현
- [ ] API 연동 (백엔드 준비 후)

---

## 💡 사용 팁

### 테마 변경
- 좌측 상단: 컬러 테마 선택 (🏠🌿🌫️☁️)
- 우측 상단: Day/Night 모드 토글

### Mock 데이터 수정
- `src/stores/*.js` 파일의 ref() 값 수정

### 컴포넌트 커스터마이징
- `src/components/dashboard/*.vue` 파일 편집

---

**감성이 먼저, 기능은 그 다음!** ❤️

---

## 📁 프로젝트 구조

```
jipjung-frontend/
├── public/
│   └── figure.svg              # 3D 룸 SVG 에셋
├── src/
│   ├── assets/
│   │   ├── css/                # Tailwind + 커스텀 CSS
│   │   │   ├── core/
│   │   │   ├── layouts/
│   │   │   ├── plugins/
│   │   │   └── ...
│   │   └── styles/
│   │       └── main.css        # 메인 스타일시트
│   ├── components/
│   │   ├── BackgroundEffects.vue     # 배경 효과
│   │   ├── ColorThemeManager.vue     # 컬러 테마 선택
│   │   ├── CrystalBall.vue           # 3D 글래스 스피어
│   │   ├── DescriptionPanel.vue      # 설명 패널
│   │   ├── FeaturesList.vue          # 기능 목록
│   │   ├── ShowroomHeader.vue        # 헤더
│   │   ├── ShowroomSamples.vue       # 샘플 카드
│   │   ├── SnowCanvas.vue            # 눈 효과
│   │   └── ThemeToggle.vue           # Day/Night 토글
│   ├── composables/
│   │   ├── useMousePosition.js       # 마우스 위치 추적
│   │   └── useTheme.js               # 테마 상태 관리
│   ├── App.vue                 # 루트 컴포넌트
│   └── main.js                 # 앱 엔트리 포인트
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## ✨ 주요 기능

### 🎨 디자인 시스템
- **Neumorphism** (Day 모드): 부드러운 입체 효과
- **Glassmorphism** (Night 모드): 반투명 유리 효과
- **4가지 컬러 테마**:
  - 🏠 Warm Beige (따뜻한 베이지)
  - 🌿 Olive Green (차분한 올리브)
  - 🌫️ Cool Gray (세련된 그레이)
  - ☁️ Sky Blue (모던 블루)

### 🌟 인터랙티브 효과
- ❄️ **눈 내리는 효과**: 마우스 반응형 파티클
- 🌙 **Day/Night 모드**: 원클릭 테마 전환
- 💡 **조명 효과**: 마우스 추적 조명, 글로벌 업라이트
- 🔮 **3D 글래스 스피어**: 애니메이션 효과

### 📱 반응형 디자인
- 데스크톱, 태블릿, 모바일 완벽 지원
- 자동 레이아웃 조정

---

## 🛠️ 기술 스택

- **Vue 3**: Composition API
- **Vite**: 빠른 빌드 도구
- **Tailwind CSS v3**: 유틸리티 CSS 프레임워크
- **GSAP**: 애니메이션 라이브러리
- **PostCSS**: CSS 후처리

---

## 💾 LocalStorage 저장 항목

- `showroom-theme`: Day/Night 테마 설정
- `showroom-color-theme`: 컬러 테마 설정

---

## 🔧 개발 팁

### 새 컴포넌트 추가
1. `src/components/` 에 `.vue` 파일 생성
2. `App.vue`에서 import 및 사용

### 스타일 수정
- Tailwind 유틸리티: `tailwind.config.js` 수정
- 커스텀 CSS: `src/assets/css/` 내 파일 수정
- 컴포넌트 스타일: 각 `.vue` 파일의 `<style>` 섹션

### Composable 추가
`src/composables/` 에 새 파일 생성하여 재사용 로직 작성

---

## 📝 문의사항

프로젝트 관련 문의는 SSAFY 팀에 문의해주세요.
