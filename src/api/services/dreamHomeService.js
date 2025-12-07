/**
 * Dream Home Service
 * 
 * 드림홈 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/dreamHomeService
 */

import apiClient from '@/api/client'
import { USER_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} DreamHomeRequest
 * @property {string} dreamHomeId - 매물 ID
 * @property {string} propertyName - 매물명
 * @property {string} location - 위치
 * @property {number} price - 가격 (원 단위)
 * @property {number} targetAmount - 목표 금액 (원 단위)
 * @property {number} monthlyGoal - 월 목표 저축액 (원 단위)
 * @property {string} targetDate - 목표 날짜 (YYYY-MM-DD)
 */

/**
 * @typedef {Object} DreamHomeResponse
 * @property {Object} dreamHome - 드림홈 정보
 * @property {string} dreamHome.dreamHomeId - 매물 ID
 * @property {string} dreamHome.propertyName - 매물명
 * @property {string} dreamHome.location - 위치
 * @property {number} dreamHome.price - 가격
 * @property {number} dreamHome.targetAmount - 목표 금액
 * @property {number} dreamHome.currentAmount - 현재 금액
 * @property {number} dreamHome.monthlyGoal - 월 목표 저축액
 * @property {string} dreamHome.targetDate - 목표 날짜
 */

/**
 * @typedef {Object} ProgressUpdateRequest
 * @property {number} amount - 증가/감소 금액 (원 단위, 음수 가능)
 * @property {string} memo - 메모
 */

/**
 * @typedef {Object} ProgressUpdateResponse
 * @property {Object} dreamHome - 업데이트된 드림홈 정보
 * @property {number} dreamHome.currentAmount - 현재 저축 금액
 * @property {number} dreamHome.targetAmount - 목표 금액
 * @property {number} dreamHome.achievementRate - 달성률 (%)
 * @property {Object} gamification - 게임화 업데이트 정보
 * @property {number} gamification.experiencePoints - 현재 경험치
 * @property {number} gamification.gainedExp - 획득한 경험치
 */

export const dreamHomeService = {
    /**
     * 드림홈 변경
     * 
     * 사용자의 목표 드림홈을 변경합니다.
     * 매물 목록에서 선택하거나 직접 입력할 수 있습니다.
     * 
     * @param {DreamHomeRequest} dreamHomeData - 드림홈 데이터
     * @returns {Promise<DreamHomeResponse>} 업데이트된 드림홈 정보
     * @throws {ApiError} 인증 필요(401), 유효성 검증 실패(400)
     * 
     * @example
     * const result = await dreamHomeService.changeDreamHome({
     *   dreamHomeId: 'property_456',
     *   propertyName: '부산 해운대 아파트',
     *   location: '부산 해운대구',
     *   price: 800000000,
     *   targetAmount: 240000000,
     *   monthlyGoal: 3000000,
     *   targetDate: '2028-12-31'
     * })
     */
    async changeDreamHome(dreamHomeData) {
        const response = await apiClient.put(USER_ENDPOINTS.DREAM_HOME, dreamHomeData)
        return response.data
    },

    /**
     * 저축 진행률 업데이트
     * 
     * 저축금을 추가하거나 차감합니다.
     * 저축 완료 시 경험치도 함께 획득합니다.
     * 
     * @param {number} amount - 금액 (양수: 저축, 음수: 차감)
     * @param {string} [memo=''] - 메모
     * @returns {Promise<ProgressUpdateResponse>} 업데이트된 진행률 및 게임화 정보
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * const result = await dreamHomeService.updateProgress(1000000, '월급 저축')
     * console.log(result.dreamHome.achievementRate) // 21.25
     * console.log(result.gamification.gainedExp) // 50
     */
    async updateProgress(amount, memo = '') {
        const response = await apiClient.post(USER_ENDPOINTS.DREAM_HOME_PROGRESS, {
            amount,
            memo
        })
        return response.data
    }
}
