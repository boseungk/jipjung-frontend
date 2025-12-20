/**
 * EXP 관련 상수
 * 
 * 백엔드 정책과 동기화 필요:
 * - DreamHomeService.java: EXP_PER_UNIT, MAX_EXP_PER_SAVINGS
 * - AiManagerService.java: EXP_REASONABLE, EXP_WASTE
 * 
 * @see jipjung-backend/src/main/java/com/jipjung/project/service/DreamHomeService.java
 * @see jipjung-backend/src/main/java/com/jipjung/project/service/AiManagerService.java
 */

/**
 * 저축 관련 EXP 정책
 */
export const SAVINGS_EXP = {
    /** 저축 시 EXP 계산 단위 (원) */
    UNIT_AMOUNT: 10_000,

    /** 단위당 EXP */
    EXP_PER_UNIT: 1,

    /** 1회 저축 시 최대 EXP */
    MAX_PER_SAVINGS: 500
}

/**
 * AI 판결 관련 EXP 정책
 * 
 * @note 백엔드 AiManagerService.java와 동기화 필요
 */
export const JUDGMENT_EXP = {
    /** 합리적 소비 판결 시 EXP */
    REASONABLE: 20,

    /** 낭비 판결 시 EXP (음수) */
    WASTE: -10
}

/**
 * 저축 금액으로 예상 EXP 계산
 * 
 * @param {number} amount - 저축 금액 (원)
 * @returns {number} 예상 EXP (0 ~ MAX_PER_SAVINGS)
 */
export function calculateEstimatedExp(amount) {
    if (!amount || amount <= 0) return 0
    const exp = Math.floor(amount / SAVINGS_EXP.UNIT_AMOUNT) * SAVINGS_EXP.EXP_PER_UNIT
    return Math.min(exp, SAVINGS_EXP.MAX_PER_SAVINGS)
}
