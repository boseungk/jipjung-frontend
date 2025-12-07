/**
 * Statistics Service
 * 
 * 통계 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/statisticsService
 */

import apiClient from '@/api/client'
import { STATISTICS_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} MonthlySpendingData
 * @property {string} month - 월 (YYYY-MM)
 * @property {number} spending - 지출액
 * @property {number} saving - 저축액
 * @property {number} receiptsCount - 영수증 개수
 */

/**
 * @typedef {Object} MonthlySpendingResponse
 * @property {MonthlySpendingData[]} monthlyData - 월별 데이터
 * @property {number} totalSpending - 총 지출액
 * @property {number} totalSaving - 총 저축액
 * @property {number} averageMonthlySpending - 월 평균 지출액
 */

/**
 * @typedef {Object} ProfileStatistics
 * @property {Object} profile - 프로필 정보
 * @property {string} profile.nickname - 닉네임
 * @property {string} profile.title - 칭호
 * @property {number} profile.level - 레벨
 * @property {string[]} profile.badges - 획득 배지 목록
 * @property {string} profile.joinDate - 가입일
 * @property {Object} stats - 통계 정보
 * @property {number} stats.defenseRate - 방어율 (%)
 * @property {number} stats.totalSavings - 총 저축액
 * @property {string} stats.weaknessCategory - 취약 카테고리
 * @property {number} stats.rankPercent - 상위 %
 * @property {Array<{month: string, amount: number}>} stats.monthlySpending - 월별 지출
 * @property {Object} managerComment - 관리인 코멘트
 * @property {string} managerComment.mood - 기분 상태
 * @property {string} managerComment.text - 코멘트 텍스트
 */

export const statisticsService = {
    /**
     * 월간 지출 통계 조회
     * 
     * 지정된 기간의 월별 지출/저축 통계를 조회합니다.
     * AssetGrowthCard 등에서 차트 데이터로 사용됩니다.
     * 
     * @param {number} [months=6] - 조회할 개월 수
     * @returns {Promise<MonthlySpendingResponse>} 월간 지출 통계
     * 
     * @example
     * const stats = await statisticsService.getMonthlySpending(6)
     * // 차트 데이터로 변환
     * const chartData = stats.monthlyData.map(d => ({
     *   x: d.month,
     *   y: d.spending
     * }))
     */
    async getMonthlySpending(months = 6) {
        const response = await apiClient.get(STATISTICS_ENDPOINTS.MONTHLY_SPENDING, {
            params: { months }
        })
        return response.data
    },

    /**
     * 사용자 프로필 통계 조회
     * 
     * ProfileSettingsView에서 프로필 카드 데이터로 사용됩니다.
     * 
     * @returns {Promise<ProfileStatistics>} 프로필 통계
     * 
     * @example
     * const profile = await statisticsService.getProfileStatistics()
     * console.log(profile.stats.defenseRate) // 64.5
     * console.log(profile.managerComment.text) // "지난달보다 식비를 20%나 줄였네?"
     */
    async getProfileStatistics() {
        const response = await apiClient.get(STATISTICS_ENDPOINTS.PROFILE)
        return response.data
    }
}
