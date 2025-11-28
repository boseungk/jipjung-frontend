import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request Interceptor: JWT 토큰 자동 첨부
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        const token = authStore.accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 401 에러이고, 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const authStore = useAuthStore()

            try {
                await authStore.refreshToken()
                // 토큰 갱신 성공 시 원래 요청 재시도
                return apiClient(originalRequest)
            } catch (refreshError) {
                // 토큰 갱신 실패 시 로그아웃
                authStore.logout()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
