import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Receipt Store - 영수증(지출) 데이터 관리
 * AI 관리인(레제)가 심문할 미처리 영수증을 관리합니다.
 */
export const useReceiptStore = defineStore('receipt', () => {
    // State
    const pendingReceipts = ref([
        {
            id: 1,
            merchantName: '치킨플러스',
            amount: 31000,
            category: '배달/식비',
            date: '2025.12.01',
            processed: false,
            timestamp: new Date('2025-12-01T18:30:00')
        }
        // 추가 Mock 데이터는 필요시 여기에 추가
    ])

    const processedReceipts = ref([])

    // Getters
    const getPendingCount = computed(() => {
        return pendingReceipts.value.filter(r => !r.processed).length
    })

    const totalPendingAmount = computed(() => {
        return pendingReceipts.value
            .filter(r => !r.processed)
            .reduce((sum, r) => sum + r.amount, 0)
    })

    const getLatestPendingReceipt = computed(() => {
        const unprocessed = pendingReceipts.value.filter(r => !r.processed)
        return unprocessed.length > 0 ? unprocessed[0] : null
    })

    // Actions
    const addReceipt = (receipt) => {
        pendingReceipts.value.push({
            ...receipt,
            id: Date.now(),
            processed: false,
            timestamp: new Date()
        })
    }

    const processReceipt = (receiptId, userResponse) => {
        const index = pendingReceipts.value.findIndex(r => r.id === receiptId)
        if (index !== -1) {
            const [receipt] = pendingReceipts.value.splice(index, 1)
            const processedReceipt = {
                ...receipt,
                processed: true,
                userResponse,
                processedAt: new Date()
            }
            processedReceipts.value.push(processedReceipt)
        }
    }

    const clearPendingReceipts = () => {
        const unprocessed = pendingReceipts.value
            .filter(r => !r.processed)
            .map(r => ({
                ...r,
                processed: true,
                processedAt: new Date()
            }))

        processedReceipts.value.push(...unprocessed)
        pendingReceipts.value = []
    }

    return {
        // State
        pendingReceipts,
        processedReceipts,

        // Getters
        getPendingCount,
        totalPendingAmount,
        getLatestPendingReceipt,

        // Actions
        addReceipt,
        processReceipt,
        clearPendingReceipts
    }
})
