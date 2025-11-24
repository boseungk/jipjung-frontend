import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    // State
    const userId = ref(1)
    const name = ref('홍길동')
    const annualIncome = ref(5000) // 만원 단위 (5000만원)
    const existingLoanMonthly = ref(50) // 만원
    const totalSavings = ref(425) // 만원
    const onboardingCompleted = ref(true)

    // Getters
    const userInfo = computed(() => ({
        userId: userId.value,
        name: name.value,
        annualIncome: annualIncome.value,
        existingLoanMonthly: existingLoanMonthly.value,
        totalSavings: totalSavings.value,
        onboardingCompleted: onboardingCompleted.value
    }))

    // Actions
    function updateSavings(amount) {
        totalSavings.value += amount
    }

    function updateIncome(newIncome) {
        annualIncome.value = newIncome
    }

    return {
        // State
        userId,
        name,
        annualIncome,
        existingLoanMonthly,
        totalSavings,
        onboardingCompleted,
        // Getters
        userInfo,
        // Actions
        updateSavings,
        updateIncome
    }
})
