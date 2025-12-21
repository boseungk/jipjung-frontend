/**
 * AI Manager Store (Pinia)
 * 
 * AI 관리인(레제) 대화 상태를 관리하는 중앙 저장소.
 * 지출 분석부터 판결까지의 전체 플로우를 추적합니다.
 * 
 * @module stores/aiManagerStore
 * 
 * @description
 * 상태 전이:
 * IDLE → ANALYZING → [EXTRACTING] → ANALYZED → JUDGING → JUDGED → IDLE
 *                        ↑              ↓
 *                        └── confirm ───┘
 * 
 * @see AI_MANAGER_FRONTEND_IMPLEMENTATION_PLAN.md
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { aiManagerService } from '@/api/services/aiManagerService'
import { useGamificationStore } from './gamificationStore'

/**
 * 상태 상수
 * @readonly
 */
export const AI_MANAGER_STATUS = Object.freeze({
    IDLE: 'IDLE',
    ANALYZING: 'ANALYZING',
    EXTRACTING: 'EXTRACTING',
    ANALYZED: 'ANALYZED',
    JUDGING: 'JUDGING',
    JUDGED: 'JUDGED'
})

/**
 * 입력 모드 상수
 * @readonly
 */
export const INPUT_MODE = Object.freeze({
    MANUAL: 'MANUAL',
    IMAGE: 'IMAGE'
})

/**
 * 기분 라벨 매핑 (백엔드 mood → 한글 라벨)
 * @readonly
 */
const MOOD_LABELS = Object.freeze({
    NORMAL: '보통',
    ANGRY: '화남',
    HAPPY: '기쁨',
    STRICT: '엄격',
    CURIOUS: '호기심',
    CONFUSED: '혼란',
    ANNOYED: '짜증'
})

/**
 * 기분-이미지 매핑 (mood → 이미지 파일명)
 * @readonly
 */
const MOOD_IMAGE_MAP = Object.freeze({
    NORMAL: 'normal.webp',
    ANGRY: 'upset.webp',
    HAPPY: 'curious.webp',
    STRICT: 'strict.webp',
    CURIOUS: 'curious.webp',
    CONFUSED: 'confuse.webp',
    ANNOYED: 'upset.webp'
})

