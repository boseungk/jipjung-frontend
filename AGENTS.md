# Repository Guidelines

## Project Structure & Module Organization
- App entry: `src/main.js`; routes in `src/router`, stores in `src/stores`, composables under `src/composables`.
- UI: Vue 3 SFCs in `src/components`; shared atoms in `src/components/common`, navigation in `src/components/navigation`, views in `src/views`.
- Styling: Tailwind and custom CSS layered via `src/assets/css/input.css` (imports `components/navigation.css`, variables, etc.).
- Constants in `src/constants`; assets/public files in `public`.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — production bundle via Vite.
- `npm run preview` — serve the built assets locally for QA.

## Coding Style & Naming Conventions
- Vue SFCs with `<script setup>`; components use PascalCase filenames (e.g., `TopNavigationBar.vue`), composables use `useX` camelCase (e.g., `useTheme.js`).
- Indentation: 2 spaces; prefer named exports for constants/composables.
- Styling: keep shared nav/button styles in `src/assets/css/components/navigation.css`; favor CSS variables defined in `input.css`.
- Icons: use `AppIcon` wrapper (Phosphor) instead of direct imports in components.

## Testing Guidelines
- No automated test suite present; add unit tests alongside features if introduced (suggest Vitest + Vue Test Utils).
- For manual QA, cover: navigation dropdowns (desktop/mobile), theme toggles, login/logout flow, and responsive breakpoints.
- Name new test files `*.spec.js` under a co-located `__tests__` or the feature folder.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subjects; prefer Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) for clarity.
- PRs: include summary, scope of change, and screenshots/GIFs for UI updates (desktop + mobile if applicable). Link related issues and note any follow-ups.
- Check that `npm run build` succeeds before requesting review; describe manual QA steps taken.

## Security & Configuration Tips
- Keep secrets out of the repo; rely on environment variables (not present by default—add `.env.example` if you introduce any).
- Axios client (`src/api/client.js`) is the central place for headers/interceptors; update there for auth or logging changes.

## Agent-Specific Instructions
- When adding navigation UI, reuse `nav-btn-base`/`dropdown-item-base` classes from `src/assets/css/components/navigation.css`.
- Avoid introducing new color tokens; extend existing CSS variables in `src/assets/css/input.css` for theme-aware styling.

## User Data Single Source
- 모든 사용자 데이터는 `authStore.user`에서 읽고 업데이트 (`authService`/`mockAuthService` 경유).
- 모의 데이터 기본값은 `src/constants/user.js` (`DEFAULT_DREAM_HOME`, `DEFAULT_GAMIFICATION`); user 객체에 `dreamHome`, `gamification` 포함.
- UI/스토어는 `authStore` computed(`userDreamHome`, `userGamification`, `userAnnualIncome` 등) 사용. `userStore`는 제거됨.
- 목표/XP 업데이트는 `authStore.updateProfile`로 반영해 mock/실제 API 모두 대응.***
