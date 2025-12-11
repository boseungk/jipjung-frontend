/**
 * API Client
 * 
 * Axios 인스턴스를 생성하고 인터셉터를 설정합니다.
 * - 요청 인터셉터: JWT 토큰 자동 첨부
 * - 응답 인터셉터: 401 에러 시 토큰 자동 갱신
 * 
 * @module api/client
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { transformAxiosError } from './errors'

/**
 * API 기본 설정
 * 
 * 개발 환경: Vite 프록시 사용 시 '/api'만 사용 (baseURL 비움)
 * 프로덕션: VITE_API_BASE_URL 환경변수 사용
 * 
 * 프록시 미사용 시: VITE_API_BASE_URL=http://localhost:8080/api
 * 프록시 사용 시: VITE_API_BASE_URL=/api 또는 환경변수 미설정
 */
const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
}

/**
 * Axios 인스턴스 생성
 */
const apiClient = axios.create(API_CONFIG)

/**
 * 토큰 갱신 중복 방지를 위한 플래그
 */
let isRefreshing = false
let refreshSubscribers = []

/**
 * 토큰 갱신 완료 후 대기 중인 요청들 재시도
 * @param {string} token - 새로운 액세스 토큰
 */
function onRefreshed(token) {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

/**
 * 토큰 갱신 대기 큐에 요청 추가
 * @param {Function} callback - 토큰 갱신 후 실행될 콜백
 */
function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback)
}

/**
 * Request Interceptor
 * - JWT 토큰 자동 첨부
 */
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        const token = authStore.accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(transformAxiosError(error))
)

/**
 * Response Interceptor
 * - 401 에러 시 토큰 자동 갱신
 * - 에러 응답 표준화
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 401 에러이고, 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            // 토큰 갱신 요청 자체가 실패한 경우 로그아웃
            if (originalRequest.url?.includes('/auth/refresh')) {
                const authStore = useAuthStore()
                authStore.logout()
                return Promise.reject(transformAxiosError(error))
            }

            // 이미 토큰 갱신 중인 경우 대기열에 추가
            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        resolve(apiClient(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const authStore = useAuthStore()
                await authStore.refreshToken()
                const newToken = authStore.accessToken

                onRefreshed(newToken)
                isRefreshing = false

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                isRefreshing = false
                refreshSubscribers = []

                const authStore = useAuthStore()
                authStore.logout()

                return Promise.reject(transformAxiosError(refreshError))
            }
        }

        return Promise.reject(transformAxiosError(error))
    }
)

export default apiClient
