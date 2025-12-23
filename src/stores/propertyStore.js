/**
 * Property Store
 *
 * 매물 관련 상태 관리 Pinia Store
 * dreamHomeStore 패턴을 따라 setup pattern으로 구현
 */

import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { propertyService } from '@/api/services/propertyService'
import { useDreamHomeStore } from './dreamHomeStore'
import { useAuthStore } from './authStore'
import { Property } from '@/models/Property'
import { SEOUL_CENTER, MAP_ZOOM_LEVELS } from '@/constants/properties'
import { validateCoordinates } from '@/utils/kakaoMapHelpers'

// 아파트 이미지 총 개수 (apartments_01.webp ~ apartments_24.webp)
const APARTMENT_IMAGE_COUNT = 24

/**
 * aptSeq 기반으로 일관된 아파트 이미지 경로를 반환
 * @param {string|number} aptId - 아파트 ID
 * @returns {string} - 이미지 경로
 */
function getRandomApartmentImage(aptId) {
    // aptId를 기반으로 일관된 이미지 인덱스를 생성 (같은 ID면 항상 같은 이미지)
    const hash = String(aptId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const imageIndex = (hash % APARTMENT_IMAGE_COUNT) + 1
    const paddedIndex = String(imageIndex).padStart(2, '0')
    return `/apartments/apartments_${paddedIndex}.webp`
}

export const usePropertyStore = defineStore('property', () => {
    // State
    const properties = ref([]) // 전체 매물 목록
    const selectedProperty = ref(null) // 선택된 매물
    const loading = ref(false) // 로딩 상태
    const error = ref(null) // 에러 메시지
    const authStore = useAuthStore()
    const { userPreferredAreas } = storeToRefs(authStore)

    // 관심 아파트 (백엔드 /api/apartments/favorites 연동)
    const favorites = ref([]) // FavoriteResponse 배열: [{id, aptSeq, apartmentInfo...}]

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
        keyword: '', // 검색어
        favoritesOnly: false // 관심 아파트만 표시
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
    const preferredRegionApplied = ref(false)

    // Computed: 관심 아파트 aptSeq 목록
    const favoriteAptSeqs = computed(() => favorites.value.map(f => f.aptSeq))

    // 하위 호환성을 위한 savedPropertyIds computed
    const savedPropertyIds = computed(() => favoriteAptSeqs.value)

    // Getters (Computed)

    function parsePreferredArea(area) {
        if (!area) return null

        if (typeof area === 'string') {
            const tokens = area.trim().split(/\s+/).filter(Boolean)
            if (tokens.length < 2) return null
            const sigungu = tokens[tokens.length - 1]
            const sido = tokens.slice(0, -1).join(' ')
            return { sido, sigungu }
        }

        if (area.sido && area.sigungu) {
            return { sido: area.sido, sigungu: area.sigungu }
        }

        return null
    }

    function resolvePreferredRegion() {
        const preferredAreas = userPreferredAreas.value || []
        if (preferredAreas.length === 0) return null
        return parsePreferredArea(preferredAreas[0])
    }

    function applyPreferredRegionIfEmpty() {
        if (preferredRegionApplied.value) return false
        if (filters.value.sigungu) {
            preferredRegionApplied.value = true
            return false
        }

        const preferred = resolvePreferredRegion()
        if (!preferred) return false

        filters.value = {
            ...filters.value,
            sido: preferred.sido,
            sigungu: preferred.sigungu
        }
        preferredRegionApplied.value = true
        return true
    }

    /**
     * 필터가 적용된 매물 목록
     */
    const filteredProperties = computed(() => {
        let result = [...properties.value]

        // 관심 아파트 필터
        if (filters.value.favoritesOnly) {
            result = result.filter(p => favoriteAptSeqs.value.includes(p.aptSeq || p.id))
        }

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

        // 방 개수 필터 (null 안전 처리)
        if (filters.value.rooms) {
            result = result.filter((p) => (p.rooms ?? 0) >= filters.value.rooms)
        }

        // 욕실 개수 필터 (null 안전 처리)
        if (filters.value.bathrooms) {
            result = result.filter((p) => (p.bathrooms ?? 0) >= filters.value.bathrooms)
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

        // 정렬 (백엔드 정렬 미지원 대비: 클라이언트에서 반영)
        const direction = sortOrder.value === 'asc' ? 1 : -1
        const sortKey = sortBy.value || 'createdAt'

        result.sort((a, b) => {
            if (sortKey === 'price') {
                return ((Number(a.price) || 0) - (Number(b.price) || 0)) * direction
            }
            if (sortKey === 'area') {
                return ((Number(a.area) || 0) - (Number(b.area) || 0)) * direction
            }

            const aTime = Date.parse(a.createdAt) || 0
            const bTime = Date.parse(b.createdAt) || 0
            return (aTime - bTime) * direction
        })

        return result
    })

    /**
     * 저장된 (관심) 매물 목록
     */
    const savedProperties = computed(() => {
        return properties.value.filter((p) => favoriteAptSeqs.value.includes(p.aptSeq || p.id))
    })

    /**
     * 구매 가능한 매물 목록 (dreamHomeStore의 targetAmount 기준)
     */
    const affordableProperties = computed(() => {
        const dreamHomeStore = useDreamHomeStore()
        const targetAmountWon = dreamHomeStore.targetAmount

        return properties.value.filter((p) => {
            if (typeof p?.isAffordableByTargetAmount === 'function') {
                return p.isAffordableByTargetAmount(targetAmountWon)
            }

            const priceManwon = Number(p?.price) || 0
            const downPaymentWon = Math.ceil(priceManwon * 10000 * 0.3)
            return downPaymentWon <= (Number(targetAmountWon) || 0)
        })
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
            filters.value.keyword !== '' ||
            filters.value.favoritesOnly === true
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
            applyPreferredRegionIfEmpty()
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
            currentPage.value = (response.page ?? 0) + 1
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
        const price = resolveAptPriceManwon(apt)
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
            rooms: (apt.rooms ?? apt.roomCnt ?? 0) > 0 ? (apt.rooms ?? apt.roomCnt) : null,
            bathrooms: (apt.bathrooms ?? apt.bathCnt ?? 0) > 0 ? (apt.bathrooms ?? apt.bathCnt) : null,
            floor: cleanFloor(apt.floor),
            buildYear: apt.buildYear,
            sido: apt.sido || apt.sidoName || '',
            sigungu: apt.sigungu || apt.umdNm || '',
            address: `${apt.umdNm || ''} ${apt.roadNm || ''}`.trim(),
            coordinates,
            images: [{ url: getRandomApartmentImage(aptId), alt: aptName }],
            features: buildFeatures(apt, areaPyeong),
            description: apt.description || '',
            agentInfo:
                apt.agentInfo &&
                    typeof apt.agentInfo === 'object' &&
                    Object.keys(apt.agentInfo).length > 0
                    ? apt.agentInfo
                    : null,
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
     * 계약금 층수 따옴표 제거
     */
    function cleanFloor(floor) {
        if (!floor || floor === '-') return null
        return String(floor).replace(/['"]/g, '').trim() || null
    }

    /**
     * 가격 포맷팅 (만원 → "X억 Y천만원" 형식)
     */
    function formatPrice(priceInManwon) {
        if (!priceInManwon || priceInManwon === 0) return '가격 문의'
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
     * 숫자/문자(콤마 포함) 형태의 값을 안전하게 number로 파싱
     * - 거래금액이 "45,000" 같은 문자열로 내려오는 케이스 방어
     */
    function parseNumberLike(value) {
        if (value === null || value === undefined) return null

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null
        }

        if (typeof value === 'string') {
            const trimmed = value.trim()
            if (!trimmed) return null

            const normalized = trimmed.replace(/,/g, '').replace(/[^\d.-]/g, '')
            if (!normalized) return null

            const parsed = Number(normalized)
            return Number.isFinite(parsed) ? parsed : null
        }

        return null
    }

    function parsePriceManwon(value) {
        const parsed = parseNumberLike(value)
        if (parsed === null) return 0
        return Math.round(parsed)
    }

    function resolveAptPriceManwon(apt) {
        if (!apt) return 0
        const raw =
            apt.dealAmount ??
            apt.recentPrice ??
            apt.price ??
            apt.latestDeal?.dealAmount ??
            apt.latestDeal?.dealAmountNum
        return parsePriceManwon(raw)
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
        const price = parsePriceManwon(
            latestDeal?.dealAmount ??
            latestDeal?.dealAmountNum ??
            info?.recentPrice ??
            info?.dealAmount ??
            info?.price ??
            0
        )
        const exclusiveArea =
            Number(latestDeal?.exclusiveArea ?? info?.area ?? info?.exclusiveArea) || 0
        const areaPyeong = exclusiveArea ? Math.round(exclusiveArea * 0.3025) : 0
        const coordinates = buildCoordinates(info || apt)
        const rooms = info?.rooms ?? info?.roomCnt
        const bathrooms = info?.bathrooms ?? info?.bathCnt

        const property = new Property({
            id: info?.aptSeq,
            title: info?.aptNm || '아파트',
            propertyType: '아파트',
            transactionType: '매매',
            price,
            area: areaPyeong,
            sqm: exclusiveArea,
            rooms: rooms > 0 ? rooms : null,
            bathrooms: bathrooms > 0 ? bathrooms : null,
            floor: cleanFloor(latestDeal?.floor || info?.floor),
            buildYear: info?.buildYear,
            sido: info?.sido || info?.sidoName || '',
            sigungu: info?.sigungu || info?.umdNm || '',
            address: info?.jibun || `${info?.umdNm || ''} ${info?.roadNm || ''}`.trim(),
            coordinates,
            images: apt.images?.length
                ? apt.images
                : [{ url: getRandomApartmentImage(info?.aptSeq), alt: info?.aptNm || '아파트' }],
            features: buildFeatures(info || apt, areaPyeong),
            description: apt.description || '',
            agentInfo:
                apt.agentInfo &&
                    typeof apt.agentInfo === 'object' &&
                    Object.keys(apt.agentInfo).length > 0
                    ? apt.agentInfo
                    : null,
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
     * 관심 아파트 목록 조회 (백엔드 연동)
     */
    async function fetchFavorites() {
        if (!authStore.isAuthenticated) return

        try {
            const response = await propertyService.getFavorites()
            favorites.value = response  // [{id, aptSeq, ...}]
        } catch (err) {
            console.error('Failed to fetch favorites:', err)
        }
    }

    // 하위 호환성을 위한 별칭
    const fetchSavedPropertyIds = fetchFavorites

    /**
     * 저장된 매물 목록 조회
     * JWT 토큰으로 사용자 식별 (userId 불필요)
     * @deprecated 구 API(/users/saved-properties) 사용 - fetchFavorites()로 대체 권장
     */
    async function fetchSavedProperties() {
        if (!authStore.isAuthenticated) return

        await fetchFavorites()
    }

    /**
     * 관심 아파트 토글 (추가/삭제)
     * @param {string} aptSeq - 아파트 고유 ID
     * @returns {Promise<boolean>} 저장 여부 (true: 저장됨, false: 저장 해제됨)
     */
    async function toggleFavorite(aptSeq) {
        if (!authStore.isAuthenticated) {
            error.value = '로그인이 필요합니다.'
            return
        }

        const existing = favorites.value.find(f => f.aptSeq === aptSeq)

        try {
            if (existing) {
                // 삭제 (favoriteId 사용)
                await propertyService.deleteFavorite(existing.id)
                favorites.value = favorites.value.filter(f => f.id !== existing.id)
                return false  // 저장 해제됨
            } else {
                // 추가
                const newFav = await propertyService.addFavorite(aptSeq)
                favorites.value.push(newFav)
                return true  // 저장됨
            }
        } catch (err) {
            error.value = err.message || '관심 아파트 저장에 실패했습니다.'
            console.error('Failed to toggle favorite:', err)
            throw err
        }
    }

    // 하위 호환성을 위한 별칭
    const toggleSaveProperty = toggleFavorite

    /**
     * 관심 아파트 필터 토글
     */
    function toggleFavoritesFilter() {
        filters.value.favoritesOnly = !filters.value.favoritesOnly
    }

    /**
     * 특정 아파트가 관심 목록에 있는지 확인
     * @param {string} aptSeq
     * @returns {boolean}
     */
    function isFavorite(aptSeq) {
        return favoriteAptSeqs.value.includes(aptSeq)
    }

    // 로그인 상태 변화에 맞춰 관심 아파트 목록을 동기화
    watch(
        () => authStore.isAuthenticated,
        async (isAuthed) => {
            if (isAuthed) {
                await fetchFavorites()
            } else {
                favorites.value = []
            }
        },
        { immediate: true }
    )

    watch(
        userPreferredAreas,
        () => {
            const applied = applyPreferredRegionIfEmpty()
            if (applied && !loading.value) {
                fetchProperties({ page: 1 })
            }
        },
        { immediate: true }
    )

    /**
     * 필터 업데이트
     * @param {Object} newFilters - 새로운 필터
     */
    function updateFilters(newFilters) {
        function normalizeNullableNumber(value) {
            if (value === null || value === undefined || value === '') return null
            const parsed = Number(value)
            return Number.isFinite(parsed) ? parsed : null
        }

        const normalized = { ...newFilters }
        if (normalized.sigungu === '') normalized.sigungu = null
        if (normalized.keyword === null || normalized.keyword === undefined) normalized.keyword = ''

        for (const key of ['priceMin', 'priceMax', 'areaMin', 'areaMax', 'rooms', 'bathrooms']) {
            if (Object.prototype.hasOwnProperty.call(normalized, key)) {
                normalized[key] = normalizeNullableNumber(normalized[key])
            }
        }

        for (const key of ['propertyType', 'transactionType']) {
            if (normalized[key] === '') normalized[key] = null
        }

        if (Object.prototype.hasOwnProperty.call(normalized, 'favoritesOnly')) {
            normalized.favoritesOnly = Boolean(normalized.favoritesOnly)
        }

        filters.value = { ...filters.value, ...normalized }
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
            keyword: '',
            favoritesOnly: false
        }
        preferredRegionApplied.value = false
        applyPreferredRegionIfEmpty()
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
        favorites,
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
        favoriteAptSeqs,
        // Actions
        fetchProperties,
        selectProperty,
        clearSelection,
        fetchFavorites,
        fetchSavedPropertyIds,
        fetchSavedProperties,
        toggleFavorite,
        toggleSaveProperty,
        toggleFavoritesFilter,
        isFavorite,
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
