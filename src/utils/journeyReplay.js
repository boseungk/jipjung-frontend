export const toNumber = (value, fallback = 0) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return numeric
}

const clampPhase = (value, maxPhase) => {
  const clamped = Math.max(1, value)
  if (!Number.isFinite(maxPhase)) return clamped
  return Math.min(maxPhase, clamped)
}

export const toPhaseNumber = (value, maxPhase) => {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return clampPhase(Math.trunc(numeric), maxPhase)
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+/)
    if (match) {
      const parsed = Number(match[0])
      if (Number.isFinite(parsed)) {
        return clampPhase(Math.trunc(parsed), maxPhase)
      }
    }
  }
  return null
}

export const normalizeJourneyData = (data, totalPhases) => {
  if (!data) return null

  const collection = data.collection ?? {}
  const summary = data.summary ?? {}

  const themeCode = String(
    collection.themeCode ?? data.themeCode ?? collection.theme ?? data.theme ?? 'CLASSIC'
  ).toUpperCase()

  const propertyName = collection.propertyName
    ?? collection.houseName
    ?? collection.name
    ?? data.propertyName
    ?? data.houseName
    ?? '드림홈'

  const location = collection.location ?? data.location ?? ''

  const phases = Array.isArray(data.phases) ? data.phases : []
  const normalizedPhases = phases.map((phase, index) => {
    const fallbackPhase = Number.isFinite(totalPhases)
      ? Math.min(totalPhases, index + 1)
      : index + 1
    const phaseNumber = toPhaseNumber(
      phase.phaseNumber ?? phase.phase ?? phase.stageNumber ?? phase.stage ?? index + 1,
      totalPhases
    ) ?? fallbackPhase

    const rawEvents = Array.isArray(phase.events) ? phase.events : []
    const normalizedEvents = rawEvents.map((event) => {
      const eventType = String(event.eventType ?? event.type ?? 'UNKNOWN').toUpperCase()
      const expChange = toNumber(event.expChange ?? event.exp ?? event.expEarned ?? 0)
      const cumulativeExp = toNumber(
        event.cumulativeExp ?? event.cumulative ?? event.cumulativeTotal ?? 0
      )
      return {
        ...event,
        eventType,
        amount: toNumber(event.amount ?? event.value ?? 0),
        expChange,
        cumulativeExp,
        date: event.date ?? event.createdAt ?? event.recordedAt ?? null,
        memo: event.memo ?? event.note ?? ''
      }
    })

    const cumulativeExp = toNumber(
      phase.cumulativeExp ?? phase.cumulativeAmount ?? phase.cumulativeTotal ?? 0
    )

    return {
      ...phase,
      phaseNumber,
      phaseName: phase.phaseName ?? phase.name ?? `Phase ${phaseNumber}`,
      reachedAt: phase.reachedAt ?? phase.reachedDate ?? phase.completedAt ?? phase.date ?? null,
      cumulativeAmount: toNumber(phase.cumulativeAmount ?? phase.savedAmount ?? phase.amount ?? 0),
      cumulativeExp,
      events: normalizedEvents
    }
  })

  const summaryData = {
    startDate: summary.startDate ?? summary.startedAt ?? summary.start ?? null,
    completedDate: summary.completedDate ?? summary.completedAt ?? summary.completed ?? null,
    totalDays: toNumber(summary.totalDays ?? summary.durationDays ?? summary.days ?? 0),
    targetAmount: toNumber(
      summary.targetAmount ?? summary.totalSaved ?? summary.totalAmount ?? summary.savedAmount ?? 0
    ),
    targetExp: toNumber(summary.targetExp ?? summary.goalExp ?? summary.maxExp ?? 0),
    totalExp: toNumber(summary.totalExp ?? summary.currentExp ?? summary.exp ?? 0),
    currentPhase: toPhaseNumber(
      summary.currentPhase ?? summary.currentStep ?? summary.currentStage ?? 0,
      totalPhases
    ) ?? 0
  }

  const maxUnlockedPhase = toPhaseNumber(
    data.maxUnlockedPhase
    ?? summary.maxUnlockedPhase
    ?? data.currentPhase
    ?? summary.currentPhase
    ?? data.currentStep
    ?? summary.currentStep
    ?? collection.currentPhase
    ?? collection.currentStage
    ?? collection.currentStep
    ?? data.currentStage
    ?? summary.currentStage
    ?? collection.stage
    ?? data.stage
    ?? summary.stage
    ?? null,
    totalPhases
  )

  return {
    collection: {
      propertyName,
      location,
      themeCode: themeCode || 'CLASSIC'
    },
    summary: summaryData,
    phases: normalizedPhases,
    maxUnlockedPhase
  }
}

export const isPhaseUnlocked = (phase) => {
  if (!phase) return false
  if (phase.reachedAt) return true
  if (Array.isArray(phase.events) && phase.events.length > 0) return true
  if (Number.isFinite(phase.cumulativeExp) && phase.cumulativeExp > 0) return true
  if (Number.isFinite(phase.cumulativeAmount) && phase.cumulativeAmount > 0) return true
  if (phase.isUnlocked || phase.unlocked || phase.isReached || phase.isCompleted) return true
  if (phase.status) {
    const status = String(phase.status).toUpperCase()
    if (['UNLOCKED', 'REACHED', 'COMPLETED', 'DONE', 'ACTIVE', 'CURRENT'].includes(status)) {
      return true
    }
  }
  return false
}

export const formatJourneyDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export const formatJourneyShortDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export const formatJourneyMoney = (amount) => {
  const numeric = toNumber(amount, 0)
  if (numeric <= 0) return '0원'
  if (numeric >= 100000000) {
    return `${(numeric / 100000000).toFixed(1)}억`
  }
  if (numeric >= 10000) {
    return `${Math.round(numeric / 10000).toLocaleString()}만원`
  }
  return `${numeric.toLocaleString()}원`
}

export const formatJourneyExp = (value) => {
  const numeric = toNumber(value, 0)
  return `${numeric.toLocaleString()} XP`
}
