/**
 * useModal Composable
 * 
 * 모달 상태 관리 및 접근성을 위한 재사용 가능한 composable.
 * 
 * Features:
 * - ESC 키로 닫기
 * - 스크롤 락 (body overflow hidden)
 * - 포커스 트랩 및 복원
 * - aria 속성 지원
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useModal } from '@/composables/useModal'
 * const { isOpen, open, close, triggerRef, modalRef, handleKeydown } = useModal()
 * </script>
 * 
 * <template>
 *   <button ref="triggerRef" @click="open">Open Modal</button>
 *   <div v-if="isOpen" ref="modalRef" @keydown="handleKeydown">...</div>
 * </template>
 * ```
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

export function useModal(options = {}) {
    const {
        closeOnEscape = true,
        closeOnOutsideClick = true,
        lockScroll = true,
        trapFocus = true
    } = options

    const isOpen = ref(false)
    const triggerRef = ref(null)
    const modalRef = ref(null)

    // 이전 활성 요소 저장 (포커스 복원용)
    let previousActiveElement = null
    // 이전 body overflow 저장 (스크롤 복원용)
    let previousOverflow = ''

    /**
     * 모달 열기
     */
    const open = () => {
        previousActiveElement = document.activeElement
        isOpen.value = true

        if (lockScroll) {
            previousOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
        }

        // 첫 번째 focusable 요소로 포커스 이동
        nextTick(() => {
            if (modalRef.value && trapFocus) {
                const firstFocusable = getFocusableElements(modalRef.value)[0]
                firstFocusable?.focus()
            }
        })
    }

    /**
     * 모달 닫기
     */
    const close = () => {
        isOpen.value = false

        if (lockScroll) {
            document.body.style.overflow = previousOverflow
        }

        // 포커스 복원
        nextTick(() => {
            if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                previousActiveElement.focus()
            }
        })
    }

    /**
     * focusable 요소 목록 가져오기
     */
    const getFocusableElements = (container) => {
        const selector = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        ].join(', ')
        return Array.from(container.querySelectorAll(selector))
    }

    /**
     * 포커스 트랩 처리
     */
    const handleFocusTrap = (e) => {
        if (!trapFocus || !modalRef.value) return

        const focusables = getFocusableElements(modalRef.value)
        if (focusables.length === 0) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
        }
    }

    /**
     * 키보드 이벤트 핸들러
     */
    const handleKeydown = (e) => {
        if (!isOpen.value) return

        if (e.key === 'Escape' && closeOnEscape) {
            e.preventDefault()
            close()
        }

        if (e.key === 'Tab') {
            handleFocusTrap(e)
        }
    }

    /**
     * 외부 클릭 핸들러
     */
    const handleOutsideClick = (e) => {
        if (!isOpen.value || !closeOnOutsideClick) return
        if (modalRef.value && !modalRef.value.contains(e.target)) {
            close()
        }
    }

    // 전역 키보드 이벤트 리스너 등록
    onMounted(() => {
        document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
        // 정리: 스크롤 복원
        if (isOpen.value && lockScroll) {
            document.body.style.overflow = previousOverflow
        }
    })

    return {
        isOpen,
        open,
        close,
        triggerRef,
        modalRef,
        handleKeydown,
        handleOutsideClick
    }
}
