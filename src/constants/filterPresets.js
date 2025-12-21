/**
 * Property Filter 관련 상수
 * 
 * 필터 프리셋, 라벨, 옵션 등을 중앙 관리합니다.
 * 변경 시 이 파일만 수정하면 됩니다.
 */

/**
 * 가격 프리셋 (단위: 만원)
 * @property {string} label - 사용자에게 표시될 라벨
 * @property {number|null} min - 최소 가격 (null = 제한 없음)
 * @property {number|null} max - 최대 가격 (null = 제한 없음)
 */
export const PRICE_PRESETS = [
    { label: '1억 이하', min: null, max: 10000 },
    { label: '1~3억', min: 10000, max: 30000 },
    { label: '3~5억', min: 30000, max: 50000 },
    { label: '5~10억', min: 50000, max: 100000 },
    { label: '10억 이상', min: 100000, max: null }
]

/**
 * 면적 프리셋 (단위: 평)
 */
export const AREA_PRESETS = [
    { label: '10평대', min: 10, max: 19 },
    { label: '20평대', min: 20, max: 29 },
    { label: '30평대', min: 30, max: 39 },
    { label: '40평 이상', min: 40, max: null }
]

/**
 * Range Slider 설정값
 */
export const SLIDER_CONFIG = {
    price: {
        min: 0,
        max: 200000,  // 20억
        step: 1000    // 1천만원 단위
    },
    area: {
        min: 0,
        max: 100,     // 100평
        step: 1
    }
}

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = [
    { value: 'createdAt', label: '최신순' },
    { value: 'price', label: '가격순' },
    { value: 'area', label: '면적순' }
]

export const SORT_ORDER_OPTIONS = [
    { value: 'desc', label: '내림차순' },
    { value: 'asc', label: '오름차순' }
]

/**
 * 가격 포맷팅 (만원 → "X억 Y천만원" 형식)
 * @param {number} priceInManwon - 만원 단위 가격
 * @returns {string} 포맷된 가격 문자열
 */
export function formatPriceLabel(priceInManwon) {
    if (priceInManwon === null || priceInManwon === undefined) return '무제한'
    if (priceInManwon === 0) return '0원'

    const eok = Math.floor(priceInManwon / 10000)
    const remainder = priceInManwon % 10000
    const chun = Math.floor(remainder / 1000)

    if (eok > 0 && chun > 0) {
        return `${eok}억 ${chun}천`
    } else if (eok > 0) {
        return `${eok}억`
    } else if (chun > 0) {
        return `${chun}천만`
    }
    return `${priceInManwon}만`
}

/**
 * 면적 포맷팅
 * @param {number} areaPyeong - 평 단위 면적
 * @returns {string} 포맷된 면적 문자열
 */
export function formatAreaLabel(areaPyeong) {
    if (areaPyeong === null || areaPyeong === undefined) return '무제한'
    return `${areaPyeong}평`
}
