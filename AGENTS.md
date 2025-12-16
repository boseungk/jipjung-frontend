# Repository Guidelines (Frontend)

This file applies to the `jipjung-frontend/` tree.

## Quick Commands
- `npm ci` (or `npm install`) — install dependencies.
- `npm run dev` — start Vite dev server (port 5173).
- `npm run build` — production bundle via Vite.
- `npm run preview` — serve the built assets locally.

## Environment & API
- Copy `.env.example` → `.env.local` and set `VITE_KAKAO_MAP_KEY` if you use Kakao Map features.
- API base URL defaults to `/api` (see `src/api/client.js`); dev proxy is configured in `vite.config.js` to forward `/api/*` → `http://localhost:8080`.
- Prefer a single package manager; this repo has `package-lock.json`, so default to `npm` to avoid lockfile drift.

## Project Structure & Module Organization
- Entry: `src/main.js`; routes in `src/router` (guards in `src/router/guards.js`).
- State: Pinia stores in `src/stores` (auth/user state lives in `authStore`).
- API: `src/api/client.js` + `src/api/services/*` (service layer), errors in `src/api/errors.js`, endpoints in `src/api/endpoints.js`.
- UI: Vue 3 SFCs in `src/components` and pages in `src/views`.
- Styling: Tailwind + custom CSS layered via `src/assets/css/input.css` (variables in `src/assets/css/core/variables.css`, shared component styles in `src/assets/css/components/*`).
- Constants in `src/constants`; static assets in `public`.
- Path alias: `@` → `src` (see `vite.config.js`).
- API contract reference: `REST_API.md`.

## Coding Style & Conventions
- Vue SFCs use `<script setup>`; components use PascalCase filenames; composables use `useX` camelCase.
- Indentation: 2 spaces; prefer named exports for constants/composables.
- Icons: use `src/components/common/AppIcon.vue` instead of direct icon imports in UI components.
- Keep API calls out of components: `component → store action → service (src/api/services) → apiClient`.

## Agent-Specific Rules (Important)
- Navigation UI: reuse `nav-btn-base` / `dropdown-item-base` from `src/assets/css/components/navigation.css`.
- Theme/styling: avoid introducing new color tokens; extend existing CSS variables in `src/assets/css/core/variables.css` and wire via `src/assets/css/input.css`.

## User Data Single Source of Truth
- Read user-related state via `useAuthStore()` computed getters (`userDreamHome`, `userGamification`, `userAnnualIncome`, ...).
- Update user-related state via `authStore.updateProfile(...)` / `authStore.updateUserData(...)` (do not mutate `authStore.user` directly).
- Default mock values live in `src/constants/user.js` (`DEFAULT_DREAM_HOME`, `DEFAULT_GAMIFICATION`).

## Testing / QA
- No automated test suite currently; if you add one, prefer Vitest + Vue Test Utils.
- Manual QA focus: auth flow (login/register/logout), onboarding steps, navigation menus (desktop/mobile), theme toggles, property list/map, and responsive breakpoints.
