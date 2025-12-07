/**
 * Collection Service
 * 
 * 컬렉션 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/collectionService
 */

import apiClient from '@/api/client'
import { USER_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} CollectionItem
 * @property {number} id - 컬렉션 ID
 * @property {number} propertyId - 매물 ID
 * @property {string} name - 드림홈 이름
 * @property {string} imageUrl - 이미지 URL
 * @property {number} price - 가격
 * @property {number} targetAmount - 목표 금액
 * @property {string} savedAt - 저장일
 * @property {boolean} isActive - 현재 활성 드림홈 여부
 */

/**
 * @typedef {Object} CollectionResponse
 * @property {CollectionItem[]} collections - 컬렉션 목록
 */

export const collectionService = {
    /**
     * 저장된 드림홈 컬렉션 조회
     * 
     * 사용자가 저장한 드림홈 목록을 조회합니다.
     * CollectionView에서 히스토리 표시에 사용됩니다.
     * 
     * @returns {Promise<CollectionResponse>} 컬렉션 목록
     * 
     * @example
     * const { collections } = await collectionService.getCollections()
     * const activeDreamHome = collections.find(c => c.isActive)
     */
    async getCollections() {
        const response = await apiClient.get(USER_ENDPOINTS.COLLECTIONS)
        return response.data
    }
}
