import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore'
import { DEFAULT_GAMIFICATION, LEVEL_TITLES } from '@/constants/user'

export const useGamificationStore = defineStore('gamification', () => {
    const authStore = useAuthStore()
    const gamification = computed(() => authStore.userGamification || DEFAULT_GAMIFICATION)

    // State derived from user data
    const currentLevel = computed(() => gamification.value.currentLevel ?? DEFAULT_GAMIFICATION.currentLevel)
    const levelTitle = computed(() => gamification.value.levelTitle || LEVEL_TITLES[currentLevel.value] || DEFAULT_GAMIFICATION.levelTitle)
    const experiencePoints = computed(() => Number(gamification.value.experiencePoints) || 0)
    const nextLevelExp = computed(() => Number(gamification.value.nextLevelExp) || DEFAULT_GAMIFICATION.nextLevelExp)
    const currentStreak = computed(() => Number(gamification.value.currentStreak) || 0)
    const longestStreak = computed(() => Number(gamification.value.longestStreak) || 0)
    const treesCollected = computed(() => Number(gamification.value.treesCollected) || 0)

    // Getters
    const expProgress = computed(() => {
        if (!nextLevelExp.value) return '0.0'
        return ((experiencePoints.value / nextLevelExp.value) * 100).toFixed(1)
    })

    const remainingExp = computed(() => {
        return Math.max(0, nextLevelExp.value - experiencePoints.value)
    })

    const gamificationInfo = computed(() => ({
        currentLevel: currentLevel.value,
        levelTitle: levelTitle.value,
        experiencePoints: experiencePoints.value,
        nextLevelExp: nextLevelExp.value,
        expProgress: expProgress.value,
        remainingExp: remainingExp.value,
        currentStreak: currentStreak.value,
        longestStreak: longestStreak.value,
        treesCollected: treesCollected.value
    }))

    function calculateNextLevelExp(level) {
        const expThresholds = {
            1: 100,
            2: 300,
            3: 500,
            4: 1000,
            5: 2000
        }
        return expThresholds[level] || 2000
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
    async function addExperience(exp) {
        let updated = {
            ...gamification.value,
            experiencePoints: experiencePoints.value + exp,
            currentLevel: currentLevel.value,
            levelTitle: levelTitle.value,
            nextLevelExp: nextLevelExp.value
        }

        while (updated.experiencePoints >= updated.nextLevelExp && updated.currentLevel < 5) {
            updated.experiencePoints = updated.experiencePoints - updated.nextLevelExp
            updated.currentLevel += 1
            updated.levelTitle = LEVEL_TITLES[updated.currentLevel] || updated.levelTitle
            updated.nextLevelExp = calculateNextLevelExp(updated.currentLevel)
        }

        await saveGamification(updated)
    }

    async function levelUp() {
        if (currentLevel.value >= 5) return

        const updated = {
            ...gamification.value,
            currentLevel: currentLevel.value + 1,
            levelTitle: LEVEL_TITLES[currentLevel.value + 1] || levelTitle.value,
            experiencePoints: Math.max(0, experiencePoints.value - nextLevelExp.value),
            nextLevelExp: calculateNextLevelExp(currentLevel.value + 1)
        }

        await saveGamification(updated)
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

    return {
        // State
        currentLevel,
        levelTitle,
        experiencePoints,
        nextLevelExp,
        currentStreak,
        longestStreak,
        treesCollected,
        // Getters
        expProgress,
        remainingExp,
        gamificationInfo,
        // Actions
        addExperience,
        levelUp,
        incrementStreak,
        resetStreak
    }
})
