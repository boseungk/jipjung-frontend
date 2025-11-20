import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const theme = ref('day')

    const toggleTheme = () => {
        theme.value = theme.value === 'day' ? 'night' : 'day'
    }

    const setTheme = (newTheme) => {
        theme.value = newTheme
    }

    // Watch for changes and update the HTML attribute
    watch(theme, (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme)
    }, { immediate: true })

    return { theme, toggleTheme, setTheme }
})
