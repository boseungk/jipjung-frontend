import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import { useDreamHomeStore } from './dreamHomeStore'

/**
 * DSR (Debt Service Ratio) 관련 상태 및 계산을 관리하는 Store
 */
export const useDsrStore = defineStore('dsr', () => {
    const userStore = useUserStore()
    const dreamHomeStore = useDreamHomeStore()

    // State
    const existingLoanMonthly = ref(50) // 만원 - 기존 대출 월 상환액
    const loanInterestRate = ref(0.04) // 연이율 4%
    const loanPeriodYears = ref(20) // 대출 기간 20년

    // Getters
    const monthlyIncome = computed(() => {
        return Math.floor(userStore.annualIncome / 12)
    })

    const monthlyRepaymentCapacity = computed(() => {
        // DSR 40% 기준으로 월 상환 가능액 계산
        return Math.floor(monthlyIncome.value * 0.4)
    })

    const dsrRatio = computed(() => {
        if (monthlyIncome.value === 0) return 0
        const ratio = (existingLoanMonthly.value / monthlyIncome.value) * 100
        return Math.floor(ratio)
    })

    const dsrStatus = computed(() => {
        const ratio = dsrRatio.value
        if (ratio < 40) return { label: '안전', class: 'safe', color: '#66BB6A' }
        if (ratio < 50) return { label: '주의', class: 'warning', color: '#FFA726' }
        return { label: '위험', class: 'danger', color: '#EF5350' }
    })

    const maxLoanAmount = computed(() => {
        // 원리금균등상환 방식으로 최대 대출 가능액 계산
        const monthlyRate = loanInterestRate.value / 12
        const months = loanPeriodYears.value * 12
        const availableMonthlyPayment = monthlyRepaymentCapacity.value - existingLoanMonthly.value

        if (availableMonthlyPayment <= 0) return 0

        // 원리금균등상환 공식: 대출원금 = 월상환액 × [(1 - (1 + 월이자율)^-개월수) / 월이자율]
        const maxLoan = availableMonthlyPayment *
            ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate)

        return Math.floor(maxLoan)
    })

    const requiredEquity = computed(() => {
        const propertyPrice = dreamHomeStore.price
        const loan = maxLoanAmount.value
        const required = propertyPrice - loan
        return Math.max(0, required)
    })

    const dsrInfo = computed(() => ({
        dsrRatio: dsrRatio.value,
        dsrStatus: dsrStatus.value,
        monthlyRepaymentCapacity: monthlyRepaymentCapacity.value,
        maxLoanAmount: maxLoanAmount.value,
        requiredEquity: requiredEquity.value,
        monthlyIncome: monthlyIncome.value,
        existingLoanMonthly: existingLoanMonthly.value
    }))

    // Actions
    function updateExistingLoan(amount) {
        existingLoanMonthly.value = amount
    }

    function updateLoanConditions(interestRate, periodYears) {
        if (interestRate) loanInterestRate.value = interestRate
        if (periodYears) loanPeriodYears.value = periodYears
    }

    return {
        // State
        existingLoanMonthly,
        loanInterestRate,
        loanPeriodYears,
        // Getters
        monthlyIncome,
        monthlyRepaymentCapacity,
        dsrRatio,
        dsrStatus,
        maxLoanAmount,
        requiredEquity,
        dsrInfo,
        // Actions
        updateExistingLoan,
        updateLoanConditions
    }
})
