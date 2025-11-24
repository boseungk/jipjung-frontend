# Vue 3 쇼룸 프로젝트 설치 및 실행 가이드

## 🚀 빠른 시작

### 1. PowerShell 실행 정책 설정 (필요시)
PowerShell을 **관리자 권한**으로 실행 후:
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

브라우저가 자동으로 열리며, http://localhost:5173 에서 확인할 수 있습니다.

### 4. 프로덕션 빌드 (선택사항)
```bash
npm run build
npm run preview
```

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
