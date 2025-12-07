/**
 * API Error Types
 * 백엔드 에러 응답을 프론트엔드에서 일관되게 처리하기 위한 커스텀 에러 클래스
 */

/**
 * API 요청 실패 시 발생하는 에러
 * @extends Error
 */
export class ApiError extends Error {
    /**
     * @param {string} message - 에러 메시지
     * @param {number} status - HTTP 상태 코드
     * @param {string} [code] - 에러 코드 (백엔드에서 제공)
     * @param {Object} [data] - 추가 에러 데이터
     */
    constructor(message, status, code = null, data = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.data = data
    }

    /**
     * 인증 관련 에러인지 확인
     * @returns {boolean}
     */
    isAuthError() {
        return this.status === 401
    }

    /**
     * 권한 부족 에러인지 확인
     * @returns {boolean}
     */
    isForbidden() {
        return this.status === 403
    }

    /**
     * 리소스 없음 에러인지 확인
     * @returns {boolean}
     */
    isNotFound() {
        return this.status === 404
    }

    /**
     * 서버 에러인지 확인
     * @returns {boolean}
     */
    isServerError() {
        return this.status >= 500
    }

    /**
     * 유효성 검증 에러인지 확인
     * @returns {boolean}
     */
    isValidationError() {
        return this.status === 400
    }
}

/**
 * 네트워크 연결 실패 에러
 * @extends Error
 */
export class NetworkError extends Error {
    constructor(message = '네트워크 연결을 확인해주세요.') {
        super(message)
        this.name = 'NetworkError'
    }
}

/**
 * 요청 타임아웃 에러
 * @extends Error
 */
export class TimeoutError extends Error {
    constructor(message = '요청 시간이 초과되었습니다. 다시 시도해주세요.') {
        super(message)
        this.name = 'TimeoutError'
    }
}

/**
 * Axios 에러를 커스텀 에러로 변환
 * @param {import('axios').AxiosError} error - Axios 에러 객체
 * @returns {ApiError | NetworkError | TimeoutError}
 */
export function transformAxiosError(error) {
    // 응답이 있는 경우 (4xx, 5xx 에러)
    if (error.response) {
        const { status, data } = error.response
        const message = data?.message || data?.error?.message || getDefaultErrorMessage(status)
        const code = data?.error?.code || null

        return new ApiError(message, status, code, data)
    }

    // 요청이 전송되었지만 응답이 없는 경우
    if (error.request) {
        if (error.code === 'ECONNABORTED') {
            return new TimeoutError()
        }
        return new NetworkError()
    }

    // 요청 설정 중 에러 발생
    return new ApiError(error.message, 0, 'REQUEST_ERROR')
}

/**
 * HTTP 상태 코드에 따른 기본 에러 메시지
 * @param {number} status - HTTP 상태 코드
 * @returns {string}
 */
function getDefaultErrorMessage(status) {
    const messages = {
        400: '잘못된 요청입니다.',
        401: '인증이 필요합니다.',
        403: '접근 권한이 없습니다.',
        404: '요청한 리소스를 찾을 수 없습니다.',
        409: '요청이 현재 상태와 충돌합니다.',
        422: '요청을 처리할 수 없습니다.',
        429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        500: '서버 오류가 발생했습니다.',
        502: '서버에 연결할 수 없습니다.',
        503: '서비스를 일시적으로 사용할 수 없습니다.',
        504: '서버 응답 시간이 초과되었습니다.'
    }

    return messages[status] || '알 수 없는 오류가 발생했습니다.'
}
