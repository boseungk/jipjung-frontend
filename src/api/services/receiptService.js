/**
 * Receipt Service
 * 
 * 영수증/지출 관련 API 호출을 담당하는 서비스 레이어.
 * REST_API.md 명세에 따라 구현됨.
 * 
 * @module api/services/receiptService
 */

import apiClient from '@/api/client'
import { RECEIPT_ENDPOINTS } from '@/api/endpoints'

/**
 * @typedef {'pending' | 'processed' | 'all'} ReceiptStatus
 */

/**
 * @typedef {'REASONABLE' | 'WASTE'} AiJudgment
 */

/**
 * @typedef {Object} Receipt
 * @property {number} id - 영수증 ID
 * @property {string} merchantName - 가맹점명
 * @property {number} amount - 금액
 * @property {string} category - 카테고리
 * @property {string} date - 날짜
 * @property {boolean} processed - 처리 여부
 * @property {string|null} imageUrl - 이미지 URL
 * @property {string|null} userResponse - 사용자 변명
 * @property {AiJudgment|null} aiJudgment - AI 판단
 * @property {string} createdAt - 생성일
 */

/**
 * @typedef {Object} ReceiptListResponse
 * @property {Receipt[]} receipts - 영수증 목록
 * @property {number} total - 전체 개수
 * @property {number} pending - 미처리 개수
 * @property {number} processed - 처리 완료 개수
 */

/**
 * @typedef {Object} ReceiptAddRequest
 * @property {string} merchantName - 가맹점명
 * @property {number} amount - 금액
 * @property {string} category - 카테고리
 * @property {string} date - 날짜 (ISO 8601)
 */

/**
 * @typedef {Object} ReceiptProcessRequest
 * @property {string} userResponse - 사용자 변명
 * @property {AiJudgment} aiJudgment - AI 판단
 * @property {number} experienceGained - 획득 경험치
 */

export const receiptService = {
    /**
     * 영수증 목록 조회
     * 
     * @param {ReceiptStatus} [status='all'] - 상태 필터
     * @param {number} [page=1] - 페이지 번호
     * @param {number} [limit=20] - 페이지당 항목 수
     * @returns {Promise<ReceiptListResponse>} 영수증 목록 및 통계
     * 
     * @example
     * const result = await receiptService.getReceipts('pending')
     * console.log(result.pending) // 미처리 영수증 수
     */
    async getReceipts(status = 'all', page = 1, limit = 20) {
        const response = await apiClient.get(RECEIPT_ENDPOINTS.LIST, {
            params: { status, page, limit }
        })
        return response.data
    },

    /**
     * 영수증 추가
     * 
     * 이미지가 있는 경우 multipart/form-data로 전송합니다.
     * 
     * @param {ReceiptAddRequest} receiptData - 영수증 데이터
     * @param {File|null} [imageFile=null] - 영수증 이미지 파일
     * @returns {Promise<Receipt>} 생성된 영수증
     * 
     * @example
     * const receipt = await receiptService.addReceipt({
     *   merchantName: '스타벅스',
     *   amount: 4500,
     *   category: '카페/음료',
     *   date: '2025-12-02T14:20:00Z'
     * }, imageFile)
     */
    async addReceipt(receiptData, imageFile = null) {
        const formData = new FormData()

        // 기본 필드 추가
        Object.entries(receiptData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value))
            }
        })

        // 이미지 파일 추가
        if (imageFile) {
            formData.append('image', imageFile)
        }

        const response = await apiClient.post(RECEIPT_ENDPOINTS.LIST, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return response.data
    },

    /**
     * 영수증 처리 (AI 심문 완료)
     * 
     * 사용자의 변명과 AI 판단 결과를 저장하고,
     * 경험치를 부여합니다.
     * 
     * @param {number} receiptId - 영수증 ID
     * @param {string} userResponse - 사용자 변명
     * @param {AiJudgment} aiJudgment - AI 판단 결과
     * @param {number} experienceGained - 획득 경험치
     * @returns {Promise<Receipt>} 처리된 영수증
     * 
     * @example
     * const result = await receiptService.processReceipt(
     *   1,
     *   '회식이었어요. 팀 분위기도 좋아지고 필요한 지출이었습니다.',
     *   'REASONABLE',
     *   50
     * )
     */
    async processReceipt(receiptId, userResponse, aiJudgment, experienceGained) {
        const response = await apiClient.put(RECEIPT_ENDPOINTS.PROCESS(receiptId), {
            userResponse,
            aiJudgment,
            experienceGained
        })
        return response.data
    }
}
