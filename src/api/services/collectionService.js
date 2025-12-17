/**
 * Collection Service
 * 
 * 컬렉션(완성된 집) 관련 API 호출을 담당하는 서비스 레이어.
 * 백엔드 /api/collection/* 엔드포인트와 연동됩니다.
 * 
 * @module api/services/collectionService
 */

import apiClient from '@/api/client'
import { COLLECTION_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} CollectionItem
 * @property {number} collectionId - 컬렉션 ID
 * @property {number} themeId - 테마 ID
 * @property {string} themeName - 테마 이름
 * @property {string} themeCode - 테마 코드 (CLASSIC, HANOK 등)
 * @property {number} dreamHomeId - 드림홈 ID (여정 조회용)
 * @property {string} propertyName - 매물명
 * @property {string} location - 위치
 * @property {number} targetAmount - 목표 금액 (원)
 * @property {number} savingPeriodDays - 저축 기간 (일)
 * @property {string} completedAt - 완공일
 * @property {boolean} isMainDisplay - 대표 전시 여부
 * @property {number} totalSaved - 완공까지 모은 총액 (원)
 * @property {string} houseName - 집 이름
 */

/**
 * @typedef {Object} CollectionResponse
 * @property {CollectionItem[]} collections - 컬렉션 목록
 * @property {number} totalCount - 총 컬렉션 수
 * @property {boolean} activeGoalExists - 활성 드림홈 존재 여부
 */

/**
 * @typedef {Object} JourneyPhase
 * @property {number} phaseNumber - Phase 번호 (1-11)
 * @property {string} phaseName - Phase 이름 (터파기, 기초 공사 등)
 * @property {string} themeCode - 테마 코드
 * @property {number} stageNumber - 단계 번호
 * @property {string} reachedAt - Phase 도달 시각
 * @property {number} cumulativeAmount - 누적 저축 금액
 * @property {Array} events - 이 Phase의 이벤트 목록
 */

/**
 * @typedef {Object} JourneyResponse
 * @property {Object} collection - 컬렉션 정보
 * @property {Object} summary - 여정 요약
 * @property {JourneyPhase[]} phases - Phase별 이벤트 목록
 */

export const collectionService = {
    /**
     * 완성된 집 목록 조회
     * 
     * 사용자가 완성한 집 목록을 조회합니다.
     * CollectionView에서 그리드 표시에 사용됩니다.
     * 
     * @returns {Promise<CollectionResponse>} 컬렉션 목록
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * const { collections, totalCount, activeGoalExists } = await collectionService.getCollections()
     */
    async getCollections() {
        const response = await apiClient.get(COLLECTION_ENDPOINTS.LIST)
        return response.data.data
    },

    /**
     * 저축 여정 상세 조회
     * 
     * 완성된 집의 저축 여정을 리플레이용으로 조회합니다.
     * JourneyReplayView에서 스크롤 애니메이션 데이터로 사용됩니다.
     * 
     * @호출부 JourneyReplayView.vue
     * @param {number} collectionId - 컬렉션 ID
     * @returns {Promise<JourneyResponse>} 저축 여정 상세 정보
     * @throws {ApiError} 인증 필요(401), 접근 권한 없음(403), 컬렉션 미존재(404)
     * 
     * @example
     * const { collection, summary, phases } = await collectionService.getJourney(1)
     * phases.forEach(phase => {
     *   console.log(`${phase.phaseName}: ${phase.events.length} events`)
     * })
     */
    async getJourney(collectionId) {
        const response = await apiClient.get(COLLECTION_ENDPOINTS.JOURNEY(collectionId))
        return response.data.data
    },

    /**
     * 대표 컬렉션 설정
     * 
     * 해당 컬렉션을 대표 전시로 설정합니다.
     * 기존 대표 컬렉션은 자동으로 해제됩니다.
     * 
     * @호출부 CollectionView.vue, CollectionMiniCard.vue
     * @param {number} collectionId - 컬렉션 ID
     * @returns {Promise<{success: boolean, collectionId: number, isMainDisplay: boolean}>}
     * @throws {ApiError} 인증 필요(401), 접근 권한 없음(403), 컬렉션 미존재(404)
     * 
     * @example
     * const result = await collectionService.setMainDisplay(1)
     * if (result.success) {
     *   console.log('대표 컬렉션 설정 완료')
     * }
     */
    async setMainDisplay(collectionId) {
        const response = await apiClient.put(COLLECTION_ENDPOINTS.MAIN_DISPLAY(collectionId))
        return response.data.data
    }
}
