/**
 * useClickOutside Composable
 * 
 * 요소 외부 클릭 감지를 위한 재사용 가능한 composable.
 * 드롭다운, 툴팁, 팝오버 등에서 사용.
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useClickOutside } from '@/composables/useClickOutside'
 * 
 * const dropdownRef = ref(null)
 * const isOpen = ref(true)
 * 
 * useClickOutside(dropdownRef, () => {
 *   isOpen.value = false
 * }, { enabled: isOpen })
 * </script>
 * 
 * <template>
 *   <div v-if="isOpen" ref="dropdownRef">Dropdown Content</div>
 * </template>
 * ```
 */
import { onMounted, onUnmounted, unref, watch } from 'vue'

/**
 * @param {Ref<HTMLElement>} targetRef - 감시할 요소 ref
 * @param {Function} callback - 외부 클릭 시 실행할 콜백
 * @param {Object} options - 옵션
 * @param {Ref<boolean>|boolean} options.enabled - 활성화 상태 (기본: true)
 * @param {string[]} options.ignore - 무시할 선택자 목록
 */
export function useClickOutside(targetRef, callback, options = {}) {
    const { enabled = true, ignore = [] } = options

    const handleClick = (event) => {
        const el = unref(targetRef)
        const isEnabled = typeof enabled === 'object' ? unref(enabled) : enabled

        if (!isEnabled || !el) return

        // 무시할 요소 체크
        for (const selector of ignore) {
            if (event.target.closest(selector)) return
        }

        // 타겟 외부 클릭 시 콜백 실행
        if (!el.contains(event.target)) {
            callback(event)
        }
    }

    const handleEscape = (event) => {
        const isEnabled = typeof enabled === 'object' ? unref(enabled) : enabled
        if (!isEnabled) return

        if (event.key === 'Escape') {
            callback(event)
        }
    }

    onMounted(() => {
        // 이벤트 버블링을 위해 capture phase 사용
        document.addEventListener('click', handleClick, true)
        document.addEventListener('keydown', handleEscape)
    })

    onUnmounted(() => {
        document.removeEventListener('click', handleClick, true)
        document.removeEventListener('keydown', handleEscape)
    })
}
