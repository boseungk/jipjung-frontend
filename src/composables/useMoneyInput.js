import { ref, computed, watch } from 'vue'

/**
 * useMoneyInput composable
 * 
 * 금액 입력 필드에 세자리 콤마 포맷팅을 제공하는 composable.
 * 
 * @param {Ref<number|null>} modelValue - 실제 숫자 값 (v-model 바인딩용)
 * @returns {Object} - displayValue, handleInput, handleBlur, handleFocus
 * 
 * @example
 * ```vue
 * <template>
 *   <input
 *     type="text"
 *     inputmode="numeric"
 *     :value="displayValue"
 *     @input="handleInput"
 *     @blur="handleBlur"
 *     @focus="handleFocus"
 *   />
 * </template>
 * 
 * <script setup>
 * import { useMoneyInput } from '@/composables/useMoneyInput'
 * 
 * const amount = ref(null)
 * const { displayValue, handleInput, handleBlur, handleFocus } = useMoneyInput(amount)
 * </script>
 * ```
 */
export function useMoneyInput(modelValue, options = {}) {
    const {
        min = 0,
        max = Number.MAX_SAFE_INTEGER,
        allowEmpty = true
    } = options

    // 편집 중인지 여부
    const isEditing = ref(false)

    /**
     * 숫자를 콤마가 포함된 문자열로 변환
     */
    const formatWithCommas = (value) => {
        if (value === null || value === undefined || value === '') return ''
        const num = Number(value)
        if (isNaN(num)) return ''
        return num.toLocaleString('ko-KR')
    }

    /**
     * 콤마가 포함된 문자열에서 숫자만 추출
     */
    const parseNumber = (str) => {
        if (!str || str === '') return null
        // 숫자와 소수점만 남기고 제거
        const cleaned = String(str).replace(/[^\d]/g, '')
        if (cleaned === '') return null
        const num = parseInt(cleaned, 10)
        return isNaN(num) ? null : num
    }

    /**
     * 화면에 표시되는 값
     * - 편집 중이 아닐 때: 콤마 포맷팅된 값
     * - 편집 중일 때: 콤마 포맷팅된 값 (입력 시에도 실시간 포맷팅)
     */
    const displayValue = computed(() => {
        if (modelValue.value === null || modelValue.value === undefined) return ''
        return formatWithCommas(modelValue.value)
    })

    /**
     * 사용자 입력 처리
     */
    const handleInput = (event) => {
        const inputValue = event.target.value
        const parsed = parseNumber(inputValue)

        // 빈 값 허용
        if (parsed === null && allowEmpty) {
            modelValue.value = null
            return
        }

        // 범위 제한
        if (parsed !== null) {
            let clampedValue = parsed
            if (parsed < min) clampedValue = min
            if (parsed > max) clampedValue = max
            modelValue.value = clampedValue

            // 입력 중에도 콤마 포맷팅 적용 (커서 위치 유지 시도)
            const cursorPos = event.target.selectionStart
            const oldLength = inputValue.length
            const newValue = formatWithCommas(clampedValue)
            const newLength = newValue.length

            // 다음 틱에서 커서 위치 조정
            requestAnimationFrame(() => {
                if (event.target) {
                    event.target.value = newValue
                    // 커서 위치 조정 (콤마 추가로 인한 위치 변경 보정)
                    const diff = newLength - oldLength
                    const newPos = Math.max(0, cursorPos + diff)
                    event.target.setSelectionRange(newPos, newPos)
                }
            })
        }
    }

    /**
     * 포커스 아웃 시 처리
     */
    const handleBlur = (event) => {
        isEditing.value = false
        // 포맷팅된 값으로 표시
        if (event.target) {
            event.target.value = displayValue.value
        }
    }

    /**
     * 포커스 시 처리
     */
    const handleFocus = (event) => {
        isEditing.value = true
        // 포커스 시 전체 선택
        if (event.target) {
            event.target.select()
        }
    }

    return {
        displayValue,
        handleInput,
        handleBlur,
        handleFocus,
        isEditing,
        formatWithCommas,
        parseNumber
    }
}
