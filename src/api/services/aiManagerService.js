/**
 * AI Manager API Service
 * 
 * 백엔드 /api/ai-manager/* 엔드포인트와 통신하는 서비스 레이어.
 * 레제(AI 관리인) 지출 분석 및 판결 기능을 제공합니다.
 * 
 * @module api/services/aiManagerService
 * 
 * @description
 * - apiClient.baseURL = '/api' 이므로 엔드포인트는 '/ai-manager/*' 형식
 * - 모든 메서드는 response.data.data를 반환 (ApiResponse.data 필드)
 * 
 * @see AI_MANAGER_FRONTEND_IMPLEMENTATION_PLAN.md
 */

import apiClient from '@/api/client'
import { AI_MANAGER_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {Object} ManualAnalyzeData
 * @property {number} amount - 금액
 * @property {string} storeName - 가게명
 * @property {string} category - 카테고리 (FOOD, TRANSPORT 등)
 * @property {string} paymentDate - 결제일 (YYYY-MM-DD)
 * @property {string} [memo] - 메모 (선택)
 */

/**
 * @typedef {Object} ConfirmData
 * @property {number} conversationId - 대화 ID
 * @property {number} amount - 금액
 * @property {string} storeName - 가게명
 * @property {string} category - 카테고리
 * @property {string} paymentDate - 결제일
 * @property {string} [memo] - 메모
 */

/**
 * @typedef {Object} JudgmentData
 * @property {number} conversationId - 대화 ID
 * @property {string} selectedExcuseId - 선택한 변명 ID
 * @property {string} [customExcuse] - 직접 입력 변명
 */

/**
 * @typedef {Object} SpendingAnalyzeResponse
 * @property {number} conversationId - 대화 ID
 * @property {string} status - 상태 (EXTRACTING | ANALYZED)
 * @property {string|null} extractionStatus - 추출 상태 (COMPLETE | PARTIAL | FAILED)
 * @property {Object|null} extractedData - 추출된 데이터
 * @property {string[]|null} missingFields - 누락된 필드 목록
 * @property {Object} receiptInfo - 영수증 정보
 * @property {Object} persona - AI 페르소나 (mood, moodLabel, script)
 * @property {Array} suggestedExcuses - 변명 선택지
 */

/**
 * @typedef {Object} JudgmentResponse
 * @property {Object} judgment - 판결 결과 (result, score, comment)
 * @property {Object} growth - 성장 정보 (expChange, currentExp, level 등)
 * @property {Object} character - 캐릭터 반응 (mood, script, animation)
 */

export const aiManagerService = {
    /**
     * 수기 입력 분석 요청 (MANUAL 모드)
     * 
     * @param {ManualAnalyzeData} data - 수기 입력 데이터
     * @returns {Promise<SpendingAnalyzeResponse>}
     * @throws {ApiError} 유효성 검증 실패(400), 인증 실패(401)
     * 
     * @example
     * const result = await aiManagerService.analyzeManual({
     *   amount: 31000,
     *   storeName: '치킨플러스',
     *   category: 'FOOD',
     *   paymentDate: '2025-12-10'
     * })
     */
    async analyzeManual(data) {
        const payload = {
            inputMode: 'MANUAL',
            amount: data.amount,
            storeName: data.storeName,
            category: data.category,
            paymentDate: data.paymentDate,
            memo: data.memo || ''
        }

        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.ANALYZE, payload)
        return response.data.data
    },

    /**
     * 이미지 분석 요청 (IMAGE 모드)
     * 
     * 영수증 이미지를 multipart/form-data로 전송하여 AI 분석 요청
     * 
     * @param {File} imageFile - 영수증 이미지 파일 (jpg/png/webp)
     * @returns {Promise<SpendingAnalyzeResponse>}
     * @throws {ApiError} 파일 형식 오류(400), 인증 실패(401), AI 오류(500)
     * 
     * @example
     * const file = event.target.files[0]
     * const result = await aiManagerService.analyzeImage(file)
     */
    async analyzeImage(imageFile) {
        const formData = new FormData()

        // JSON request part
        const requestBlob = new Blob(
            [JSON.stringify({ inputMode: 'IMAGE' })],
            { type: 'application/json' }
        )
        formData.append('request', requestBlob)

        // Image file part
        formData.append('image', imageFile)

        const response = await apiClient.post(
            AI_MANAGER_ENDPOINTS.ANALYZE,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return response.data.data
    },

    /**
     * 추출 데이터 확인 (IMAGE 모드 2단계)
     * 
     * 이미지에서 추출된 데이터를 사용자가 확인/수정 후 분석 진행
     * 
     * @param {ConfirmData} data - 확인된 데이터
     * @returns {Promise<SpendingAnalyzeResponse>}
     * @throws {ApiError} 대화 없음(404), 잘못된 상태(400)
     */
    async confirmExtraction(data) {
        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.CONFIRM, data)
        return response.data.data
    },

    /**
     * 최종 판결 요청
     * 
     * 사용자가 선택한 변명에 대해 AI가 판결을 내리고 경험치 반영
     * 
     * @param {JudgmentData} data - 판결 요청 데이터
     * @returns {Promise<JudgmentResponse>}
     * @throws {ApiError} 대화 없음(404), 잘못된 상태(400)
     * 
     * @example
     * const result = await aiManagerService.submitJudgment({
     *   conversationId: 501,
     *   selectedExcuseId: 'STRESS'
     * })
     */
    async submitJudgment(data) {
        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.JUDGMENT, data)
        return response.data.data
    },

    /**
     * 분석 내역 조회
     * 
     * @param {number} [limit=10] - 조회 개수 (최대 50)
     * @returns {Promise<Array>} 분석 내역 배열
     * @throws {ApiError} 인증 실패(401)
     */
    async getHistory(limit = 10) {
        const response = await apiClient.get(AI_MANAGER_ENDPOINTS.HISTORY, {
            params: { limit }
        })
        return response.data.data
    }
}
