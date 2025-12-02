import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './authStore'
import { DEFAULT_DREAM_HOME } from '@/constants/user'

export const useDreamHomeStore = defineStore('dreamHome', () => {
    const authStore = useAuthStore()
    const dreamHome = computed(() => authStore.userDreamHome || DEFAULT_DREAM_HOME)

    // State derived from user data
    const dreamHomeId = computed(() => dreamHome.value.dreamHomeId ?? DEFAULT_DREAM_HOME.dreamHomeId)
    const propertyName = computed(() => dreamHome.value.propertyName || DEFAULT_DREAM_HOME.propertyName)
    const location = computed(() => dreamHome.value.location || DEFAULT_DREAM_HOME.location)
    const price = computed(() => Number(dreamHome.value.price) || DEFAULT_DREAM_HOME.price)
    const targetAmount = computed(() => Number(dreamHome.value.targetAmount) || DEFAULT_DREAM_HOME.targetAmount)
    const monthlyGoal = computed(() => Number(dreamHome.value.monthlyGoal) || DEFAULT_DREAM_HOME.monthlyGoal)
    const targetDate = computed(() => dreamHome.value.targetDate || DEFAULT_DREAM_HOME.targetDate)
    const currentAmount = computed(() => Number(dreamHome.value.currentAmount) || 0)

    // Getters
    const achievementRate = computed(() => {
        if (!targetAmount.value) return '0.0'
        return ((currentAmount.value / targetAmount.value) * 100).toFixed(1)
    })

    const daysRemaining = computed(() => {
        const target = new Date(targetDate.value || DEFAULT_DREAM_HOME.targetDate)
        const today = new Date()
        const diff = target - today
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

    const remainingAmount = computed(() => {
        return Math.max(0, targetAmount.value - currentAmount.value)
    })

    const dreamHomeInfo = computed(() => ({
        dreamHomeId: dreamHomeId.value,
        propertyName: propertyName.value,
        location: location.value,
        price: price.value,
        targetAmount: targetAmount.value,
        monthlyGoal: monthlyGoal.value,
        targetDate: targetDate.value,
        currentAmount: currentAmount.value,
        achievementRate: achievementRate.value,
        daysRemaining: daysRemaining.value,
        remainingAmount: remainingAmount.value
    }))

    // Actions
    async function updateProgress(amount) {
        const nextAmount = Math.max(0, currentAmount.value + amount)
        try {
            await authStore.updateProfile({
                dreamHome: {
                    ...dreamHome.value,
                    currentAmount: nextAmount
                }
            })
        } catch (error) {
            console.error('Failed to update dream home progress:', error)
            throw error
        }
    }

    async function changeDreamHome(newDreamHome) {
        const nextDreamHome = {
            ...dreamHome.value,
            ...newDreamHome
        }

        if (newDreamHome.price && !newDreamHome.targetAmount) {
            nextDreamHome.targetAmount = Math.floor(newDreamHome.price * 0.3)
        }

        try {
            await authStore.updateProfile({ dreamHome: nextDreamHome })
        } catch (error) {
            console.error('Failed to change dream home:', error)
            throw error
        }
    }

    return {
        // State
        dreamHomeId,
        propertyName,
        location,
        price,
        targetAmount,
        monthlyGoal,
        targetDate,
        currentAmount,
        // Getters
        achievementRate,
        daysRemaining,
        remainingAmount,
        dreamHomeInfo,
        // Actions
        updateProgress,
        changeDreamHome
    }
})
