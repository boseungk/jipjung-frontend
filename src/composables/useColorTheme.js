import { ref, watch } from 'vue'

const currentColorTheme = ref('warm-beige')

export function useColorTheme() {
    const setColorTheme = (theme) => {
        currentColorTheme.value = theme
        document.documentElement.setAttribute('data-color-theme', theme)
        localStorage.setItem('colorTheme', theme)
    }

    // Initialize from localStorage
    const savedTheme = localStorage.getItem('colorTheme')
    if (savedTheme) {
        setColorTheme(savedTheme)
    } else {
        setColorTheme('warm-beige')
    }

    return {
        currentColorTheme,
        setColorTheme
    }
}
