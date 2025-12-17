/**
 * Onboarding Flow Constants
 * 
 * Centralized validation rules, boundaries, and configuration
 * for the multi-step onboarding process.
 */

/**
 * Validation rules for each onboarding step
 */
export const VALIDATION = {
    /**
     * Step 1: Birth Year
     */
    BIRTH_YEAR: {
        MIN: 1900,
        MAX: new Date().getFullYear(),
        get ERROR_MESSAGE() {
            return `1900년부터 ${this.MAX}년 사이의 연도를 입력해주세요`
        }
    },

    /**
     * Step 2: Annual Income (in 만원)
     */
    ANNUAL_INCOME: {
        MIN: 2000,           // 2천만원
        MAX: 10000,          // 1억원
        DEFAULT: 5000,       // 5천만원
        STEP: 100,           // 100만원 단위
        LABEL_MIN: '2천만원',
        LABEL_MAX: '1억원'
    },

    /**
     * Step 3: Existing Loan Monthly Payment (in 만원)
     */
    EXISTING_LOAN: {
        MIN: 0,
        MAX: 1000,           // 1천만원
        DEFAULT: 0,
        QUICK_AMOUNTS: [0, 30, 50, 100, 150],
        QUICK_LABELS: {
            0: '없음',
            30: '30만원',
            50: '50만원',
            100: '100만원',
            150: '150만원'
        }
    },

    /**
     * Step 4: Preferred Areas
     */
    PREFERRED_AREAS: {
        MIN: 1,
        MAX: 3,
        ERROR_MIN: '최소 1개 지역을 선택해주세요',
        ERROR_MAX: '최대 3개 지역까지 선택 가능합니다',
        SUCCESS_MAX: '최대 3개 지역까지 선택하셨습니다'
    },

    /**
     * Current Assets (in 만원)
     */
    CURRENT_ASSETS: {
        MIN: 0,
        MAX: 100000,         // 100억원
        DEFAULT: 0,
        STEP: 100,           // 100만원 단위
        QUICK_AMOUNTS: [0, 1000, 3000, 5000, 10000],
        QUICK_LABELS: {
            0: '없음',
            1000: '1천만원',
            3000: '3천만원',
            5000: '5천만원',
            10000: '1억원'
        }
    }
}

/**
 * Total number of onboarding steps
 */
export const TOTAL_STEPS = 4

/**
 * Step titles and descriptions
 */
export const STEP_CONTENT = {
    1: {
        title: '출생연도를 입력해주세요',
        description: '연령대에 맞는 맞춤 정보를 제공해드립니다',
        icon: 'Calendar'
    },
    2: {
        title: '연소득을 알려주세요',
        description: '정확한 대출 한도 계산을 위해 필요합니다',
        icon: 'CurrencyCircleDollar'
    },
    3: {
        title: '재정 상황을 알려주세요',
        description: '대출 한도 분석을 위해 필요합니다',
        icon: 'FileText'
    },
    4: {
        title: '희망 지역을 선택하세요',
        description: '최대 3곳까지 선택 가능합니다',
        icon: 'MapPin'
    }
}

/**
 * Onboarding completion messages
 */
export const MESSAGES = {
    WELCOME: '환영합니다!',
    INTRO: '시작하기 전에 몇 가지 정보를 알려주세요',
    SUBMIT_ERROR: '온보딩 정보 저장에 실패했습니다. 다시 시도해주세요.',
    SUBMIT_SUCCESS: '환영합니다! 지금 바로 시작해볼까요?',
    LOADING: '저장 중...',
    START: '시작하기',
    NEXT: '다음',
    PREV: '이전'
}

/**
 * Format income value for display
 * @param {number} value - Income in 만원
 * @returns {string} Formatted string
 */
export function formatIncome(value) {
    const incomeBillion = value / 10000
    if (incomeBillion >= 1) {
        return `${incomeBillion.toFixed(2)}억원`
    } else {
        return `${value.toLocaleString()}만원`
    }
}

/**
 * Calculate slider fill percentage
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Percentage (0-100)
 */
export function calculateSliderFillPercent(value, min, max) {
    return ((value - min) / (max - min)) * 100
}
