# 서비스 소개 페이지 (Landing Page) 구현 PRD

> **작성일**: 2024-12-23  
> **목표**: 화려하고 세련된 서비스 소개 페이지 구현

---

## 1. 개요

### 1.1 목적
- 집정(JIPJUNG) 서비스의 핵심 기능을 시각적으로 소개
- 스크롤 기반 인터랙션으로 몰입감 있는 사용자 경험 제공
- Day → Night 전환 효과로 서비스의 분위기 있는 비주얼 강조

### 1.2 페이지 흐름
```
[Hero] → [Features] → [Journey Preview + Night 전환] → [AI 레제 데모]
```

---

## 2. 디자인 시스템 참조

### 2.1 색상 토큰
| 토큰 | Day Mode | Night Mode |
|------|----------|------------|
| `--showroom-bg-day/night` | `#F9F8F6` | `#3a3530` |
| `--showroom-card-bg-day/night` | `#FFFFFF` | `#4a453f` |
| `--showroom-text-day/night` | `#2C2420` | `#F5EDE3` |
| `--brand-accent` | `#FF6B3D` | `#FF6B3D` |

**토큰 매핑 원칙**:
- Landing 전용 alias(`--showroom-bg`, `--showroom-card-bg`, `--showroom-text`)를 만들고 `data-theme`에 따라 day/night 토큰에 매핑

**예시**:
```css
html[data-theme="day"] {
  --showroom-bg: var(--showroom-bg-day);
  --showroom-card-bg: var(--showroom-card-bg-day);
  --showroom-text: var(--showroom-text-day);
}

html[data-theme="night"] {
  --showroom-bg: var(--showroom-bg-night);
  --showroom-card-bg: var(--showroom-card-bg-night);
  --showroom-text: var(--showroom-text-night);
}
```

### 2.2 기존 컴포넌트 재사용
- `CrystalBall.vue` - 3D 수정구 인테리어 디스플레이
- `SnowCanvas.vue` - 눈 내리는 파티클 효과
- `useTheme` composable - Day/Night 테마 전환

### 2.3 애니메이션 참조
- **참조 파일**: `src/assets/css/core/animations.css`
- **주요 키프레임**: `fade-in`, `slide-in-up`, `scale-in`, `glow`, `pulse`

---

## 3. 섹션별 상세 명세

### 3.1 Section 1: Hero (100vh)

**목적**: 서비스 핵심 가치 전달

**레이아웃**:
```
┌─────────────────────────────────────┐
│                                     │
│     🏠 CrystalBall                   │
│     (idle-float 애니메이션)           │
│                                     │
│     "저축이 집이 되는 경험"            │
│     "매일 저축하며 드림홈을 완성하세요"  │
│                                     │
│     [ 시작하기 → ] (CTA 버튼)         │
│                                     │
│          ↓ 스크롤 힌트                │
└─────────────────────────────────────┘
```

**구현 체크리스트**:
- [ ] `CrystalBall` 컴포넌트 import (완성된 인테리어 표시)
- [ ] 헤드라인 텍스트 `slide-in-up` 애니메이션
- [ ] CTA 버튼 → 로그인/회원가입 페이지 연결
- [ ] 스크롤 힌트 화살표 (bounce 애니메이션)

---

### 3.2 Section 2: Features Grid

**목적**: 4가지 핵심 기능 소개

**레이아웃** (2x2 Bento Grid):
```
┌─────────────────┐  ┌─────────────────┐
│ 🏠 저축 게이미피케이션 │  │ 📊 DSR 시뮬레이션  │
│                 │  │                 │
│ 저축할 때마다     │  │ 대출 한도를       │
│ 집이 완성되요    │  │ 미리 계산하세요   │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ 🔍 매물 검색      │  │ 🤖 AI 관리사      │
│                 │  │                 │
│ 관심 지역의      │  │ 똑똑한 재무       │
│ 매물을 탐색      │  │ 조언을 받으세요  │
└─────────────────┘  └─────────────────┘
```

**구현 체크리스트**:
- [ ] IntersectionObserver로 뷰포트 진입 감지
- [ ] 각 카드 `scale-in` 진입 애니메이션 (stagger 0.1s)
- [ ] Glassmorphism 카드 스타일 적용
- [ ] 호버 시 transform + shadow 강화

**카드 스타일 참조**:
```css
.feature-card {
  background: var(--showroom-card-bg);
  color: var(--showroom-text);
  backdrop-filter: blur(var(--surface-glass-blur));
  border-radius: var(--border-radius-md);
  box-shadow: var(--surface-card-shadow);
}
```

---

### 3.3 Section 3: Journey Preview + Night 전환 ⭐

**목적**: 집 건설 과정 체험 + Day→Night 전환 데모

#### 3.3.1 스크롤 기반 단계 전환

