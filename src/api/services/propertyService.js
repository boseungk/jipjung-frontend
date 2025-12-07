/**
 * Property Service
 * 
 * 매물 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/propertyService
 */

import apiClient from '@/api/client'
import { PROPERTY_ENDPOINTS, USER_ENDPOINTS, savedPropertyEndpoints } from '@/api/endpoints'

/**
 * @typedef {Object} PropertyFilters
 * @property {string} [propertyType] - 매물 타입 (아파트, 빌라, 오피스텔, 단독주택)
 * @property {string} [transactionType] - 거래 유형 (매매, 전세, 월세)
 * @property {number} [priceMin] - 최소 가격
 * @property {number} [priceMax] - 최대 가격
 * @property {number} [areaMin] - 최소 면적 (m²)
 * @property {number} [areaMax] - 최대 면적 (m²)
 * @property {string} [sido] - 시/도
 * @property {string} [sigungu] - 시/군/구
 * @property {number} [rooms] - 최소 방 개수
 * @property {number} [bathrooms] - 최소 욕실 개수
 * @property {string[]} [features] - 특징 배열
 * @property {string} [keyword] - 검색어
 */

/**
 * @typedef {Object} PropertyListOptions
 * @property {PropertyFilters} [filters] - 필터 옵션
 * @property {string} [sortBy] - 정렬 기준 (price, area, createdAt)
 * @property {string} [sortOrder] - 정렬 순서 (asc, desc)
 * @property {number} [page] - 페이지 번호 (기본: 1)
 * @property {number} [limit] - 페이지당 항목 수 (기본: 50)
 */

/**
 * @typedef {Object} Property
 * @property {number} id - 매물 ID
 * @property {string} title - 제목
 * @property {string} propertyType - 매물 타입
 * @property {string} transactionType - 거래 유형
 * @property {number} price - 가격
 * @property {number} area - 면적 (m²)
 * @property {number} rooms - 방 개수
 * @property {number} bathrooms - 욕실 개수
 * @property {string} address - 주소
 * @property {string} sido - 시/도
 * @property {string} sigungu - 시/군/구
 * @property {string} dong - 동
 * @property {Object} coordinates - 좌표
 * @property {string[]} images - 이미지 URL 배열
 * @property {string[]} features - 특징 배열
 * @property {string} description - 설명
 * @property {number} buildYear - 건축년도
 * @property {number} floor - 층
 * @property {number} totalFloors - 전체 층수
 * @property {number} maintenanceFee - 관리비
 * @property {string} createdAt - 생성일
 */

/**
 * @typedef {Object} PropertyListResponse
 * @property {Property[]} properties - 매물 목록
 * @property {number} total - 전체 매물 수
 * @property {number} page - 현재 페이지
 * @property {number} totalPages - 전체 페이지 수
 * @property {number} limit - 페이지당 항목 수
 */

export const propertyService = {
  /**
   * 매물 목록 조회
   * 
   * @param {PropertyListOptions} [options={}] - 조회 옵션
   * @returns {Promise<PropertyListResponse>} 매물 목록 및 페이지네이션 정보
   * 
   * @example
   * const result = await propertyService.getProperties({
   *   filters: { propertyType: '아파트', priceMax: 1000000000 },
   *   sortBy: 'price',
   *   sortOrder: 'asc',
   *   page: 1,
   *   limit: 50
   * })
   */
  async getProperties(options = {}) {
    const { filters = {}, sortBy, sortOrder, page = 1, limit = 50 } = options

    const response = await apiClient.get(PROPERTY_ENDPOINTS.LIST, {
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

  /**
   * 단일 매물 상세 조회
   * 
   * @param {number|string} id - 매물 ID
   * @returns {Promise<Property>} 매물 상세 정보
   * @throws {ApiError} 매물 없음(404)
   */
  async getPropertyById(id) {
    const response = await apiClient.get(PROPERTY_ENDPOINTS.DETAIL(id))
    return response.data
  },

  /**
   * 저장된 매물 ID 목록 조회
   * 
   * JWT 토큰으로 사용자 식별 (userId 파라미터 불필요)
   * 
   * @returns {Promise<number[]>} 저장된 매물 ID 배열
   */
  async getSavedPropertyIds() {
    const response = await apiClient.get(USER_ENDPOINTS.SAVED_PROPERTY_IDS)
    return response.data.savedPropertyIds || []
  },

  /**
   * 저장된 매물 목록 조회
   * 
   * @returns {Promise<Property[]>} 저장된 매물 목록
   */
  async getSavedProperties() {
    const response = await apiClient.get(USER_ENDPOINTS.SAVED_PROPERTIES)
    return response.data.properties || []
  },

  /**
   * 매물 저장/저장 취소 토글
   * 
   * @param {number|string} propertyId - 매물 ID
   * @returns {Promise<boolean>} 저장 여부 (true: 저장됨, false: 저장 취소됨)
   */
  async toggleSaveProperty(propertyId) {
    const response = await apiClient.post(savedPropertyEndpoints.toggle(propertyId))
    return response.data.isSaved
  },

  /**
   * 매물 저장 취소
   * 
   * @param {number|string} propertyId - 매물 ID
   * @returns {Promise<void>}
   */
  async unsaveProperty(propertyId) {
    await apiClient.delete(savedPropertyEndpoints.delete(propertyId))
  },

  /**
   * 매물이 저장되어 있는지 확인
   * 
   * 클라이언트 측에서 savedPropertyIds를 캐시하여 확인하는 것을 권장
   * 
   * @param {number|string} propertyId - 매물 ID
   * @param {number[]} savedIds - 저장된 매물 ID 배열
   * @returns {boolean} 저장 여부
   */
  isPropertySaved(propertyId, savedIds) {
    return savedIds.includes(Number(propertyId))
  }
}
