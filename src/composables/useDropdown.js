import { ref } from 'vue'

/**
 * Composable for managing dropdown state
 * Ensures only one dropdown is open at a time
 */
export function useDropdown() {
    const activeDropdown = ref(null)

    /**
     * Toggle dropdown state
     * @param {string} name - Dropdown identifier
     */
    const toggle = (name) => {
        activeDropdown.value = activeDropdown.value === name ? null : name
    }

    /**
     * Close specific or all dropdowns
     * @param {string} [name] - Optional dropdown identifier. If not provided, closes all.
     */
    const close = (name) => {
        if (!name || activeDropdown.value === name) {
            activeDropdown.value = null
        }
    }

    /**
     * Check if dropdown is open
     * @param {string} name - Dropdown identifier
     * @returns {boolean}
     */
    const isOpen = (name) => activeDropdown.value === name

    return {
        toggle,
        close,
        isOpen,
        activeDropdown
    }
}