**Phase 구조** (총 11단계):
| Phase | 구분 | 이름 | 설명 |
|-------|------|------|------|
| 1 | 집 | 터 다지기 | 빈 땅 |
| 2 | 집 | 기초 공사 | 기초 |
| 3 | 집 | 뼈대 세우기 | 뼈대 |
| 4 | 집 | 벽체 완성 | 벽 |
| 5 | 집 | 지붕 올리기 | 지붕 |
| 6 | 집 | 입주 준비 | 완성 외관 |
| 7 | 인테리어 | 바닥·벽 정돈 | 배경 |
| 8 | 인테리어 | 휴식 공간 | 소파 |
| 9 | 인테리어 | 기능 더하기 | 테이블 |
| 10 | 인테리어 | 분위기 완성 | 램프 |
| 11 | 인테리어 | 디테일 | 소품 완성 |

**이미지 로드 함수 참조**:
```javascript
import { 
  getExteriorStageUrl,      // Phase 1-6
  getInteriorLayerUrls,     // Phase 7-11 레이어
  getInteriorNightUrl       // Night 모드 이미지
} from '@/constants/showroomWebp'
```

**스크롤 진행률 → Phase 매핑 로직** (JourneyReplayView 참조):
```javascript
const rawProgress = (scrollTop - start) / (end - start)
const scrollProgress = Math.min(1, Math.max(0, rawProgress)) // 0 ~ 1 clamp
const newPhase = Math.floor(scrollProgress * (totalPhases - 1)) + 1
```

**스크롤 구간 정의 (ScrollTrigger pin 권장)**:
- Section 3 전체를 pin하고 scrub로 11단계를 진행 (모바일 안정성 확보)
- `start/end`는 섹션 top/bottom 기준으로 고정, `end`는 단계 수에 비례하도록 충분한 스크롤 길이 확보

#### 3.3.2 Night 모드 전환 (Phase 11 도달 시)

**조건**: `currentPhase === 11`
**원칙**: Night 진입 후 사용자가 끄기 전까지 유지, Phase 이탈해도 토글 노출 유지

**버튼 표시**:
```vue
<transition name="fade-scale">
  <button
    v-if="isAtFinalPhase || isNight"
    class="dark-mode-toggle-btn"
    type="button"
    aria-label="Day/Night 전환"
    :aria-pressed="isNight"
    @click="toggleTheme"
  >
    <!-- Sun/Moon SVG 아이콘 -->
  </button>
</transition>
```

**Night 전환 시 변화**:
1. `html[data-theme="night"]` 설정
2. 배경색 전환 (0.45s ease)
3. 인테리어 Night 이미지 오버레이
4. Phase 11에서 SnowCanvas 눈 효과 활성화
5. CTA 버튼 glow 애니메이션
6. LandingView 언마운트 시 Day로 복귀 (스코프 유지)

**테마 스코프 처리 (권장)**:
- 랜딩 진입 시 기존 테마를 저장
- Day로 시작 강제 (데모 일관성)
- 랜딩 이탈 시 저장해둔 테마로 복원

```javascript
const { theme, setTheme } = useTheme()
const prevTheme = ref(theme.value)

onMounted(() => {
  prevTheme.value = theme.value
  setTheme('day')
})

onBeforeUnmount(() => {
  setTheme(prevTheme.value || 'day')
})
```


**Night 이미지 오버레이**:
```vue
<transition name="night-fade">
  <img v-if="isNight && isAtFinalPhase" 
       :src="interiorNightImageUrl" 
       class="interior-layer--night" />
</transition>
```

**SnowCanvas 표시 조건**:
```vue
<SnowCanvas v-if="isNight && isAtFinalPhase" />
```

**구현 체크리스트**:
- [ ] Section 3 pin 컨테이너 구성 (ScrollTrigger 기준)
- [ ] 스크롤 진행률 계산 로직 (clamp 포함)
- [ ] ScrollTrigger pin + scrub 적용, `start/end` 명확화
- [ ] Phase 1-6: 외관 이미지 전환 (GSAP opacity/scale)
- [ ] Phase 7-11: 인테리어 레이어 순차 표시
- [ ] Progress bar + dots UI
- [ ] Phase 11: Night 토글 버튼 fade-in
- [ ] 버튼 클릭 → toggleTheme() 호출
- [ ] Night 상태에서도 토글 버튼 유지 노출
- [ ] LandingView 언마운트 시 테마 복귀
- [ ] 토글 버튼 포커스 스타일/키보드 접근성 처리
- [ ] Night 전환 시 SnowCanvas 표시
- [ ] 최종 CTA 버튼 (glow 애니메이션)

#### 3.3.3 이미지 로딩 전략
- Phase 1-2는 초기 preload
- Phase 3+ 및 Night 이미지는 단계 진입 직전 prefetch
- lazy 로딩은 IntersectionObserver 또는 requestIdleCallback 사용

---

### 3.4 Section 4: AI 레제 데모

