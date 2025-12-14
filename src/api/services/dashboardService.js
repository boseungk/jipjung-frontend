/**
 * Dashboard Service
 * 
 * 대시보드 통합 데이터 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/dashboardService
 */

import apiClient from '@/api/client'
import { USER_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} DashboardUser
 * @property {number} id - 사용자 ID
 * @property {string} name - 사용자 이름
 * @property {string} email - 이메일
 * @property {number} birthYear - 출생년도
 * @property {number} annualIncome - 연소득
 * @property {number} existingLoanMonthly - 월 대출 상환액
 */

/**
 * @typedef {Object} DashboardDreamHome
 * @property {string|null} dreamHomeId - 매물 ID
 * @property {string} propertyName - 매물명
 * @property {string} location - 위치
 * @property {number} price - 가격
 * @property {number} targetAmount - 목표 금액
 * @property {number} currentAmount - 현재 금액
 * @property {number} monthlyGoal - 월 목표 저축액
 * @property {string} targetDate - 목표 날짜
 * @property {number} achievementRate - 달성률 (%)
 * @property {number} daysRemaining - 남은 일수
 */

/**
 * @typedef {Object} DashboardGamification
 * @property {number} currentLevel - 현재 레벨
 * @property {string} levelTitle - 레벨 칭호
 * @property {number} experiencePoints - 현재 경험치
 * @property {number} nextLevelExp - 다음 레벨 필요 경험치
 * @property {number} expProgress - 경험치 진행률 (%)
 * @property {number} currentStreak - 현재 연속 활동 일수
 * @property {number} longestStreak - 최장 연속 활동 일수
 * @property {number} treesCollected - 수집한 나무 수
 */

/**
 * @typedef {Object} DashboardDsr
 * @property {number} dsrRatio - DSR 비율 (%)
 * @property {Object} dsrStatus - DSR 상태 정보
 * @property {string} dsrStatus.label - 상태 라벨 (안전/주의/위험)
 * @property {string} dsrStatus.class - CSS 클래스명
 * @property {string} dsrStatus.color - 상태 색상
 * @property {number} monthlyIncome - 월 소득
 * @property {number} monthlyRepaymentCapacity - 월 상환 가능액
 * @property {number} maxLoanAmount - 최대 대출 가능액
 * @property {number} requiredEquity - 필요 자기자본
 */

/**
 * @typedef {Object} DashboardResponse
 * @property {DashboardUser} user - 사용자 기본 정보
 * @property {DashboardDreamHome} dreamHome - 드림홈 정보
 * @property {DashboardGamification} gamification - 게임화 정보
 * @property {DashboardDsr} dsr - DSR 정보
 */

/**
 * Dashboard Service
 * 
 * @description
 * **반환값 규칙**: 이 서비스는 `response.data` (ApiResponse 전체)를 반환합니다.
 * 호출자(authStore)가 `data.showroom`, `data.profile` 등의 내부 필드를 추출해야 합니다.
 * 
 * 일부 다른 서비스(예: themeService)는 내부 데이터를 바로 반환하므로,
 * 서비스별 반환 형태가 다를 수 있습니다. 신규 서비스 작성 시 이 규칙을 참고하세요.
 */
export const dashboardService = {
    /**
     * 대시보드 통합 데이터 조회
     * 
     * 사용자의 대시보드에 필요한 모든 데이터를 한 번에 조회합니다.
     * - 사용자 기본 정보
     * - 드림홈 목표 및 진행 상황
     * - 게임화 상태 (레벨, 경험치, 스트릭)
     * - DSR 분석 결과
     * 
     * @returns {Promise<DashboardResponse>} 대시보드 통합 데이터
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * const dashboard = await dashboardService.getDashboard()
     * console.log(dashboard.dreamHome.achievementRate) // 20.8
     */
    async getDashboard() {
        const response = await apiClient.get(USER_ENDPOINTS.DASHBOARD)
        return response.data
    }
}
