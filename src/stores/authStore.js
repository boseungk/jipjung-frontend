/**
 * Authentication Store
 * 
 * 사용자 인증 상태 관리를 담당하는 Pinia 스토어.
 * - 로그인/로그아웃 상태 관리
 * - JWT 토큰 관리 (localStorage 동기화)
 * - 사용자 정보 관리
 * - 대시보드 데이터 로드
 * 
 * @module stores/authStore
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/services/authService'
import { dashboardService } from '@/api/services/dashboardService'
import { DEFAULT_DREAM_HOME, DEFAULT_GAMIFICATION } from '@/constants/user'

/**
 * localStorage 키 상수
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken'
}

export const useAuthStore = defineStore('auth', () => {
    // ============================================
    // State
    // ============================================

    /** @type {import('vue').Ref<Object|null>} 현재 사용자 정보 */
    const user = ref(null)

    /** @type {import('vue').Ref<string|null>} JWT 액세스 토큰 */
    const accessToken = ref(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null)

    /** @type {import('vue').Ref<string|null>} JWT 리프레시 토큰 */
    const refreshTokenValue = ref(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null)

    /** @type {import('vue').Ref<boolean>} 대시보드 데이터 로딩 상태 */
    const isDashboardLoading = ref(false)

    // ============================================
    // Getters (Computed)
    // ============================================

    /** 인증 여부 */
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

    /** 온보딩 완료 여부 */
    const onboardingCompleted = computed(() => user.value?.onboardingCompleted || false)

    /** 사용자 이름 */
    const userName = computed(() => user.value?.name || '사용자')

    /** 사용자 ID */
    const userId = computed(() => user.value?.id ?? null)

    /** 연소득 */
    const userAnnualIncome = computed(() => Number(user.value?.annualIncome) || 0)

    /** 월 대출 상환액 */
    const userExistingLoanMonthly = computed(() => Number(user.value?.existingLoanMonthly) || 0)

    /** 출생년도 */
    const userBirthYear = computed(() => user.value?.birthYear ?? null)

    /** 선호 지역 */
    const userPreferredAreas = computed(() => user.value?.preferredAreas || [])

    /** 드림홈 정보 (기본값 포함) */
    const userDreamHome = computed(() => user.value?.dreamHome || DEFAULT_DREAM_HOME)

    /** 게임화 정보 (기본값 포함) */
    const userGamification = computed(() => user.value?.gamification || DEFAULT_GAMIFICATION)

    // ============================================
    // Private Helpers
    // ============================================

    /**
     * 토큰을 상태와 localStorage에 저장
     * @param {string} access - 액세스 토큰
     * @param {string} refresh - 리프레시 토큰
     */
    function persistTokens(access, refresh) {
        accessToken.value = access
        refreshTokenValue.value = refresh
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
    }

    /**
     * 토큰 및 사용자 상태 초기화
     */
    function clearAuth() {
        user.value = null
        accessToken.value = null
        refreshTokenValue.value = null
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    }

    // ============================================
    // Actions
    // ============================================

    /**
     * 회원가입
     * 
     * @param {Object} userData - 회원가입 정보
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.name - 이름
     * @returns {Promise<Object>} 응답 데이터
     * @throws {ApiError} API 오류
     */
    async function register(userData) {
        const data = await authService.register(userData)

        persistTokens(data.accessToken, data.refreshToken)
        user.value = data.user

        return data
    }

    /**
     * 로그인
     * 
     * 백엔드는 토큰을 Authorization 헤더로 반환하고,
     * body에는 nickname만 포함됩니다.
     * 
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호
     * @returns {Promise<Object>} 응답 데이터
     * @throws {ApiError} API 오류
     */
    async function login(email, password) {
        const data = await authService.login(email, password)

        // 토큰 저장 (refreshToken은 현재 백엔드에서 미지원)
        if (data.accessToken) {
            accessToken.value = data.accessToken
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken)
        }

        // 사용자 정보 설정 (현재는 nickname만 있음)
        user.value = {
            nickname: data.nickname,
            email: email  // 로그인 시 입력한 이메일 저장
        }

        return data
    }

    /**
     * 로그아웃
     * 
     * API 호출 실패해도 로컬 상태는 반드시 초기화
     */
    async function logout() {
        try {
            if (accessToken.value) {
                await authService.logout()
            }
        } catch (error) {
            console.error('Logout API call failed:', error)
        } finally {
            clearAuth()
        }
    }

    /**
     * 토큰 갱신
     * 
     * @returns {Promise<Object>} 새로운 토큰 정보
     * @throws {ApiError} 갱신 실패 시 로그아웃 처리됨
     */
    async function refreshToken() {
        try {
            const data = await authService.refreshToken(refreshTokenValue.value)

            accessToken.value = data.accessToken
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken)

            return data
        } catch (error) {
            console.error('Token refresh failed:', error)
            clearAuth()
            throw error
        }
    }

    /**
     * 온보딩 완료
     * 
     * @param {Object} onboardingData - 온보딩 데이터
     * @returns {Promise<Object>} 업데이트된 사용자 정보
     */
    async function completeOnboarding(onboardingData) {
        const response = await authService.completeOnboarding(onboardingData)

        // 백엔드 응답 구조: { code, status, message, data: { user, dsrResult } }
        const userData = response.data?.user || response.user

        if (userData) {
            // 기존 사용자 정보와 병합
            user.value = { ...user.value, ...userData }
        }

        return response
    }

    /**
     * 프로필 수정
     * 
     * @param {Object} profileData - 프로필 데이터
     * @returns {Promise<Object>} 업데이트된 사용자 정보
     */
    async function updateProfile(profileData) {
        const data = await authService.updateProfile(profileData)

        // 기존 사용자 정보와 병합
        user.value = { ...user.value, ...data.user }

        return data
    }

    /**
     * 인증 상태 확인 (앱 시작 시 호출)
     * 
     * localStorage에 토큰이 있으면 사용자 정보를 조회하여
     * 세션 유효성을 확인합니다.
     */
    async function checkAuth() {
        if (!accessToken.value) {
            return
        }

        try {
            const userData = await authService.getCurrentUser()
            user.value = userData
        } catch (error) {
            console.error('Auth check failed:', error)
            clearAuth()
        }
    }

    /**
     * 대시보드 데이터 로드
     * 
     * 대시보드 진입 시 호출하여 통합 데이터를 가져옵니다.
     * 사용자, 드림홈, 게임화, DSR 정보를 한 번에 업데이트합니다.
     * 
     * @returns {Promise<Object>} 대시보드 데이터
     */
    async function loadDashboard() {
        if (isDashboardLoading.value) {
            return
        }

        isDashboardLoading.value = true

        try {
            const dashboard = await dashboardService.getDashboard()

            // 사용자 정보 업데이트 (드림홈, 게임화 정보 포함)
            user.value = {
                ...user.value,
                ...dashboard.user,
                dreamHome: dashboard.dreamHome,
                gamification: dashboard.gamification
            }

            return dashboard
        } finally {
            isDashboardLoading.value = false
        }
    }

    /**
     * 사용자 정보 부분 업데이트
     * 
     * 다른 스토어에서 사용자 정보를 업데이트할 때 사용
     * (예: dreamHomeStore에서 currentAmount 업데이트)
     * 
     * @param {Object} updates - 업데이트할 필드들
     */
    function updateUserData(updates) {
        if (!user.value) return

        user.value = { ...user.value, ...updates }
    }

    // ============================================
    // Return
    // ============================================
    return {
        // State
        user,
        accessToken,
        refreshTokenValue,
        isDashboardLoading,

        // Getters
        isAuthenticated,
        onboardingCompleted,
        userName,
        userId,
        userAnnualIncome,
        userExistingLoanMonthly,
        userBirthYear,
        userPreferredAreas,
        userDreamHome,
        userGamification,

        // Actions
        register,
        login,
        logout,
        refreshToken,
        completeOnboarding,
        updateProfile,
        checkAuth,
        loadDashboard,
        updateUserData
    }
})
