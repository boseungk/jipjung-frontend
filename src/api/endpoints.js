/**
 * API 엔드포인트 상수
 * 
 * 모든 API 경로를 한 곳에서 관리하여 유지보수성 향상
 * REST_API.md 명세와 일치하도록 관리
 */

/**
 * 인증 관련 엔드포인트
 */
export const AUTH_ENDPOINTS = {
    REGISTER: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
}

/**
 * 사용자 관련 엔드포인트
 */
export const USER_ENDPOINTS = {
    ONBOARDING: '/users/onboarding',
    PROFILE: '/users/profile',
    DASHBOARD: '/users/dashboard',
    DREAM_HOME: '/users/dream-home',
    DREAM_HOME_PROGRESS: '/users/dream-home/progress',
    SAVED_PROPERTIES: '/users/saved-properties',
    SAVED_PROPERTY_IDS: '/users/saved-properties/ids',
    COLLECTIONS: '/users/collections'
}

/**
 * 게임화 관련 엔드포인트
 */
export const GAMIFICATION_ENDPOINTS = {
    EXPERIENCE: '/users/gamification/experience',
    STREAK: '/users/gamification/streak'
}

/**
 * 매물(아파트) 관련 엔드포인트
 */
export const PROPERTY_ENDPOINTS = {
    LIST: '/apartments',
    DETAIL: (id) => `/apartments/${id}`
}

/**
 * 영수증 관련 엔드포인트
 */
export const RECEIPT_ENDPOINTS = {
    LIST: '/receipts',
    PROCESS: (id) => `/receipts/${id}/process`
}

/**
 * 통계 관련 엔드포인트
 */
export const STATISTICS_ENDPOINTS = {
    MONTHLY_SPENDING: '/users/statistics/monthly-spending',
    PROFILE: '/users/statistics/profile'
}

/**
 * 저장된 매물 관련 엔드포인트 (동적 경로)
 */
export const savedPropertyEndpoints = {
    toggle: (propertyId) => `/users/saved-properties/${propertyId}/toggle`,
    delete: (propertyId) => `/users/saved-properties/${propertyId}`
}

/**
 * DSR 시뮬레이션 관련 엔드포인트
 */
export const DSR_ENDPOINTS = {
    SIMULATION: '/simulation/dsr'
}
