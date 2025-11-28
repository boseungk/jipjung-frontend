import { ref, onMounted } from 'vue'

/**
 * Composable for managing theme state (day/night mode)
 * 공유 상태를 사용해 컴포넌트 간에 테마가 어긋나지 않도록 한다.
 */
const theme = ref('day')
const isNight = ref(false)
let initialized = false

const hasWindow = typeof window !== 'undefined'

const applyTheme = (newTheme) => {
    theme.value = newTheme
    isNight.value = newTheme === 'night'

    if (!hasWindow) return

    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('showroom-theme', newTheme)

    // Dispatch custom event for legacy code compatibility
    window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: newTheme, isNight: newTheme === 'night' }
    }))
}

const initTheme = () => {
    if (initialized || !hasWindow) return
    const savedTheme = localStorage.getItem('showroom-theme') || 'day'
    applyTheme(savedTheme)
    initialized = true
}

export function useTheme() {
    initTheme()

    // Toggle between day and night
    const toggleTheme = () => {
        const newTheme = theme.value === 'day' ? 'night' : 'day'
        applyTheme(newTheme)
    }

    // Set specific theme
    const setTheme = (newTheme) => {
        if (newTheme === 'day' || newTheme === 'night') {
            applyTheme(newTheme)
        }
    }

    // Initialize on mount for client-side usage
    onMounted(() => {
        initTheme()
    })

    return {
        theme,
        isNight,
        toggleTheme,
        setTheme,
    }
}
