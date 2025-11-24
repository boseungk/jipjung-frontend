/**
 * 숫자를 천 단위 구분자가 있는 문자열로 변환
 * @param {number|string} num - 변환할 숫자
 * @returns {string} 포맷된 문자열
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 만원 단위를 억/만원으로 변환
 * @param {number} amount - 만원 단위 금액
 * @returns {string} '1억 2,500만원' 형태
 * @example
 * formatKoreanCurrency(15000) // "1억 5,000만원"
 * formatKoreanCurrency(5000) // "5,000만원"
 * formatKoreanCurrency(10000) // "1억원"
 */
export const formatKoreanCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0만원'

    const eok = Math.floor(amount / 10000)
    const man = amount % 10000

    if (eok > 0 && man > 0) {
        return `${formatNumber(eok)}억 ${formatNumber(man)}만원`
    } else if (eok > 0) {
        return `${formatNumber(eok)}억원`
    }
    return `${formatNumber(man)}만원`
}

/**
 * 날짜 문자열을 한국어 형식으로 변환
 * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} YYYY년 MM월 DD일 형태
 * @example
 * formatKoreanDate('2026-12-31') // "2026년 12월 31일"
 */
export const formatKoreanDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
}
