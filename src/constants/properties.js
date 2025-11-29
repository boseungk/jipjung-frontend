/**
 * Property Constants
 *
 * 매물 관련 상수 정의
 * 매물 타입, 거래 유형, 가격 범위, 면적 범위 등
 */

/**
 * 매물 타입
 */
export const PROPERTY_TYPES = ['아파트', '빌라', '오피스텔', '주택']

/**
 * 거래 유형
 */
export const TRANSACTION_TYPES = ['매매', '전세', '월세']

/**
 * 가격 범위 (만원 단위)
 */
export const PRICE_RANGES = [
    { label: '3억 이하', min: 0, max: 30000 },
    { label: '3억 - 5억', min: 30000, max: 50000 },
    { label: '5억 - 7억', min: 50000, max: 70000 },
    { label: '7억 - 10억', min: 70000, max: 100000 },
    { label: '10억 이상', min: 100000, max: Infinity }
]

/**
 * 면적 범위 (평수)
 */
export const AREA_RANGES = [
    { label: '20평 이하', min: 0, max: 20 },
    { label: '20평 - 30평', min: 20, max: 30 },
    { label: '30평 - 40평', min: 30, max: 40 },
    { label: '40평 이상', min: 40, max: Infinity }
]

/**
 * 방 개수 옵션
 */
export const ROOM_OPTIONS = [1, 2, 3, 4, 5]

/**
 * 욕실 개수 옵션
 */
export const BATHROOM_OPTIONS = [1, 2, 3]

/**
 * 서울 중심 좌표 (시청)
 */
export const SEOUL_CENTER = {
    lat: 37.5665,
    lng: 126.9780
}

/**
 * 지도 줌 레벨
 */
export const MAP_ZOOM_LEVELS = {
    CITY: 8, // 도시 전체
    DISTRICT: 6, // 구 단위
    DETAIL: 4 // 상세 (단일 매물)
}

/**
 * 매물 타입별 마커 이모지
 */
export const MARKER_EMOJIS = {
    '아파트': '🏢',
    '빌라': '🏘️',
    '오피스텔': '🏙️',
    '주택': '🏠'
}

/**
 * 매물 특징 옵션
 */
export const PROPERTY_FEATURES = [
    '주차 가능',
    '역세권',
    '남향',
    '리모델링',
    '엘리베이터',
    '베란다',
    '풀옵션',
    '반려동물 가능',
    '단기임대 가능',
    '즉시입주 가능'
]

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = [
    { label: '최신순', value: 'createdAt', order: 'desc' },
    { label: '낮은 가격순', value: 'price', order: 'asc' },
    { label: '높은 가격순', value: 'price', order: 'desc' },
    { label: '넓은 면적순', value: 'area', order: 'desc' }
]

/**
 * 서울 주요 구별 좌표 (강남권 중심)
 */
export const SEOUL_DISTRICT_COORDINATES = {
    '강남구': { lat: 37.5172, lng: 127.0473 },
    '서초구': { lat: 37.4837, lng: 127.0324 },
    '송파구': { lat: 37.5145, lng: 127.1059 },
    '강동구': { lat: 37.5301, lng: 127.1238 },
    '강서구': { lat: 37.5509, lng: 126.8495 },
    '양천구': { lat: 37.5170, lng: 126.8664 },
    '영등포구': { lat: 37.5264, lng: 126.8962 },
    '구로구': { lat: 37.4954, lng: 126.8874 },
    '금천구': { lat: 37.4519, lng: 126.9018 },
    '관악구': { lat: 37.4781, lng: 126.9515 },
    '동작구': { lat: 37.5124, lng: 126.9393 },
    '용산구': { lat: 37.5384, lng: 126.9654 },
    '마포구': { lat: 37.5663, lng: 126.9019 },
    '서대문구': { lat: 37.5791, lng: 126.9368 },
    '은평구': { lat: 37.6027, lng: 126.9291 },
    '종로구': { lat: 37.5735, lng: 126.9788 },
    '중구': { lat: 37.5641, lng: 126.9979 },
    '성동구': { lat: 37.5634, lng: 127.0368 },
    '광진구': { lat: 37.5384, lng: 127.0822 },
    '동대문구': { lat: 37.5744, lng: 127.0396 },
    '중랑구': { lat: 37.6063, lng: 127.0925 },
    '성북구': { lat: 37.5894, lng: 127.0167 },
    '강북구': { lat: 37.6397, lng: 127.0256 },
    '도봉구': { lat: 37.6688, lng: 127.0471 },
    '노원구': { lat: 37.6542, lng: 127.0568 }
}

/**
 * 가격대별 색상 (지도 마커용)
 */
export const PRICE_COLORS = {
    LOW: '#66BB6A', // 3억 이하 - 초록
    MEDIUM: '#42A5F5', // 3-7억 - 파랑
    HIGH: '#FFA726', // 7-10억 - 주황
    PREMIUM: '#EF5350' // 10억 이상 - 빨강
}

/**
 * 가격에 따른 색상 반환
 * @param {number} price - 가격 (만원 단위)
 * @returns {string} 색상 코드
 */
export function getPriceColor(price) {
    if (price <= 30000) return PRICE_COLORS.LOW
    if (price <= 70000) return PRICE_COLORS.MEDIUM
    if (price <= 100000) return PRICE_COLORS.HIGH
    return PRICE_COLORS.PREMIUM
}

/**
 * 평수를 제곱미터로 변환
 * @param {number} pyeong - 평수
 * @returns {number} 제곱미터
 */
export function pyeongToSqm(pyeong) {
    return Math.round(pyeong * 3.3058)
}

/**
 * 제곱미터를 평수로 변환
 * @param {number} sqm - 제곱미터
 * @returns {number} 평수
 */
export function sqmToPyeong(sqm) {
    return Math.round((sqm / 3.3058) * 10) / 10
}
