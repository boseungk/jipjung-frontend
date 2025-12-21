# Gamification Final Stage Open Questions

## Context
- File: `jipjung-frontend/src/stores/gamificationStore.js`
- Current UX idea: after completing a house, if savings remain, the user selects a new house theme and continues growing it.

## Current Behavior (Summary)
- `addExperience` auto-switches from house -> furniture once house stage reaches 6.
- `applyGrowthResult` keeps the current track even at house stage 6 unless the user explicitly starts furniture.
- `applyJudgmentGrowth` uses a different furniture EXP accumulation path.
- `nextLevelExp` uses `requiredForLevel || calculateNextMilestoneExp(...)`, which overrides `0` and can misreport max-level progress.

## Ambiguities / Inconsistencies
- House completion:
  - `addExperience` flips to furniture automatically.
  - `applyGrowthResult` explicitly *does not* auto-switch.
  - This creates conflicting behavior depending on which entry path is used.
- Furniture final stage:
  - `addExperience` can keep emitting badges even when the stage is already maxed.
  - `applyGrowthResult` caps EXP at the final milestone.
  - `applyJudgmentGrowth` can accumulate EXP beyond the final milestone.
- Max-level progress:
  - If `requiredForLevel` is `0` (max level), the fallback overrides it with a computed milestone value.

## Decision Options
1) **Post-Completion Theme Cycle (recommended for current UX idea)**
   - After house stage 6, prompt theme selection and restart house progression.
   - Store `houseThemeId` and `houseCycle` (or `themeRunId`) to track history.
   - Keep furniture progression as an optional side track or separate "interior mode".
2) **Auto-switch to Furniture**
   - Preserve current `addExperience` behavior.
   - Make `applyGrowthResult` and `applyJudgmentGrowth` follow the same auto-switch rule.
3) **Freeze at Max**
   - Stop EXP accumulation and badge issuance after final stage.
   - Provide a "start new theme" or "reset" action for the next cycle.

## Data Model Questions
- Do we need `houseThemeId` / `themeRunId` to identify the current house?
- Should EXP carry into the next theme cycle or reset to 0?
- Should badges be per theme cycle or global history?
- Should furniture be a per-theme track or a global track?

## Suggested Next Step
- Decide the target flow (1/2/3 above), then align:
  - `addExperience`
  - `applyGrowthResult`
  - `applyJudgmentGrowth`
  - `nextLevelExp` (max-level handling)

## Related Docs
- `jipjung-frontend/docs/HOUSE_THEME_GAMIFICATION_REFACTORING_PRD.md`
- `jipjung-frontend/docs/HOUSE_THEME_SCHEMA_REFACTORING.md`
