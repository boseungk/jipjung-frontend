export const DEFAULT_DREAM_HOME = {
  dreamHomeId: null, // null = 목표 미설정
  propertyName: '목표를 설정해주세요',
  houseName: null,
  location: '',
  price: 0,
  targetAmount: 0,
  monthlyGoal: 0,
  targetDate: '',
  currentAmount: 0
}

export const DEFAULT_GAMIFICATION = {
  currentLevel: 1,        // 기본 레벨 1
  levelTitle: '신입 건축가',
  experiencePoints: 0,    // 경험치 0
  nextLevelExp: 100,
  currentStreak: 0,       // 스트릭 0
  longestStreak: 0,
  treesCollected: 0,
  buildTrack: 'house',    // 'house' | 'furniture'
  houseStage: 1,          // 1~6 (webp stage1~6)
  furnitureStage: 0,      // 0~5 (webp interior layers)
  badges: []
}

export const LEVEL_TITLES = {
  1: '터파기',
  2: '기초 공사',
  3: '골조',
  4: '지붕',
  5: '외벽',
  6: '완공'
}

/**
 * 레벨별 누적 경험치 임계값 (백엔드 LevelPolicy.java와 동기화)
 * - 인덱스 = 레벨 - 1
 * - 예: 레벨 3 시작점 = LEVEL_THRESHOLDS[2] = 300
 */
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]
export const MAX_LEVEL = 6

/**
 * 현재 레벨 내에서의 진행도 계산
 * @param {number} currentExp - 현재 누적 경험치
 * @param {number} level - 현재 레벨 (1~6)
 * @returns {{ currentInLevel: number, requiredForLevel: number, percent: number }}
 */
export function calculateLevelProgress(currentExp, level) {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, level || 1))
  const levelStartExp = LEVEL_THRESHOLDS[safeLevel - 1] || 0

  // 최대 레벨인 경우
  if (safeLevel >= MAX_LEVEL) {
    return { currentInLevel: 0, requiredForLevel: 0, percent: 100 }
  }

  const nextLevelExp = LEVEL_THRESHOLDS[safeLevel] || LEVEL_THRESHOLDS[MAX_LEVEL - 1]
  const requiredForLevel = nextLevelExp - levelStartExp
  const currentInLevel = Math.max(0, (currentExp || 0) - levelStartExp)
  const percent = requiredForLevel > 0
    ? Math.min(100, Math.max(0, (currentInLevel / requiredForLevel) * 100))
    : 100

  return { currentInLevel, requiredForLevel, percent }
}

/**
 * 활동 기반 스트릭 마일스톤
 * - 7/14/21/28일 연속 활동 시 보너스 EXP 지급
 */
export const STREAK_MILESTONES = [
  { days: 7, exp: 50, label: '1주일 연속 접속!', emoji: '🔥' },
  { days: 14, exp: 100, label: '2주 연속!', emoji: '🌟' },
  { days: 21, exp: 150, label: '3주 연속!', emoji: '💪' },
  { days: 28, exp: 200, label: '4주 연속!', emoji: '🏆' }
]
