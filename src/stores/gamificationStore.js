import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGamificationStore = defineStore('gamification', () => {
    // State
    const currentLevel = ref(3)
    const levelTitle = ref('꾸준한 실천가')
    const experiencePoints = ref(320)
    const nextLevelExp = ref(500)
    const currentStreak = ref(7)
    const longestStreak = ref(15)
    const treesCollected = ref(3)

    // Level titles mapping
    const levelTitles = {
        1: '꿈나무',
        2: '새싹',
        3: '꾸준한 실천가',
        4: '전문가',
        5: '집나무 숲지기'
    }

    // Getters
    const expProgress = computed(() => {
        return ((experiencePoints.value / nextLevelExp.value) * 100).toFixed(1)
    })

    const remainingExp = computed(() => {
        return nextLevelExp.value - experiencePoints.value
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

    // Actions
    function addExperience(exp) {
        experiencePoints.value += exp

        // Check for level up
        if (experiencePoints.value >= nextLevelExp.value) {
            levelUp()
        }
    }

    function levelUp() {
        if (currentLevel.value < 5) {
            currentLevel.value++
            levelTitle.value = levelTitles[currentLevel.value]
            experiencePoints.value = experiencePoints.value - nextLevelExp.value
            nextLevelExp.value = calculateNextLevelExp()
        }
    }

    function calculateNextLevelExp() {
        const expThresholds = {
            1: 100,
            2: 300,
            3: 500,
            4: 1000,
            5: 2000
        }
        return expThresholds[currentLevel.value] || 2000
    }

    function incrementStreak() {
        currentStreak.value++
        if (currentStreak.value > longestStreak.value) {
            longestStreak.value = currentStreak.value
        }
    }

    function resetStreak() {
        currentStreak.value = 0
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
