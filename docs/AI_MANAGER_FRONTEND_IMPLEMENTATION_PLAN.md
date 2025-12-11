# AI Manager 프론트엔드 연동 구현 계획서

> **문서 버전:** 1.3  
> **작성일:** 2025-12-11  
> **상태:** 코드 리뷰 피드백 반영 완료  
> **목적:** 백엔드 AI Manager API와 프론트엔드 연동 + UI/UX 전면 개편

---

## 목차

1. [현황 분석](#1-현황-분석)
2. [목표 및 범위](#2-목표-및-범위)
3. [아키텍처](#3-아키텍처)
4. [API 계약서](#4-api-계약서)
5. [파일 변경 목록](#5-파일-변경-목록)
6. [상세 구현 명세](#6-상세-구현-명세)
7. [UI/UX 설계](#7-uiux-설계)
8. [구현 순서](#8-구현-순서)
9. [테스트 계획](#9-테스트-계획)
10. [리스크 및 고려사항](#10-리스크-및-고려사항)
11. [자체 검토 결과](#11-자체-검토-결과)

---

## 1. 현황 분석

### 1.1 현재 프론트엔드 구조

| 파일 | 현재 상태 | 문제점 |
|------|----------|--------|
| `AiManagerView.vue` | 730줄, Mock 데이터 | `receiptStore` 하드코딩 데이터 사용, 실제 API 미연동 |
| `receiptStore.js` | Mock Store | 로컬 상태만 관리, API 호출 없음 |
| `receiptService.js` | 구 API 스펙 | `/receipts` 엔드포인트 기준, 현재 백엔드와 불일치 |
| `endpoints.js` | AI Manager 없음 | `/ai-manager/*` 엔드포인트 정의 누락 |

### 1.2 현재 `AiManagerView.vue` 분석

```javascript
// 현재 코드 문제점
const quickReplyChips = [
  { id: 1, emoji: '😢', text: '스트레스 비용' },
  // ... 하드코딩된 변명 선택지
]

// Mock 응답 로직
if (text.includes('스트레스')) {
  aiResponse = '스트레스? 너 스트레스 받으면...'
}
```

**문제점:**
1. AI 응답이 프론트엔드에서 하드코딩됨
2. 백엔드 Gemini 호출 결과를 사용하지 않음
3. 경험치 변화가 실제 DB에 반영되지 않음
4. 이미지 분석(IMAGE 모드) 지원 없음

### 1.3 백엔드 API 현황 (구현 완료)

| 엔드포인트 | HTTP | 설명 |
|-----------|------|------|
| `/api/ai-manager/analyze` | POST | MANUAL/IMAGE 모드 분석 |
| `/api/ai-manager/confirm` | POST | IMAGE 모드 추출 확인 |
| `/api/ai-manager/judgment` | POST | 최종 판결 + 경험치 처리 |
| `/api/ai-manager/history` | GET | 분석 내역 조회 |

---

## 2. 목표 및 범위

### 2.1 핵심 목표

| # | 목표 | 우선순위 |
|---|------|---------|
| 1 | 실제 백엔드 API 연동 | P0 (필수) |
| 2 | MANUAL/IMAGE 입력 모드 지원 | P0 (필수) |
| 3 | IMAGE 모드 추출 확인 플로우 | P0 (필수) |
| 4 | 분석 히스토리 조회 | P1 (권장) |
| 5 | 로딩 애니메이션 | P1 (권장) |
| 6 | 레제 캐릭터 애니메이션 | P3 (나중에) |

### 2.2 범위 외 (Out of Scope)

- 영수증 이미지 GCS 업로드/보관
- 원본 추출값 vs 확정값 비교 기능
- 푸시 알림
- 오프라인 모드

---

## 3. 아키텍처

### 3.1 컴포넌트 의존성

```
AiManagerView.vue (Page)
├── SpendingInputModal.vue     (통합 입력 모달 - 메인) [변경]
│   ├── InputModeSelector        (입력 모드 선택 - Step 1)
│   ├── ManualInputForm          (수기 입력 폼 - Step 2a)
│   ├── ImageUploader            (이미지 업로드 - Step 2b)
│   └── ImageExtractConfirm      (추출 확인 폼 - Step 3)
├── ChatBubble.vue            (채팅 버블)
├── ExcuseSelector.vue        (변명 선택)
├── JudgmentResult.vue        (판결 결과)
├── LoadingOverlay.vue        (로딩 애니메이션)
└── HistoryList.vue           (히스토리)
```

### 3.2 데이터 플로우

```
[User Action] → [aiManagerStore Action] → [aiManagerService API Call]
                        ↓
               [Store State Update]
                        ↓
              [Component Re-render]
```

### 3.3 상태 관리

```javascript
// aiManagerStore 상태 전이
IDLE → ANALYZING → EXTRACTING → ANALYZED → JUDGING → JUDGED → IDLE
                       ↑              ↓
                       └── confirm ───┘
```

---

## 4. API 계약서

### 4.1 POST /api/ai-manager/analyze (MANUAL)

**요청:**
```json
{
  "inputMode": "MANUAL",
  "amount": 31000,
  "storeName": "치킨플러스",
  "category": "FOOD",
  "paymentDate": "2025-12-10",
  "memo": "야식"
}
```

**응답 (200 OK):**
```json
{
  "code": 200,
  "message": "레제가 지출을 분석했습니다.",
  "data": {
    "conversationId": 501,
    "status": "ANALYZED",
    "extractionStatus": null,
    "extractedData": null,
    "missingFields": null,
    "receiptInfo": {
      "amount": 31000,
      "storeName": "치킨플러스",
      "categoryLabel": "식비",
      "paymentDate": "2025-12-10"
    },
    "persona": {
      "mood": "STRICT",
      "moodLabel": "매우 엄격함",
      "script": "야, 3만원 넘게? 치킨플러스에서? 진심이야?"
    },
    "suggestedExcuses": [
      {"id": "STRESS", "text": "스트레스 비용", "type": "DEFENSE"},
      {"id": "NEED", "text": "단백질 보충", "type": "DEFENSE"},
      {"id": "ADMIT", "text": "인정합니다", "type": "GIVE_UP"}
    ]
  }
}
```

### 4.2 POST /api/ai-manager/analyze (IMAGE)

**요청:** `multipart/form-data`
- `request`: `{"inputMode": "IMAGE"}` (JSON)
- `image`: 영수증 파일 (jpg/png/webp)

**응답 (COMPLETE):**
```json
{
  "data": {
    "conversationId": 502,
    "status": "EXTRACTING",
    "extractionStatus": "COMPLETE",
    "extractedData": {
      "amount": 31000,
      "storeName": "치킨플러스 강남점",
      "category": "FOOD",
      "paymentDate": "2025-12-10"
    },
    "missingFields": null,
    "persona": {
      "mood": "CURIOUS",
      "moodLabel": "호기심",
      "script": "오, 영수증 찍어왔네? 어디 한번 볼까..."
    }
  }
}
```

**응답 (PARTIAL):**
```json
{
  "data": {
    "extractionStatus": "PARTIAL",
    "extractedData": {
      "amount": 31000,
      "storeName": null,
      "category": "FOOD",
      "paymentDate": null
    },
    "missingFields": ["storeName", "paymentDate"],
    "persona": {
      "mood": "CONFUSED",
      "script": "음... 글씨가 잘 안 보이네. 가게 이름이랑 날짜 좀 알려줘."
    }
  }
}
```

**응답 (FAILED):**
```json
{
  "data": {
    "extractionStatus": "FAILED",
    "extractedData": null,
    "missingFields": ["amount", "storeName", "category", "paymentDate"],
    "persona": {
      "mood": "ANNOYED",
      "script": "이게 영수증이야? 아무것도 안 보이는데. 직접 쓰던가."
    }
  }
}
```

### 4.3 POST /api/ai-manager/confirm

**요청:**
```json
{
  "conversationId": 502,
  "amount": 31000,
  "storeName": "치킨플러스 강남점",
  "category": "FOOD",
  "paymentDate": "2025-12-10",
  "memo": ""
}
```

**응답:** MANUAL analyze 응답과 동일 구조 (status=ANALYZED)

### 4.4 POST /api/ai-manager/judgment

**요청:**
```json
{
  "conversationId": 501,
  "selectedExcuseId": "STRESS",
  "customExcuse": ""
}
```

**응답 (REASONABLE):**
```json
{
  "data": {
    "judgment": {
      "result": "REASONABLE",
      "score": 85,
      "comment": "스트레스 받아서 먹은 거라니 이번만 봐준다."
    },
    "growth": {
      "resultType": "SUCCESS",
      "expChange": 50,
      "currentExp": 1250,
      "maxExp": 2000,
      "level": 5,
      "levelLabel": "1층 골조 공사",
      "isLevelUp": false,
      "warning": null
    },
    "character": {
      "mood": "NORMAL",
      "script": "알았어, 먹고 힘내서 돈이나 더 벌어와.",
      "animation": "NOD"
    }
  }
}
```

**응답 (WASTE):**
```json
{
  "data": {
    "judgment": {
      "result": "WASTE",
      "score": 15,
      "comment": "핑계가 너무 구차해."
    },
    "growth": {
      "resultType": "FAIL",
      "expChange": -30,
      "currentExp": 1220,
      "maxExp": 2000,
      "level": 5,
      "levelLabel": "1층 골조 공사",
      "isLevelUp": false,
      "warning": "공사가 지연되고 있습니다!"
    },
    "character": {
      "mood": "ANGRY",
      "script": "내 집이 늦게 지어지는 소리가 들리네?",
      "animation": "SHOUT"
    }
  }
}
```

### 4.5 GET /api/ai-manager/history

**요청:** `GET /api/ai-manager/history?limit=10`

**응답:**
```json
{
  "data": [
    {
      "conversationId": 501,
      "receiptInfo": {
        "amount": 31000,
        "storeName": "치킨플러스",
        "category": "FOOD",
        "categoryLabel": "식비",
        "date": "2025-12-04"
      },
      "judgmentResult": "REASONABLE",
      "judgmentScore": 85,
      "expChange": 50,
      "status": "JUDGED",
      "createdAt": "2025-12-04T20:30:00"
    }
  ]
}
```

---

## 5. 파일 변경 목록

### 5.1 신규 파일 (8개)

| # | 파일 경로 | 설명 | 예상 LOC |
|---|----------|------|---------|
| 1 | `src/api/services/aiManagerService.js` | API 호출 서비스 | ~80 |
| 2 | `src/stores/aiManagerStore.js` | Pinia 상태 관리 | ~220 |
| 3 | `src/constants/spendingCategories.js` | 카테고리 상수 | ~15 |
| 4 | `src/components/ai/SpendingInputModal.vue` | **통합 입력 모달 (메인)** | ~350 |
| 5 | `src/components/ai/ExcuseSelector.vue` | 변명 선택 | ~100 |
| 6 | `src/components/ai/JudgmentResult.vue` | 판결 결과 | ~150 |
| 7 | `src/components/ai/LoadingOverlay.vue` | 로딩 애니메이션 | ~80 |
| 8 | `src/components/ai/HistoryList.vue` | 히스토리 리스트 | ~120 |

> **설계 결정**: 입력 관련 4개 컴포넌트를 `SpendingInputModal` 1개로 통합  
> (모달 내부 Step 1~3 전환 방식)

### 5.2 수정 파일 (2개)

| # | 파일 경로 | 변경 내용 |
|---|----------|----------|
| 1 | `src/api/endpoints.js` | AI_MANAGER_ENDPOINTS 추가 |
| 2 | `src/views/AiManagerView.vue` | 전면 리팩토링 |

### 5.3 삭제 파일 (2개)

| # | 파일 경로 | 사유 |
|---|----------|------|
| 1 | `src/stores/receiptStore.js` | aiManagerStore로 대체 |
| 2 | `src/api/services/receiptService.js` | aiManagerService로 대체 |

---

## 6. 상세 구현 명세

### 6.1 endpoints.js 추가

```javascript
/**
 * AI 매니저 관련 엔드포인트
 */
export const AI_MANAGER_ENDPOINTS = {
    ANALYZE: '/ai-manager/analyze',
    CONFIRM: '/ai-manager/confirm',
    JUDGMENT: '/ai-manager/judgment',
    HISTORY: '/ai-manager/history'
}
```

### 6.2 spendingCategories.js

```javascript
/**
 * 지출 카테고리 상수
 * 백엔드 SpendingCategory enum과 동기화
 */
export const SPENDING_CATEGORIES = [
    { value: 'FOOD', label: '식비', emoji: '🍽️' },
    { value: 'TRANSPORT', label: '교통비', emoji: '🚌' },
    { value: 'SHOPPING', label: '쇼핑', emoji: '🛍️' },
    { value: 'ENTERTAINMENT', label: '여가/문화', emoji: '🎬' },
    { value: 'LIVING', label: '생활비', emoji: '🏠' },
    { value: 'ETC', label: '기타', emoji: '📦' }
]

/**
 * 카테고리 value로 label 조회
 */
export const getCategoryLabel = (value) => {
    const category = SPENDING_CATEGORIES.find(c => c.value === value)
    return category ? category.label : value
}

/**
 * 카테고리 value로 emoji 조회
 */
export const getCategoryEmoji = (value) => {
    const category = SPENDING_CATEGORIES.find(c => c.value === value)
    return category ? category.emoji : '📦'
}
```

### 6.3 aiManagerService.js

> **주의**: 서비스는 `response.data.data`를 반환하여 스토어에서 바로 사용 가능하게 함.  
> `apiClient` baseURL이 `/api`이므로 엔드포인트는 `/ai-manager/*`만 정의.

```javascript
/**
 * AI Manager API Service
 * 
 * 백엔드 /api/ai-manager/* 엔드포인트와 통신
 * 
 * [중요] apiClient.baseURL = '/api' 이므로,
 *         AI_MANAGER_ENDPOINTS는 '/ai-manager/*' 형식 사용
 * 
 * 반환값: response.data.data (ApiResponse.data 필드)
 */
import apiClient from '@/api/client'
import { AI_MANAGER_ENDPOINTS } from '@/api/endpoints'

export const aiManagerService = {
    /**
     * 수기 입력 분석 (MANUAL 모드)
     * 
     * @param {Object} data
     * @param {number} data.amount - 금액
     * @param {string} data.storeName - 가게명
     * @param {string} data.category - 카테고리 (FOOD, TRANSPORT 등)
     * @param {string} data.paymentDate - 결제일 (YYYY-MM-DD)
     * @param {string} [data.memo] - 메모
     * @returns {Promise<SpendingAnalyzeResponse>}
     */
    async analyzeManual(data) {
        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.ANALYZE, {
            inputMode: 'MANUAL',
            amount: data.amount,
            storeName: data.storeName,
            category: data.category,
            paymentDate: data.paymentDate,
            memo: data.memo || ''
        })
        // ApiResponse { code, message, data } 에서 data만 반환
        return response.data.data
    },

    /**
     * 이미지 분석 (IMAGE 모드)
     * 
     * @param {File} imageFile - 영수증 이미지 파일
     * @returns {Promise<SpendingAnalyzeResponse>}
     */
    async analyzeImage(imageFile) {
        const formData = new FormData()
        
        // JSON part
        const requestBlob = new Blob(
            [JSON.stringify({ inputMode: 'IMAGE' })],
            { type: 'application/json' }
        )
        formData.append('request', requestBlob)
        
        // Image part
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
     * @param {Object} data
     * @param {number} data.conversationId - 대화 ID
     * @param {number} data.amount - 금액
     * @param {string} data.storeName - 가게명
     * @param {string} data.category - 카테고리
     * @param {string} data.paymentDate - 결제일
     * @param {string} [data.memo] - 메모
     * @returns {Promise<SpendingAnalyzeResponse>}
     */
    async confirmExtraction(data) {
        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.CONFIRM, data)
        return response.data.data
    },

    /**
     * 최종 판결 요청
     * 
     * @param {Object} data
     * @param {number} data.conversationId - 대화 ID
     * @param {string} data.selectedExcuseId - 선택한 변명 ID
     * @param {string} [data.customExcuse] - 직접 입력 변명
     * @returns {Promise<JudgmentResponse>}
     */
    async submitJudgment(data) {
        const response = await apiClient.post(AI_MANAGER_ENDPOINTS.JUDGMENT, data)
        return response.data.data
    },

    /**
     * 분석 내역 조회
     * 
     * @param {number} [limit=10] - 조회 개수 (최대 50)
     * @returns {Promise<AiHistoryResponse[]>}
     */
    async getHistory(limit = 10) {
        const response = await apiClient.get(AI_MANAGER_ENDPOINTS.HISTORY, {
            params: { limit }
        })
        return response.data.data // AiHistoryResponse[]
    }
}
```

### 6.4 aiManagerStore.js (핵심)

```javascript
/**
 * AI Manager Store (Pinia)
 * 
 * AI 대화 상태를 관리하는 중앙 저장소
 * 
 * 상태 전이:
 * IDLE → ANALYZING → [EXTRACTING] → ANALYZED → JUDGING → JUDGED → IDLE
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { aiManagerService } from '@/api/services/aiManagerService'

export const useAiManagerStore = defineStore('aiManager', () => {
    // =========================================================================
    // State
    // =========================================================================
    
    /** 현재 대화 ID */
    const conversationId = ref(null)
    
    /** 
     * 현재 상태
     * - IDLE: 대기 중 (입력 모드 선택 화면)
     * - ANALYZING: AI 분석 중 (로딩)
     * - EXTRACTING: 이미지 추출 완료, 확인 대기
     * - ANALYZED: 분석 완료, 변명 선택 대기
     * - JUDGING: 판결 중 (로딩)
     * - JUDGED: 판결 완료, 결과 표시
     */
    const status = ref('IDLE')
    
    /** 입력 모드 ('MANUAL' | 'IMAGE') */
    const inputMode = ref(null)
    
    // --- 추출 관련 (IMAGE 모드) ---
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
    const isLoading = ref(false)
    const error = ref(null)

    // =========================================================================
    // Getters
    // =========================================================================
    
    const isIdle = computed(() => status.value === 'IDLE')
    const isExtracting = computed(() => status.value === 'EXTRACTING')
    const isAnalyzed = computed(() => status.value === 'ANALYZED')
    const isJudged = computed(() => status.value === 'JUDGED')
    const hasMissingFields = computed(() => missingFields.value.length > 0)
    
    /** 현재 레제의 대사 (채팅 버블용) */
    const currentScript = computed(() => persona.value?.script || '')
    
    /** 현재 레제의 기분 (이미지 변경용) */
    const currentMood = computed(() => persona.value?.mood || 'NORMAL')

    // =========================================================================
    // Actions
    // =========================================================================
    
    /**
     * 전체 상태 초기화 (새 대화 시작)
     */
    const resetConversation = () => {
        conversationId.value = null
        status.value = 'IDLE'
        inputMode.value = null
        extractionStatus.value = null
        extractedData.value = null
        missingFields.value = []
        receiptInfo.value = null
        persona.value = null
        suggestedExcuses.value = []
        judgmentResult.value = null
        error.value = null
    }

    /**
     * 수기 입력 분석 요청
     */
    const analyzeManual = async (formData) => {
        try {
            isLoading.value = true
            error.value = null
            inputMode.value = 'MANUAL'
            status.value = 'ANALYZING'

            // 서비스가 response.data.data를 반환하므로 바로 사용
            const result = await aiManagerService.analyzeManual(formData)

            // 상태 업데이트
            conversationId.value = result.conversationId
            status.value = result.status // 'ANALYZED'
            receiptInfo.value = result.receiptInfo
            persona.value = result.persona
            suggestedExcuses.value = result.suggestedExcuses || []

            return result
        } catch (e) {
            error.value = e.response?.data?.message || '분석 중 오류가 발생했습니다'
            status.value = 'IDLE'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 이미지 분석 요청
     */
    const analyzeImage = async (imageFile) => {
        try {
            isLoading.value = true
            error.value = null
            inputMode.value = 'IMAGE'
            status.value = 'ANALYZING'

            // 서비스가 response.data.data를 반환하므로 바로 사용
            const result = await aiManagerService.analyzeImage(imageFile)

            // 상태 업데이트
            conversationId.value = result.conversationId
            status.value = result.status // 'EXTRACTING'
            extractionStatus.value = result.extractionStatus
            extractedData.value = result.extractedData
            missingFields.value = result.missingFields || []
            persona.value = result.persona

            return result
        } catch (e) {
            error.value = e.response?.data?.message || '이미지 분석 중 오류가 발생했습니다'
            status.value = 'IDLE'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 추출 데이터 확인 (IMAGE 모드 2단계)
     */
    const confirmExtraction = async (confirmedData) => {
        const previousStatus = status.value // 실패 시 복원용
        try {
            isLoading.value = true
            error.value = null

            // 서비스가 response.data.data를 반환하므로 바로 사용
            const result = await aiManagerService.confirmExtraction({
                conversationId: conversationId.value,
                ...confirmedData
            })

            // 상태 업데이트
            status.value = result.status // 'ANALYZED'
            receiptInfo.value = result.receiptInfo
            persona.value = result.persona
            suggestedExcuses.value = result.suggestedExcuses || []

            return result
        } catch (e) {
            error.value = e.response?.data?.message || '확인 중 오류가 발생했습니다'
            status.value = previousStatus // 실패 시 이전 상태로 복원
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 판결 요청
     */
    const submitJudgment = async (selectedExcuseId, customExcuse = '') => {
        const previousStatus = status.value
        try {
            isLoading.value = true
            error.value = null
            status.value = 'JUDGING'

            // 서비스가 response.data.data를 반환하므로 바로 사용
            const result = await aiManagerService.submitJudgment({
                conversationId: conversationId.value,
                selectedExcuseId,
                customExcuse
            })

            // 상태 업데이트
            status.value = 'JUDGED'
            judgmentResult.value = result
            
            // 판결 후 character 정보를 persona로 변환
            // 백엔드 character에는 mood, script, animation이 있음
            // moodLabel은 백엔드에서 제공하지 않으므로 MOOD_LABELS 맵 사용
            const MOOD_LABELS = {
                NORMAL: '보통',
                ANGRY: '화남',
                HAPPY: '기쁨',
                STRICT: '엄격',
                CURIOUS: '호기심',
                CONFUSED: '혼란',
                ANNOYED: '짜증'
            }
            persona.value = {
                mood: result.character?.mood,
                moodLabel: MOOD_LABELS[result.character?.mood] || '보통',
                script: result.character?.script
            }

            return result
        } catch (e) {
            error.value = e.response?.data?.message || '판결 중 오류가 발생했습니다'
            status.value = previousStatus // 실패 시 이전 상태로 복원
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 히스토리 조회
     * 
     * 판결 후 납관적 추가 대신 서버 재조회 방식 사용 (데이터 일관성)
     */
    const fetchHistory = async (limit = 10) => {
        try {
            isLoading.value = true
            // 서비스가 response.data.data를 반환하므로 바로 사용
            const result = await aiManagerService.getHistory(limit)
            history.value = result || []
            return history.value
        } catch (e) {
            error.value = e.response?.data?.message || '내역 조회 중 오류가 발생했습니다'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // =========================================================================
    // Return
    // =========================================================================
    return {
        // State
        conversationId, status, inputMode,
        extractionStatus, extractedData, missingFields,
        receiptInfo, persona, suggestedExcuses,
        judgmentResult, history,
        isLoading, error,

        // Getters
        isIdle, isExtracting, isAnalyzed, isJudged,
        hasMissingFields, currentScript, currentMood,

        // Actions
        resetConversation, analyzeManual, analyzeImage,
        confirmExtraction, submitJudgment, fetchHistory
    }
})
```

---

## 7. UI/UX 설계

### 7.1 화면 상태별 레이아웃

#### 상태 1: 기본 화면 (IDLE) - 사이드바 클릭 시 모달 트리거

```
┌─────────────────────────────────────────────────────────┐
│  [사이드바]          │  [메인 영역 - 채팅 UI]           │
│                      │                                   │
│  레제 이미지 (정적)    │   ┌─────────────────────────┐    │
│  상태: 대기 중       │   │ 레제: 손님~ 오늘 지출   │    │
│                      │   │ 검토할 거 있어?        │    │
│  ───────────────     │   └─────────────────────────┘    │
│                      │                                   │
│  ┌────────────────┐  │                                   │
│  │ 클릭하여 지출   │  │                                   │
│  │ 등록하기       │  │                                   │
│  │              │  │                                   │
│  │   + 영수증     │  │                                   │
│  └────────────────┘  │                                   │
│   ^👆 클릭 시 모달 오픈  │                                   │
└─────────────────────────────────────────────────────────┘
```

#### 상태 1-1: 통합 입력 모달 - Step 1: 모드 선택 (SpendingInputModal)

```
╭─────────────────────────────────────────────╮
│                                             │
│  ←  지출 등록하기                             │
│                                             │
│  지출을 어떻게 입력할까요?                   │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │   📷 영수증 촬영하기                    │  │
│  │   카메라로 영수증을 촬영해요         │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │   ✏️ 수기로 입력하기                    │  │
│  │   직접 지출 정보를 입력해요         │  │
│  └─────────────────────────────────────┘  │
│                                             │
╯─────────────────────────────────────────────╯
```

#### 상태 1-2: 통합 입력 모달 - Step 2a: 수기 입력 폼

```
╭─────────────────────────────────────────────╮
│                                             │
│  ←  수기 입력                                 │
│                                             │
│  금액 *                                     │
│  ┌─────────────────────────────────────┐  │
│  │ 31,000                              │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  가게명 *                                   │
│  ┌─────────────────────────────────────┐  │
│  │ 치킨플러스                           │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  카테고리 *                                  │
│  [🍽️식비] [🚌교통] [🛍쇼핑] [🎬여가] ...     │
│                                             │
│  결제일 *                                   │
│  ┌─────────────────────────────────────┐  │
│  │ 2025-12-10                          │  │
│  └─────────────────────────────────────┘  │
│                                             │
│           [분석 요청하기 →]                   │
╯─────────────────────────────────────────────╯
```

#### 상태 1-3: 통합 입력 모달 - Step 3: 이미지 추출 확인

```
╭─────────────────────────────────────────────╮
│                                             │
│  ←  추출 결과 확인                             │
│                                             │
│  💬 "오, 영수증 찍어왔네? 어디 보자..."   │
│                                             │
│  ── 추출 결과 ──                              │
│  금액:     ₩31,000          [수정]        │
│  가게명:   치킨플러스 강남점    [수정]        │
│  카테고리: 식비              [수정]        │
│  결제일:   2025-12-10      [수정]        │
│                                             │
│  ⚠️ 누락: 결제일 (직접 입력 필요)            │
│                                             │
│           [확인하고 분석 진행]                  │
╯─────────────────────────────────────────────╯
```

#### 상태 2: 분석 완료 / 변명 선택 (ANALYZED) - 메인 화면

> **Note**: 모달 닫히고 메인 페이지 채팅 UI로 전환

```
┌─────────────────────────────────────────────────────────┐
│  [사이드바]          │  [채팅 영역]                      │
│                      │                                   │
│  레제 이미지         │   ┌─────────────────────────┐    │
│  상태: 매우 엄격함   │   │ 레제: 야, 3만원 넘게?   │    │
│                      │   │ 치킨플러스에서? 진심?   │    │
│  ───────────────     │   └─────────────────────────┘    │
│                      │                                   │
│  RECEIPT INFO        │   ── 변명을 선택하세요 ──        │
│  ₩31,000             │                                   │
│  치킨플러스          │   [😢 스트레스 비용]              │
│  식비                │   [🍖 단백질 보충]                │
│  2025-12-10         │   [🏳️ 인정합니다]                 │
│                      │                                   │
│                      │   또는 직접 입력:                 │
│                      │   ┌───────────────────────────┐  │
│                      │   │                           │  │
│                      │   └───────────────────────────┘  │
│                      │                                   │
│                      │   [판결 받기 →]                   │
└─────────────────────────────────────────────────────────┘
```

#### 상태 5: 판결 결과 (JUDGED)

```
┌─────────────────────────────────────────────────────────┐
│  [사이드바]          │  [결과 화면]                      │
│                      │                                   │
│  레제 이미지         │   🎉 합리적 소비!                 │
│  상태: 보통          │   점수: 85점                      │
│                      │                                   │
│                      │   "스트레스 받아서 먹은 거라니    │
│                      │    이번만 봐준다."                │
│                      │                                   │
│                      │   ┌─────────────────────────┐    │
│                      │   │  +50 EXP                 │    │
│                      │   │  ████████░░░░ Lv.5      │    │
│                      │   │  1250 / 2000            │    │
│                      │   │  1층 골조 공사          │    │
│                      │   └─────────────────────────┘    │
│                      │                                   │
│                      │   [새로운 지출 등록]  [내역 보기] │
└─────────────────────────────────────────────────────────┘
```

### 7.2 반응형 설계

| 화면 너비 | 레이아웃 |
|----------|---------|
| >= 768px | 사이드바(30%) + 메인(70%) 그리드 |
| < 768px | 단일 컬럼, 사이드바 상단 배치 |

### 7.3 로딩 애니메이션 (LoadingOverlay)

**트리거 조건:** `aiManagerStore.isLoading === true`

**레이아웃:**
```
┌─────────────────────────────────────────────────────────┐
│                    [반투명 오버레이]                     │
│                                                         │
│              ┌─────────────────────┐                  │
│              │                     │                  │
│              │   🔍  (회전 애니)   │                  │
│              │                     │                  │
│              └─────────────────────┘                  │
│                                                         │
│                "증거 확보 중..."                        │
│                                                         │
│         (상황별 메시지 번갈아 표시)                     │
│         - 영수증 살펴보는 중...                        │
│         - 금액 확인 중...                            │
│         - 어디 보자...                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**CSS 애니메이션:**
```css
/* 돋보기 회전 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 매직감 🎩 - 폄짝폄짝 느낌 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-icon {
  animation: spin 1.5s linear infinite;
  font-size: 48px;
}

.loading-text {
  animation: bounce 1s ease-in-out infinite;
}
```

**상황별 메시지:**
| 상황 | 메시지 |
|------|--------|
| ANALYZING (IMAGE) | "영수증 살펴보는 중..." |
| ANALYZING (MANUAL) | "지출 분석 중..." |
| confirm 호출 | "준비 중..." |
| JUDGING | "판결 내리는 중..." |

---

## 8. 구현 순서

### Phase 1: 기반 구조 (Day 1)

| # | 작업 | 담당 파일 |
|---|------|----------|
| 1.1 | endpoints.js에 AI_MANAGER_ENDPOINTS 추가 | endpoints.js |
| 1.2 | spendingCategories.js 상수 파일 생성 | 신규 |
| 1.3 | aiManagerService.js 생성 | 신규 |
| 1.4 | aiManagerStore.js 생성 | 신규 |

### Phase 2: 컴포넌트 개발 (Day 2)

| # | 작업 | 담당 파일 |
|---|------|----------|
| 2.1 | **SpendingInputModal.vue** 생성 (통합 모달) | 신규 |
| 2.2 | ExcuseSelector.vue 생성 | 신규 |
| 2.3 | LoadingOverlay.vue 생성 | 신규 |

### Phase 3: 결과 컴포넌트 (Day 3)

| # | 작업 | 담당 파일 |
|---|------|----------|
| 3.1 | JudgmentResult.vue 생성 | 신규 |
| 3.2 | HistoryList.vue 생성 | 신규 |

### Phase 4: 페이지 통합 (Day 4)

| # | 작업 | 담당 파일 |
|---|------|----------|
| 4.1 | AiManagerView.vue 전면 리팩토링 | 기존 파일 |
| 4.2 | receiptStore.js 삭제 | 삭제 |
| 4.3 | receiptService.js 삭제 | 삭제 |

### Phase 5: 테스트 및 마무리 (Day 5)

| # | 작업 |
|---|------|
| 5.1 | MANUAL 모드 E2E 테스트 |
| 5.2 | IMAGE 모드 E2E 테스트 |
| 5.3 | 에러 케이스 테스트 |
| 5.4 | 반응형 UI 테스트 |

---

## 9. 테스트 계획

### 9.1 단위 테스트

| 테스트 대상 | 테스트 케이스 |
|------------|--------------|
| aiManagerService | API 호출 성공/실패, multipart 업로드 |
| aiManagerStore | 상태 전이 정확성, **에러 시 상태 복원** |
| SpendingInputModal | 유효성 검증, 스텝 전환 |

### 9.2 E2E 테스트 시나리오

| # | 시나리오 | 검증 포인트 |
|---|----------|------------|
| 1 | MANUAL: 입력 → 분석 → 변명 → 판결 | 경험치 변화, UI 상태 전이 |
| 2 | IMAGE (COMPLETE): 업로드 → 확인 → 분석 → 판결 | 추출 데이터 폼 채움 |
| 3 | IMAGE (PARTIAL): 업로드 → 누락 필드 입력 → 확인 | 누락 필드 하이라이트 |
| 4 | IMAGE (FAILED): 업로드 → 빈 폼 → 수기 입력 | 전체 필드 입력 필요 |
| 5 | 네트워크 에러 (500) | 에러 메시지 + 재시도 버튼 |
| 6 | 히스토리 조회 | 최근 내역 리스트 |
| 7 | **업로드 용량 초과** | 파일 크기 제한 안내 |
| 8 | **잘못된 이미지 형식** | 지원 형식 안내 (jpg/png/webp) |
| 9 | **인증 만료 (401)** | 로그인 페이지 리다이렉트 |
| 10 | **confirm 실패 후 재시도** | EXTRACTING 상태 유지, 에러 표시 |

### 9.3 에러 케이스

| HTTP | 상황 | 프론트 처리 |
|------|------|------------|
| 400 | 필수 필드 누락 | 폼 유효성 에러 표시 |
| 400 | 잘못된 카테고리 | "유효하지 않은 카테고리" 토스트 |
| 400 | 잘못된 대화 상태 | "해당 대화는 진행할 수 없습니다" |
| 401 | 인증 만료 | 로그인 페이지 리다이렉트 |
| 404 | 대화 없음 | "대화를 찾을 수 없습니다" |
| 500 | AI 서비스 오류 | "잠시 후 다시 시도" + 재시도 버튼 |

---

## 10. 리스크 및 고려사항

### 10.1 기술적 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| Gemini API 지연 (2~5초) | UX 저하 | 로딩 애니메이션 + 상태 메시지 |
| 이미지 추출 실패율 | 사용자 재시도 필요 | FAILED → 수기 입력 안내 |
| 대용량 이미지 업로드 | 타임아웃 | 클라이언트 리사이징 고려 |

### 10.2 UX 고려사항

| 사항 | 현재 계획 | 대안 |
|------|----------|------|
| 히스토리 표시 위치 | 같은 페이지 하단 | 별도 탭/페이지 분리 |
| 레제 이미지 변화 | 정적 이미지 | 기분별 이미지 교체 |
| 입력 폼 유효성 | 제출 시 검증 | 실시간 검증 |

### 10.3 향후 개선 가능 사항

1. **원본 추출값 보존**: 백엔드 `extracted_*` 컬럼 추가 후 비교 UI
2. **이미지 저장**: GCS 업로드 + URL 보관
3. **푸시 알림**: 분석 완료 시 알림
4. **통계 대시보드**: 월별 합리/낭비 비율

---

## 11. 자체 검토 결과

### 11.1 검토 체크리스트

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | API 계약서 완전성 | ✅ | 모든 엔드포인트 커버 |
| 2 | 상태 전이 명확성 | ✅ | IDLE → JUDGED 플로우 정의 |
| 3 | 에러 처리 정의 | ✅ | HTTP 코드별 처리 방안 |
| 4 | 컴포넌트 분리 | ✅ | 재사용 가능한 단위로 분리 |
| 5 | 구현 순서 논리성 | ✅ | 의존성 순서대로 배치 |
| 6 | 테스트 시나리오 | ✅ | 주요 플로우 + 에러 케이스 |

### 11.2 사용자 피드백 반영 (v1.2)

| # | 피드백 | 적용 내용 |
|---|--------|----------|
| 1 | 입력 모드 선택을 모달로 | ✅ 사이드바 영수증 영역 클릭 → 모달 팝업 |
| 2 | 수기 입력/이미지 확인도 모달 안에서 | ✅ **`SpendingInputModal`로 통합 (스텝 방식)** |
| 3 | 레제 이미지는 정적으로 | ✅ 캐릭터 애니메이션을 P3로 연기 |
| 4 | 로딩 애니메이션 추가 | ✅ `LoadingOverlay.vue` + CSS 애니메이션 |

### 11.3 코드 리뷰 피드백 반영 (v1.3)

| # | 지적 사항 | 수정 내용 |
|---|----------|----------|
| 1 | 서비스 반환/소비 불일치 | ✅ 서비스에서 `response.data.data` 반환하도록 수정 |
| 2 | 엔드포인트 prefix 모호 | ✅ `apiClient.baseURL = '/api'` 명시, 엔드포인트는 `/ai-manager/*` |
| 3 | 파일 인벤토리 불일치 | ✅ **신규 8개**로 수정 (통합 반영) |
| 4 | 상태/에러 처리 누락 | ✅ confirm/judgment 실패 시 `previousStatus`로 복원 |
| 5 | 판결 후 persona 매핑 | ✅ 모든 mood에 대한 `MOOD_LABELS` 맵 추가 |
| 6 | 테스트 범위 갭 | ✅ 업로드 용량/형식, 401, confirm 재시도 테스트 추가 |

### 11.4 최종 결정 사항

| 항목 | 결정 | 비고 |
|------|------|------|
| 입력 전체 플로우 | **통합 모달 (SpendingInputModal)** | Step 1~3 내부 전환 |
| 레제 캐릭터 이미지 | **정적** | 나중에 구현 (P3) |
| 로딩 애니메이션 | **돋보기 회전 + 메시지** | CSS animation |
| 히스토리 | **같은 페이지 하단 + 서버 재조회** | 낙관적 추가 X |

### 11.5 결론

- **구현 가능성**: 높음 (기존 패턴 활용)
- **예상 공수**: 5일 (1인 기준)
- **신규 파일 수**: 8개
- **핵심 변경**: 입력 4개 컴포넌트 → `SpendingInputModal` 1개로 통합

---

> **다음 단계**: 리뷰 완료 후 Phase 1 구현 시작


