/**
 * Dream Home Store
 * 
 * 드림홈 상태 관리를 담당하는 Pinia 스토어.
 * authStore의 사용자 데이터와 동기화됩니다.
 * 
 * @module stores/dreamHomeStore
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { dreamHomeService } from '@/api/services/dreamHomeService'
import { DEFAULT_DREAM_HOME } from '@/constants/user'

export const useDreamHomeStore = defineStore('dreamHome', () => {
    const authStore = useAuthStore()

    function formatLocalDateYYYYMMDD(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    function updateAssetsChartDataForToday(previousChartData, today, todayBalance) {
        const safeChartData = Array.isArray(previousChartData) ? previousChartData : []
        const todayStr = typeof today === 'string' ? today : formatLocalDateYYYYMMDD(today)

        if (!safeChartData.length) {
            return [{ date: todayStr, balance: todayBalance }]
        }

        const chartDataCopy = safeChartData.map((point) => ({ ...point }))
        const todayIndex = chartDataCopy.findIndex((point) => point?.date === todayStr)

        if (todayIndex >= 0) {
            for (let index = todayIndex; index < chartDataCopy.length; index += 1) {
                chartDataCopy[index] = { ...chartDataCopy[index], balance: todayBalance }
            }
            return chartDataCopy
        }

        // Fallback: update the latest point (chart window usually ends at "today")
        const lastIndex = chartDataCopy.length - 1
        chartDataCopy[lastIndex] = { ...chartDataCopy[lastIndex], balance: todayBalance }
        return chartDataCopy
    }

    // ============================================
    // State
    // ============================================

    /** @type {import('vue').Ref<boolean>} 로딩 상태 */
    const isLoading = ref(false)

    /** @type {import('vue').Ref<string|null>} 에러 메시지 */
    const error = ref(null)

    // ============================================
    // Computed (AuthStore 데이터 기반)
    // ============================================

    /** 드림홈 데이터 (기본값 포함) */
    const dreamHome = computed(() => authStore.userDreamHome || DEFAULT_DREAM_HOME)

    /** 드림홈 ID */
    const dreamHomeId = computed(() => dreamHome.value.dreamHomeId ?? DEFAULT_DREAM_HOME.dreamHomeId)

    /** 매물명 */
    const propertyName = computed(() => dreamHome.value.propertyName || DEFAULT_DREAM_HOME.propertyName)

    /** 사용자 정의 집 이름 */
    const houseName = computed(() => dreamHome.value.houseName || DEFAULT_DREAM_HOME.houseName || '')

    /** 위치 */
    const location = computed(() => dreamHome.value.location || DEFAULT_DREAM_HOME.location)

    /** 가격 */
    const price = computed(() => Number(dreamHome.value.price) || DEFAULT_DREAM_HOME.price)

    /** 목표 금액 */
    const targetAmount = computed(() => Number(dreamHome.value.targetAmount) || DEFAULT_DREAM_HOME.targetAmount)

    /** 월 목표 저축액 */
    const monthlyGoal = computed(() => Number(dreamHome.value.monthlyGoal) || DEFAULT_DREAM_HOME.monthlyGoal)

    /** 목표 날짜 */
    const targetDate = computed(() => dreamHome.value.targetDate || DEFAULT_DREAM_HOME.targetDate)

    /** 현재 저축 금액 */
    const currentAmount = computed(() => Number(dreamHome.value.currentAmount) || 0)

    // ============================================
    // Getters
    // ============================================

    /** 달성률 (%) */
    const achievementRate = computed(() => {
        if (!targetAmount.value) return '0.0'
        return ((currentAmount.value / targetAmount.value) * 100).toFixed(1)
    })

    /** 남은 일수 */
    const daysRemaining = computed(() => {
        const target = new Date(targetDate.value || DEFAULT_DREAM_HOME.targetDate)
        const today = new Date()
        const diff = target - today
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

    /** 남은 금액 */
    const remainingAmount = computed(() => {
        return Math.max(0, targetAmount.value - currentAmount.value)
    })

    /**
     * V2: 연결된 매물 정보 (참조용)
     * 대시보드 API 응답의 goal.linkedProperty에서 가져옴
     */
    const linkedProperty = computed(() => {
        return authStore.user?._raw?.goal?.linkedProperty || null
    })

    /** 드림홈 정보 객체 */
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
        remainingAmount: remainingAmount.value,
        linkedProperty: linkedProperty.value
    }))

    /** XP 기반 진행률 (대시보드 응답에서 제공될 때만) */
    const expProgress = computed(() => {
        const raw = authStore.user?._raw?.goal?.expProgress
        const numeric = Number(raw)
        return Number.isFinite(numeric) ? numeric : null
    })

    const targetExp = computed(() => {
        const raw = authStore.user?._raw?.goal?.targetExp
        const numeric = Number(raw)
        return Number.isFinite(numeric) ? numeric : null
    })

    const totalExp = computed(() => {
        const raw = authStore.user?._raw?.goal?.totalExp
        const numeric = Number(raw)
        return Number.isFinite(numeric) ? numeric : null
    })

    // ============================================
    // Actions
    // ============================================

    /**
     * 저축 기록 (백엔드 연동)
     * 
     * @param {number} amount - 저축 금액 (원 단위)
     * @param {'DEPOSIT'|'WITHDRAW'} saveType - 저축 유형
     * @param {string} [memo=''] - 메모
     * @returns {Promise<SavingsRecordResponse>} 저축 결과
     */
    async function recordSavings(amount, saveType = 'DEPOSIT', memo = '') {
        isLoading.value = true
        error.value = null

        try {
            const response = await dreamHomeService.recordSavings({
                amount,
                saveType,
                memo
            })

            // 드림홈 상태 업데이트
            if (response.dreamHomeStatus) {
                authStore.updateUserData({
                    dreamHome: {
                        ...authStore.userDreamHome,
                        currentAmount: response.dreamHomeStatus.currentSavedAmount,
                        targetAmount: response.dreamHomeStatus.targetAmount,
                        achievementRate: response.dreamHomeStatus.achievementRate,
                        isCompleted: response.dreamHomeStatus.isCompleted ?? authStore.userDreamHome?.isCompleted ?? false
                    }
                })

                // 대시보드 자산 성장 차트(assets.chartData) 즉시 반영
                // - 대시보드 API 재호출 없이도 AssetGrowthCard가 업데이트되도록 authStore._raw.assets.chartData를 갱신
                const previousRaw = authStore.user?._raw || {}
                const previousAssets = previousRaw.assets || {}
                const nextSavedAmount = response.dreamHomeStatus.currentSavedAmount
                const nextChartData = updateAssetsChartDataForToday(
                    previousAssets.chartData,
                    new Date(),
                    nextSavedAmount
                )

                authStore.updateUserData({
                    _raw: {
                        ...previousRaw,
                        assets: {
                            ...previousAssets,
                            totalAsset: nextSavedAmount,
                            chartData: nextChartData
                        }
                    }
                })
            }

            // 스트릭 정보 반영 (활동 기반)
            const previousRaw = authStore.user?._raw || {}
            const previousRawStreak = previousRaw.streak || {}
            if (response.streakInfo) {
                authStore.updateUserData({
                    gamification: {
                        ...authStore.userGamification,
                        currentStreak: response.streakInfo.currentStreak,
                        longestStreak: response.streakInfo.maxStreak
                    },
                    _raw: {
                        ...previousRaw,
                        streak: {
                            ...previousRawStreak,
                            currentStreak: response.streakInfo.currentStreak,
                            maxStreak: response.streakInfo.maxStreak,
                            isTodayParticipated: true
                        }
                    }
                })
            } else {
                authStore.updateUserData({
                    _raw: {
                        ...previousRaw,
                        streak: {
                            ...previousRawStreak,
                            isTodayParticipated: true
                        }
                    }
                })
            }

            return response
        } catch (err) {
            error.value = err.message || '저축 기록에 실패했습니다.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 드림홈 설정 (백엔드 연동)
     * 
     * @param {Object} data - { aptSeq, targetAmount, targetDate, monthlyGoal }
     * @param {Object} [options]
     * @param {string} [options.themeCode] - 선택한 테마 코드 (대시보드 즉시 반영용)
     * @returns {Promise<DreamHomeSetResponse>} 설정 결과
     */
    async function setDreamHome(data, options = {}) {
        isLoading.value = true
        error.value = null

        try {
            const response = await dreamHomeService.setDreamHome(data)

            // authStore의 사용자 데이터 업데이트
            if (response.dreamHome) {
                authStore.updateUserData({
                    dreamHome: response.dreamHome
                })
            }

            if (options?.themeCode) {
                authStore.updateUserData({
                    showroom: {
                        ...(authStore.userShowroom || {}),
                        themeCode: options.themeCode
                    }
                })
            }

            return response
        } catch (err) {
            error.value = err.message || '드림홈 설정에 실패했습니다.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 에러 상태 초기화
     */
    function clearError() {
        error.value = null
    }

    // ============================================
    // Return
    // ============================================
    return {
        // State
        isLoading,
        error,
        dreamHomeId,
        propertyName,
        houseName,
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
        linkedProperty,
        expProgress,
        targetExp,
        totalExp,
        dreamHomeInfo,

        // Actions
        recordSavings,
        setDreamHome,
        clearError
    }
})
