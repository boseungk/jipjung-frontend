/**
 * Authentication Service
 * 
 * 인증 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/authService
 */

import apiClient from '@/api/client'
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - 이메일 (유일)
 * @property {string} password - 비밀번호 (8자 이상)
 * @property {string} nickname - 닉네임 (2-20자)
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - JWT 액세스 토큰
 * @property {string} refreshToken - JWT 리프레시 토큰
 * @property {User} user - 사용자 정보
 */

/**
 * @typedef {Object} OnboardingRequest
 * @property {number} birthYear - 출생년도
 * @property {number} annualIncome - 연소득 (원 단위)
 * @property {number} existingLoanMonthly - 월 대출 상환액 (원 단위)
 * @property {number} currentAssets - 현재 보유 자산 (원 단위)
 * @property {string[]} preferredAreas - 선호 지역 배열
 */

/**
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} nickname - 닉네임 (2-20자)
 * @property {number} annualIncome - 연소득 (원 단위)
 * @property {number} existingLoanMonthly - 월 대출 상환액 (원 단위)
 */

export const authService = {
  /**
   * 회원가입
   * 
   * @param {RegisterRequest} userData - 회원가입 정보
   * @returns {Promise<LoginResponse>} 토큰 및 사용자 정보
   * @throws {ApiError} 이메일 중복(400), 유효성 검증 실패(400)
   * 
   * @example
   * const result = await authService.register({
   *   email: 'user@example.com',
   *   password: 'Test1234!@',
   *   nickname: '홍길동'
   * })
   */
  async register(userData) {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData)
    return response.data
  },

  /**
   * 로그인
   * 
   * 백엔드는 JWT 토큰을 Authorization 헤더로 반환합니다.
   * 응답 body에는 nickname만 포함됩니다.
   * 
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<{accessToken: string, nickname: string}>} 토큰 및 닉네임
   * @throws {ApiError} 인증 실패(401), 유효성 검증 실패(400)
   * 
   * @example
   * const result = await authService.login('user@example.com', 'password123')
   */
  async login(email, password) {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password })

    // 헤더에서 토큰 추출 (Bearer 제거)
    const authHeader = response.headers['authorization'] || response.headers['Authorization']
    const accessToken = authHeader?.replace('Bearer ', '') || null

    // body의 data에서 user 정보 추출 (onboardingCompleted 포함)
    const responseData = response.data.data || response.data || {}
    const user = responseData.user || {}

    return {
      accessToken,
      nickname: user.nickname,
      onboardingCompleted: user.onboardingCompleted,
      user // 전체 user 객체도 반환
    }
  },

  /**
   * 토큰 갱신
   * 
   * @param {string} refreshToken - 리프레시 토큰
   * @returns {Promise<{accessToken: string}>} 새로운 액세스 토큰
   * @throws {ApiError} 토큰 만료/유효하지 않음(401)
   */
  async refreshToken(refreshToken) {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH, { refreshToken })
    return response.data
  },

  /**
   * 현재 사용자 정보 조회
   * 
   * apiClient 인터셉터에서 토큰을 자동으로 첨부하므로
   * 별도의 토큰 파라미터가 필요하지 않음
   * 
   * @returns {Promise<User>} 사용자 정보
   * @throws {ApiError} 인증 필요(401), 사용자 없음(404)
   */
  async getCurrentUser() {
    const response = await apiClient.get(AUTH_ENDPOINTS.ME)
    return response.data
  },

  /**
   * 온보딩 정보 저장
   * 
   * @param {OnboardingRequest} onboardingData - 온보딩 데이터
   * @returns {Promise<{user: User}>} 업데이트된 사용자 정보
   * @throws {ApiError} 인증 필요(401), 유효성 검증 실패(400)
   * 
   * @example
   * const result = await authService.completeOnboarding({
   *   birthYear: 1995,
   *   annualIncome: 50000000,
   *   existingLoanMonthly: 500000,
   *   currentAssets: 30000000,
   *   preferredAreas: ['강남구', '서초구']
   * })
   */
  async completeOnboarding(onboardingData) {
    const response = await apiClient.post(USER_ENDPOINTS.ONBOARDING, onboardingData)
    return response.data
  },

  /**
   * 프로필 수정
   * 
   * @param {ProfileUpdateRequest} profileData - 프로필 데이터
   * @returns {Promise<{user: User}>} 업데이트된 사용자 정보
   * @throws {ApiError} 인증 필요(401), 유효성 검증 실패(400)
   * 
   * @example
   * const result = await authService.updateProfile({
   *   nickname: '건축왕2세',
   *   annualIncome: 55000000,
   *   existingLoanMonthly: 450000
   * })
   */
  async updateProfile(profileData) {
    // 백엔드 명세: POST /api/users/profile
    const response = await apiClient.post(USER_ENDPOINTS.PROFILE, profileData)
    return response.data
  },

  /**
   * 로그아웃
   * 
   * @returns {Promise<{message: string}>} 성공 메시지
   */
  async logout() {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT)
    return response.data
  }
}
