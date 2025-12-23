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

export const MAX_LEVEL = 6

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
