/**
 * API Services Index
 * 
 * 모든 API 서비스를 한 곳에서 export하여 import를 간소화합니다.
 * 
 * @module api/services
 * 
 * @example
 * // Before
 * import { authService } from '@/api/services/authService'
 * import { propertyService } from '@/api/services/propertyService'
 * 
 * // After
 * import { authService, propertyService } from '@/api/services'
 */

export { authService } from './authService'
export { dashboardService } from './dashboardService'
export { propertyService } from './propertyService'
export { dreamHomeService } from './dreamHomeService'
export { gamificationService } from './gamificationService'
export { receiptService } from './receiptService'
export { statisticsService } from './statisticsService'
export { collectionService } from './collectionService'
export { userService } from './userService'
