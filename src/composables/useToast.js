/**
 * Toast Notification Composable
 * 
 * Provides a global toast notification system to replace
 * native alert() dialogs with better UX.
 */

import { reactive } from 'vue'

/**
 * Global toast state - shared across the app
 */
const toastState = reactive({
    visible: false,
    message: '',
    type: 'info', // 'info' | 'success' | 'error' | 'warning'
    duration: 3000
})

/**
 * Provides toast notification methods
 * 
 * @returns {Object} Toast state and control methods
 */
export function useToast() {
    let hideTimeout = null

    /**
     * Show a toast notification
     * 
     * @param {string} message - Message to display
     * @param {string} type - Toast type ('info', 'success', 'error', 'warning')
     * @param {number} duration - Duration in ms (0 = manual dismiss)
     */
    function showToast(message, type = 'info', duration = 3000) {
        // Clear existing timeout
        if (hideTimeout) {
            clearTimeout(hideTimeout)
            hideTimeout = null
        }

        // Update toast state
        toastState.visible = true
        toastState.message = message
        toastState.type = type
        toastState.duration = duration

        // Auto-hide after duration
        if (duration > 0) {
            hideTimeout = setTimeout(() => {
                hideToast()
            }, duration)
        }
    }

    /**
     * Hide the current toast
     */
    function hideToast() {
        toastState.visible = false
        if (hideTimeout) {
            clearTimeout(hideTimeout)
            hideTimeout = null
        }
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     * @param {number} duration - Duration in ms
     */
    function showSuccess(message, duration = 3000) {
        showToast(message, 'success', duration)
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     * @param {number} duration - Duration in ms (default 4s for errors)
     */
    function showError(message, duration = 4000) {
        showToast(message, 'error', duration)
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     * @param {number} duration - Duration in ms
     */
    function showWarning(message, duration = 3000) {
        showToast(message, 'warning', duration)
    }

    /**
     * Show info toast
     * @param {string} message - Info message
     * @param {number} duration - Duration in ms
     */
    function showInfo(message, duration = 3000) {
        showToast(message, 'info', duration)
    }

    return {
        // State (reactive)
        toastState,

        // Methods
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}
