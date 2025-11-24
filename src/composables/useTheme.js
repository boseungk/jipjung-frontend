import { ref, watch, onMounted } from 'vue'

/**
 * Composable for managing theme state (day/night mode)
 */
export function useTheme() {
    const theme = ref('day')
    const isNight = ref(false)

    // Load theme from localStorage or default to 'day'
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('showroom-theme')
        if (savedTheme) {
            theme.value = savedTheme
            isNight.value = savedTheme === 'night'
        }
    }

    // Apply theme to document
    const applyTheme = (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme)
        theme.value = newTheme
        isNight.value = newTheme === 'night'
        localStorage.setItem('showroom-theme', newTheme)

        // Dispatch custom event for legacy code compatibility
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme, isNight: newTheme === 'night' }
        }))
    }

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

    // Watch for theme changes
    watch(theme, (newTheme) => {
        applyTheme(newTheme)
    })

    // Initialize on mount
    onMounted(() => {
        loadTheme()
        applyTheme(theme.value)
    })

    return {
        theme,
        isNight,
        toggleTheme,
        setTheme,
    }
}
