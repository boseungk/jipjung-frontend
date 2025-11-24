import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDreamHomeStore = defineStore('dreamHome', () => {
    // State
    const dreamHomeId = ref(1)
    const propertyName = ref('래미안 아파트')
    const location = ref('서울 강남구')
    const price = ref(50000) // 만원 (5억)
    const targetAmount = ref(15000) // 계약금 30% (1.5억)
    const monthlyGoal = ref(100) // 만원
    const targetDate = ref('2026-12-31')
    const currentAmount = ref(4250) // 만원 (425만원 저축)

    // Getters
    const achievementRate = computed(() => {
        return ((currentAmount.value / targetAmount.value) * 100).toFixed(1)
    })

    const daysRemaining = computed(() => {
        const target = new Date(targetDate.value)
        const today = new Date()
        const diff = target - today
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

    const remainingAmount = computed(() => {
        return targetAmount.value - currentAmount.value
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
    function updateProgress(amount) {
        currentAmount.value += amount
    }

    function changeDreamHome(newDreamHome) {
        propertyName.value = newDreamHome.propertyName
        location.value = newDreamHome.location
        price.value = newDreamHome.price
        targetAmount.value = newDreamHome.price * 0.3
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
