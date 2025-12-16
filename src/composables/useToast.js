/**
 * Toast Notification Composable
 * 
 * Provides a global toast notification system to replace
 * native alert() dialogs with better UX.
 */

import { reactive, ref } from 'vue'

/**
 * Global toast state - shared across the app
 */
const toastState = reactive({
  id: 0,
  visible: false,
  message: '',
  type: 'info', // 'info' | 'success' | 'error' | 'warning'
  duration: 3000
})

const TOAST_TYPES = new Set(['info', 'success', 'error', 'warning'])

const isPaused = ref(false)

let hideTimeout = null
let startedAtMs = 0
let remainingMs = 0

function clearHideTimeout() {
  if (!hideTimeout) return
  clearTimeout(hideTimeout)
  hideTimeout = null
}

function normalizeDuration(duration) {
  const numericDuration = Number(duration)
  if (!Number.isFinite(numericDuration)) return 0
  return Math.max(0, numericDuration)
}

function normalizeType(type) {
  if (TOAST_TYPES.has(type)) return type
  return 'info'
}

function hideToast() {
  toastState.visible = false
  isPaused.value = false
  startedAtMs = 0
  remainingMs = 0
  clearHideTimeout()
}

function pauseToast() {
  if (!toastState.visible) return
  if (isPaused.value) return
  if (toastState.duration <= 0) return
  if (!startedAtMs) return

  isPaused.value = true

  const elapsedMs = Date.now() - startedAtMs
  remainingMs = Math.max(0, remainingMs - elapsedMs)
  startedAtMs = 0
  clearHideTimeout()

  if (remainingMs <= 0) {
    hideToast()
  }
}

function resumeToast() {
  if (!toastState.visible) return
  if (!isPaused.value) return
  if (remainingMs <= 0) return

  isPaused.value = false
  startedAtMs = Date.now()
  hideTimeout = setTimeout(() => {
    hideToast()
  }, remainingMs)
}

/**
 * Provides toast notification methods
 * 
 * @returns {Object} Toast state and control methods
 */
export function useToast() {
  /**
   * Show a toast notification
   * 
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('info', 'success', 'error', 'warning')
   * @param {number} duration - Duration in ms (0 = manual dismiss)
   */
  function showToast(message, type = 'info', duration = 3000) {
    clearHideTimeout()

    isPaused.value = false
    startedAtMs = 0

    toastState.id += 1
    toastState.visible = true
    toastState.message = message
    toastState.type = normalizeType(type)

    remainingMs = normalizeDuration(duration)
    toastState.duration = remainingMs

    if (remainingMs > 0) {
      startedAtMs = Date.now()
      hideTimeout = setTimeout(() => {
        hideToast()
      }, remainingMs)
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
    isPaused,

    // Methods
    showToast,
    hideToast,
    pauseToast,
    resumeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
