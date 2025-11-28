import { useAuthStore } from '@/stores/authStore'

/**
 * 라우터 가드 설정
 * - 인증 체크
 * - 온보딩 완료 체크
 * - 인증된 사용자의 로그인 페이지 접근 방지
 */
export function setupRouterGuards(router) {
    router.beforeEach(async (to, from, next) => {
        const authStore = useAuthStore()

        // 인증이 필요한 라우트
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

        // 온보딩이 필요한 라우트
        const requiresOnboarding = to.matched.some(record => record.meta.requiresOnboarding)

        // 공개 라우트 (인증 없이 접근 가능)
        const isPublicRoute = to.meta.public === true

        // 인증 상태 체크 (최초 로드 시)
        // accessToken은 있지만 user 정보가 없으면 API 호출하여 user 정보 가져오기
        if (authStore.accessToken && !authStore.user) {
            try {
                await authStore.checkAuth()
            } catch (error) {
                console.error('Auth check failed during navigation:', error)
                // 인증 실패 시 로그아웃 처리 (checkAuth 내부에서 처리됨)
            }
        }

        // 1. 인증이 필요한 페이지인데 로그인하지 않은 경우
        if (requiresAuth && !authStore.isAuthenticated) {
            next({
                name: 'Login',
                query: { redirect: to.fullPath }
            })
            return
        }

        // 2. 로그인했지만 온보딩을 완료하지 않은 경우
        if (requiresOnboarding && authStore.isAuthenticated && !authStore.onboardingCompleted) {
            // 온보딩 페이지로 가는 중이 아니라면 온보딩 페이지로 리디렉션
            if (to.name !== 'Onboarding') {
                next({ name: 'Onboarding' })
                return
            }
        }

        // 3. 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시
        if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
            if (authStore.onboardingCompleted) {
                next({ name: 'Dashboard' })
            } else {
                next({ name: 'Onboarding' })
            }
            return
        }

        // 4. 온보딩 완료 후 온보딩 페이지 접근 시 대시보드로 리디렉션
        if (to.name === 'Onboarding' && authStore.onboardingCompleted) {
            next({ name: 'Dashboard' })
            return
        }

        next()
    })
}
