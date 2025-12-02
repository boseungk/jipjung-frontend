export const DEFAULT_DREAM_HOME = {
  dreamHomeId: 1,
  propertyName: '래미안 아파트',
  location: '서울 강남구',
  price: 50000, // 만원 단위 (5억)
  targetAmount: 15000, // 계약금 30% (1.5억)
  monthlyGoal: 100, // 만원
  targetDate: '2026-12-31',
  currentAmount: 4250 // 만원 (425만원 저축)
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
