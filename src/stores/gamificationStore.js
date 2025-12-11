import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore'
import { DEFAULT_GAMIFICATION, LEVEL_TITLES } from '@/constants/user'

const HOUSE_TOTAL_STAGES = 7
const FURNITURE_TOTAL_STAGES = 5
const BADGE_HISTORY_LIMIT = 12

const HOUSE_BADGE_MESSAGES = [
  '씨앗을 심고 기초를 다졌어요 🌱',
  '뼈대가 올라가고 있어요 🏗️',
  '벽을 세워 공간을 만들었어요 🧱',
  '창문과 문이 생겼어요 🚪',
  '지붕을 올렸어요. 거의 다 왔어요 🏠',
  '마감 공사 중이에요 ✨',
  '집이 완성됐어요! 이제 가구를 채워볼까요? 🏡'
]

const FURNITURE_BADGE_MESSAGES = [
  '배경과 바닥을 정돈했어요 🪴',
  '소파가 들어왔어요 🛋️',
  '테이블과 수납을 배치했어요 🪑',
  '조명을 켜서 분위기를 더했어요 💡',
  '소품까지 모두 완성! 🎉'
]

export const useGamificationStore = defineStore('gamification', () => {
  const authStore = useAuthStore()
  const gamification = computed(() => ({
    ...DEFAULT_GAMIFICATION,
    ...(authStore.userGamification || {})
  }))

  // State derived from user data
  const currentLevel = computed(() => gamification.value.currentLevel ?? DEFAULT_GAMIFICATION.currentLevel)
  const levelTitle = computed(() => gamification.value.levelTitle || LEVEL_TITLES[currentLevel.value] || DEFAULT_GAMIFICATION.levelTitle)
  const experiencePoints = computed(() => Math.max(0, Number(gamification.value.experiencePoints) || 0))
  const buildTrack = computed(() => gamification.value.buildTrack || 'house')
  const houseStage = computed(() => {
    const stage = Number(gamification.value.houseStage)
    const safeStage = Number.isFinite(stage) && stage > 0 ? stage : 1
    return Math.min(HOUSE_TOTAL_STAGES, safeStage)
  })
  const furnitureStage = computed(() => {
    const stage = Number(gamification.value.furnitureStage)
    const safeStage = Number.isFinite(stage) && stage >= 0 ? stage : 0
    return Math.min(FURNITURE_TOTAL_STAGES, safeStage)
  })
  const badgeHistory = computed(() => gamification.value.badges || [])
  const latestBadge = computed(() => badgeHistory.value[0] || null)
  const badgeCount = computed(() => badgeHistory.value.length)
  const currentStreak = computed(() => Number(gamification.value.currentStreak) || 0)
  const longestStreak = computed(() => Number(gamification.value.longestStreak) || 0)
  const treesCollected = computed(() => Number(gamification.value.treesCollected) || 0)

  const activeStage = computed(() => {
    if (buildTrack.value === 'house') return houseStage.value
    return Math.max(1, furnitureStage.value || 1)
  })

  // Getters
  const nextLevelExp = computed(() => calculateNextMilestoneExp(buildTrack.value, activeStage.value))
  const expProgress = computed(() => {
    if (!nextLevelExp.value) return '0.0'
    return Math.min(100, (experiencePoints.value / nextLevelExp.value) * 100).toFixed(1)
  })

  const remainingExp = computed(() => {
    return Math.max(0, nextLevelExp.value - experiencePoints.value)
  })

  const isHouseComplete = computed(() => houseStage.value >= HOUSE_TOTAL_STAGES)
  const isFurnitureComplete = computed(() => buildTrack.value === 'furniture' && furnitureStage.value >= FURNITURE_TOTAL_STAGES)

  const gamificationInfo = computed(() => ({
    currentLevel: currentLevel.value,
    levelTitle: levelTitle.value,
    experiencePoints: experiencePoints.value,
    nextLevelExp: nextLevelExp.value,
    expProgress: expProgress.value,
    remainingExp: remainingExp.value,
    currentStreak: currentStreak.value,
    longestStreak: longestStreak.value,
    treesCollected: treesCollected.value,
    buildTrack: buildTrack.value,
    houseStage: houseStage.value,
    furnitureStage: furnitureStage.value,
    badgeCount: badgeCount.value,
    badges: badgeHistory.value,
    latestBadge: latestBadge.value,
    isHouseComplete: isHouseComplete.value,
    isFurnitureComplete: isFurnitureComplete.value
  }))

  function calculateNextMilestoneExp(track, stage) {
    const base = track === 'house' ? 150 : 180
    const step = track === 'house' ? 20 : 25
    const stageIndex = Math.max(0, (stage || 1) - 1)
    return base + stageIndex * step
  }

  function deriveLevelFromBadges(count) {
    if (count >= 8) return 5
    if (count >= 6) return 4
    if (count >= 4) return 3
    if (count >= 2) return 2
    return 1
  }

  function buildBadgePayload(track, stage, order) {
    const isHouse = track === 'house'
    const labels = isHouse ? HOUSE_BADGE_MESSAGES : FURNITURE_BADGE_MESSAGES
    const safeIndex = Math.min(labels.length - 1, Math.max(0, stage - 1))

    return {
      id: `badge-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      track,
      stage,
      label: isHouse
        ? `집 단계 ${stage}/${HOUSE_TOTAL_STAGES}`
        : `가구 단계 ${stage}/${FURNITURE_TOTAL_STAGES}`,
      message: labels[safeIndex],
      earnedAt: new Date().toISOString(),
      order
    }
  }

  async function saveGamification(updatedGamification) {
    try {
      await authStore.updateProfile({ gamification: updatedGamification })
    } catch (error) {
      console.error('Failed to update gamification data:', error)
      throw error
    }
  }

  // Actions
  async function addExperience(rawExp) {
    let pendingExp = Math.max(0, Number(rawExp) || 0)
    let nextTrack = buildTrack.value || 'house'
    let nextHouseStage = houseStage.value
    let nextFurnitureStage = furnitureStage.value
    let accumulatedExp = experiencePoints.value
    const updatedBadges = [...badgeHistory.value]

    const resolveActiveStage = () => {
      return nextTrack === 'house'
        ? Math.max(1, nextHouseStage)
        : Math.max(1, nextFurnitureStage || 1)
    }

    while (true) {
      const activeStageValue = resolveActiveStage()
      const milestone = calculateNextMilestoneExp(nextTrack, activeStageValue)
      const totalExp = accumulatedExp + pendingExp

      if (totalExp < milestone) {
        accumulatedExp = totalExp
        break
      }

      const overflow = totalExp - milestone
      pendingExp = overflow
      accumulatedExp = 0

      const newBadge = buildBadgePayload(nextTrack, activeStageValue, updatedBadges.length + 1)
      updatedBadges.unshift(newBadge)
      updatedBadges.splice(BADGE_HISTORY_LIMIT)

      if (nextTrack === 'house') {
        const advancedHouseStage = Math.min(HOUSE_TOTAL_STAGES, nextHouseStage + 1)
        nextHouseStage = advancedHouseStage
        if (advancedHouseStage >= HOUSE_TOTAL_STAGES) {
          nextTrack = 'furniture'
          nextFurnitureStage = Math.max(nextFurnitureStage, 1)
        }
      } else {
        nextFurnitureStage = Math.min(
          FURNITURE_TOTAL_STAGES,
          Math.max(0, nextFurnitureStage) + 1
        )
      }

      if (pendingExp <= 0) {
        break
      }
    }

    const derivedLevel = Math.max(
      currentLevel.value || 1,
      deriveLevelFromBadges(updatedBadges.length)
    )

    const nextLevelExpValue = calculateNextMilestoneExp(
      nextTrack,
      nextTrack === 'house'
        ? Math.max(1, nextHouseStage)
        : Math.max(1, nextFurnitureStage)
    )

    const updated = {
      ...gamification.value,
      buildTrack: nextTrack,
      houseStage: nextHouseStage,
      furnitureStage: nextFurnitureStage,
      experiencePoints: accumulatedExp,
      currentLevel: derivedLevel,
      levelTitle: LEVEL_TITLES[derivedLevel] || levelTitle.value,
      badges: updatedBadges,
      nextLevelExp: nextLevelExpValue
    }

    await saveGamification(updated)
  }

  async function levelUp() {
    const missingExp = Math.max(0, nextLevelExp.value - experiencePoints.value)
    if (missingExp === 0) {
      await addExperience(0)
      return
    }
    await addExperience(missingExp)
  }

  async function syncMilestones() {
    if (experiencePoints.value >= nextLevelExp.value) {
      await addExperience(0)
    }
  }

  async function incrementStreak() {
    const nextCurrentStreak = currentStreak.value + 1
    const nextLongestStreak = Math.max(nextCurrentStreak, longestStreak.value)
    const updated = {
      ...gamification.value,
      currentStreak: nextCurrentStreak,
      longestStreak: nextLongestStreak
    }
    await saveGamification(updated)
  }

  async function resetStreak() {
    const updated = {
      ...gamification.value,
      currentStreak: 0
    }
    await saveGamification(updated)
  }

  async function resetFurnitureProgress() {
    const updated = {
      ...gamification.value,
      buildTrack: 'furniture',
      furnitureStage: 0,
      houseStage: Math.max(houseStage.value, HOUSE_TOTAL_STAGES),
      experiencePoints: 0,
      nextLevelExp: calculateNextMilestoneExp('furniture', 1),
      badges: gamification.value.badges || []
    }
    await saveGamification(updated)
  }

  async function resetHouseProgress() {
    const updated = {
      ...gamification.value,
      buildTrack: 'house',
      houseStage: 1,
      furnitureStage: 0,
      experiencePoints: 0,
      nextLevelExp: calculateNextMilestoneExp('house', 1),
      badges: gamification.value.badges || [],
      currentLevel: currentLevel.value,
      levelTitle: levelTitle.value
    }
    await saveGamification(updated)
  }

  /**
   * 성장 결과 반영 (저축 API 응답에서 사용)
   * 
   * 백엔드 SavingsRecordResponse.GrowthResult 필드:
   * - resultType: 'SUCCESS' | 'LEVEL_UP'
   * - expChange: 획득 경험치
   * - currentExp: 현재 총 경험치
   * - maxExp: 다음 레벨까지 필요 경험치
   * - level: 현재 레벨
   * - isLevelUp: 레벨업 여부
   * - levelLabel: 레벨 타이틀 (예: "2층 골조 공사")
   * 
   * @param {Object} growth - SavingsRecordResponse.growth
   */
  function applyGrowthResult(growth) {
    if (!growth) return

    authStore.updateUserData({
      gamification: {
        ...authStore.userGamification,
        // 필드명 매핑 (백엔드 → 프론트엔드)
        experiencePoints: growth.currentExp,  // currentExp → experiencePoints
        currentLevel: growth.level,           // level → currentLevel
        nextLevelExp: growth.maxExp,          // maxExp → nextLevelExp
        levelTitle: growth.levelLabel         // levelLabel → levelTitle
      }
    })
  }

  return {
    // State
    currentLevel,
    levelTitle,
    experiencePoints,
    nextLevelExp,
    buildTrack,
    houseStage,
    furnitureStage,
    badgeHistory,
    latestBadge,
    badgeCount,
    currentStreak,
    longestStreak,
    treesCollected,
    isHouseComplete,
    isFurnitureComplete,
    // Getters
    expProgress,
    remainingExp,
    gamificationInfo,
    // Actions
    addExperience,
    syncMilestones,
    levelUp,
    incrementStreak,
    resetStreak,
    resetFurnitureProgress,
    resetHouseProgress,
    applyGrowthResult
  }
})
