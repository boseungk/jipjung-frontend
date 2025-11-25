import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CollectionView from '../views/CollectionView.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: DashboardView,
        meta: {
            title: '집짓기 - 대시보드'
        }
    },
    {
        path: '/collection',
        name: 'Collection',
        component: CollectionView,
        meta: {
            title: '집짓기 - 컬렉션'
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

// Update document title on route change
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || '집짓기'
    next()
})

export default router
