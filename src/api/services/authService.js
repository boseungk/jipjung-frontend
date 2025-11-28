/**
 * Auth Service
 * Mock API를 사용하는 인증 서비스
 * 실제 백엔드 준비 시 mockAuthService를 실제 API 호출로 교체
 */

import { mockAuthService } from './mockAuthService'

export const authService = {
    /**
     * 회원가입
     */
    async register(userData) {
        return await mockAuthService.register(userData)
    },

    /**
     * 로그인
     */
    async login(email, password) {
        return await mockAuthService.login(email, password)
    },

    /**
     * 토큰 갱신
     */
    async refreshToken(refreshToken) {
        return await mockAuthService.refreshToken(refreshToken)
    },

    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser(token) {
        return await mockAuthService.getCurrentUser(token)
    },

    /**
     * 온보딩 정보 저장
     */
    async completeOnboarding(token, onboardingData) {
        return await mockAuthService.completeOnboarding(token, onboardingData)
    },

    /**
     * 프로필 수정
     */
    async updateProfile(token, profileData) {
        return await mockAuthService.updateProfile(token, profileData)
    },

    /**
     * 로그아웃
     */
    async logout(token) {
        return await mockAuthService.logout(token)
    }
}

// 실제 백엔드 API 사용 시 아래와 같이 교체:
/*
import apiClient from '@/api/client'

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  async completeOnboarding(onboardingData) {
    const response = await apiClient.put('/auth/onboarding', onboardingData)
    return response.data
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/auth/profile', profileData)
    return response.data
  },

  async logout() {
    const response = await apiClient.post('/auth/logout')
    return response.data
  }
}
*/
