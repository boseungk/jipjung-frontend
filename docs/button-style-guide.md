# 버튼 스타일 가이드 (Glassmorphism Design System)

## 📖 개요

전체 앱에서 사용할 통일된 버튼 스타일 시스템입니다. 기존 **Neumorphism** 디자인을 **Glassmorphism**으로 대체하여, Day/Night 모드 모두에서 일관된 디자인 언어를 제공합니다.

---

## 🎨 디자인 철학

### Day Mode: Soft Glassmorphism
- **투명한 유리 느낌**: 배경이 살짝 비치는 반투명 효과
- **부드러운 블러**: 배경과 자연스럽게 섞이는 블러 효과
- **따뜻한 그림자**: 베이지 톤과 어울리는 부드러운 브라운 그림자

### Night Mode: Enhanced Glassmorphism  
- **깊이 있는 유리**: 더 강한 블러로 몽환적인 분위기
- **다층 그림자**: 내부 하이라이트 + 외부 그림자로 입체감 강조
- **명확한 경계**: 더 선명한 테두리로 어두운 배경과 구분

---

## 📐 CSS 변수 시스템

모든 버튼 스타일은 CSS 변수로 관리되어 **한 곳에서 모든 버튼을 제어**할 수 있습니다.

### 위치
```
src/assets/css/core/variables.css
```

### Day Mode 변수
```css
/* 배경 및 블러 */
--nav-btn-bg-day: rgba(255, 255, 255, 0.75);
--nav-btn-blur-day: 10px;
--nav-btn-border-day: rgba(255, 255, 255, 0.6);

/* 그림자 */
--nav-btn-shadow-day: 
    0 4px 12px rgba(88, 60, 50, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);

--nav-btn-shadow-day-hover: 
    0 6px 16px rgba(88, 60, 50, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.9);

--nav-btn-press-shadow-day: 
    inset 0 3px 8px rgba(88, 60, 50, 0.15);
```

### Night Mode 변수
```css
/* 배경 및 블러 */
--nav-btn-bg-night: rgba(255, 255, 255, 0.08);
--nav-btn-blur-night: 16px;
--nav-btn-border-night: rgba(255, 255, 255, 0.15);

/* 그림자 */
--nav-btn-shadow-night: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.15),
    inset 0 -1px 1px rgba(0, 0, 0, 0.2);

--nav-btn-shadow-night-hover: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);

--nav-btn-press-shadow-night: 
    inset 0 4px 16px rgba(0, 0, 0, 0.5);
```

---

## 🔧 사용 방법

### 1. 기본 버튼 클래스 적용

```vue
<button class="glass-btn">클릭</button>
```

### 2. CSS 스타일 정의

```css
.glass-btn {
  /* 레이아웃 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  
  /* 모양 */
  border-radius: var(--nav-btn-radius, 20px);
  
  /* 애니메이션 */
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

/* Day Mode */
html[data-theme="day"] .glass-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  box-shadow: var(--nav-btn-shadow-day);
}

html[data-theme="day"] .glass-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: var(--nav-btn-shadow-day-hover);
}

html[data-theme="day"] .glass-btn:active {
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
  box-shadow: var(--nav-btn-press-shadow-day);
}

/* Night Mode */
html[data-theme="night"] .glass-btn {
  background: var(--nav-btn-bg-night);
  backdrop-filter: blur(var(--nav-btn-blur-night));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-night));
  border: 1px solid var(--nav-btn-border-night);
  box-shadow: var(--nav-btn-shadow-night);
}

html[data-theme="night"] .glass-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: var(--nav-btn-shadow-night-hover);
}

html[data-theme="night"] .glass-btn:active {
  background: rgba(0, 0, 0, 0.3);
  transform: translateY(1px) scale(0.97);
  opacity: 0.8;
  box-shadow: var(--nav-btn-press-shadow-night);
}
```

---

## 🎭 애니메이션 명세

### Hover 효과
```css
transform: translateY(-2px);  /* 위로 2px 부상 */
box-shadow: [더 강한 그림자];  /* 깊이감 증가 */
```

