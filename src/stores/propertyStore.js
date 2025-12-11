/**
 * Property Store
 *
 * 매물 관련 상태 관리 Pinia Store
 * dreamHomeStore 패턴을 따라 setup pattern으로 구현
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { propertyService } from '@/api/services/propertyService'
import { useDreamHomeStore } from './dreamHomeStore'
import { useAuthStore } from './authStore'
import { Property } from '@/models/Property'
import { SEOUL_CENTER, MAP_ZOOM_LEVELS } from '@/constants/properties'
import { validateCoordinates } from '@/utils/kakaoMapHelpers'

export const usePropertyStore = defineStore('property', () => {
    // State
    const properties = ref([]) // 전체 매물 목록
    const selectedProperty = ref(null) // 선택된 매물
    const loading = ref(false) // 로딩 상태
    const error = ref(null) // 에러 메시지
    const savedPropertyIds = ref([]) // 저장된 매물 ID 목록

    // 필터 상태
    const filters = ref({
        propertyType: null, // 매물 타입
        transactionType: null, // 거래 유형
        priceMin: null, // 최소 가격
        priceMax: null, // 최대 가격
        areaMin: null, // 최소 면적
        areaMax: null, // 최대 면적
        sido: '서울특별시', // 시/도
        sigungu: null, // 시/군/구
        rooms: null, // 방 개수
        bathrooms: null, // 욕실 개수
        features: [], // 특징
        keyword: '' // 검색어
    })

    // 정렬 상태
    const sortBy = ref('createdAt') // 정렬 기준
    const sortOrder = ref('desc') // 정렬 순서

    // 지도 상태
    const mapCenter = ref({ ...SEOUL_CENTER }) // 지도 중심 좌표
    const mapZoom = ref(MAP_ZOOM_LEVELS.CITY) // 지도 줌 레벨

    // 페이지네이션 상태
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalProperties = ref(0)
    const itemsPerPage = ref(50)

    // Getters (Computed)

    /**
     * 필터가 적용된 매물 목록
     */
    const filteredProperties = computed(() => {
        let result = [...properties.value]

        // 매물 타입 필터
        if (filters.value.propertyType) {
            result = result.filter((p) => p.propertyType === filters.value.propertyType)
        }

        // 거래 유형 필터
        if (filters.value.transactionType) {
            result = result.filter((p) => p.transactionType === filters.value.transactionType)
        }

        // 가격 범위 필터
        if (filters.value.priceMin !== null) {
            result = result.filter((p) => p.price >= filters.value.priceMin)
        }
        if (filters.value.priceMax !== null) {
            result = result.filter((p) => p.price <= filters.value.priceMax)
        }

        // 면적 범위 필터
        if (filters.value.areaMin !== null) {
            result = result.filter((p) => p.area >= filters.value.areaMin)
        }
        if (filters.value.areaMax !== null) {
            result = result.filter((p) => p.area <= filters.value.areaMax)
        }

        // 지역 필터
        if (filters.value.sigungu) {
            result = result.filter((p) => p.sigungu === filters.value.sigungu)
        }

        // 방 개수 필터
        if (filters.value.rooms) {
            result = result.filter((p) => p.rooms >= filters.value.rooms)
        }

        // 욕실 개수 필터
        if (filters.value.bathrooms) {
            result = result.filter((p) => p.bathrooms >= filters.value.bathrooms)
        }

        // 특징 필터
        if (filters.value.features && filters.value.features.length > 0) {
            result = result.filter((p) =>
                filters.value.features.some((feature) => p.features.includes(feature))
            )
        }

        // 검색어 필터
        if (filters.value.keyword) {
            const keyword = filters.value.keyword.toLowerCase()
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(keyword) ||
                    p.address.toLowerCase().includes(keyword) ||
                    p.sigungu.toLowerCase().includes(keyword) ||
                    p.description.toLowerCase().includes(keyword)
            )
        }

        return result
    })

    /**
     * 저장된 매물 목록
     */
    const savedProperties = computed(() => {
        return properties.value.filter((p) => savedPropertyIds.value.includes(p.id))
    })

    /**
     * 구매 가능한 매물 목록 (dreamHomeStore의 targetAmount 기준)
     */
    const affordableProperties = computed(() => {
        const dreamHomeStore = useDreamHomeStore()
        const budget = dreamHomeStore.targetAmount

        return properties.value.filter((p) => p.isAffordable(budget))
    })

    /**
     * 필터가 활성화되어 있는지 확인
     */
    const hasActiveFilters = computed(() => {
        return (
            filters.value.propertyType !== null ||
            filters.value.transactionType !== null ||
            filters.value.priceMin !== null ||
            filters.value.priceMax !== null ||
            filters.value.areaMin !== null ||
            filters.value.areaMax !== null ||
            filters.value.sigungu !== null ||
            filters.value.rooms !== null ||
            filters.value.bathrooms !== null ||
            (filters.value.features && filters.value.features.length > 0) ||
            filters.value.keyword !== ''
        )
    })

    /**
     * 선택된 매물이 저장되어 있는지 확인
     */
    const isSelectedPropertySaved = computed(() => {
        if (!selectedProperty.value) return false
        return savedPropertyIds.value.includes(selectedProperty.value.id)
    })

    // Actions

    /**
     * 매물 목록 조회
     * @param {Object} options - 조회 옵션
     */
    async function fetchProperties(options = {}) {
        loading.value = true
        error.value = null

        try {
            const response = await propertyService.getProperties({
                filters: filters.value,
                sortBy: sortBy.value,
                sortOrder: sortOrder.value,
                page: currentPage.value,
                limit: itemsPerPage.value,
                ...options
            })

            // 백엔드 데이터를 프론트엔드 형식으로 변환
            properties.value = (response.apartments || []).map(mapApartmentToProperty)
            totalProperties.value = response.totalCount || 0
            totalPages.value = response.totalPages || 1
            currentPage.value = response.page || 0
        } catch (err) {
            error.value = err.message || '매물 목록을 불러오는데 실패했습니다.'
            console.error('Failed to fetch properties:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 백엔드 아파트 데이터를 프론트엔드 Property 형식으로 변환
     * @param {Object} apt - 백엔드 ApartmentListResponse
     * @returns {Object} - 프론트엔드 Property 객체
     */
    function mapApartmentToProperty(apt) {
        // 백엔드 ApartmentListResponse는 aptSeq를 직접 필드로 가짐
        const aptId = apt.aptSeq || apt.id
        const aptName = apt.aptNm || apt.title || '아파트'
        const price = Number(apt.dealAmount ?? apt.recentPrice ?? apt.price) || 0
        const exclusiveArea = Number(apt.exclusiveArea ?? apt.area) || 0
        const areaPyeong = exclusiveArea ? Math.round(exclusiveArea * 0.3025) : 0
        const coordinates = buildCoordinates(apt)

        const property = new Property({
            id: aptId,
            title: aptName,
            propertyType: '아파트',
            transactionType: '매매',
            price,
            area: areaPyeong,
            sqm: exclusiveArea,
            rooms: apt.rooms ?? apt.roomCnt ?? 0,
            bathrooms: apt.bathrooms ?? apt.bathCnt ?? 0,
            floor: apt.floor || '-',
            buildYear: apt.buildYear,
            sido: '서울특별시',
            sigungu: apt.umdNm || '',
            address: `${apt.umdNm || ''} ${apt.roadNm || ''}`.trim(),
            coordinates,
            images: [{ url: null, alt: aptName }],
            features: buildFeatures(apt, areaPyeong),
            description: apt.description || '',
            agentInfo: apt.agentInfo || {},
            createdAt: apt.dealDate || apt.createdAt || new Date().toISOString()
        })

        // 기존 UI 포맷 유지
        property.priceFormatted = formatPrice(price)
        property.getFormattedPrice = () => formatPrice(price)

        // 호환성을 위해 개별 좌표도 보관
        if (coordinates) {
            property.latitude = coordinates.lat
            property.longitude = coordinates.lng
        }

        return property
    }

    /**
     * 가격 포맷팅 (만원 → "X억 Y천만원" 형식)
     */
    function formatPrice(priceInManwon) {
        if (!priceInManwon) return '가격 미정'
        const eok = Math.floor(priceInManwon / 10000)
        const remainder = priceInManwon % 10000
        const chun = Math.floor(remainder / 1000)

        if (eok > 0 && chun > 0) {
            return `${eok}억 ${chun}천만원`
        } else if (eok > 0) {
            return `${eok}억원`
        } else if (chun > 0) {
            return `${chun}천만원`
        } else {
            return `${priceInManwon}만원`
        }
    }

    /**
     * 단일 매물 조회 및 선택
     * @param {number|string} id - 매물 ID (aptSeq)
     */
    async function selectProperty(id) {
        loading.value = true
        error.value = null

        try {
            const aptDetail = await propertyService.getPropertyById(id)

            // 백엔드 상세 데이터를 프론트엔드 형식으로 변환
            const property = mapApartmentDetailToProperty(aptDetail)
            selectedProperty.value = property

            // 지도 중심을 선택된 매물 위치로 이동
            if (property?.coordinates) {
                mapCenter.value = { ...property.coordinates }
                mapZoom.value = MAP_ZOOM_LEVELS.DETAIL
            }
        } catch (err) {
            error.value = err.message || '매물 정보를 불러오는데 실패했습니다.'
            console.error('Failed to select property:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 백엔드 아파트 상세 데이터를 프론트엔드 Property 형식으로 변환
     */
    function mapApartmentDetailToProperty(apt) {
        const { info, deals } = normalizeAptDetail(apt)

        const latestDeal = deals && deals.length > 0 ? deals[0] : null
        const price = Number(latestDeal?.dealAmount ?? info?.recentPrice ?? 0) || 0
        const exclusiveArea =
            Number(latestDeal?.exclusiveArea ?? info?.area ?? info?.exclusiveArea) || 0
        const areaPyeong = exclusiveArea ? Math.round(exclusiveArea * 0.3025) : 0
        const coordinates = buildCoordinates(info || apt)

        const property = new Property({
            id: info?.aptSeq,
            title: info?.aptNm || '아파트',
            propertyType: '아파트',
            transactionType: '매매',
            price,
            area: areaPyeong,
            sqm: exclusiveArea,
            rooms: info?.rooms ?? info?.roomCnt ?? 0,
            bathrooms: info?.bathrooms ?? info?.bathCnt ?? 0,
            floor: latestDeal?.floor || info?.floor || '-',
            buildYear: info?.buildYear,
            sido: '서울특별시',
            sigungu: info?.umdNm || '',
            address: info?.jibun || `${info?.umdNm || ''} ${info?.roadNm || ''}`.trim(),
            coordinates,
            images: apt.images?.length
                ? apt.images
                : [{ url: null, alt: info?.aptNm || '아파트' }],
            features: buildFeatures(info || apt, areaPyeong),
            description: apt.description || '',
            agentInfo: apt.agentInfo || {},
            createdAt:
                latestDeal?.dealDate || apt.dealDate || apt.createdAt || new Date().toISOString()
        })

        property.priceFormatted = formatPrice(price)
        property.getFormattedPrice = () => formatPrice(price)
        property.roadAddress = `${info?.roadNm || ''} ${info?.roadNmBonbun || ''}${info?.roadNmBubun ? '-' + info.roadNmBubun : ''
            }`.trim()
        property.deals = deals || [] // 거래 이력 전체
        property.dealCount = deals?.length || 0

        if (coordinates) {
            property.latitude = coordinates.lat
            property.longitude = coordinates.lng
        }

        return property
    }

    function normalizeAptDetail(apt) {
        const data = apt?.data || apt
        const info = getAptInfo(data) || data?.aptInfo || data
        const deals = data?.deals || apt?.deals || []
        return { info, deals }
    }

    function getAptInfo(apt) {
        if (!apt) return null
        if (apt.aptSeq) return apt
        if (apt.aptInfo) return apt.aptInfo
        return null
    }

    function buildFeatures(apt, areaPyeong) {
        const features = []
        if (apt?.buildYear) {
            features.push(`${apt.buildYear}년 건축`)
        }
        if (areaPyeong) {
            features.push(`${areaPyeong}평`)
        }
        if (Array.isArray(apt?.features)) {
            features.push(...apt.features)
        }
        return features
    }

    function buildCoordinates(apt) {
        if (!apt) return null
        const lat = parseFloat(apt.latitude ?? apt.lat)
        const lng = parseFloat(apt.longitude ?? apt.lng)

        if (validateCoordinates(lat, lng)) {
            return { lat, lng }
        }

        return null
    }

    /**
     * 매물 선택 해제
     */
    function clearSelection() {
        selectedProperty.value = null
    }

    /**
     * 저장된 매물 ID 목록 조회
     */
    /**
     * 저장된 매물 ID 목록 조회
     * JWT 토큰으로 사용자 식별 (userId 불필요)
     */
    async function fetchSavedPropertyIds() {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return

        try {
            const ids = await propertyService.getSavedPropertyIds()
            savedPropertyIds.value = ids
        } catch (err) {
            console.error('Failed to fetch saved property ids:', err)
        }
    }

    /**
     * 저장된 매물 목록 조회
     */
    /**
     * 저장된 매물 목록 조회
     * JWT 토큰으로 사용자 식별 (userId 불필요)
     */
    async function fetchSavedProperties() {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return

        loading.value = true
        error.value = null

        try {
            const saved = await propertyService.getSavedProperties()
            properties.value = saved
            await fetchSavedPropertyIds()
        } catch (err) {
            error.value = err.message || '저장된 매물 목록을 불러오는데 실패했습니다.'
            console.error('Failed to fetch saved properties:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 매물 저장/저장 취소 토글
     * @param {number|string} propertyId - 매물 ID
     */
    /**
     * 매물 저장/저장 취소 토글
     * @param {number|string} propertyId - 매물 ID
     */
    async function toggleSaveProperty(propertyId) {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            error.value = '로그인이 필요합니다.'
            return
        }

        try {
            const isSaved = await propertyService.toggleSaveProperty(propertyId)

            // savedPropertyIds 업데이트
            if (isSaved) {
                if (!savedPropertyIds.value.includes(propertyId)) {
                    savedPropertyIds.value.push(propertyId)
                }
            } else {
                const index = savedPropertyIds.value.indexOf(propertyId)
                if (index > -1) {
                    savedPropertyIds.value.splice(index, 1)
                }
            }

            return isSaved
        } catch (err) {
            error.value = err.message || '매물 저장에 실패했습니다.'
            console.error('Failed to toggle save property:', err)
            throw err
        }
    }

    /**
     * 필터 업데이트
     * @param {Object} newFilters - 새로운 필터
     */
    function updateFilters(newFilters) {
        filters.value = { ...filters.value, ...newFilters }
    }

    /**
     * 필터 초기화
     */
    function resetFilters() {
        filters.value = {
            propertyType: null,
            transactionType: null,
            priceMin: null,
            priceMax: null,
            areaMin: null,
            areaMax: null,
            sido: '서울특별시',
            sigungu: null,
            rooms: null,
            bathrooms: null,
            features: [],
            keyword: ''
        }
    }

    /**
     * 정렬 설정 변경
     * @param {string} by - 정렬 기준
     * @param {string} order - 정렬 순서
     */
    function updateSort(by, order = 'desc') {
        sortBy.value = by
        sortOrder.value = order
    }

    /**
     * 지도 중심 설정
     * @param {Object} center - 중심 좌표 { lat, lng }
     * @param {number} zoom - 줌 레벨 (선택사항)
     */
    function setMapCenter(center, zoom = null) {
        mapCenter.value = { ...center }
        if (zoom !== null) {
            mapZoom.value = zoom
        }
    }

    /**
     * 지도 줌 레벨 설정
     * @param {number} zoom - 줌 레벨
     */
    function setMapZoom(zoom) {
        mapZoom.value = zoom
    }

    /**
     * 지도를 서울 중심으로 초기화
     */
    function resetMapCenter() {
        mapCenter.value = { ...SEOUL_CENTER }
        mapZoom.value = MAP_ZOOM_LEVELS.CITY
    }

    /**
     * 페이지 변경
     * @param {number} page - 페이지 번호
     */
    async function changePage(page) {
        if (page < 1 || page > totalPages.value) return
        currentPage.value = page
        await fetchProperties()
    }

    /**
     * 매물 검색
     * @param {string} keyword - 검색어
     */
    async function searchProperties(keyword) {
        filters.value.keyword = keyword
        currentPage.value = 1
        await fetchProperties()
    }

    /**
     * 매물 데이터 초기화 (디버깅용)
     */
    async function resetProperties() {
        try {
            await propertyService.resetProperties()
            await fetchProperties()
        } catch (err) {
            error.value = err.message || '매물 데이터 초기화에 실패했습니다.'
            console.error('Failed to reset properties:', err)
        }
    }

    /**
     * 에러 메시지 초기화
     */
    function clearError() {
        error.value = null
    }

    return {
        // State
        properties,
        selectedProperty,
        loading,
        error,
        savedPropertyIds,
        filters,
        sortBy,
        sortOrder,
        mapCenter,
        mapZoom,
        currentPage,
        totalPages,
        totalProperties,
        itemsPerPage,
        // Computed
        filteredProperties,
        savedProperties,
        affordableProperties,
        hasActiveFilters,
        isSelectedPropertySaved,
        // Actions
        fetchProperties,
        selectProperty,
        clearSelection,
        fetchSavedPropertyIds,
        fetchSavedProperties,
        toggleSaveProperty,
        updateFilters,
        resetFilters,
        updateSort,
        setMapCenter,
        setMapZoom,
        resetMapCenter,
        changePage,
        searchProperties,
        resetProperties,
        clearError
    }
})
