import { ref, computed } from 'vue'

/**
 * 폼 검증 Composable
 */
export function useFormValidation() {
    const errors = ref({})

    /**
     * 이메일 검증
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            return '이메일을 입력해주세요'
        }
        if (!emailRegex.test(email)) {
            return '올바른 이메일 형식이 아닙니다'
        }
        return null
    }

    /**
     * 비밀번호 검증
     */
    function validatePassword(password, minLength = 6) {
        if (!password) {
            return '비밀번호를 입력해주세요'
        }
        if (password.length < minLength) {
            return `비밀번호는 최소 ${minLength}자 이상이어야 합니다`
        }
        return null
    }

    /**
     * 비밀번호 확인 검증
     */
    function validatePasswordConfirm(password, passwordConfirm) {
        if (!passwordConfirm) {
            return '비밀번호 확인을 입력해주세요'
        }
        if (password !== passwordConfirm) {
            return '비밀번호가 일치하지 않습니다'
        }
        return null
    }

    /**
     * 이름 검증
     */
    function validateName(name) {
        if (!name) {
            return '이름을 입력해주세요'
        }
        if (name.length < 2) {
            return '이름은 최소 2자 이상이어야 합니다'
        }
        return null
    }

    /**
     * 출생연도 검증
     */
    function validateBirthYear(birthYear) {
        const currentYear = new Date().getFullYear()
        const year = parseInt(birthYear)

        if (!birthYear) {
            return '출생연도를 입력해주세요'
        }
        if (isNaN(year)) {
            return '올바른 연도를 입력해주세요'
        }
        if (year < 1900 || year > currentYear) {
            return `출생연도는 1900년부터 ${currentYear}년 사이여야 합니다`
        }
        return null
    }

    /**
     * 필드 검증
     */
    function validateField(fieldName, value, validator) {
        const error = validator(value)
        if (error) {
            errors.value[fieldName] = error
        } else {
            delete errors.value[fieldName]
        }
        return !error
    }

    /**
     * 모든  에러 초기화
     */
    function clearErrors() {
        errors.value = {}
    }

    /**
     * 특정 필드 에러 초기화
     */
    function clearFieldError(fieldName) {
        delete errors.value[fieldName]
    }

    /**
     * 폼이 유효한지 확인
     */
    const isValid = computed(() => Object.keys(errors.value).length === 0)

    /**
     * 특정 필드에 에러가 있는지 확인
     */
    function hasError(fieldName) {
        return !!errors.value[fieldName]
    }

    /**
     * 특정 필드의 에러 메시지 가져오기
     */
    function getError(fieldName) {
        return errors.value[fieldName] || ''
    }

    return {
        errors,
        isValid,
        validateEmail,
        validatePassword,
        validatePasswordConfirm,
        validateName,
        validateBirthYear,
        validateField,
        clearErrors,
        clearFieldError,
        hasError,
        getError
    }
}
