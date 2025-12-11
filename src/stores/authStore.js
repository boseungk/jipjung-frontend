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
    REFRESH_TOKEN: 'refreshToken',
    ONBOARDING_COMPLETED: 'onboardingCompleted'
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
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
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

        // onboardingCompleted 상태 localStorage에 저장
        const isOnboardingCompleted = data.onboardingCompleted ?? false
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(isOnboardingCompleted))

        // 사용자 정보 설정 (onboardingCompleted 포함)
        user.value = {
            ...data.user,
            nickname: data.nickname,
            email: email,
            onboardingCompleted: isOnboardingCompleted
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
     * 회원탈퇴
     * 
     * @param {string} password - 현재 비밀번호
     * @throws {ApiError} API 오류 시 throw (호출자에서 처리)
     */
    async function deleteAccount(password) {
        await authService.deleteAccount(password)
        clearAuth()
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
            const preferredAreas = normalizePreferredAreas(
                userData.preferredAreas,
                onboardingData?.preferredAreas
            )
            user.value = { ...user.value, ...userData, onboardingCompleted: true, preferredAreas }
            // localStorage에도 저장
            localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true')
        }

        return response
    }

    /**
     * 선호 지역 배열을 문자열 배열로 정규화
     * @param {Array} areas - 서버/클라이언트에서 받은 선호 지역 배열
     * @param {Array} fallback - 대체 배열 (undefined일 때 사용)
     * @returns {string[]} "시/도 시군구" 형태 문자열 배열
     */
    function normalizePreferredAreas(areas, fallback = []) {
        const source = Array.isArray(areas) ? areas : Array.isArray(fallback) ? fallback : []
        return source
            .map((area) => {
                if (!area) return null
                if (typeof area === 'string') return area.trim()
                if (area.sido && area.sigungu) return `${area.sido} ${area.sigungu}`.trim()
                return null
            })
            .filter(Boolean)
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
     * 
     * 대시보드 API 실패 시에도 토큰이 유효하면 기본 user 정보를 설정합니다.
     */
    async function checkAuth() {
        if (!accessToken.value) {
            return
        }

        // 토큰이 있으면 일단 기본 user 정보 설정 (isAuthenticated가 true가 되도록)
        // localStorage에서 onboardingCompleted 복원
        if (!user.value) {
            const storedOnboardingCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
            user.value = {
                onboardingCompleted: storedOnboardingCompleted === 'true'
            }
        }

        try {
            // 대시보드 API로 사용자 정보 조회 시도
            await loadDashboard()
        } catch (error) {
            console.error('Auth check failed:', error)
            // 401/403 에러인 경우만 로그아웃 처리
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                clearAuth()
            }
            // 다른 에러 (네트워크, 500, 온보딩 미완료 등)는 
            // 기본 user 정보 유지하여 인증 상태 유지
        }
    }

    /**
     * 대시보드 데이터 로드
     * 
     * 대시보드 진입 시 호출하여 통합 데이터를 가져옵니다.
     * 백엔드 응답을 프론트엔드 구조로 변환합니다.
     * 
     * @returns {Promise<Object>} 대시보드 데이터
     */
    async function loadDashboard() {
        if (isDashboardLoading.value) {
            return
        }

        isDashboardLoading.value = true

        try {
            const dashboardResponse = await dashboardService.getDashboard()

            // 백엔드 응답 구조: { code, status, message, data: { profile, goal, streak, dsr, assets, showroom, gapAnalysis } }
            const response = dashboardResponse.data || dashboardResponse

            // 사용자 정보 매핑 (profile -> user)
            const mappedUser = {
                nickname: response.profile?.nickname,
                name: response.profile?.nickname,  // 하위 호환성
                onboardingCompleted: true,
                preferredAreas: response.profile?.preferredAreas || []
            }

            // 드림홈 정보 매핑 (goal -> dreamHome)
            const mappedDreamHome = {
                propertyName: response.goal?.targetPropertyName || '목표를 설정해주세요',
                targetAmount: response.goal?.totalAmount || 0,
                currentAmount: response.goal?.savedAmount || 0,
                remainingAmount: response.goal?.remainingAmount || 0,
                achievementRate: response.goal?.achievementRate || 0,
                isCompleted: response.goal?.isCompleted || false
            }

            // 게임화 정보 매핑 (profile + streak -> gamification)
            const mappedGamification = {
                currentLevel: response.profile?.level || 1,
                levelTitle: response.profile?.title || '신입 건축가',
                experiencePoints: response.profile?.levelProgress?.currentExp || 0,
                nextLevelExp: response.profile?.levelProgress?.targetExp || 100,
                expProgress: response.profile?.levelProgress?.percent || 0,
                remainingExp: response.profile?.levelProgress?.remainingExp || 0,
                currentStreak: response.streak?.currentStreak || 0,
                longestStreak: response.streak?.maxStreak || 0,
                isTodayParticipated: response.streak?.isTodayParticipated || false,
                rewardAvailable: response.streak?.rewardAvailable || false,
                weeklyStatus: response.streak?.weeklyStatus || []
            }

            // 사용자 정보 업데이트
            user.value = {
                ...user.value,
                ...mappedUser,
                dreamHome: mappedDreamHome,
                gamification: mappedGamification,
                // 원본 백엔드 응답 보존 (컴포넌트에서 직접 접근 가능)
                _raw: {
                    profile: response.profile,
                    goal: response.goal,
                    streak: response.streak,
                    dsr: response.dsr,
                    assets: response.assets,
                    showroom: response.showroom,
                    gapAnalysis: response.gapAnalysis
                }
            }

            return response
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
        deleteAccount,
        refreshToken,
        completeOnboarding,
        updateProfile,
        checkAuth,
        loadDashboard,
        updateUserData
    }
})
