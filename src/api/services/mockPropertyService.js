/**
 * Mock Property Service
 *
 * localStorage 기반 매물 데이터 관리 서비스
 * 실제 백엔드 API가 준비될 때까지 사용
 */

import { Property } from '@/models/Property'
import { generateMockProperties } from '@/utils/mockPropertyGenerator'

// localStorage 키
const PROPERTIES_KEY = 'jipjung_properties'
const SAVED_PROPERTIES_KEY = 'jipjung_saved_properties'

/**
 * localStorage에서 매물 데이터 로드
 * @returns {Property[]} Property 인스턴스 배열
 */
function loadProperties() {
    try {
        const stored = localStorage.getItem(PROPERTIES_KEY)

        if (!stored) {
            // 저장된 데이터가 없으면 새로 생성
            const properties = generateMockProperties()
            saveProperties(properties)
            return properties
        }

        const data = JSON.parse(stored)
        return data.map((item) => Property.fromJSON(item))
    } catch (error) {
        console.error('Failed to load properties from localStorage:', error)
        return []
    }
}

/**
 * localStorage에 매물 데이터 저장
 * @param {Property[]} properties - Property 인스턴스 배열
 */
function saveProperties(properties) {
    try {
        const data = properties.map((property) => property.toJSON())
        localStorage.setItem(PROPERTIES_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Failed to save properties to localStorage:', error)
    }
}

/**
 * localStorage에서 사용자의 저장된 매물 ID 목록 로드
 * @param {string|number} userId - 사용자 ID
 * @returns {number[]} 매물 ID 배열
 */
function loadSavedPropertyIds(userId) {
    try {
        const stored = localStorage.getItem(`${SAVED_PROPERTIES_KEY}_${userId}`)
        return stored ? JSON.parse(stored) : []
    } catch (error) {
        console.error('Failed to load saved properties from localStorage:', error)
        return []
    }
}

/**
 * localStorage에 사용자의 저장된 매물 ID 목록 저장
 * @param {string|number} userId - 사용자 ID
 * @param {number[]} propertyIds - 매물 ID 배열
 */
function saveSavedPropertyIds(userId, propertyIds) {
    try {
        localStorage.setItem(`${SAVED_PROPERTIES_KEY}_${userId}`, JSON.stringify(propertyIds))
    } catch (error) {
        console.error('Failed to save saved properties to localStorage:', error)
    }
}

/**
 * 필터 적용
 * @param {Property[]} properties - 매물 배열
 * @param {Object} filters - 필터 조건
 * @returns {Property[]} 필터링된 매물 배열
 */
function applyFilters(properties, filters = {}) {
    let filtered = [...properties]

    // 매물 타입 필터
    if (filters.propertyType) {
        filtered = filtered.filter((p) => p.propertyType === filters.propertyType)
    }

    // 거래 유형 필터
    if (filters.transactionType) {
        filtered = filtered.filter((p) => p.transactionType === filters.transactionType)
    }

    // 가격 범위 필터
    if (filters.priceMin !== undefined) {
        filtered = filtered.filter((p) => p.price >= filters.priceMin)
    }
    if (filters.priceMax !== undefined) {
        filtered = filtered.filter((p) => p.price <= filters.priceMax)
    }

    // 면적 범위 필터
    if (filters.areaMin !== undefined) {
        filtered = filtered.filter((p) => p.area >= filters.areaMin)
    }
    if (filters.areaMax !== undefined) {
        filtered = filtered.filter((p) => p.area <= filters.areaMax)
    }

    // 지역 필터
    if (filters.sido) {
        filtered = filtered.filter((p) => p.sido === filters.sido)
    }
    if (filters.sigungu) {
        filtered = filtered.filter((p) => p.sigungu === filters.sigungu)
    }

    // 방 개수 필터
    if (filters.rooms) {
        filtered = filtered.filter((p) => p.rooms >= filters.rooms)
    }

    // 욕실 개수 필터
    if (filters.bathrooms) {
        filtered = filtered.filter((p) => p.bathrooms >= filters.bathrooms)
    }

    // 특징 필터 (OR 조건)
    if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter((p) =>
            filters.features.some((feature) => p.features.includes(feature))
        )
    }

    // 검색어 필터 (제목, 주소, 설명에서 검색)
    if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        filtered = filtered.filter(
            (p) =>
                p.title.toLowerCase().includes(keyword) ||
                p.address.toLowerCase().includes(keyword) ||
                p.sigungu.toLowerCase().includes(keyword) ||
                p.description.toLowerCase().includes(keyword)
        )
    }

    return filtered
}

/**
 * 정렬 적용
 * @param {Property[]} properties - 매물 배열
 * @param {string} sortBy - 정렬 기준 (price, area, createdAt)
 * @param {string} sortOrder - 정렬 순서 (asc, desc)
 * @returns {Property[]} 정렬된 매물 배열
 */
function applySort(properties, sortBy = 'createdAt', sortOrder = 'desc') {
    const sorted = [...properties]

    sorted.sort((a, b) => {
        let aValue = a[sortBy]
        let bValue = b[sortBy]

        // 날짜는 타임스탬프로 변환
        if (sortBy === 'createdAt') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
        }

        if (sortOrder === 'asc') {
            return aValue - bValue
        } else {
            return bValue - aValue
        }
    })

    return sorted
}

/**
 * Mock Property Service
 */
