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

## Code Guidelines

1. **Extract constants** - No magic numbers. Use `src/constants/` for values, thresholds, endpoints
2. **Small components** - Keep < 200 lines. Extract reusable UI, logic to composables, data to services
3. **Type-safe props** - Always validate props and define emits
4. **Service layer** - All API calls through services (e.g., `src/api/services/`)
5. **CSS variables** - Use `src/assets/css/core/variables.css`, no hardcoded hex colors
6. **Computed properties** - Never calculate in templates
7. **Error handling** - Try/catch with user feedback
8. **DRY utilities** - Centralize formatters/validators in `src/utils/`

## Design System

**Glassmorphism**:
- Buttons: nav glass tokens + brand accent gradient (use `--nav-btn-*` CSS variables)
- Containers: `backdrop-blur-glass` + `bg-opacity-10` + `border border-white/20`
- Shadows: `shadow-glass`, `shadow-glass-lg`

**UX Priority**: Crystal Ball (emotion) → Achievement % (motivation) → Gamification → Data → Details

## Performance

- GPU acceleration: `transform: translateZ(0)` for animations
- Target: 60fps mobile, <1.5s initial load
- Lazy-load views: `() => import('./views/...')`

## Patterns

- **Imports**: Always use `@/` path alias
- **Stores**: Pinia setup pattern with `defineStore()` + Composition API
- **Composables**: Return reactive refs and functions for reusable logic
- **Services**: API calls in `src/api/services/` with proper error handling

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
