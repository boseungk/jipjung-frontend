/**
 * User Service
 * 
 * 사용자 관련 API 호출 (프로필, 인테리어 상태 동기화)
 */

import apiClient from '@/api/client'
import { USER_ENDPOINTS } from '@/api/endpoints'

/**
 * 인테리어 진행 상태 서버 동기화
 * 
 * 클라이언트에서 계산된 인테리어 상태를 서버에 저장합니다.
 * 서버는 값을 검증하고 클램핑하여 저장된 실제 값을 반환합니다.
 * 
 * @param {Object} data - 인테리어 상태
 * @param {string} data.buildTrack - 현재 트랙 ('house' | 'furniture')
 * @param {number} data.furnitureStage - 인테리어 단계 (0-5)
 * @param {number} data.furnitureExp - 현재 단계 내 경험치
 * @returns {Promise<{buildTrack: string, furnitureStage: number, furnitureExp: number}>}
 */
export async function updateFurnitureProgress(data) {
  const response = await apiClient.put(USER_ENDPOINTS.FURNITURE_PROGRESS, data)
  return response.data.data
}

export const userService = {
  updateFurnitureProgress
}
