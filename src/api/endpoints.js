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
    DELETE_ACCOUNT: '/users/account',
    DREAM_HOME: '/users/dream-home',
    DREAM_HOME_PROGRESS: '/users/dream-home/progress',
    FURNITURE_PROGRESS: '/users/furniture-progress',
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
 * 드림홈(저축 목표) 관련 엔드포인트
 * 
 * @description 백엔드 /api/dream-home/* 엔드포인트
 */
export const DREAM_HOME_ENDPOINTS = {
    /** 드림홈 설정 (POST) */
    SET: '/dream-home',
    /** 저축 기록 (POST) */
    SAVINGS: '/dream-home/savings'
}

/**
 * 매물(아파트) 관련 엔드포인트
 */
export const PROPERTY_ENDPOINTS = {
    LIST: '/apartments',
    DETAIL: (id) => `/apartments/${id}`,
    REGION_COORDINATES: (regionName) => `/apartments/regions/${encodeURIComponent(regionName)}/coordinates`,
    /** 관심 아파트 목록 (GET/POST) */
    FAVORITES: '/apartments/favorites',
    /** 관심 아파트 삭제 (DELETE) */
    FAVORITE_DELETE: (id) => `/apartments/favorites/${id}`
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

/**
 * AI 관리인(레제) 관련 엔드포인트
 * 
 * @description 백엔드 /api/ai-manager/* 엔드포인트
 * @see AI_MANAGER_FRONTEND_IMPLEMENTATION_PLAN.md 섹션 4
 */
export const AI_MANAGER_ENDPOINTS = {
    /** 지출 분석 (MANUAL/IMAGE 모드) */
    ANALYZE: '/ai-manager/analyze',
    /** 이미지 추출 확인 */
    CONFIRM: '/ai-manager/confirm',
    /** 최종 판결 요청 */
    JUDGMENT: '/ai-manager/judgment',
    /** 분석 내역 조회 */
    HISTORY: '/ai-manager/history'
}

/**
 * 테마 관련 엔드포인트
 * 
 * @description 백엔드 /api/themes/* 엔드포인트
 */
export const THEME_ENDPOINTS = {
    /** 활성 테마 목록 조회 (GET) */
    LIST: '/themes'
}

/**
 * 컬렉션(완성된 집) 관련 엔드포인트
 * 
 * @description 백엔드 /api/collection/* 엔드포인트
 */
export const COLLECTION_ENDPOINTS = {
    /** 완성된 집 목록 조회 (GET) */
    LIST: '/collection',
    /** 저축 여정 상세 조회 (GET) */
    JOURNEY: (collectionId) => `/collection/${collectionId}/journey`,
    /** 진행 중인 드림홈 여정 조회 (GET) */
    IN_PROGRESS_JOURNEY: '/collection/in-progress/journey',
    /** 대표 컬렉션 설정 (PUT) */
    MAIN_DISPLAY: (collectionId) => `/collection/${collectionId}/main-display`
}
