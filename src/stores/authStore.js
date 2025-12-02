import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/services/authService'
import { DEFAULT_DREAM_HOME, DEFAULT_GAMIFICATION } from '@/constants/user'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null)
    const accessToken = ref(localStorage.getItem('accessToken') || null)
    const refreshTokenValue = ref(localStorage.getItem('refreshToken') || null)

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
    const onboardingCompleted = computed(() => user.value?.onboardingCompleted || false)
    const userName = computed(() => user.value?.name || '사용자')
    const userId = computed(() => user.value?.id ?? null)
    const userAnnualIncome = computed(() => Number(user.value?.annualIncome) || 0)
    const userExistingLoanMonthly = computed(() => Number(user.value?.existingLoanMonthly) || 0)
    const userBirthYear = computed(() => user.value?.birthYear ?? null)
    const userPreferredAreas = computed(() => user.value?.preferredAreas || [])
    const userDreamHome = computed(() => user.value?.dreamHome || DEFAULT_DREAM_HOME)
    const userGamification = computed(() => user.value?.gamification || DEFAULT_GAMIFICATION)

    // Actions

    /**
     * 회원가입
     */
    async function register(userData) {
        try {
            const data = await authService.register(userData)

            accessToken.value = data.accessToken
            refreshTokenValue.value = data.refreshToken
            user.value = data.user

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)

            return data
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        }
    }

    /**
     * 로그인
     */
    async function login(email, password) {
        try {
            const data = await authService.login(email, password)

            accessToken.value = data.accessToken
            refreshTokenValue.value = data.refreshToken
            user.value = data.user

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)

            return data
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    /**
     * 로그아웃
     */
    async function logout() {
        try {
            if (accessToken.value) {
                await authService.logout(accessToken.value)
            }
        } catch (error) {
            console.error('Logout API call failed:', error)
        } finally {
            // 로컬 상태 초기화
            user.value = null
            accessToken.value = null
            refreshTokenValue.value = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        }
    }

    /**
     * 토큰 갱신
     */
    async function refreshToken() {
        try {
            const data = await authService.refreshToken(refreshTokenValue.value)
            accessToken.value = data.accessToken
            localStorage.setItem('accessToken', data.accessToken)
            return data
        } catch (error) {
            console.error('Token refresh failed:', error)
            await logout()
            throw error
        }
    }

    /**
     * 온보딩 완료
     */
    async function completeOnboarding(onboardingData) {
        try {
            const data = await authService.completeOnboarding(
                accessToken.value,
                onboardingData
            )
            user.value = { ...user.value, ...data.user }
            return data
        } catch (error) {
            console.error('Onboarding failed:', error)
            throw error
        }
    }

    /**
     * 프로필 수정
     */
    async function updateProfile(profileData) {
        try {
            const data = await authService.updateProfile(
                accessToken.value,
                profileData
            )
            user.value = { ...user.value, ...data.user }
            return data
        } catch (error) {
            console.error('Profile update failed:', error)
            throw error
        }
    }

    /**
     * 인증 상태 확인 (앱 시작 시 호출)
     */
    async function checkAuth() {
        if (accessToken.value) {
            try {
                const userData = await authService.getCurrentUser(accessToken.value)
                user.value = userData
            } catch (error) {
                console.error('Auth check failed:', error)
                await logout()
            }
        }
    }

    return {
        // State
        user,
        accessToken,
        refreshTokenValue,
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
        checkAuth
    }
})
