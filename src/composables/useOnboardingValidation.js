/**
 * Onboarding Validation Composable
 * 
 * Centralized validation logic for all onboarding steps.
 * Eliminates duplication between parent and child components.
 */

import { computed } from 'vue'
import { VALIDATION } from '@/constants/onboardingConstants'

/**
 * Provides validation logic for onboarding flow
 * 
 * @param {Ref<Object>} onboardingData - Reactive onboarding data object
 * @param {Ref<number>} currentStep - Current step number (1-4)
 * @returns {Object} Validation methods and computed properties
 */
export function useOnboardingValidation(onboardingData, currentStep) {
    /**
     * Check if user can proceed to next step
     */
    const canProceed = computed(() => {
        if (!onboardingData.value || !currentStep.value) return false

        switch (currentStep.value) {
            case 1:
                return validateBirthYear(onboardingData.value.birthYear)
            case 2:
                return validateIncome(onboardingData.value.annualIncome)
            case 3:
                return validateLoan(onboardingData.value.existingLoanMonthly) &&
                    validateAssets(onboardingData.value.currentAssets)
            case 4:
                return validateAreas(onboardingData.value.preferredAreas)
            default:
                return false
        }
    })

    /**
     * Validate birth year
     * @param {number} year - Birth year
     * @returns {boolean} True if valid
     */
    function validateBirthYear(year) {
        if (!year) return false
        return year >= VALIDATION.BIRTH_YEAR.MIN &&
            year <= VALIDATION.BIRTH_YEAR.MAX
    }

    /**
     * Get birth year error message
     * @param {number} year - Birth year
     * @returns {string} Error message or empty string
     */
    function getBirthYearError(year) {
        if (!year) return ''
        if (year < VALIDATION.BIRTH_YEAR.MIN || year > VALIDATION.BIRTH_YEAR.MAX) {
            return VALIDATION.BIRTH_YEAR.ERROR_MESSAGE
        }
        return ''
    }

    /**
     * Validate annual income
     * @param {number} income - Annual income in 만원
     * @returns {boolean} True if valid
     */
    function validateIncome(income) {
        if (income === null || income === undefined) return false
        return income >= VALIDATION.ANNUAL_INCOME.MIN &&
            income <= VALIDATION.ANNUAL_INCOME.MAX
    }

    /**
     * Validate existing loan amount
     * @param {number} loan - Monthly loan payment in 만원
     * @returns {boolean} True if valid (0 is valid)
     */
    function validateLoan(loan) {
        if (loan === null || loan === undefined) return false
        return loan >= VALIDATION.EXISTING_LOAN.MIN &&
            loan <= VALIDATION.EXISTING_LOAN.MAX
    }

    /**
     * Validate current assets
     * @param {number} assets - Current assets in 만원
     * @returns {boolean} True if valid (0 is valid)
     */
    function validateAssets(assets) {
        if (assets === null || assets === undefined) return true // Allow undefined for backwards compat
        return assets >= VALIDATION.CURRENT_ASSETS.MIN &&
            assets <= VALIDATION.CURRENT_ASSETS.MAX
    }

    /**
     * Validate preferred areas
     * @param {Array} areas - Array of {sido, sigungu} objects
     * @returns {boolean} True if valid
     */
    function validateAreas(areas) {
        if (!Array.isArray(areas)) return false
        return areas.length >= VALIDATION.PREFERRED_AREAS.MIN &&
            areas.length <= VALIDATION.PREFERRED_AREAS.MAX
    }

    /**
     * Get areas error/success message
     * @param {Array} areas - Array of area objects
     * @returns {string} Message or empty string
     */
    function getAreasMessage(areas) {
        if (!Array.isArray(areas) || areas.length === 0) {
            return VALIDATION.PREFERRED_AREAS.ERROR_MIN
        }
        if (areas.length >= VALIDATION.PREFERRED_AREAS.MAX) {
            return VALIDATION.PREFERRED_AREAS.SUCCESS_MAX
        }
        return ''
    }

    return {
        // Computed
        canProceed,

        // Validation methods
        validateBirthYear,
        validateIncome,
        validateLoan,
        validateAssets,
        validateAreas,

        // Error message helpers
        getBirthYearError,
        getAreasMessage
    }
}