### Active (클릭) 효과
```css
transform: translateY(1px) scale(0.97);  /* 아래로 1px + 97% 축소 */
opacity: 0.8;  /* 80% 투명도 */
box-shadow: [내부 그림자];  /* 눌린 느낌 */
```

### Transition
```css
transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
/* Bouncy spring easing - 탄력 있는 느낌 */
```

---

## 📦 버튼 변형 (Variants)

### 1. Primary Button (강조)
```css
.glass-btn-primary {
  /* 기본 glass-btn 상속 */
  background: rgba(255, 127, 80, 0.15);  /* Living Coral tint */
  color: var(--brand-accent, #FF7F50);
  border: 1px solid rgba(255, 127, 80, 0.3);
}
```

### 2. Icon Button (아이콘 전용)
```css
.glass-btn-icon {
  /* 기본 glass-btn 상속 */
  width: 40px;
  height: 40px;
  padding: 0;
}
```

### 3. Menu Item (긴 버튼)
```css
.glass-btn-menu {
  /* 기본 glass-btn 상속 */
  width: 100%;
  justify-content: flex-start;
  gap: 0.5rem;
}
```

---

## ✅ 체크리스트 (기존 Neumorphism 교체 시)

### 1. CSS 변수 확인
- [ ] `variables.css`에 glassmorphism 변수 정의 확인
- [ ] 기존 `--neu-*` 변수 제거 또는 deprecated 표시

### 2. 컴포넌트 업데이트
- [ ] 기존 `.neu-btn` 클래스를 `.glass-btn`으로 변경
- [ ] `backdrop-filter` 추가
- [ ] `box-shadow` 를 변수 참조로 교체

### 3. 호환성 확인
- [ ] Chrome/Edge (backdrop-filter 지원)
- [ ] Safari (-webkit-backdrop-filter 필수)
- [ ] Firefox (backdrop-filter 지원)

### 4. 가독성 테스트
- [ ] 다양한 배경에서 텍스트 대비도 확인
- [ ] WCAG AA 기준 충족 여부 확인

---

## 🚫 주의사항

### 1. 하드코딩 금지
❌ **나쁜 예**:
```css
.my-button {
  background: rgba(255, 255, 255, 0.75);  /* 하드코딩 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

✅ **좋은 예**:
```css
.my-button {
  background: var(--nav-btn-bg-day);  /* 변수 사용 */
  box-shadow: var(--nav-btn-shadow-day);
}
```

### 2. Backdrop-filter 필수
Glassmorphism의 핵심은 **backdrop-filter**입니다. 항상 포함하세요:
```css
backdrop-filter: blur(var(--nav-btn-blur-day));
-webkit-backdrop-filter: blur(var(--nav-btn-blur-day));  /* Safari */
```

### 3. 일관된 애니메이션
모든 버튼은 **동일한 애니메이션**을 사용해야 합니다:
- Hover: `translateY(-2px)`
- Active: `translateY(1px) scale(0.97)` + `opacity: 0.8`

---

## 📚 참고 자료

- 현재 구현: `src/assets/css/components/navigation.css`
- 변수 정의: `src/assets/css/core/variables.css`
- 예제 컴포넌트: `src/components/navigation/ThemeControls.vue`

---

## 🎯 마이그레이션 가이드 (Neumorphism → Glassmorphism)

### Before (Neumorphism)
```css
.neu-btn {
  background: var(--showroom-bg-day);
  box-shadow: 
    -4px -4px 8px var(--neu-shadow-light-day),
    4px 4px 12px var(--neu-shadow-dark-day);
}
```

### After (Glassmorphism)
```css
.glass-btn {
  background: var(--nav-btn-bg-day);
  backdrop-filter: blur(var(--nav-btn-blur-day));
  -webkit-backdrop-filter: blur(var(--nav-btn-blur-day));
  border: 1px solid var(--nav-btn-border-day);
  box-shadow: var(--nav-btn-shadow-day);
}
```

### 주요 차이점
1. **배경**: 불투명 → 반투명
2. **블러**: 없음 → 10~16px
3. **테두리**: 없음 → 흰색 테두리 추가
4. **그림자**: 양방향 → 단방향 + inset

---

**마지막 업데이트**: 2025-11-28
