import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { useDreamHomeStore } from './dreamHomeStore'
import { dsrSimulationService } from '@/api/services/dsrSimulationService'

/**
 * DSR (Debt Service Ratio) 관련 상태 및 계산을 관리하는 Store
 * 백엔드 Dashboard API 응답과 PRO 시뮬레이션 연동
 */
export const useDsrStore = defineStore('dsr', () => {
    const authStore = useAuthStore()
    const dreamHomeStore = useDreamHomeStore()

    // State
    const loanInterestRate = ref(0.04) // 연이율 4%
    const loanPeriodYears = ref(20) // 대출 기간 20년
    const isSimulating = ref(false)
    const lastSimulationResult = ref(null)
    const simulationError = ref(null)

    // Backend DSR data from Dashboard API
    const backendDsr = computed(() => authStore.user?._raw?.dsr || null)
    const backendFinancialInfo = computed(() => backendDsr.value?.financialInfo || null)
    const backendGapAnalysis = computed(() => authStore.user?._raw?.gapAnalysis || null)

    // Getters - Prefer backend data when available
    const monthlyIncome = computed(() => {
        // 백엔드 데이터 우선 사용
        if (backendFinancialInfo.value?.monthlyIncome) {
            return backendFinancialInfo.value.monthlyIncome
        }
        const annualIncome = authStore.userAnnualIncome
        if (!annualIncome) return 0
        return Math.floor(annualIncome / 12)
    })

    const existingLoanMonthly = computed(() => {
        if (backendFinancialInfo.value?.existingLoanRepayment) {
            return backendFinancialInfo.value.existingLoanRepayment
        }
        return authStore.userExistingLoanMonthly || 0
    })

    const monthlyRepaymentCapacity = computed(() => {
        if (backendFinancialInfo.value?.availableCapacity) {
            return backendFinancialInfo.value.availableCapacity
        }
        return Math.floor(monthlyIncome.value * 0.4)
    })

    // DSR Ratio - Use backend calculated value when available
    const dsrRatio = computed(() => {
        if (backendDsr.value?.dsrPercent !== undefined) {
            return backendDsr.value.dsrPercent
        }
        // Fallback: local calculation
        if (monthlyIncome.value === 0) return 0
        const ratio = (existingLoanMonthly.value / monthlyIncome.value) * 100
        return Math.round(ratio * 10) / 10
    })

    // DSR Status - Use backend grade when available
    const dsrStatus = computed(() => {
        if (backendDsr.value) {
            const colorMap = {
                'GREEN': '#66BB6A',
                'YELLOW': '#FFA726',
                'RED': '#EF5350',
                'GRAY': '#9E9E9E'
            }
            return {
                label: backendDsr.value.gradeLabel || '알 수 없음',
                class: backendDsr.value.gradeColor?.toLowerCase() === 'green' ? 'safe'
                    : backendDsr.value.gradeColor?.toLowerCase() === 'yellow' ? 'warning'
                        : backendDsr.value.gradeColor?.toLowerCase() === 'red' ? 'danger'
                            : 'unknown',
                color: colorMap[backendDsr.value.gradeColor] || '#9E9E9E'
            }
        }
        // Fallback: local calculation
        const ratio = dsrRatio.value
        if (ratio < 40) return { label: '안전', class: 'safe', color: '#66BB6A' }
        if (ratio < 50) return { label: '주의', class: 'warning', color: '#FFA726' }
        return { label: '위험', class: 'danger', color: '#EF5350' }
    })

    // Max Loan Amount - Use backend Gap Analysis when available
    const maxLoanAmount = computed(() => {
        if (backendGapAnalysis.value?.virtualLoanLimit) {
            return backendGapAnalysis.value.virtualLoanLimit
        }
        if (lastSimulationResult.value?.maxLoanAmount) {
            return lastSimulationResult.value.maxLoanAmount
        }
        // Fallback: local calculation
        const monthlyRate = loanInterestRate.value / 12
        const months = loanPeriodYears.value * 12
        const availableMonthlyPayment = monthlyRepaymentCapacity.value - existingLoanMonthly.value

        if (availableMonthlyPayment <= 0) return 0

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

    // Gap Analysis derived values
    const gapAnalysis = computed(() => {
        if (backendGapAnalysis.value) {
            return {
                hasTarget: backendGapAnalysis.value.hasTarget,
                targetAmount: backendGapAnalysis.value.targetAmount || 0,
                currentAssets: backendGapAnalysis.value.currentAssets || 0,
                currentSavedAmount: backendGapAnalysis.value.currentSavedAmount || 0,
                virtualLoanLimit: backendGapAnalysis.value.virtualLoanLimit || 0,
                requiredSavings: backendGapAnalysis.value.requiredSavings || 0,
                dsrMode: backendGapAnalysis.value.dsrMode || 'LITE'
            }
        }
        return null
    })

    // Simulation result derived values
    const simulationResult = computed(() => lastSimulationResult.value)

    const dsrInfo = computed(() => ({
        dsrRatio: dsrRatio.value,
        dsrStatus: dsrStatus.value,
        monthlyRepaymentCapacity: monthlyRepaymentCapacity.value,
        maxLoanAmount: maxLoanAmount.value,
        requiredEquity: requiredEquity.value,
        monthlyIncome: monthlyIncome.value,
        existingLoanMonthly: existingLoanMonthly.value,
        gapAnalysis: gapAnalysis.value,
        simulationResult: simulationResult.value,
        hasBackendData: !!backendDsr.value
    }))

    // Actions
    async function updateExistingLoan(amount) {
        try {
            await authStore.updateProfile({ existingLoanMonthly: amount })
        } catch (error) {
            console.error('Failed to update existing loan amount:', error)
            throw error
        }
    }

    function updateLoanConditions(interestRate, periodYears) {
        if (interestRate) loanInterestRate.value = interestRate
        if (periodYears) loanPeriodYears.value = periodYears
    }

    /**
     * DSR PRO 시뮬레이션 실행
     * @param {Object} request - 시뮬레이션 요청 데이터
     * @returns {Promise<Object>} 시뮬레이션 결과
     */
    async function runSimulation(request) {
        isSimulating.value = true
        simulationError.value = null

        try {
            const response = await dsrSimulationService.simulate(request)
            const result = response.data || response
            lastSimulationResult.value = result
            return result
        } catch (error) {
            console.error('DSR simulation failed:', error)
            simulationError.value = error.message || '시뮬레이션 실행에 실패했습니다'
            throw error
        } finally {
            isSimulating.value = false
        }
    }

    function clearSimulationResult() {
        lastSimulationResult.value = null
        simulationError.value = null
    }

    return {
        // State
        loanInterestRate,
        loanPeriodYears,
        isSimulating,
        lastSimulationResult,
        simulationError,
        // Getters
        monthlyIncome,
        existingLoanMonthly,
        monthlyRepaymentCapacity,
        dsrRatio,
        dsrStatus,
        maxLoanAmount,
        requiredEquity,
        gapAnalysis,
        simulationResult,
        dsrInfo,
        hasBackendData: computed(() => !!backendDsr.value),
        // Actions
        updateExistingLoan,
        updateLoanConditions,
        runSimulation,
        clearSimulationResult
    }
})
