import { ref, onMounted, onUnmounted } from 'vue'
import { BREAKPOINTS } from '@/constants/navigation'

/**
 * Composable for managing responsive state
 */
export function useResponsive() {
    const isMobile = ref(false)
    const isTablet = ref(false)
    const isDesktop = ref(false)
    const hasWindow = typeof window !== 'undefined'

    const updateResponsive = () => {
        if (!hasWindow) return
        const width = window.innerWidth
        isMobile.value = width <= BREAKPOINTS.mobile
        isTablet.value = width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet
        isDesktop.value = width > BREAKPOINTS.tablet
    }

    onMounted(() => {
        if (!hasWindow) return
        updateResponsive()
        window.addEventListener('resize', updateResponsive)
    })

    onUnmounted(() => {
        if (!hasWindow) return
        window.removeEventListener('resize', updateResponsive)
    })

    return {
        isMobile,
        isTablet,
        isDesktop,
        updateResponsive
    }
}
