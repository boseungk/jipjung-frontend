import { ref, onMounted } from 'vue'
import { COLOR_THEMES } from '@/constants/navigation'

const currentColorTheme = ref('warm-beige')
const hasWindow = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof localStorage !== 'undefined'
let initialized = false

const availableThemes = COLOR_THEMES.map((theme) => theme.value)
const DEFAULT_THEME = availableThemes[0] || 'warm-beige'

const sanitizeTheme = (theme) => (availableThemes.includes(theme) ? theme : DEFAULT_THEME)

const applyColorTheme = (theme) => {
    const nextTheme = sanitizeTheme(theme)
    currentColorTheme.value = nextTheme
    if (!hasWindow) return
    document.documentElement.setAttribute('data-color-theme', nextTheme)
    localStorage.setItem('colorTheme', nextTheme)
}

const initColorTheme = () => {
    if (initialized || !hasWindow) return
    const savedTheme = localStorage.getItem('colorTheme')
    applyColorTheme(savedTheme || DEFAULT_THEME)
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
