const STORAGE_PREFIX = 'goalCompletionShown'

const getGoalCompletionKey = (userId) => {
  const numericId = Number(userId)
  if (Number.isFinite(numericId) && numericId > 0) {
    return `${STORAGE_PREFIX}:${Math.trunc(numericId)}`
  }
  return `${STORAGE_PREFIX}:guest`
}

export const readGoalCompletionId = (userId) => {
  try {
    return localStorage.getItem(getGoalCompletionKey(userId))
  } catch (error) {
    return null
  }
}

export const hasGoalCompletionShown = (userId, dreamHomeId) => {
  if (dreamHomeId == null) return false
  const stored = readGoalCompletionId(userId)
  if (!stored) return false
  return String(stored) === String(dreamHomeId)
}

export const markGoalCompletionShown = (userId, dreamHomeId) => {
  if (dreamHomeId == null) return
  try {
    localStorage.setItem(getGoalCompletionKey(userId), String(dreamHomeId))
  } catch (error) {
    // ignore storage failures
  }
}
