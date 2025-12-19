/**
 * Collection Store
 *
 * 컬렉션(완성된 집)과 진행 중 드림홈 상태를 관리하는 Pinia 스토어.
 * 컴포넌트는 스토어 액션을 통해 API를 호출합니다.
 *
 * @module stores/collectionStore
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collectionService } from '@/api/services/collectionService'

export const useCollectionStore = defineStore('collection', () => {
  /** @type {import('vue').Ref<boolean>} 컬렉션 로딩 상태 */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string|null>} 에러 메시지 */
  const error = ref(null)

  /** @type {import('vue').Ref<Array>} 완성된 컬렉션 목록 */
  const collections = ref([])

  /** @type {import('vue').Ref<Object|null>} 진행 중 드림홈 요약 */
  const inProgress = ref(null)

  const normalizeCollectionItem = (item = {}) => {
    const collectionId = item.collectionId ?? item.id ?? item.collection_id
    const propertyName = item.propertyName ?? item.houseName ?? item.name ?? '드림홈'
    const themeCode = item.themeCode ?? item.theme ?? 'CLASSIC'
    return {
      ...item,
      collectionId,
      propertyName,
      themeCode
    }
  }

  const normalizeInProgress = (item = {}) => {
    const dreamHomeId = item.dreamHomeId ?? item.id ?? item.collectionId
    const propertyName = item.propertyName ?? item.houseName ?? item.name ?? '드림홈'
    const themeCode = item.themeCode ?? item.theme ?? 'CLASSIC'
    return {
      ...item,
      dreamHomeId,
      propertyName,
      themeCode
    }
  }

  /**
   * 완성된 컬렉션 목록 조회
   *
   * @returns {Promise<void>}
   */
  async function fetchCollections() {
    isLoading.value = true
    error.value = null

    try {
      const data = await collectionService.getCollections()
      collections.value = Array.isArray(data?.collections)
        ? data.collections.map(normalizeCollectionItem)
        : []
      inProgress.value = data?.inProgress ? normalizeInProgress(data.inProgress) : null
    } catch (err) {
      console.error('컬렉션 조회 실패:', err)
      error.value = err.response?.data?.message ?? '컬렉션을 불러올 수 없습니다'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 컬렉션 저축 여정 조회
   *
   * @param {number|string} collectionId
   * @returns {Promise<Object>}
   */
  async function fetchJourney(collectionId) {
    return collectionService.getJourney(collectionId)
  }

  /**
   * 진행 중 드림홈 여정 조회
   *
   * @returns {Promise<Object>}
   */
  async function fetchInProgressJourney() {
    return collectionService.getInProgressJourney()
  }

  return {
    isLoading,
    error,
    collections,
    inProgress,
    fetchCollections,
    fetchJourney,
    fetchInProgressJourney
  }
})
