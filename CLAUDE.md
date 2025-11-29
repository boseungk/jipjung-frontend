# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**You are a Vue 3 senior developer with expertise in clean architecture, design systems, and performance optimization.**

## Project Overview

**집-중 (Jip-joong)** - Emotional-first savings gamification app with dual-phase progression (Phase 1: Construction → Phase 2: Interior Showroom). Core philosophy: **"Emotions first, functionality second"** (감성이 먼저, 기능은 그 다음).

## Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm preview          # Preview production build
```

## Core Architecture

**Stack**: Vue 3.4 (Composition API) + Vite 5 + Pinia 2.1 + Vue Router 4 + Tailwind CSS 3.4

**Key Systems**:
- **Design**: Glass/jelly CTAs + Glass containers + Minimal text
- **State**: 5 Pinia stores (auth, user, dreamHome, dsr, gamification) using setup pattern
- **Auth**: JWT with auto-refresh interceptor in `src/api/client.js`
- **Routing**: Meta-based guards (`requiresAuth`, `public`, `hideNavbar`)

## Clean Code Principles

### 1. No Magic Numbers or Hardcoding

❌ **Bad**:
```javascript
// Hardcoded values scattered everywhere
if (savings > 1000000) { ... }
timeout = 3000
margin = '24px'
```

✅ **Good**:
```javascript
// Constants in dedicated files
// src/constants/savings.js
export const SAVINGS_THRESHOLDS = {
  FIRST_MILESTONE: 100000,
  PHASE_TRANSITION: 1000000
}

// src/constants/timing.js
export const ANIMATION_DURATION = {
  SHORT: 300,
  MEDIUM: 600,
  LONG: 1000
}

// Use Tailwind utilities or CSS variables
<div class="mt-6"> <!-- Instead of style="margin-top: 24px" -->
```

### 2. Extract Constants and Configuration

**Create dedicated constant files**:
- `src/constants/colors.js` - Color palettes
- `src/constants/navigation.js` - Nav menu items
- `src/constants/api.js` - API endpoints
- `src/constants/validation.js` - Form validation rules

**Example**:
```javascript
// src/constants/api.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  SAVINGS: {
    LIST: '/savings',
    CREATE: '/savings',
    UPDATE: (id) => `/savings/${id}`
  }
}
```

### 3. Component Decomposition

❌ **Bad**: 500-line monolithic components

✅ **Good**: Single Responsibility Principle
```
✓ Small, focused components (< 200 lines)
✓ Extract reusable UI to src/components/common/
✓ Business logic to composables
✓ Data fetching to services
```

### 4. Composables for Reusable Logic

Extract ANY repeated logic to composables:

```javascript
// src/composables/useSavings.js
export function useSavings() {
  const { savingsRecords } = useDreamHomeStore()

  const totalSaved = computed(() =>
    savingsRecords.value.reduce((sum, record) => sum + record.amount, 0)
  )

  const progressPercentage = computed(() => {
    const target = SAVINGS_THRESHOLDS.FIRST_MILESTONE
    return Math.min((totalSaved.value / target) * 100, 100)
  })

  return { totalSaved, progressPercentage }
}
```

### 5. Service Layer Pattern

All API calls go through service layer:

```javascript
// src/api/services/savingsService.js
import apiClient from '@/api/client'
import { API_ENDPOINTS } from '@/constants/api'

export const savingsService = {
  async fetchSavings() {
    const { data } = await apiClient.get(API_ENDPOINTS.SAVINGS.LIST)
    return data
  },

  async createSaving(amount, memo) {
    const { data } = await apiClient.post(API_ENDPOINTS.SAVINGS.CREATE, {
      amount,
      memo,
      date: new Date().toISOString()
    })
    return data
  }
}
```

### 6. Type-Safe Props and Emits

```javascript
// Always define props with validators
const props = defineProps({
  amount: {
    type: Number,
    required: true,
    validator: (value) => value >= 0
  },
  category: {
    type: String,
    default: 'general',
    validator: (value) => ['general', 'bonus', 'interest'].includes(value)
  }
})

// Always define emits
const emit = defineEmits(['save', 'cancel'])
```

### 7. Error Handling Strategy

```javascript
// Always handle errors gracefully
async function handleSaving() {
  try {
    loading.value = true
    await savingsService.createSaving(amount.value, memo.value)
    showSuccessToast('저축 완료!')
  } catch (error) {
    console.error('Saving failed:', error)
    showErrorToast(error.response?.data?.message || '저축 등록에 실패했습니다.')
  } finally {
    loading.value = false
  }
}
```

### 8. CSS Variables over Hardcoded Colors

❌ **Bad**: `bg-[#f5e6d3]`

✅ **Good**: `bg-showroom-bg-day` (uses CSS variables from `src/assets/css/core/variables.css`)

### 9. Computed Properties for Derived State

```javascript
// ❌ Bad: Recalculating in template
<div>{{ (savings / target * 100).toFixed(1) }}%</div>

// ✅ Good: Computed property
const progressPercentage = computed(() =>
  ((savings.value / target.value) * 100).toFixed(1)
)
<div>{{ progressPercentage }}%</div>
```

### 10. DRY with Utility Functions

Create utilities in `src/utils/`:

```javascript
// src/utils/formatters.js
export function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

export function formatDate(date, format = 'short') {
  const options = format === 'short'
    ? { month: 'numeric', day: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric' }
  return new Intl.DateTimeFormat('ko-KR', options).format(new Date(date))
}
```

## Design System Rules

### Glass/Jelly CTAs (Day & Night)
- Buttons/Cards: nav glass tokens (`--nav-btn-blur-*`, `--nav-btn-shadow-*`) + brand accent gradient
- Hover: lift with `--nav-btn-shadow-*-hover`; Active: cushioned press `--nav-btn-press-shadow-*`

### Glassmorphism Containers
- Containers: `backdrop-blur-glass` + `bg-opacity-10` + `border border-white/20`
- Shadows: `shadow-glass`, `shadow-glass-lg`

### Display Priority (UX Hierarchy)
1. Crystal Ball (emotional)
2. Achievement % (motivation)
3. Gamification (engagement)
4. Data/Charts (information)
5. Details (reference)

## Performance

- GPU acceleration: `transform: translateZ(0)` for animations
- Target: 60fps mobile, <1.5s initial load
- Lazy-load views: `() => import('./views/...')`
- Optimize SVGs with SVGO

## Code Patterns

**Path Alias**: Always use `@/` for imports
```javascript
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatters'
```

**Store Pattern**: Composition API setup stores
```javascript
export const useExampleStore = defineStore('example', () => {
  const state = ref(0)
  const doubled = computed(() => state.value * 2)
  function increment() { state.value++ }
  return { state, doubled, increment }
})
```

**Composables**: Return reactive refs and functions
```javascript
export function useExample() {
  const data = ref(null)
  const loading = ref(false)

  async function fetch() { ... }

  return { data, loading, fetch }
}
```

## Critical Rules

1. **No hardcoding** - Extract to constants
2. **No 500-line components** - Decompose to SRP
3. **Service layer** - All API calls through services
4. **Composables** - Extract reusable logic
5. **Type-safe props** - Always validate
6. **Error handling** - Try/catch with user feedback
7. **CSS variables** - No inline hex colors
8. **Computed for derived state** - Never calculate in template
9. **DRY utilities** - Centralize formatters/validators
10. **Performance-first** - GPU acceleration, lazy loading
