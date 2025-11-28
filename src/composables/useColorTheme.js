import { ref, onMounted } from 'vue'

const currentColorTheme = ref('warm-beige')
const hasWindow = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof localStorage !== 'undefined'
let initialized = false

const applyColorTheme = (theme) => {
    currentColorTheme.value = theme
    if (!hasWindow) return
    document.documentElement.setAttribute('data-color-theme', theme)
    localStorage.setItem('colorTheme', theme)
}

const initColorTheme = () => {
    if (initialized || !hasWindow) return
    const savedTheme = localStorage.getItem('colorTheme')
    applyColorTheme(savedTheme || 'warm-beige')
    initialized = true
}

export function useColorTheme() {
    initColorTheme()

    const setColorTheme = (theme) => {
        applyColorTheme(theme)
    }

    onMounted(() => {
        initColorTheme()
    })

    return {
        currentColorTheme,
        setColorTheme
    }
}
