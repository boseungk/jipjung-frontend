/**
 * Gamification Service
 * 
 * 게임화 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/gamificationService
 */

import apiClient from '@/api/client'
import { GAMIFICATION_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} ExperienceRequest
 * @property {number} amount - 경험치량
 * @property {string} reason - 획득 사유
 */

/**
 * @typedef {Object} ExperienceResponse
 * @property {Object} gamification - 게임화 정보
 * @property {number} gamification.currentLevel - 현재 레벨
 * @property {string} gamification.levelTitle - 레벨 칭호
 * @property {number} gamification.experiencePoints - 현재 경험치
 * @property {number} gamification.nextLevelExp - 다음 레벨 필요 경험치
 * @property {boolean} gamification.leveledUp - 레벨업 여부
 */

/**
 * @typedef {'increment' | 'reset'} StreakAction
 */

/**
 * @typedef {Object} StreakResponse
 * @property {Object} gamification - 게임화 정보
 * @property {number} gamification.currentStreak - 현재 연속 저축 일수
 * @property {number} gamification.longestStreak - 최장 연속 저축 일수
 */

export const gamificationService = {
    /**
     * 경험치 추가
     * 
     * 특정 활동 완료 시 경험치를 추가합니다.
     * 레벨업 시 leveledUp 플래그가 true로 반환됩니다.
     * 
     * @param {number} amount - 경험치량
     * @param {string} reason - 획득 사유
     * @returns {Promise<ExperienceResponse>} 업데이트된 게임화 정보
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * const result = await gamificationService.addExperience(100, '영수증 심문 성공')
     * if (result.gamification.leveledUp) {
     *   // 레벨업 축하 모달 표시
     * }
     */
    async addExperience(amount, reason) {
        const response = await apiClient.post(GAMIFICATION_ENDPOINTS.EXPERIENCE, {
            amount,
            reason
        })
        return response.data
    },

    /**
     * 스트릭 업데이트
     * 
     * 연속 저축 기록을 업데이트합니다.
     * - increment: 스트릭 1 증가
     * - reset: 스트릭 초기화
     * 
     * @param {StreakAction} action - 액션 타입
     * @returns {Promise<StreakResponse>} 업데이트된 스트릭 정보
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * // 연속 저축 성공
     * const result = await gamificationService.updateStreak('increment')
     * console.log(result.gamification.currentStreak) // 6
     * 
     * // 저축 실패로 스트릭 초기화
     * await gamificationService.updateStreak('reset')
     */
    async updateStreak(action) {
        const response = await apiClient.post(GAMIFICATION_ENDPOINTS.STREAK, { action })
        return response.data
    }
}