export const mockPropertyService = {
    /**
     * 매물 목록 조회 (필터링, 정렬 지원)
     * @param {Object} options - 옵션
     * @param {Object} options.filters - 필터 조건
     * @param {string} options.sortBy - 정렬 기준
     * @param {string} options.sortOrder - 정렬 순서
     * @param {number} options.page - 페이지 번호 (1부터 시작)
     * @param {number} options.limit - 페이지당 개수
     * @returns {Promise<Object>} { properties, total, page, totalPages }
     */
    async getProperties(options = {}) {
        // 지연 시뮬레이션 (실제 API 호출처럼)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const { filters = {}, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = options

        try {
            let properties = loadProperties()

            // 필터 적용
            properties = applyFilters(properties, filters)

            // 정렬 적용
            properties = applySort(properties, sortBy, sortOrder)

            // 페이지네이션
            const total = properties.length
            const totalPages = Math.ceil(total / limit)
            const start = (page - 1) * limit
            const end = start + limit
            const paginatedProperties = properties.slice(start, end)

            return {
                properties: paginatedProperties,
                total,
                page,
                totalPages
            }
        } catch (error) {
            console.error('Failed to get properties:', error)
            throw new Error('매물 목록을 불러오는데 실패했습니다.')
        }
    },

    /**
     * 단일 매물 조회
     * @param {number|string} id - 매물 ID
     * @returns {Promise<Property|null>} Property 인스턴스 또는 null
     */
    async getPropertyById(id) {
        await new Promise((resolve) => setTimeout(resolve, 200))

        try {
            const properties = loadProperties()
            const property = properties.find((p) => p.id === Number(id))
            return property || null
        } catch (error) {
            console.error('Failed to get property by id:', error)
            throw new Error('매물 정보를 불러오는데 실패했습니다.')
        }
    },

    /**
     * 사용자의 저장된 매물 ID 목록 조회
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<number[]>} 매물 ID 배열
     */
    async getSavedPropertyIds(userId) {
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
            return loadSavedPropertyIds(userId)
        } catch (error) {
            console.error('Failed to get saved property ids:', error)
            throw new Error('저장된 매물 목록을 불러오는데 실패했습니다.')
        }
    },

    /**
     * 사용자의 저장된 매물 목록 조회
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<Property[]>} Property 인스턴스 배열
     */
    async getSavedProperties(userId) {
        await new Promise((resolve) => setTimeout(resolve, 200))

        try {
            const savedIds = loadSavedPropertyIds(userId)
            const allProperties = loadProperties()
            return allProperties.filter((p) => savedIds.includes(p.id))
        } catch (error) {
            console.error('Failed to get saved properties:', error)
            throw new Error('저장된 매물 목록을 불러오는데 실패했습니다.')
        }
    },

    /**
     * 매물 저장/저장 취소 토글
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<boolean>} 저장 여부 (true: 저장됨, false: 저장 취소됨)
     */
    async toggleSaveProperty(userId, propertyId) {
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
            const savedIds = loadSavedPropertyIds(userId)
            const id = Number(propertyId)
            const index = savedIds.indexOf(id)

            let isSaved
            if (index > -1) {
                // 이미 저장된 경우 제거
                savedIds.splice(index, 1)
                isSaved = false
            } else {
                // 저장되지 않은 경우 추가
                savedIds.push(id)
                isSaved = true
            }

            saveSavedPropertyIds(userId, savedIds)
            return isSaved
        } catch (error) {
            console.error('Failed to toggle save property:', error)
            throw new Error('매물 저장에 실패했습니다.')
        }
    },

    /**
     * 매물 저장
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<void>}
     */
    async saveProperty(userId, propertyId) {
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
            const savedIds = loadSavedPropertyIds(userId)
            const id = Number(propertyId)

            if (!savedIds.includes(id)) {
                savedIds.push(id)
                saveSavedPropertyIds(userId, savedIds)
            }
        } catch (error) {
            console.error('Failed to save property:', error)
            throw new Error('매물 저장에 실패했습니다.')
        }
    },

    /**
     * 매물 저장 취소
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<void>}
     */
    async unsaveProperty(userId, propertyId) {
        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
            const savedIds = loadSavedPropertyIds(userId)
            const id = Number(propertyId)
            const index = savedIds.indexOf(id)

            if (index > -1) {
                savedIds.splice(index, 1)
                saveSavedPropertyIds(userId, savedIds)
            }
        } catch (error) {
            console.error('Failed to unsave property:', error)
            throw new Error('매물 저장 취소에 실패했습니다.')
        }
    },

    /**
     * 매물 데이터 초기화 (디버깅용)
     * @returns {Promise<void>}
     */
    async resetProperties() {
        try {
            const properties = generateMockProperties()
            saveProperties(properties)
        } catch (error) {
            console.error('Failed to reset properties:', error)
            throw new Error('매물 데이터 초기화에 실패했습니다.')
        }
    },

    /**
     * 매물이 사용자의 저장 목록에 있는지 확인
     * @param {string|number} userId - 사용자 ID
     * @param {number|string} propertyId - 매물 ID
     * @returns {Promise<boolean>} 저장 여부
     */
    async isPropertySaved(userId, propertyId) {
        await new Promise((resolve) => setTimeout(resolve, 50))

        try {
            const savedIds = loadSavedPropertyIds(userId)
            return savedIds.includes(Number(propertyId))
        } catch (error) {
            console.error('Failed to check if property is saved:', error)
            return false
        }
    }
}
