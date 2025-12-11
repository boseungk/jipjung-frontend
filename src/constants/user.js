export const DEFAULT_DREAM_HOME = {
  dreamHomeId: null, // null = 목표 미설정
  propertyName: '목표를 설정해주세요',
  location: '',
  price: 0,
  targetAmount: 0,
  monthlyGoal: 0,
  targetDate: '',
  currentAmount: 0
}

export const DEFAULT_GAMIFICATION = {
  currentLevel: 3,
  levelTitle: '꾸준한 실천가',
  experiencePoints: 80,
  nextLevelExp: 150,
  currentStreak: 7,
  longestStreak: 15,
  treesCollected: 3,
  buildTrack: 'house', // 'house' | 'furniture'
  houseStage: 1,       // 1~7 (phase7.svg)
  furnitureStage: 0,   // 0~5 (figure.svg layers)
  badges: []
}

export const LEVEL_TITLES = {
  1: '꿈나무',
  2: '새싹',
  3: '꾸준한 실천가',
  4: '전문가',
  5: '집나무 숲지기'
}
