import { ref, onMounted } from 'vue'

/**
 * Composable for managing theme state (day/night mode)
 */
export function useTheme() {
    const theme = ref('day')
    const isNight = ref(false)

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

    // Initialize on mount
    onMounted(() => {
        const savedTheme = localStorage.getItem('showroom-theme') || 'day'
        applyTheme(savedTheme)
    })

    return {
        theme,
        isNight,
        toggleTheme,
        setTheme,
    }
}
