# 🎨 SSAFYHome - Lifestyle Showroom Design Guide

> **라이프스타일 쇼룸** 디자인 시스템 공식 가이드  
> 날(Day)과 밤(Night)의 이원화된 디자인 철학

---

## 📋 목차
1. [디자인 철학](#디자인-철학)
2. [테마 시스템](#테마-시스템)
3. [컴포넌트 가이드](#컴포넌트-가이드)
4. [조명 시스템](#조명-시스템)
5. [기술 스펙](#기술-스펙)

---

## 🎯 디자인 철학

### 이원화 전략 (Dual Design Strategy)

사용자의 환경(조명)에 따라 가장 자연스러운 물리 법칙을 적용합니다.

| 구분 | Day Mode (낮) ☀️ | Night Mode (밤) 🌙 |
|------|------------------|-------------------|
| **스타일** | Soft Clay (부드러운 점토) | Tactile Glass (깊이감 있는 유리) |
| **빛의 원리** | 반사 (Reflection) | 투과 & 발광 (Transmission) |
| **질감** | 불투명(Solid) + 양각/음각 | 반투명(Translucent) + 안쪽 그림자 |
| **느낌** | 따뜻하고 말랑말랑한 촉감 | 차갑지만 영롱하고 세련된 미래적 느낌 |

---

## 🎨 테마 시스템

### 1. Day Mode: Soft Clay Neumorphism

**핵심 원리**: 밝은 배경에서 빛이 반사되어 입체감을 만듦

#### 스타일 정의
```css
/* Default State - 떠있는 점토 */
background: linear-gradient(145deg, var(--card-bg) 0%, rgba(255, 255, 255, 0.95) 100%);
box-shadow:
  /* Dual shadows - 입체감 */
  8px 8px 16px var(--shadow-dark),
  -8px -8px 16px var(--shadow-light),
  /* Inner highlight */
  inset 2px 2px 4px rgba(255, 255, 255, 0.5),
  inset -2px -2px 4px rgba(0, 0, 0, 0.05);
```

#### 인터랙션
- **Hover**: Shadow 강화, 4px 위로 lift
- **Active**: Inset shadow로 눌린 느낌, `scale(0.97)`

---

### 2. Night Mode: Tactile Glassmorphism

**핵심 원리**: 어둠 속에서 빛을 머금고 투과하는 유리

#### 스타일 정의
```css
/* Default State - 떠있는 유리 */
background: rgba(255, 255, 255, 0.05~0.08);
backdrop-filter: blur(10-12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid transparent;
border-top-color: rgba(255, 255, 255, 0.1~0.15);
border-left-color: rgba(255, 255, 255, 0.05~0.08);
box-shadow:
  0 8px 24px rgba(0, 0, 0, 0.35),
  0 4px 12px rgba(0, 0, 0, 0.25);
```

#### 인터랙션
- **Hover**: 밝아짐 (`0.08`), shadow 강화, 4px lift
- **Active (Pressed)**: 
  ```css
  background: rgba(0, 0, 0, 0.2); /* 20% 어두워짐 */
  border-top-color: rgba(0, 0, 0, 0.1);
  box-shadow:
    inset 4px 4px 12px rgba(0, 0, 0, 0.5),
    inset -2px -2px 8px rgba(255, 255, 255, 0.03);
  transform: translateY(2px) scale(0.98); /* 물리적 depression */
  ```

---

## 🧩 컴포넌트 가이드

### 1. Info Cards (정보 카드)

**용도**: 달성률, 진행 기간, 현재 저축액, 남은 금액

#### Day Mode
- Background: Gradient (white → card-bg)
- Shadow: Dual neumorphic (8px offset)
- Interaction: Lift on hover, press on active

#### Night Mode
- Background: `rgba(255, 255, 255, 0.06)`
- Backdrop-filter: `blur(12px)`
- Border highlight: Top 12%, Left 6%
- Shadow: Deep drop shadow (20-28px)

---

### 2. Price Card (가격 카드)

**용도**: 목표 저축 금액 표시

#### Day Mode
- 동일한 neumorphic 스타일
- Accent color for amount text

#### Night Mode
- Background: `rgba(255, 255, 255, 0.05)`
- `blur(10px)` frosted effect
- Slightly lower opacity for subtle presence

---

### 3. Experience Button (CTA)

**용도**: 체험하기 메인 액션

#### Day Mode
- Solid accent background gradient
- Strong neumorphic shadows
- Inner highlight for depth

#### Night Mode
- **Accent Glass**: `rgba(212, 165, 116, 0.25~0.15)`
- Warm glow shadow
- Top border: `rgba(255, 255, 255, 0.2)`
- Stronger pressed effect with darkening

---

### 4. Theme Toggle (테마 전환 버튼)

**위치**: 우측 상단

#### Day Mode
- White background (`rgba(255, 255, 255, 0.9)`)
- Subtle green accent border
- Glassmorphic blur

#### Night Mode
- **Full Glassmorphism**
- `rgba(255, 255, 255, 0.06)` + `blur(12px)`
- Top highlight border
- Pressed: Dark inset with 2px depression

---

### 5. Color Theme Picker (색상 선택기)

**위치**: 좌측 상단  
**테마**: Warm Beige, Olive Green, Cool Gray, Sky Blue

#### Container
- **Day**: Neumorphic card
- **Night**: Glass container (`rgba(255, 255, 255, 0.05)` + blur)

#### Swatches
- **Night**: Individual glass buttons
- Border highlights, drop shadows
- Pressed: Inset + darkening

---

## 💡 조명 시스템

### 1. Global Mouse Light

**위치**: Fixed, full screen  
**기능**: 마우스 위치 추적 ambient glow

```css
.mouse-light-effect {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    circle 600px at var(--mouse-x) var(--mouse-y),
    rgba(255, 255, 255, 0.15) 0%,
    transparent 70%
  );
  mix-blend-mode: overlay; /* Day */
  animation: ambient-pulse 6s infinite;
}

html[data-theme="night"] .mouse-light-effect {
  background: radial-gradient(
    circle 800px at var(--mouse-x) var(--mouse-y),
    rgba(255, 180, 100, 0.15) 0%,
    transparent 70%
  );
  mix-blend-mode: screen;
}
```

---

### 2. Global Uplight (바닥 조명)

**위치**: Fixed bottom  
**높이**: 50vh

#### 특징
- **Day**: Subtle warmth (`overlay` blend)
- **Night**: Cozy lantern glow (`screen` blend)
- Gentle breathing animation (8s cycle)

```css
.rising-light-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50vh;
  z-index: -2;
}

html[data-theme="day"] .rising-light-container {
  background: linear-gradient(to top,
    rgba(255, 245, 235, 0.6) 0%,
    rgba(255, 245, 235, 0.2) 40%,
    transparent 100%);
  mix-blend-mode: overlay;
}

html[data-theme="night"] .rising-light-container {
  background: linear-gradient(to top,
    rgba(255, 180, 100, 0.25) 0%,
    rgba(255, 160, 80, 0.1) 50%,
    transparent 100%);
  mix-blend-mode: screen;
}
```

---

### 3. Glass Sphere Lighting

**3D 효과**: Crystal ball with volumetric lighting

#### Day Mode
- Realistic glass with inner reflections
- Specular glare (top-left)
- Prismatic rim light (bottom-right)
- Shimmer animation (8s)

#### Night Mode
- Dramatic glass with warm inner glow
- Strong inset shadows
- Golden highlights
- Enhanced shimmer (6s)

---

## 🛠 기술 스펙

### CSS Variables (Color Themes)

#### Warm Beige (Default)
```css
--showroom-bg-day: #E8E0D5;
--showroom-accent-day: #D4A574;
--showroom-bg-night: #3a3530;
--showroom-accent-night: #D4A574;
```

#### Olive Green
```css
--showroom-bg-day: #d2dcc8;
--showroom-accent-day: #81C784;
```

#### Cool Gray, Sky Blue
- 각각 고유한 color palette

---

### Glassmorphism 핵심 속성

```css
/* Essential Properties */
backdrop-filter: blur(10-12px);
-webkit-backdrop-filter: blur(12px); /* Safari */
background: rgba(white, 0.05~0.08);
border-top-color: rgba(white, 0.1~0.15);
box-shadow: 0 8px 24px rgba(black, 0.3);
```

---

### Animation Timing

- **Transition**: `400ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Ambient Pulse**: `6-8s ease-in-out infinite`
- **Hover Lift**: `translateY(-4px)`
- **Press Depression**: `translateY(2px) scale(0.98)`

---

## 📐 디자인 원칙

### 1. 하이라이트는 절제되게
- **Night 모드**: White highlight는 **5% 이하**
- 너무 밝으면 "플라스틱 광택" → "frosted metal" 느낌 유지

### 2. 그림자는 배경과 조화롭게
- **순수 검정 금지** (Night mode)
- 배경색의 darker tone 사용 (tinted shadows)

### 3. 표면은 미묘하게 밝게
- 버튼 표면 = 배경보다 **1-2% 밝음**
- 빛을 받는 물리적 자연스러움

### 4. Pressed State의 물리성
- 단순 scale 변화 ❌
- `translateY(2px)` + `scale(0.98)` ✅
- 손끝이 들어가는 tactile feedback

---

## 🎬 결론

이 디자인 시스템은 **Day/Night에 따라 완전히 다른 물리 법칙**을 적용하여, 사용자에게 시간대별로 최적화된 경험을 제공합니다.

- **Day**: 따뜻하고 친근한 clay 촉감
- **Night**: 차갑고 영롱한 glass 미래감

모든 인터랙션은 **tactile feedback**을 극대화하여 "만질 수 있는 UI"를 구현합니다. 🎨✨
