/**
 * Property Service
 *
 * 매물 관련 API 서비스 (Service Layer Abstraction)
 * mockPropertyService를 래핑하여 나중에 실제 API로 쉽게 교체 가능
 */

import { mockPropertyService } from './mockPropertyService'

export const propertyService = {
    /**
     * 매물 목록 조회
     * @param {Object} options - 조회 옵션
     * @returns {Promise<Object>} { properties, total, page, totalPages }
     */
    async getProperties(options = {}) {
        return await mockPropertyService.getProperties(options)
    },

    /**
     * 단일 매물 조회
     * @param {number|string} id - 매물 ID
     * @returns {Promise<Property|null>} Property 인스턴스 또는 null
     */
    async getPropertyById(id) {
        return await mockPropertyService.getPropertyById(id)
    },

    /**
     * 사용자의 저장된 매물 ID 목록 조회
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<number[]>} 매물 ID 배열
     */
    async getSavedPropertyIds(userId) {
        return await mockPropertyService.getSavedPropertyIds(userId)
    },

    /**
     * 사용자의 저장된 매물 목록 조회
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<Property[]>} Property 인스턴스 배열
     */
    async getSavedProperties(userId) {
        return await mockPropertyService.getSavedProperties(userId)
    },

    /**
     * 매물 저장/저장 취소 토글
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<boolean>} 저장 여부 (true: 저장됨, false: 저장 취소됨)
     */
    async toggleSaveProperty(userId, propertyId) {
        return await mockPropertyService.toggleSaveProperty(userId, propertyId)
    },

    /**
     * 매물 저장
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<void>}
     */
    async saveProperty(userId, propertyId) {
        return await mockPropertyService.saveProperty(userId, propertyId)
    },

    /**
     * 매물 저장 취소
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<void>}
     */
    async unsaveProperty(userId, propertyId) {
        return await mockPropertyService.unsaveProperty(userId, propertyId)
    },

    /**
     * 매물이 사용자의 저장 목록에 있는지 확인
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<boolean>} 저장 여부
     */
    async isPropertySaved(userId, propertyId) {
        return await mockPropertyService.isPropertySaved(userId, propertyId)
    },

    /**
     * 매물 데이터 초기화 (디버깅용)
     * @returns {Promise<void>}
     */
    async resetProperties() {
        return await mockPropertyService.resetProperties()
    }
}

// 실제 백엔드 API 사용 시 아래와 같이 교체:
/*
import apiClient from '@/api/client'

export const propertyService = {
  async getProperties(options = {}) {
    const { filters, sortBy, sortOrder, page, limit } = options
    const response = await apiClient.get('/properties', {
      params: {
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit
      }
    })
    return response.data
  },

  async getPropertyById(id) {
    const response = await apiClient.get(`/properties/${id}`)
    return response.data
  },

  async getSavedPropertyIds(userId) {
    const response = await apiClient.get(`/users/${userId}/saved-properties/ids`)
    return response.data
  },

  async getSavedProperties(userId) {
    const response = await apiClient.get(`/users/${userId}/saved-properties`)
    return response.data
  },

  async toggleSaveProperty(userId, propertyId) {
    const response = await apiClient.post(`/users/${userId}/saved-properties/${propertyId}/toggle`)
    return response.data.isSaved
  },

  async saveProperty(userId, propertyId) {
    const response = await apiClient.post(`/users/${userId}/saved-properties/${propertyId}`)
    return response.data
  },

  async unsaveProperty(userId, propertyId) {
    const response = await apiClient.delete(`/users/${userId}/saved-properties/${propertyId}`)
    return response.data
  },

  async isPropertySaved(userId, propertyId) {
    const response = await apiClient.get(`/users/${userId}/saved-properties/${propertyId}/check`)
    return response.data.isSaved
  }
}
*/
