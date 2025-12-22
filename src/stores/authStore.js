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
import { DEFAULT_DREAM_HOME, DEFAULT_GAMIFICATION, LEVEL_THRESHOLDS, MAX_LEVEL } from '@/constants/user'
import { SHOWROOM_TOTAL_STAGES } from '@/constants/showroomWebp'
import { VALIDATION } from '@/constants/onboardingConstants'

const HOUSE_TOTAL_STAGES = SHOWROOM_TOTAL_STAGES.house
const FURNITURE_TOTAL_STAGES = SHOWROOM_TOTAL_STAGES.furniture

const KRW_PER_MANWON = 10000
const PROFILE_LIMITS_MANWON = {
    annualIncome: 50000,
    existingLoanMonthly: 1000,
    currentAssets: 100000
}

/**
 * localStorage 키 상수
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ONBOARDING_COMPLETED: 'onboardingCompleted',
    FURNITURE_PROGRESS_PREFIX: 'showroomFurnitureProgress'
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

    /** 사용자 이름 (닉네임 우선) */
    const userName = computed(() => user.value?.nickname || user.value?.name || '사용자')

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

    /** 쇼룸 정보 (집짓기 시각화) */
    const userShowroom = computed(() => user.value?.showroom || null)

    /** 목표 설정 여부 (대시보드 응답을 우선 사용) */
    const hasDreamHomeGoal = computed(() => {
        const dreamHome = userDreamHome.value
        const isDefaultDreamHome = !!dreamHome
            && dreamHome.dreamHomeId == null
            && dreamHome.propertyName === DEFAULT_DREAM_HOME.propertyName
            && !dreamHome.targetAmount
            && !dreamHome.currentAmount
        const derivedHasGoal = (() => {
            if (!dreamHome) return false
            if (dreamHome.dreamHomeId != null) return true
            if (dreamHome.propertyName && dreamHome.propertyName !== DEFAULT_DREAM_HOME.propertyName) return true
            return Boolean(dreamHome.targetAmount || dreamHome.currentAmount)
        })()

        const rawHasTarget = user.value?._raw?.gapAnalysis?.hasTarget
        if (rawHasTarget === true && !isDefaultDreamHome) return true
        return derivedHasGoal
    })

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

    function getFurnitureProgressStorageKeyByUserId(rawUserId) {
        const userId = Number(rawUserId)
        if (!Number.isFinite(userId) || userId <= 0) return null
        return `${STORAGE_KEYS.FURNITURE_PROGRESS_PREFIX}_user_${Math.trunc(userId)}`
    }

    function getLegacyFurnitureProgressStorageKeyByToken(rawToken) {
        const token = typeof rawToken === 'string' ? rawToken : ''
        const suffix = token ? token.slice(-24) : 'guest'
        return `${STORAGE_KEYS.FURNITURE_PROGRESS_PREFIX}_${suffix}`
    }

    function getFurnitureProgressStorageKeys(options = {}) {
        const userIdOverride = options?.userId
        const tokenOverride = options?.token
        return {
            userKey: getFurnitureProgressStorageKeyByUserId(userIdOverride ?? user.value?.id),
            legacyKey: getLegacyFurnitureProgressStorageKeyByToken(tokenOverride ?? accessToken.value)
        }
    }

    function readFurnitureProgress(options = {}) {
        const { userKey, legacyKey } = getFurnitureProgressStorageKeys(options)

        const parseProgress = (raw) => {
            if (!raw) return null
            const parsed = JSON.parse(raw)
            const stage = Number(parsed?.furnitureStage)
            const exp = Number(parsed?.experiencePoints)
            const safeStage = Number.isFinite(stage) ? Math.trunc(stage) : null
            const safeExp = Number.isFinite(exp) ? Math.max(0, exp) : null

            if (!safeStage || safeStage < 1) return null
            return {
                furnitureStage: Math.min(FURNITURE_TOTAL_STAGES, safeStage),
                experiencePoints: safeExp ?? 0
            }
        }

        try {
            const fromUser = userKey ? parseProgress(localStorage.getItem(userKey)) : null
            if (fromUser) return fromUser

            const fromLegacy = legacyKey ? parseProgress(localStorage.getItem(legacyKey)) : null
            if (fromLegacy && userKey) {
                try {
                    localStorage.setItem(userKey, JSON.stringify({ ...fromLegacy, migratedAt: new Date().toISOString() }))
                } catch (error) {
                    // ignore migration failures
                }
            }
            return fromLegacy
        } catch (error) {
            return null
        }
    }

    function persistFurnitureProgress({ furnitureStage, experiencePoints }) {
        const stage = Number(furnitureStage)
        const exp = Number(experiencePoints)
        const safeStage = Number.isFinite(stage) ? Math.trunc(stage) : 1
        const safeExp = Number.isFinite(exp) ? Math.max(0, exp) : 0

        const payload = {
            furnitureStage: Math.min(FURNITURE_TOTAL_STAGES, Math.max(1, safeStage)),
            experiencePoints: safeExp,
            updatedAt: new Date().toISOString()
        }

        try {
            const { userKey, legacyKey } = getFurnitureProgressStorageKeys()
            const rawPayload = JSON.stringify(payload)
            if (userKey) localStorage.setItem(userKey, rawPayload)
            if (legacyKey) localStorage.setItem(legacyKey, rawPayload)
        } catch (error) {
            // ignore storage failures
        }
    }

    function clearFurnitureProgress(options = {}) {
        try {
            const { userKey, legacyKey } = getFurnitureProgressStorageKeys(options)
            if (userKey) localStorage.removeItem(userKey)
            if (legacyKey) localStorage.removeItem(legacyKey)
        } catch (error) {
            // ignore
        }
    }

    /**
     * 토큰 및 사용자 상태 초기화
     */
    function clearAuth() {
        const userFurnitureProgressKey = getFurnitureProgressStorageKeyByUserId(user.value?.id)
        const legacyFurnitureProgressKey = getLegacyFurnitureProgressStorageKeyByToken(accessToken.value)
        user.value = null
        accessToken.value = null
        refreshTokenValue.value = null
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
        if (userFurnitureProgressKey) localStorage.removeItem(userFurnitureProgressKey)
        if (legacyFurnitureProgressKey) localStorage.removeItem(legacyFurnitureProgressKey)
    }

    function toFiniteInteger(value, fallback = 0) {
        if (value === null || value === undefined || value === '') return fallback
        const numeric = Number(value)
        if (!Number.isFinite(numeric)) return fallback
        return Math.trunc(numeric)
    }

    function toWonMaybe(value, maxManwon) {
        const intValue = Math.max(0, toFiniteInteger(value, 0))
        if (intValue <= maxManwon) {
            return intValue * KRW_PER_MANWON
        }
        return intValue
    }

    function toManwonMaybe(value, maxManwon) {
        const intValue = Math.max(0, toFiniteInteger(value, 0))
        if (intValue > maxManwon) {
            return Math.round(intValue / KRW_PER_MANWON)
        }
        return intValue
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
        const apiPayload = {
            birthYear: toFiniteInteger(onboardingData?.birthYear, null),
            annualIncome: toWonMaybe(onboardingData?.annualIncome, VALIDATION.ANNUAL_INCOME.MAX),
            existingLoanMonthly: toWonMaybe(onboardingData?.existingLoanMonthly, VALIDATION.EXISTING_LOAN.MAX),
            currentAssets: toWonMaybe(onboardingData?.currentAssets, VALIDATION.CURRENT_ASSETS.MAX),
            preferredAreas: normalizePreferredAreas(onboardingData?.preferredAreas)
        }

        const response = await authService.completeOnboarding(apiPayload)

        // 백엔드 응답 구조: { code, status, message, data: { user, dsrResult } }
        const userData = response.data?.user || response.user

        if (userData) {
            // 기존 사용자 정보와 병합
            const preferredAreas = normalizePreferredAreas(
                userData.preferredAreas,
                onboardingData?.preferredAreas
            )

            const localPatch = {
                birthYear: toFiniteInteger(onboardingData?.birthYear, null),
                annualIncome: toFiniteInteger(onboardingData?.annualIncome, 0),
                existingLoanMonthly: toFiniteInteger(onboardingData?.existingLoanMonthly, 0),
                currentAssets: toFiniteInteger(onboardingData?.currentAssets, 0)
            }

            user.value = { ...user.value, ...userData, ...localPatch, onboardingCompleted: true, preferredAreas }
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
        const hasApiPatch = profileData && typeof profileData === 'object' && (
            Object.prototype.hasOwnProperty.call(profileData, 'nickname') ||
            Object.prototype.hasOwnProperty.call(profileData, 'annualIncome') ||
            Object.prototype.hasOwnProperty.call(profileData, 'existingLoanMonthly') ||
            Object.prototype.hasOwnProperty.call(profileData, 'currentAssets')
        )

        if (profileData && typeof profileData === 'object') {
            // 서버에 없는 필드는 로컬 상태만 업데이트 (예: birthYear, gamification 등)
            const localOnlyPatch = { ...profileData }
            delete localOnlyPatch.nickname
            delete localOnlyPatch.annualIncome
            delete localOnlyPatch.existingLoanMonthly
            delete localOnlyPatch.currentAssets
            if (Object.keys(localOnlyPatch).length > 0) {
                updateUserData(localOnlyPatch)
            }
        }

        if (!hasApiPatch) {
            return { user: user.value }
        }

        const currentNickname = String(user.value?.nickname ?? user.value?.name ?? '').trim()
        const nextNickname = String(profileData?.nickname ?? currentNickname).trim()
        const nextAnnualIncomeManwon = toFiniteInteger(
            profileData?.annualIncome ?? user.value?.annualIncome ?? 0,
            0
        )
        const nextExistingLoanMonthlyManwon = toFiniteInteger(
            profileData?.existingLoanMonthly ?? user.value?.existingLoanMonthly ?? 0,
            0
        )
        const nextCurrentAssetsManwon = toFiniteInteger(
            profileData?.currentAssets ?? user.value?.currentAssets ?? 0,
            0
        )

        const apiPayload = {
            nickname: nextNickname,
            annualIncome: toWonMaybe(nextAnnualIncomeManwon, PROFILE_LIMITS_MANWON.annualIncome),
            existingLoanMonthly: toWonMaybe(nextExistingLoanMonthlyManwon, PROFILE_LIMITS_MANWON.existingLoanMonthly),
            currentAssets: toWonMaybe(nextCurrentAssetsManwon, PROFILE_LIMITS_MANWON.currentAssets)
        }

        const response = await authService.updateProfile(apiPayload)

        // 지원 형태:
        // - { user: {...} } (mock)
        // - { code, status, message, data: { user: {...} } } (ApiResponse)
        const userPatch = response?.user ?? response?.data?.user ?? null
        const patchSource = userPatch ?? profileData ?? null

        if (patchSource && typeof patchSource === 'object') {
            const normalizedPatch = { ...patchSource }

            if (patchSource.nickname != null && patchSource.name == null) {
                normalizedPatch.name = patchSource.nickname
            }
            if (patchSource.name != null && patchSource.nickname == null) {
                normalizedPatch.nickname = patchSource.name
            }

            // Backend is 원 단위, UI/store는 만원 단위로 사용
            if (normalizedPatch.annualIncome != null) {
                normalizedPatch.annualIncome = toManwonMaybe(normalizedPatch.annualIncome, PROFILE_LIMITS_MANWON.annualIncome)
            }
            if (normalizedPatch.existingLoanMonthly != null) {
                normalizedPatch.existingLoanMonthly = toManwonMaybe(normalizedPatch.existingLoanMonthly, PROFILE_LIMITS_MANWON.existingLoanMonthly)
            }
            if (normalizedPatch.currentAssets != null) {
                normalizedPatch.currentAssets = toManwonMaybe(normalizedPatch.currentAssets, PROFILE_LIMITS_MANWON.currentAssets)
            }

            // 기존 사용자 정보와 병합
            user.value = { ...user.value, ...normalizedPatch }
        }

        return response
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
                id: response.profile?.userId,
                nickname: response.profile?.nickname,
                name: response.profile?.nickname,  // 하위 호환성
                email: response.profile?.email,
                birthYear: response.profile?.birthYear,
                createdAt: response.profile?.createdAt,
                annualIncome: response.profile?.annualIncome ?? 0,
                existingLoanMonthly: response.profile?.existingLoanMonthly ?? 0,
                onboardingCompleted: true,
                preferredAreas: response.profile?.preferredAreas || []
            }

            // 드림홈 정보 매핑 (goal -> dreamHome)
            const previousDreamHome = user.value?.dreamHome || DEFAULT_DREAM_HOME
            const mappedDreamHome = {
                ...previousDreamHome,
                dreamHomeId: response.goal?.dreamHomeId ?? previousDreamHome.dreamHomeId ?? null,
                propertyName: response.goal?.targetPropertyName ?? previousDreamHome.propertyName ?? DEFAULT_DREAM_HOME.propertyName,
                houseName: response.goal?.houseName ?? previousDreamHome.houseName ?? DEFAULT_DREAM_HOME.houseName,
                targetAmount: response.goal?.targetAmount ?? response.goal?.totalAmount ?? previousDreamHome.targetAmount ?? 0,
                currentAmount: response.goal?.savedAmount ?? previousDreamHome.currentAmount ?? 0,
                remainingAmount: response.goal?.remainingAmount ?? previousDreamHome.remainingAmount ?? 0,
                achievementRate: response.goal?.achievementRate ?? previousDreamHome.achievementRate ?? 0,
                isCompleted: response.goal?.isCompleted ?? previousDreamHome.isCompleted ?? false
            }

            // 게임화 정보 매핑 (profile + streak -> gamification)
            const existingTrack = user.value?.gamification?.buildTrack
            const existingFurnitureStage = Number(user.value?.gamification?.furnitureStage) || 0
            const existingExperiencePoints = Number(user.value?.gamification?.experiencePoints)

            const rawShowroomStep = Number(response.showroom?.currentStep ?? response.profile?.level ?? 1)
            const showroomStep = Number.isFinite(rawShowroomStep) ? Math.max(1, Math.trunc(rawShowroomStep)) : 1
            const isHouseCompleted = showroomStep >= HOUSE_TOTAL_STAGES

            if (!isHouseCompleted) {
                clearFurnitureProgress({ userId: response.profile?.userId })
            }

            const storedFurnitureProgress = isHouseCompleted
                ? readFurnitureProgress({ userId: response.profile?.userId })
                : null

            // 트랙 결정 로직:
            // 1. 백엔드 showroom 응답 우선 (서버 상태가 source of truth)
            // 2. 기존 로컬 상태가 있으면 참고
            // 3. 그 외에는 house 트랙
            const backendBuildTrack = response.showroom?.buildTrack
            const rawBackendFurnitureStage = Number(response.showroom?.furnitureStage)
            const rawBackendFurnitureExp = Number(response.showroom?.furnitureExp)
            const backendFurnitureStage = Number.isFinite(rawBackendFurnitureStage)
                ? Math.max(0, Math.trunc(rawBackendFurnitureStage))
                : 0
            const backendFurnitureExp = Number.isFinite(rawBackendFurnitureExp)
                ? Math.max(0, rawBackendFurnitureExp)
                : null
            const storedFurnitureExp = Number.isFinite(storedFurnitureProgress?.experiencePoints)
                ? Math.max(0, storedFurnitureProgress.experiencePoints)
                : null
            const existingFurnitureExp = existingTrack === 'furniture' && Number.isFinite(existingExperiencePoints)
                ? Math.max(0, existingExperiencePoints)
                : null

            let derivedTrack = 'house'
            if (isHouseCompleted) {
                if (backendBuildTrack === 'furniture') {
                    derivedTrack = 'furniture'
                } else if (existingTrack === 'furniture') {
                    derivedTrack = 'furniture'
                } else if (storedFurnitureProgress?.furnitureStage >= 1) {
                    derivedTrack = 'furniture'
                }
            }

            const derivedHouseStage = Math.min(HOUSE_TOTAL_STAGES, showroomStep)

            // 인테리어 단계: 백엔드 값 > 기존 로컬 값 > localStorage 순으로 우선순위
            const derivedFurnitureStage = derivedTrack === 'furniture'
                ? Math.min(
                    FURNITURE_TOTAL_STAGES,
                    Math.max(
                        1,
                        backendFurnitureStage,
                        existingFurnitureStage,
                        storedFurnitureProgress?.furnitureStage || 0,
                        showroomStep - HOUSE_TOTAL_STAGES
                    )
                )
                : 0

            // 인테리어 EXP: 백엔드 값 우선
            const derivedFurnitureExp = derivedTrack === 'furniture'
                ? (backendFurnitureExp ?? existingFurnitureExp ?? storedFurnitureExp ?? 0)
                : 0

            const rawLevelValue = Number(response.profile?.level)
            const currentLevelValue = Number.isFinite(rawLevelValue)
                ? Math.max(1, Math.trunc(rawLevelValue))
                : DEFAULT_GAMIFICATION.currentLevel
            const levelForProgress = Math.min(MAX_LEVEL, currentLevelValue)
            const levelStartExp = LEVEL_THRESHOLDS[levelForProgress - 1] || 0
            const rawCurrentExp = Number(response.profile?.levelProgress?.currentExp)
            const safeCurrentExp = Number.isFinite(rawCurrentExp)
                ? Math.max(0, rawCurrentExp)
                : (Number.isFinite(existingExperiencePoints) ? Math.max(0, existingExperiencePoints) : 0)
            const derivedHouseExp = safeCurrentExp < levelStartExp
                ? levelStartExp + safeCurrentExp
                : safeCurrentExp

            const mappedGamification = {
                currentLevel: currentLevelValue,
                levelTitle: response.profile?.title || '신입 건축가',
                experiencePoints: derivedTrack === 'furniture'
                    ? derivedFurnitureExp
                    : derivedHouseExp,
                nextLevelExp: response.profile?.levelProgress?.targetExp || 100,
                expProgress: response.profile?.levelProgress?.percent || 0,
                remainingExp: response.profile?.levelProgress?.remainingExp || 0,
                currentStreak: response.streak?.currentStreak || 0,
                longestStreak: response.streak?.maxStreak || 0,
                isTodayParticipated: response.streak?.isTodayParticipated || false,
                rewardAvailable: response.streak?.rewardAvailable || false,
                weeklyStatus: response.streak?.weeklyStatus || [],
                buildTrack: derivedTrack,
                houseStage: derivedHouseStage,
                furnitureStage: derivedFurnitureStage
            }

            // 사용자 정보 업데이트
            user.value = {
                ...user.value,
                ...mappedUser,
                dreamHome: mappedDreamHome,
                gamification: mappedGamification,
                // 쇼룸 정보 직접 매핑 (집짓기 시각화)
                showroom: response.showroom || null,
                // 원본 백엔드 응답 보존 (컴포넌트에서 직접 접근 가능)
                _raw: {
                    profile: response.profile,
                    goal: response.goal,
                    streak: response.streak,
                    dsr: response.dsr,
                    assets: response.assets,
                    gapAnalysis: response.gapAnalysis
                }
            }

            if (derivedTrack === 'furniture') {
                persistFurnitureProgress({
                    furnitureStage: derivedFurnitureStage,
                    experiencePoints: derivedFurnitureExp
                })
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
        userShowroom,
        hasDreamHomeGoal,

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
        updateUserData,
        persistFurnitureProgress,
        clearFurnitureProgress
    }
})
