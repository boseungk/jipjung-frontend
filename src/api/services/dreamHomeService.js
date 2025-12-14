/**
 * Dream Home Service
 * 
 * 드림홈 관련 API 호출을 담당하는 서비스 레이어.
 * 백엔드 /api/dream-home/* 엔드포인트와 연동됩니다.
 * 
 * @module api/services/dreamHomeService
 */

import apiClient from '@/api/client'
import { DREAM_HOME_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} DreamHomeSetRequest
 * @property {string} aptSeq - 아파트 고유 ID
 * @property {number} targetAmount - 목표 금액 (만원 단위)
 * @property {string} targetDate - 목표 달성일 (YYYY-MM-DD)
 * @property {number} monthlyGoal - 월 목표 저축액 (만원 단위)
 */

/**
 * @typedef {Object} DreamHomeSetResponse
 * @property {Object} dreamHome - 설정된 드림홈 정보
 */

/**
 * @typedef {Object} SavingsRecordRequest
 * @property {number} amount - 저축 금액 (원 단위)
 * @property {'DEPOSIT'|'WITHDRAW'} saveType - 저축 유형
 * @property {string} [memo] - 메모
 */

/**
 * @typedef {Object} SavingsRecordResponse
 * @property {Object} dreamHomeStatus - 드림홈 상태
 * @property {number} dreamHomeStatus.currentSavedAmount - 현재 저축 금액
 * @property {number} dreamHomeStatus.targetAmount - 목표 금액
 * @property {number} dreamHomeStatus.achievementRate - 달성률
 * @property {Object} growth - 성장 결과
 * @property {string} growth.resultType - 'SUCCESS' | 'LEVEL_UP'
 * @property {number} growth.expChange - 획득 경험치
 * @property {number} growth.currentExp - 현재 총 경험치
 * @property {number} growth.maxExp - 다음 레벨까지 필요 경험치
 * @property {number} growth.level - 현재 레벨
 * @property {boolean} growth.isLevelUp - 레벨업 여부
 * @property {string} growth.levelLabel - 레벨 타이틀
 * @property {Object|null} streakInfo - 스트릭 정보 (오늘 첫 활동 시에만 포함)
 * @property {number} streakInfo.currentStreak - 현재 연속 활동 일수
 * @property {number} streakInfo.maxStreak - 최장 연속 활동 일수
 * @property {number} streakInfo.expEarned - 스트릭으로 획득한 EXP
 */

export const dreamHomeService = {
    /**
     * 드림홈 설정
     * 
     * 사용자의 목표 드림홈을 설정합니다.
     * 매물 상세에서 "내 집으로 설정" 버튼 클릭 시 호출됩니다.
     * 
     * @호출부 PropertyActions.vue, DreamHomeSetModal.vue
     * @param {DreamHomeSetRequest} data - 드림홈 설정 데이터
     * @returns {Promise<DreamHomeSetResponse>} 설정된 드림홈 정보
     * @throws {ApiError} 인증 필요(401), 유효성 검증 실패(400)
     * 
     * @example
     * const result = await dreamHomeService.setDreamHome({
     *   aptSeq: '12345',
     *   targetAmount: 24000,  // 2억 4천만원 (만원 단위)
     *   targetDate: '2028-12-31',
     *   monthlyGoal: 300  // 300만원 (만원 단위)
     * })
     */
    async setDreamHome(data) {
        const response = await apiClient.post(DREAM_HOME_ENDPOINTS.SET, data)
        return response.data.data
    },

    /**
     * 저축 기록
     * 
     * 저축금을 기록하고 경험치를 획득합니다.
     * 대시보드에서 "저축하기" 버튼 클릭 시 모달을 통해 호출됩니다.
     * 
     * @호출부 SavingInputModal.vue, MainGoalCard.vue, dreamHomeStore.js
     * @param {SavingsRecordRequest} data - 저축 기록 데이터
     * @returns {Promise<SavingsRecordResponse>} 저축 결과 및 성장 정보
     * @throws {ApiError} 인증 필요(401), 드림홈 미설정(400)
     * 
     * @example
     * const result = await dreamHomeService.recordSavings({
     *   amount: 1000000,  // 100만원
     *   saveType: 'DEPOSIT',
     *   memo: '월급 저축'
     * })
     * console.log(result.growth.expChange) // 50
     * console.log(result.growth.isLevelUp) // true
     */
    async recordSavings(data) {
        const response = await apiClient.post(DREAM_HOME_ENDPOINTS.SAVINGS, data)
        return response.data.data
    }
}

