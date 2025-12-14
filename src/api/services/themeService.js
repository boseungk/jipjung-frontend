/**
 * Theme Service
 * 
 * 테마 관련 API 호출을 담당하는 서비스 레이어.
 * 드림홈 설정 모달에서 테마 선택 UI에 사용됩니다.
 * 
 * @module api/services/themeService
 */

import apiClient from '@/api/client'
import { THEME_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} HouseTheme
 * @property {number} themeId - 테마 고유 ID
 * @property {string} themeCode - 테마 코드 (MODERN, HANOK, CASTLE 등)
 * @property {string} themeName - 테마 표시명 (모던 하우스, 한옥, 서양 성 등)
 * @property {string|null} previewImageUrl - 테마 미리보기 이미지 URL (없으면 null)
 */

export const themeService = {
    /**
     * 활성 테마 목록 조회
     * 
     * 드림홈 설정 시 선택할 수 있는 테마 목록을 조회합니다.
     * 
     * @호출부 DreamHomeSetModal.vue
     * @returns {Promise<HouseTheme[]>} 테마 목록
     * @throws {ApiError} 인증 필요(401)
     * 
     * @example
     * const themes = await themeService.getActiveThemes()
     * // [{ themeId: 1, themeCode: 'MODERN', themeName: '모던 하우스' }, ...]
     */
    async getActiveThemes() {
        const response = await apiClient.get(THEME_ENDPOINTS.LIST)
        return response.data.data
    }
}