export const useAiManagerStore = defineStore('aiManager', () => {
    // =========================================================================
    // State
    // =========================================================================

    /** 현재 대화 ID */
    const conversationId = ref(null)

    /** 
     * 현재 상태
     * @type {import('vue').Ref<string>}
     */
    const status = ref(AI_MANAGER_STATUS.IDLE)

    /** 입력 모드 ('MANUAL' | 'IMAGE') */
    const inputMode = ref(null)

    // --- 이미지 추출 관련 (IMAGE 모드) ---
    /** 추출 상태 (COMPLETE | PARTIAL | FAILED) */
    const extractionStatus = ref(null)
    /** 추출된 데이터 */
    const extractedData = ref(null)
    /** 누락된 필드 목록 */
    const missingFields = ref([])

    // --- 분석 결과 (ANALYZED 상태) ---
    /** 영수증 정보 */
    const receiptInfo = ref(null)
    /** AI 페르소나 (mood, moodLabel, script) */
    const persona = ref(null)
    /** 변명 선택지 배열 */
    const suggestedExcuses = ref([])

    // --- 판결 결과 (JUDGED 상태) ---
    const judgmentResult = ref(null)

    // --- 히스토리 ---
    const history = ref([])

    // --- UI 상태 ---
    const actionLoading = ref(false) // 분석/확인/판결 등 주요 액션 로딩
    const actionType = ref(null) // 'analyze' | 'image' | 'confirm' | 'judgment'
    const historyLoading = ref(false)
    const error = ref(null)
    const historyError = ref(null)

    // =========================================================================
    // Getters (Computed)
    // =========================================================================

    const isIdle = computed(() => status.value === AI_MANAGER_STATUS.IDLE)
    const isExtracting = computed(() => status.value === AI_MANAGER_STATUS.EXTRACTING)
    const isAnalyzed = computed(() => status.value === AI_MANAGER_STATUS.ANALYZED)
    const isJudged = computed(() => status.value === AI_MANAGER_STATUS.JUDGED)
    const hasMissingFields = computed(() => missingFields.value.length > 0)

    /** 현재 레제의 대사 (채팅 버블용) */
    const currentScript = computed(() => persona.value?.script ?? '')

    /** 현재 레제의 기분 (이미지 변경용) */
    const currentMood = computed(() => persona.value?.mood ?? 'NORMAL')

    /** 현재 레제의 기분 라벨 */
    const currentMoodLabel = computed(() => persona.value?.moodLabel ?? '보통')

    /** 현재 레제의 감정 이미지 URL */
    const currentMoodImageUrl = computed(() => {
        const mood = currentMood.value
        const filename = MOOD_IMAGE_MAP[mood] ?? 'normal.webp'
        return new URL(`../assets/images/characters/${filename}`, import.meta.url).href
    })

    /** 주요 액션 로딩 여부 (오버레이 노출용) */
    const isOverlayLoading = computed(() => actionLoading.value)

    /** 오버레이 타입 (로딩 메시지 제어) */
    const overlayType = computed(() => {
        switch (actionType.value) {
            case 'image':
                return 'image'
            case 'confirm':
                return 'confirming'
            case 'judgment':
                return 'judging'
            default:
                return 'analyzing'
        }
    })

    /** 변명 제출 등 액션 버튼 비활성화용 로딩 상태 */
    const isActionLoading = computed(() => actionLoading.value)

    /** 히스토리 전용 로딩/에러 */
    const isHistoryLoading = computed(() => historyLoading.value)

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * API 결과에서 공통 상태 업데이트
     * @private
     */
    const updateFromAnalyzeResult = (result) => {
        conversationId.value = result.conversationId
        status.value = result.status
        receiptInfo.value = result.receiptInfo
        persona.value = result.persona
        suggestedExcuses.value = result.suggestedExcuses ?? []
    }

    /**
     * 에러 메시지 추출
     * @private
     */
    const extractErrorMessage = (e, defaultMsg) => {
        return e.response?.data?.message ?? e.message ?? defaultMsg
    }

    // =========================================================================
    // Actions
    // =========================================================================

    /**
     * 전체 상태 초기화 (새 대화 시작)
     */
    const resetConversation = () => {
        conversationId.value = null
        status.value = AI_MANAGER_STATUS.IDLE
        inputMode.value = null
        extractionStatus.value = null
        extractedData.value = null
        missingFields.value = []
        receiptInfo.value = null
        persona.value = null
        suggestedExcuses.value = []
        judgmentResult.value = null
        error.value = null
        historyError.value = null
        actionType.value = null
        actionLoading.value = false
        historyLoading.value = false
    }

    /**
     * 수기 입력 분석 요청
     * 
     * @param {Object} formData - 입력 폼 데이터
     * @returns {Promise<Object>} 분석 결과
     */
    const analyzeManual = async (formData) => {
        try {
            actionLoading.value = true
            actionType.value = 'analyze'
            error.value = null
            inputMode.value = INPUT_MODE.MANUAL
            status.value = AI_MANAGER_STATUS.ANALYZING

            const result = await aiManagerService.analyzeManual(formData)

            updateFromAnalyzeResult(result)

            return result
        } catch (e) {
            error.value = extractErrorMessage(e, '분석 중 오류가 발생했습니다')
            status.value = AI_MANAGER_STATUS.IDLE
            throw e
        } finally {
            actionLoading.value = false
            actionType.value = null
        }
    }

    /**
     * 이미지 분석 요청
     * 
     * @param {File} imageFile - 영수증 이미지 파일
     * @returns {Promise<Object>} 분석/추출 결과
     */
    const analyzeImage = async (imageFile) => {
        try {
            actionLoading.value = true
            actionType.value = 'image'
            error.value = null
            inputMode.value = INPUT_MODE.IMAGE
            status.value = AI_MANAGER_STATUS.ANALYZING

            const result = await aiManagerService.analyzeImage(imageFile)

            // IMAGE 모드는 EXTRACTING 상태로 전환
            conversationId.value = result.conversationId
            status.value = result.status
            extractionStatus.value = result.extractionStatus
            extractedData.value = result.extractedData
            missingFields.value = result.missingFields ?? []
            persona.value = result.persona

            return result
        } catch (e) {
            error.value = extractErrorMessage(e, '이미지 분석 중 오류가 발생했습니다')
            status.value = AI_MANAGER_STATUS.IDLE
            throw e
        } finally {
            actionLoading.value = false
            actionType.value = null
        }
    }

    /**
     * 추출 데이터 확인 (IMAGE 모드 2단계)
     * 
     * @param {Object} confirmedData - 확인/수정된 데이터
     * @returns {Promise<Object>} 분석 결과
     */
    const confirmExtraction = async (confirmedData) => {
        const previousStatus = status.value
        try {
            actionLoading.value = true
            actionType.value = 'confirm'
            error.value = null

            const result = await aiManagerService.confirmExtraction({
                conversationId: conversationId.value,
                ...confirmedData
            })

            updateFromAnalyzeResult(result)

            return result
        } catch (e) {
            error.value = extractErrorMessage(e, '확인 중 오류가 발생했습니다')
            status.value = previousStatus // 실패 시 이전 상태로 복원
            throw e
        } finally {
            actionLoading.value = false
            actionType.value = null
        }
    }

    /**
     * 판결 요청
     * 
     * @param {string} selectedExcuseId - 선택한 변명 ID
     * @param {string} [customExcuse=''] - 직접 입력 변명
     * @returns {Promise<Object>} 판결 결과
     */
    const submitJudgment = async (selectedExcuseId, customExcuse = '') => {
        const previousStatus = status.value
        try {
            actionLoading.value = true
            actionType.value = 'judgment'
            error.value = null
            status.value = AI_MANAGER_STATUS.JUDGING

            const result = await aiManagerService.submitJudgment({
                conversationId: conversationId.value,
                selectedExcuseId,
                customExcuse
            })

            // 상태 업데이트
            status.value = AI_MANAGER_STATUS.JUDGED
            judgmentResult.value = result

            // 경험치/레벨 반영 (백엔드 응답에서)
            if (result.growth) {
                const gamificationStore = useGamificationStore()
                gamificationStore.applyJudgmentGrowth(result.growth)
            }

            // 판결 후 character 정보를 persona로 변환
            if (result.character) {
                persona.value = {
                    mood: result.character.mood,
                    moodLabel: MOOD_LABELS[result.character.mood] ?? '보통',
                    script: result.character.script
                }
            }

            return result
        } catch (e) {
            error.value = extractErrorMessage(e, '판결 중 오류가 발생했습니다')
            status.value = previousStatus // 실패 시 이전 상태로 복원
            throw e
        } finally {
            actionLoading.value = false
            actionType.value = null
        }
    }

    /**
     * 히스토리 조회
     * 
     * @param {number} [limit=10] - 조회 개수
     * @returns {Promise<Array>} 히스토리 목록
     */
    const fetchHistory = async (limit = 10) => {
        try {
            historyLoading.value = true
            historyError.value = null
            const result = await aiManagerService.getHistory(limit)
            history.value = result ?? []
            return history.value
        } catch (e) {
            historyError.value = extractErrorMessage(e, '내역 조회 중 오류가 발생했습니다')
            throw e
        } finally {
            historyLoading.value = false
        }
    }

    /**
     * 에러 상태 초기화
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * 히스토리 에러 초기화
     */
    const clearHistoryError = () => {
        historyError.value = null
    }

    // =========================================================================
    // Return
    // =========================================================================
    return {
        // State
        conversationId,
        status,
        inputMode,
        extractionStatus,
        extractedData,
        missingFields,
        receiptInfo,
        persona,
        suggestedExcuses,
        judgmentResult,
        history,
        error,
        historyError,

        // Getters
        isIdle,
        isExtracting,
        isAnalyzed,
        isJudged,
        hasMissingFields,
        currentScript,
        currentMood,
        currentMoodLabel,
        currentMoodImageUrl,
        isOverlayLoading,
        overlayType,
        isActionLoading,
        isHistoryLoading,

        // Actions
        resetConversation,
        analyzeManual,
        analyzeImage,
        confirmExtraction,
        submitJudgment,
        fetchHistory,
        clearError,
        clearHistoryError
    }
})
