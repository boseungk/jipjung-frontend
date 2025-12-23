const TOTAL_PHASES = 11
const HOUSE_PHASES = 6

const toNumber = (value, fallback = null) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export const normalizeGoalProgress = (goal) => {
  const targetExp = toNumber(goal?.targetExp, null)
  const totalExp = toNumber(goal?.totalExp, null)
  let expProgress = toNumber(goal?.expProgress, null)
  let currentPhase = toNumber(goal?.currentPhase, null)

  if (Number.isFinite(targetExp) && targetExp > 0 && Number.isFinite(totalExp)) {
    if (!Number.isFinite(expProgress)) {
      const percent = (totalExp / targetExp) * 100
      expProgress = Math.min(100, Math.max(0, Math.round(percent * 10) / 10))
    }
    if (!Number.isFinite(currentPhase)) {
      const phase = Math.floor((totalExp * TOTAL_PHASES) / targetExp) + 1
      currentPhase = Math.min(TOTAL_PHASES, Math.max(1, phase))
    }
  }

  return {
    targetExp,
    totalExp,
    expProgress,
    currentPhase
  }
}

export const getTrackFromPhase = (phase) => {
  const safePhase = Number.isFinite(phase) ? Math.trunc(phase) : 1
  return safePhase <= HOUSE_PHASES ? 'house' : 'furniture'
}

export const getStageFromPhase = (phase) => {
  const safePhase = Number.isFinite(phase) ? Math.max(1, Math.trunc(phase)) : 1
  return safePhase <= HOUSE_PHASES ? safePhase : safePhase - HOUSE_PHASES
}

export const getPhaseLabel = (phase, houseLabels = []) => {
  const safePhase = Number.isFinite(phase) ? Math.max(1, Math.trunc(phase)) : 1
  if (safePhase <= HOUSE_PHASES) {
    return houseLabels[safePhase - 1] || `단계 ${safePhase}`
  }
  return `인테리어 ${safePhase - HOUSE_PHASES}단계`
}

export const getStageProgress = (totalExp, targetExp, currentPhase) => {
  if (!Number.isFinite(targetExp) || targetExp <= 0) return null
  if (!Number.isFinite(totalExp)) return null

  const perStage = targetExp / TOTAL_PHASES
  const phase = Number.isFinite(currentPhase) ? Math.max(1, Math.min(TOTAL_PHASES, Math.trunc(currentPhase))) : 1
  const stageStart = perStage * (phase - 1)
  const stageEnd = phase >= TOTAL_PHASES ? targetExp : perStage * phase
  const currentInStage = Math.max(0, totalExp - stageStart)
  const requiredForStage = Math.max(0, stageEnd - stageStart)
  const remainingInStage = Math.max(0, stageEnd - totalExp)

  return {
    perStage,
    stageStart,
    stageEnd,
    currentInStage,
    requiredForStage,
    remainingInStage
  }
}

export const GOAL_PROGRESS_PHASES = {
  total: TOTAL_PHASES,
  house: HOUSE_PHASES,
  furniture: TOTAL_PHASES - HOUSE_PHASES
}
