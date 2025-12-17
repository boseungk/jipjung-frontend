import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore'
import { DEFAULT_GAMIFICATION, LEVEL_TITLES, calculateLevelProgress } from '@/constants/user'

const HOUSE_TOTAL_STAGES = 6
const FURNITURE_TOTAL_STAGES = 5
const BADGE_HISTORY_LIMIT = 12

/**
 * 집 짓기 배지 메시지 (Phase 1)
 * @deprecated 백엔드 levelLabel 우선 사용, 이 배열은 폴백용
 */
const HOUSE_BADGE_MESSAGES = [
  '꿈을 위한 첫 삽을 떴어요! 🌱',
  '차근차근 기초를 다지고 있어요 🧱',
  '공간이 조금씩 형태를 갖춰가요 🏗️',
  '어떤 집이 될지 기대되지 않나요? 🏠',
  '거의 다 왔어요! 마무리가 한창이에요 🎨',
  '드디어 완성! 따뜻한 온기로 채워주세요 🏡'
]

/**
 * 가구 배치 배지 메시지 (Phase 2)
 * @deprecated Phase 2 구현 시 백엔드에서 동적 제공 예정
 */
const FURNITURE_BADGE_MESSAGES = [
  '새로운 인테리어를 시작해볼까요? 🎨',
  '공간의 중심이 잡히기 시작했어요 🏠',
  '허전했던 곳들이 알차게 채워졌어요 📦',
  '공간에 따뜻한 생기를 불어넣었어요 ✨',
  '살고 싶은 집, 인테리어 끝! 🥳'
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

  // Getters - 진행도 계산
  const levelProgress = computed(() => calculateLevelProgress(experiencePoints.value, currentLevel.value))

  const nextLevelExp = computed(() => {
    if (buildTrack.value === 'furniture') {
      return calculateNextMilestoneExp('furniture', activeStage.value)
    }
    return levelProgress.value.requiredForLevel || calculateNextMilestoneExp('house', activeStage.value)
  })

  const expProgress = computed(() => {
    if (buildTrack.value === 'furniture') {
      const denom = nextLevelExp.value || 1
      const percent = denom > 0 ? (experiencePoints.value / denom) * 100 : 0
      return Math.min(100, Math.max(0, percent)).toFixed(1)
    }
    return levelProgress.value.percent.toFixed(1)
  })

  const remainingExp = computed(() => {
    if (buildTrack.value === 'furniture') {
      return Math.max(0, nextLevelExp.value - experiencePoints.value)
    }
    return Math.max(0, levelProgress.value.requiredForLevel - levelProgress.value.currentInLevel)
  })

  // 현재 레벨 내 경험치 (UI 표시용)
  const currentExpInLevel = computed(() => {
    if (buildTrack.value === 'furniture') return experiencePoints.value
    return levelProgress.value.currentInLevel
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
      authStore.updateUserData({ gamification: updatedGamification })
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

  /**
   * @deprecated 백엔드에서 저축 시 자동으로 스트릭 처리합니다.
   * 이 메서드는 더 이상 사용하지 마세요.
   * @see StreakService.participate()
   */
  async function incrementStreak() {
    console.warn('[DEPRECATED] incrementStreak: 백엔드에서 자동 처리됩니다. 저축 API를 사용하세요.')
    // 로컬 상태 업데이트 제거 - 서버 데이터와 불일치 방지
  }

  /**
   * @deprecated 백엔드에서 스트릭을 관리합니다.
   * 이 메서드는 더 이상 사용하지 마세요.
   */
  async function resetStreak() {
    console.warn('[DEPRECATED] resetStreak: 백엔드에서 관리됩니다.')
    // 로컬 상태 업데이트 제거 - 서버 데이터와 불일치 방지
  }

  async function resetFurnitureProgress() {
    const updated = {
      ...gamification.value,
      buildTrack: 'furniture',
      furnitureStage: 1,
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

    const rawStep = Number(growth.level || 1)
    const nextStep = Number.isFinite(rawStep) ? Math.max(1, Math.trunc(rawStep)) : 1
    const currentTrack = authStore.userGamification?.buildTrack || 'house'
    const currentFurnitureStage = Number(authStore.userGamification?.furnitureStage) || 0
    const currentTrackExp = Number(authStore.userGamification?.experiencePoints) || 0

    let nextTrack = nextStep > HOUSE_TOTAL_STAGES ? 'furniture' : 'house'
    const nextHouseStage = Math.min(HOUSE_TOTAL_STAGES, nextStep)

    // 백엔드가 레벨을 6(완공)에서 더 올려주지 않는 경우에도,
    // 집 완성 이후에는 인테리어 트랙으로 넘어갈 수 있어야 합니다.
    if (nextHouseStage >= HOUSE_TOTAL_STAGES) {
      nextTrack = 'furniture'
    }
    if (currentTrack === 'furniture' && nextStep <= HOUSE_TOTAL_STAGES) {
      nextTrack = 'furniture'
    }

    const baseFurnitureStage = nextTrack === 'furniture'
      ? Math.min(FURNITURE_TOTAL_STAGES, Math.max(1, currentFurnitureStage, nextStep - HOUSE_TOTAL_STAGES))
      : 0

    const isUnlockingFurniture = currentTrack !== 'furniture' && nextTrack === 'furniture'
    const rawExpDelta = Math.max(0, Number(growth.expChange) || 0)
    const expDelta = isUnlockingFurniture ? 0 : rawExpDelta

    let nextFurnitureStage = baseFurnitureStage
    let nextTrackExp = nextTrack === 'furniture'
      ? (isUnlockingFurniture ? 0 : currentTrackExp)
      : Math.max(0, Number(growth.currentExp) || 0)

    // Phase 2(인테리어) 진행도는 XP 임계값 기반으로 프론트에서 계산합니다.
    // - Stage 1: 배경(언락 시 기본 지급)
    // - Stage 2~5: XP 임계값 도달 시 단계 상승 + XP 리셋
    if (nextTrack === 'furniture') {
      let pendingExp = expDelta
      let accumulatedExp = Math.max(0, nextTrackExp)

      while (pendingExp > 0 && nextFurnitureStage < FURNITURE_TOTAL_STAGES) {
        const milestone = calculateNextMilestoneExp('furniture', Math.max(1, nextFurnitureStage))
        const total = accumulatedExp + pendingExp
        if (total < milestone) {
          accumulatedExp = total
          pendingExp = 0
          break
        }

        const overflow = total - milestone
        nextFurnitureStage = Math.min(FURNITURE_TOTAL_STAGES, nextFurnitureStage + 1)
        accumulatedExp = 0
        pendingExp = overflow
      }

      // 최종 단계에서는 XP를 계속 쌓이게 두되, UI/로직이 깨지지 않도록 상한만 둡니다.
      if (nextFurnitureStage >= FURNITURE_TOTAL_STAGES) {
        accumulatedExp = Math.min(accumulatedExp + pendingExp, calculateNextMilestoneExp('furniture', FURNITURE_TOTAL_STAGES))
      }

      nextTrackExp = accumulatedExp
    }

    authStore.updateUserData({
      gamification: {
        ...authStore.userGamification,
        // 필드명 매핑 (백엔드 → 프론트엔드)
        experiencePoints: nextTrackExp,
        currentLevel: growth.level,           // level → currentLevel
        nextLevelExp: nextTrack === 'furniture'
          ? calculateNextMilestoneExp('furniture', Math.max(1, nextFurnitureStage))
          : growth.maxExp,                    // maxExp → nextLevelExp
        levelTitle: growth.levelLabel,        // levelLabel → levelTitle
        buildTrack: nextTrack,
        houseStage: nextHouseStage,
        furnitureStage: nextFurnitureStage
      },
      // showroom 섹션 동기화 (저축 직후 즉시 단계 반영)
      showroom: authStore.userShowroom
        ? {
          ...authStore.userShowroom,
          currentStep: nextStep,
          stepTitle: growth.levelLabel || authStore.userShowroom.stepTitle
        }
        : {
          currentStep: nextStep,
          totalSteps: HOUSE_TOTAL_STAGES,
          stepTitle: growth.levelLabel || '',
          stepDescription: '',
          imageUrl: null
        }
    })

    if (nextTrack === 'furniture') {
      authStore.persistFurnitureProgress({
        furnitureStage: nextFurnitureStage,
        experiencePoints: nextTrackExp
      })
    } else {
      authStore.clearFurnitureProgress()
    }
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
    currentExpInLevel,
    gamificationInfo,
    // Actions
    addExperience,
    syncMilestones,
    levelUp,
    // @deprecated - 백엔드 자동 처리로 인해 사용 중단
    // incrementStreak,
    // resetStreak,
    resetFurnitureProgress,
    resetHouseProgress,
    applyGrowthResult
  }
})