**목적**: AI 관리사 캐릭터의 감정 변화 기능 체험

#### 3.4.1 캐릭터 이미지 (5종)

| Mood | 이미지 | 예시 대사 |
|------|--------|----------|
| NORMAL | normal.webp | "안녕하세요! 오늘 지출을 확인해볼까요?" |
| CURIOUS | curious.webp | "흠, 이 지출은 뭔가요?" |
| STRICT | strict.webp | "이 지출은 좀 과한 것 같아요..." |
| CONFUSED | confuse.webp | "잠깐, 이게 맞나요?" |
| UPSET | upset.webp | "50,000원 커피라니요?!" |

**이미지 경로**: `src/assets/images/characters/`

#### 3.4.2 스크롤 기반 감정 순환

```javascript
// 스크롤 진행률에 따른 감정 전환
const MOODS = ['NORMAL', 'CURIOUS', 'STRICT', 'CONFUSED', 'UPSET']
const moodIndex = Math.floor(scrollProgress * MOODS.length)
const currentMood = MOODS[Math.min(moodIndex, MOODS.length - 1)]
```

#### 3.4.3 감정 변화 애니메이션 (AiManagerView 참조)

```javascript
// GSAP bounce + glow
gsap.timeline()
  .to(characterWrapper, { scale: 1.15, duration: 0.25, ease: 'back.out(1.7)' })
  .to(characterWrapper, { scale: 1, duration: 0.3, ease: 'power2.out' })

// glow 클래스 토글
characterImage.classList.add('mood-changed')
setTimeout(() => characterImage.classList.remove('mood-changed'), 800)
```

**Glow 애니메이션 CSS**:
```css
.character-image.mood-changed {
  border-color: var(--brand-accent, #ff6b3d);
  box-shadow: 
    0 0 20px rgba(255, 107, 61, 0.5),
    0 0 40px rgba(255, 107, 61, 0.3);
  animation: glow-pulse 0.8s ease-out;
}
```

**구현 체크리스트**:
- [ ] 캐릭터 이미지 5종 import
- [ ] 첫 상태 이미지 preload, 나머지 lazy 로딩
- [ ] 스크롤 진행률 → 감정 매핑
- [ ] GSAP bounce 애니메이션
- [ ] Glow 효과 CSS
- [ ] 감정별 대사 표시 (타이핑 효과 옵션)
- [ ] 감정 인디케이터 dots

---

## 4. 파일 구조

```
src/
├── views/
│   └── LandingView.vue          # 메인 뷰 (NEW)
│
├── components/
│   └── landing/                 # 랜딩 전용 컴포넌트 (NEW)
│       ├── LandingHero.vue
│       ├── LandingFeatures.vue
│       ├── LandingJourneyPreview.vue
│       └── LandingAiDemo.vue
│
├── assets/css/
│   └── layouts/
│       └── landing.css          # 랜딩 전용 스타일 (NEW)
│
└── router/
    └── index.js                 # '/landing' 라우트 추가 (MODIFY)
```

---

## 5. 라우터 설정

```javascript
// src/router/index.js
{
  path: '/landing',
  name: 'Landing',
  component: () => import('../views/LandingView.vue'),
  meta: { requiresAuth: false }
}
```

---

## 6. 의존성

### 6.1 필수 (이미 설치됨)
- **GSAP + ScrollTrigger** - pin/scrub 기반 스크롤 애니메이션 필수
- **Vue Router** - 라우팅

### 6.2 재사용 컴포넌트
- `CrystalBall.vue`
- `SnowCanvas.vue`
- `useTheme` composable

---

## 7. 테스트 체크리스트

### 7.1 기능 테스트
- [ ] Hero 섹션 CrystalBall 표시 확인
- [ ] Features 카드 스크롤 진입 애니메이션
- [ ] Journey Phase 1-11 스크롤 전환
- [ ] Phase 11 Night 토글 버튼 등장
- [ ] Night 전환 + SnowCanvas 효과
- [ ] Night 상태에서도 토글 버튼 유지 노출
- [ ] LandingView 언마운트 시 테마 복귀
- [ ] 토글 버튼 키보드 접근/ARIA 동작 확인
- [ ] AI 레제 감정 순환 애니메이션

### 7.2 반응형 테스트
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1200px+)

### 7.3 성능 체크
- [ ] 이미지 lazy loading
- [ ] Phase 이미지 사전 로딩/프리페치 확인
- [ ] 캐릭터 이미지 lazy 로딩 확인
- [ ] 애니메이션 60fps 유지
- [ ] 스크롤 이벤트 throttle/passive

---

## 8. 예상 작업량

| 항목 | 시간 |
|------|------|
| LandingView + Hero | 30분 |
| Features 섹션 | 30분 |
| Journey Preview + Night | 1시간 |
| AI 레제 데모 | 30분 |
| 스타일링 + 반응형 | 30분 |
| **총합** | **~3시간** |
