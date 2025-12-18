/**
 * DSR 등급 기준 - 단일 소스 오브 트루스 (Single Source of Truth)
 * 
 * 이 파일의 기준을 dsrStore, DsrSimulationView, DsrGaugeCard가 공유합니다.
 * DSR 관련 색상, 라벨, 기준값을 변경할 때는 이 파일만 수정하면 됩니다.
 * 
 * @see DSR_SIMULATION_IMPROVEMENT_PLAN.md Phase 1.1
 */

/**
 * DSR 등급 판단 기준값 (%)
 * - SAFE: 이 값 이하이면 "안전"
 * - WARNING: SAFE 초과 ~ 이 값 이하이면 "주의"
 * - 초과: "위험"
 */
export const DSR_THRESHOLDS = {
    SAFE: 40,
    WARNING: 70
}

/**
 * 등급별 상세 정보
 */
export const DSR_GRADES = {
    SAFE: {
        label: '안전',
        class: 'safe',
        color: '#43A047',
        description: '대출 승인에 유리해요'
    },
    WARNING: {
        label: '주의',
        class: 'warning',
        color: '#FBC02D',
        description: '추가 대출 시 신중하게 검토하세요'
    },
    DANGER: {
        label: '위험',
        class: 'danger',
        color: '#F44336',
        description: '대출 승인이 어려울 수 있어요'
    }
}

/**
 * DSR 비율에 따른 등급 정보 반환
 * 
 * @param {number} ratio - DSR 비율 (0-100)
 * @returns {{ label: string, class: string, color: string, description: string }}
 * 
 * @example
 * getDsrGrade(30)  // { label: '안전', class: 'safe', color: '#43A047', ... }
 * getDsrGrade(55)  // { label: '주의', class: 'warning', color: '#FBC02D', ... }
 * getDsrGrade(80)  // { label: '위험', class: 'danger', color: '#F44336', ... }
 */
export function getDsrGrade(ratio) {
    if (ratio <= DSR_THRESHOLDS.SAFE) {
        return { ...DSR_GRADES.SAFE }
    }
    if (ratio <= DSR_THRESHOLDS.WARNING) {
        return { ...DSR_GRADES.WARNING }
    }
    return { ...DSR_GRADES.DANGER }
}

/**
 * DSR 비율에 따른 게이지 색상 반환
 * 
 * @param {number} ratio - DSR 비율 (0-100)
 * @returns {string} HEX 색상 코드
 * 
 * @example
 * getDsrGaugeColor(30) // '#43A047' (초록)
 * getDsrGaugeColor(55) // '#FBC02D' (노랑)
 * getDsrGaugeColor(80) // '#F44336' (빨강)
 */
export function getDsrGaugeColor(ratio) {
    return getDsrGrade(ratio).color
}

/**
 * DSR 비율에 따른 상태 톤 클래스 반환 (CSS 클래스용)
 * 
 * @param {number} ratio - DSR 비율 (0-100)
 * @returns {string} 'tone-safe' | 'tone-warning' | 'tone-danger'
 */
export function getDsrToneClass(ratio) {
    return `tone-${getDsrGrade(ratio).class}`
}
