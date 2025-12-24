import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

// Existing views
import DashboardView from '../views/DashboardView.vue'
import CollectionView from '../views/CollectionView.vue'
import PropertyListView from '../views/PropertyListView.vue'
import ProfileSettingsView from '../views/ProfileSettingsView.vue'

// Auth views (will be created)
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const OnboardingView = () => import('../views/onboarding/OnboardingView.vue')

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: () => import('../views/LandingView.vue'),
        meta: {
            title: '집-중 - 서비스 소개',
            public: true,
            hideNavbar: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: {
            title: '집-중 - 로그인',
            public: true,
            hideNavbar: true
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        meta: {
            title: '집-중 - 회원가입',
            public: true,
            hideNavbar: true
        }
    },
    {
        path: '/onboarding',
        name: 'Onboarding',
        component: OnboardingView,
        meta: {
            title: '집-중 - 시작하기',
            requiresAuth: true,
            hideNavbar: true
        }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: {
            title: '집-중 - 대시보드',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/collection',
        name: 'Collection',
        component: CollectionView,
        meta: {
            title: '집-중 - 컬렉션',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/properties',
        name: 'Properties',
        component: PropertyListView,
        meta: {
            title: '집-중 - 매물 검색',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/ai-manager',
        name: 'AiManager',
        component: () => import('../views/AiManagerView.vue'),
        meta: {
            title: '집-중 - AI 관리실',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileSettingsView,
        meta: {
            title: '집-중 - 프로필 설정',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/dsr-simulation',
        name: 'DsrSimulation',
        component: () => import('../views/DsrSimulationView.vue'),
        meta: {
            title: '집-중 - DSR 시뮬레이션',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/savings',
        name: 'Savings',
        component: () => import('../views/SavingsView.vue'),
        meta: {
            title: '집-중 - 저축하기',
            requiresAuth: true,
            requiresOnboarding: true
        }
    },
    {
        path: '/collection/:id/journey',
        name: 'JourneyReplay',
        component: () => import('../views/JourneyReplayView.vue'),
        meta: {
            title: '집-중 - 저축 여정',
            requiresAuth: true,
            requiresOnboarding: true,
            hideNavbar: true
        }
    },
    {
        path: '/collection/in-progress/journey',
        name: 'InProgressJourneyReplay',
        component: () => import('../views/JourneyReplayView.vue'),
        meta: {
            title: '집-중 - 진행 중 저축 여정',
            requiresAuth: true,
            requiresOnboarding: true,
            hideNavbar: true,
            isInProgress: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Setup authentication guards
setupRouterGuards(router)

// Update document title on route change
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || '집-중'
    next()
})

export default router
