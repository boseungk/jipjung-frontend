/**
 * 지출 카테고리 상수
 * 
 * 백엔드 SpendingCategory enum과 동기화 유지 필요
 * 
 * @module constants/spendingCategories
 */

/**
 * 지출 카테고리 목록
 * @type {Array<{value: string, label: string, emoji: string}>}
 */
export const SPENDING_CATEGORIES = Object.freeze([
    { value: 'FOOD', label: '식비', emoji: '🍽️' },
    { value: 'TRANSPORT', label: '교통비', emoji: '🚌' },
    { value: 'SHOPPING', label: '쇼핑', emoji: '🛍️' },
    { value: 'ENTERTAINMENT', label: '여가/문화', emoji: '🎬' },
    { value: 'LIVING', label: '생활비', emoji: '🏠' },
    { value: 'ETC', label: '기타', emoji: '📦' }
])

/**
 * 카테고리 value로 label 조회
 * 
 * @param {string} value - 카테고리 value (예: 'FOOD')
 * @returns {string} 카테고리 label (예: '식비') 또는 원본 value
 * 
 * @example
 * getCategoryLabel('FOOD') // '식비'
 * getCategoryLabel('UNKNOWN') // 'UNKNOWN'
 */
export const getCategoryLabel = (value) => {
    const category = SPENDING_CATEGORIES.find(c => c.value === value)
    return category?.label ?? value
}

/**
 * 카테고리 value로 emoji 조회
 * 
 * @param {string} value - 카테고리 value
 * @returns {string} 카테고리 emoji 또는 기본값 '📦'
 * 
 * @example
 * getCategoryEmoji('FOOD') // '🍽️'
 * getCategoryEmoji('UNKNOWN') // '📦'
 */
export const getCategoryEmoji = (value) => {
    const category = SPENDING_CATEGORIES.find(c => c.value === value)
    return category?.emoji ?? '📦'
}

/**
 * 카테고리 value로 전체 정보 조회
 * 
 * @param {string} value - 카테고리 value
 * @returns {{value: string, label: string, emoji: string} | null}
 */
export const getCategory = (value) => {
    return SPENDING_CATEGORIES.find(c => c.value === value) ?? null
}
