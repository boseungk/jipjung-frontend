/**
 * DSR Simulation Service
 * 
 * PRO 모드 DSR 시뮬레이션 API 호출을 담당하는 서비스 레이어.
 * 2026년 정책 기반 DSR 상세 시뮬레이션 제공.
 * 
 * @module api/services/dsrSimulationService
 */

import apiClient from '@/api/client'
import { DSR_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} DsrSimulationRequest
 * @property {number} annualIncome - 연소득 (원)
 * @property {string} region - 지역 (SEOUL_METRO | ETC)
 * @property {number} existingAnnualDebtService - 기존 연간 원리금 상환액 (원)
 * @property {number} [jeonseLoanBalance] - 전세대출 잔액 (원, 선택)
 * @property {number} [jeonseLoanRate] - 전세대출 금리 (%, 선택)
 * @property {boolean} [jeonseIncludedInDsr] - 전세대출 DSR 포함 여부
 * @property {string} targetLoanType - 대출 유형 (VARIABLE | MIXED | PERIODIC | FIXED)
 * @property {number} targetLoanRate - 예상 대출 금리 (%)
 * @property {number} maturityYears - 대출 만기 (년)
 * @property {string} [lenderType] - 금융기관 유형 (BANK | NON_BANK)
 */

/**
 * @typedef {Object} AppliedPolicy
 * @property {number} stressDsrRate - 적용된 스트레스 가산금리 (%)
 * @property {number} youthIncomeMultiplier - 장래소득 인정 배율
 */

/**
 * @typedef {Object} GameUpdate
 * @property {number} reducedGap - 줄어든 목표 저축액 (원)
 * @property {number} expGained - 획득 경험치
 */

/**
 * @typedef {Object} DsrSimulationResponse
 * @property {number} currentDsrPercent - 현재 DSR (%)
 * @property {number} dsrAfterMaxLoanPercent - 최대 한도 대출 시 DSR (%)
 * @property {string} userGrade - DSR 등급 (SAFE | WARNING | RESTRICTED)
 * @property {number} maxLoanAmount - 최대 대출 가능액 (원)
 * @property {AppliedPolicy} appliedPolicy - 적용된 정책 정보
 * @property {string} simulationTip - 시뮬레이션 팁
 * @property {GameUpdate} [gameUpdate] - 게임 갱신 정보 (목표 설정 시)
 */

export const dsrSimulationService = {
    /**
     * DSR PRO 시뮬레이션 실행
     * 
     * 2026년 정책 기반 상세 DSR 시뮬레이션을 수행합니다.
     * - 스트레스 금리: 수도권 3.0%p, 비수도권 0.75%p
     * - 청년 장래소득: 20-34세 구간별 인정
     * - 대출 유형별 스트레스 반영율
     * 
     * @param {DsrSimulationRequest} request - 시뮬레이션 요청 데이터
     * @returns {Promise<DsrSimulationResponse>} 시뮬레이션 결과
     * @throws {ApiError} 유효성 검증 실패(400), 인증 실패(401)
     * 
     * @example
     * const result = await dsrSimulationService.simulate({
     *   annualIncome: 60000000,
     *   region: 'SEOUL_METRO',
     *   existingAnnualDebtService: 3000000,
     *   targetLoanType: 'PERIODIC',
     *   targetLoanRate: 4.0,
     *   maturityYears: 40
     * })
     */
    async simulate(request) {
        const response = await apiClient.post(DSR_ENDPOINTS.SIMULATION, request)
        return response.data
    }
}
