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
 * 원 단위 금액을 천 단위 구분자와 함께 표시
 * @param {number} amount - 원 단위 금액
 * @returns {string} '150,000,000원' 형태
 * @example
 * formatWon(150000000) // "150,000,000원"
 * formatWon(50000) // "50,000원"
 */
export const formatWon = (amount) => {
    if (amount === null || amount === undefined) return '0원'
    return `${formatNumber(amount)}원`
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
 * [M-3] 원 단위를 읽기 쉬운 압축 형태로 변환 (대시보드 카드용)
 * @param {number} amount - 원 단위 금액
 * @returns {string} '1,500만원', '1억 5,000만원' 형태
 * @example
 * formatWonCompact(15000000) // "1,500만원"
 * formatWonCompact(150000000) // "1억 5,000만원"
 * formatWonCompact(100000000) // "1억원"
 * formatWonCompact(5000) // "5,000원"
 */
export const formatWonCompact = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '0원'

    // 억 단위
    if (amount >= 100000000) {
        const billions = Math.floor(amount / 100000000)
        const millions = Math.floor((amount % 100000000) / 10000)
        if (millions > 0) {
            return `${formatNumber(billions)}억 ${formatNumber(millions)}만원`
        }
        return `${formatNumber(billions)}억원`
    }

    // 만원 단위
    if (amount >= 10000) {
        return `${formatNumber(Math.floor(amount / 10000))}만원`
    }

    // 원 단위
    return `${formatNumber(amount)}원`
}

/**
 * [M-3] 단위 생략 버전 (차트 Y축 라벨 등에 사용)
 * @param {number} amount - 원 단위 금액
 * @returns {string} '1,500만', '1억' 형태 (단위 생략)
 * @example
 * formatManwon(15000000) // "1,500만"
 * formatManwon(150000000) // "1억 5,000만"
 * formatManwon(100000000) // "1억"
 */
export const formatManwon = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '0'

    // 억 단위
    if (amount >= 100000000) {
        const billions = Math.floor(amount / 100000000)
        const millions = Math.floor((amount % 100000000) / 10000)
        if (millions > 0) {
            return `${formatNumber(billions)}억 ${formatNumber(millions)}만`
        }
        return `${formatNumber(billions)}억`
    }

    // 만원 단위
    if (amount >= 10000) {
        return `${formatNumber(Math.floor(amount / 10000))}만`
    }

    // 원 단위
    return formatNumber(amount)
}

/**
 * 원 단위를 "₩ + 억/만" 형태로 표시 (DSR 시뮬레이션 등에서 사용)
 * @param {number} amount - 원 단위 금액
 * @returns {string} '₩1억 5,000만', '₩69만' 형태
 */
export const formatKrwManwon = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '₩0'

    const absValue = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''

    if (absValue >= 100000000) {
        const eok = Math.floor(absValue / 100000000)
        const remainingMan = Math.round((absValue % 100000000) / 10000)

        if (remainingMan === 0) {
            return `${sign}₩${formatNumber(eok)}억`
        }

        return `${sign}₩${formatNumber(eok)}억 ${formatNumber(remainingMan)}만`
    }

    const man = Math.round(absValue / 10000)
    return `${sign}₩${formatNumber(man)}만`
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
