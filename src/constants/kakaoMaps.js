/**
 * Kakao Maps Configuration
 *
 * 카카오맵 API 관련 설정 및 상수
 */

/**
 * 카카오맵 기본 설정
 */
export const KAKAO_MAP_CONFIG = {
    // 환경변수에서만 키를 읽어 사용 (하드코드 금지)
    APP_KEY: (import.meta.env.VITE_KAKAO_MAP_KEY || '').trim(),
    DEFAULT_CENTER: {
        lat: 37.5665, // 서울시청 위도
        lng: 126.9780 // 서울시청 경도
    },
    DEFAULT_LEVEL: 8, // 기본 줌 레벨
    MIN_LEVEL: 1, // 최소 줌 레벨 (가장 확대)
    MAX_LEVEL: 14 // 최대 줌 레벨 (가장 축소)
}

/**
 * 마커 색상 설정
 */
export const MARKER_COLORS = {
    default: '#4285f4', // 기본 - 파란색
    selected: '#FF7F50', // 선택됨 - Living Coral (집중 브랜드 색상)
    affordable: '#66BB6A', // 구매 가능 - 초록색
    expensive: '#EF5350' // 고가 - 빨간색
}

/**
 * 마커 크기 설정
 */
export const MARKER_SIZES = {
    small: { width: 32, height: 40 },
    medium: { width: 40, height: 50 },
    large: { width: 48, height: 60 }
}

/**
 * 클러스터 설정
 */
export const CLUSTER_CONFIG = {
    gridSize: 60, // 클러스터 그리드 크기
    minClusterSize: 2, // 최소 클러스터 크기
    minLevel: 6, // 클러스터링을 시작할 최소 레벨
    disableClickZoom: false, // 클릭 시 줌 비활성화 여부
    averageCenter: true, // 클러스터 중심을 평균 위치로 설정
    styles: [
        {
            width: '40px',
            height: '40px',
            background: 'rgba(66, 133, 244, 0.8)',
            borderRadius: '50%',
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '40px'
        }
    ]
}

/**
 * 지도 컨트롤 위치
 */
export const MAP_CONTROL_POSITIONS = {
    TOP: 'TOP',
    TOP_LEFT: 'TOPLEFT',
    TOP_RIGHT: 'TOPRIGHT',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    BOTTOM_LEFT: 'BOTTOMLEFT',
    BOTTOM: 'BOTTOM',
    BOTTOM_RIGHT: 'BOTTOMRIGHT'
}

/**
 * 지도 타입
 */
export const MAP_TYPES = {
    ROADMAP: 'ROADMAP', // 일반 지도
    SKYVIEW: 'SKYVIEW', // 스카이뷰
    HYBRID: 'HYBRID' // 하이브리드 (스카이뷰 + 라벨)
}

/**
 * 인포윈도우 설정
 */
export const INFOWINDOW_CONFIG = {
    removable: true, // 닫기 버튼 표시
    zIndex: 1000 // z-index
}

/**
 * 오버레이 z-index
 */
export const OVERLAY_Z_INDEX = {
    MARKER: 10,
    INFO_WINDOW: 100,
    CUSTOM_OVERLAY: 50
}

/**
 * 지도 이동 애니메이션 설정
 */
export const PAN_ANIMATION = {
    duration: 500, // 애니메이션 지속 시간 (ms)
    easing: 'ease-out' // 이징 함수
}

/**
 * 줌 레벨별 표시 설정
 */
export const ZOOM_DISPLAY_SETTINGS = {
    // 레벨 1-4: 개별 매물 상세 정보 표시
    DETAIL: { min: 1, max: 4 },
    // 레벨 5-8: 매물 마커 표시
    MARKER: { min: 5, max: 8 },
    // 레벨 9-14: 클러스터만 표시
    CLUSTER: { min: 9, max: 14 }
}

/**
 * 검색 반경 설정 (미터 단위)
 */
export const SEARCH_RADIUS = {
    NEARBY: 500, // 인근 (500m)
    LOCAL: 1000, // 지역 (1km)
    DISTRICT: 3000, // 구 (3km)
    CITY: 10000 // 시 (10km)
}

/**
 * 지도 이벤트 타입
 */
export const MAP_EVENTS = {
    CLICK: 'click',
    DOUBLE_CLICK: 'dblclick',
    RIGHT_CLICK: 'rightclick',
    MOUSE_MOVE: 'mousemove',
    DRAG_START: 'dragstart',
    DRAG_END: 'dragend',
    CENTER_CHANGED: 'center_changed',
    ZOOM_CHANGED: 'zoom_changed',
    BOUNDS_CHANGED: 'bounds_changed',
    TILE_LOADED: 'tilesloaded'
}

/**
 * 마커 이벤트 타입
 */
export const MARKER_EVENTS = {
    CLICK: 'click',
    MOUSE_OVER: 'mouseover',
    MOUSE_OUT: 'mouseout',
    DRAG_START: 'dragstart',
    DRAG_END: 'dragend'
}

/**
 * 거리 계산 (Haversine 공식)
 * @param {Object} coord1 - 첫 번째 좌표 { lat, lng }
 * @param {Object} coord2 - 두 번째 좌표 { lat, lng }
 * @returns {number} 거리 (미터)
 */
export function calculateDistance(coord1, coord2) {
    const R = 6371e3 // 지구 반지름 (미터)
    const φ1 = (coord1.lat * Math.PI) / 180
    const φ2 = (coord2.lat * Math.PI) / 180
    const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180
    const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * 바운드 내 포함 여부 확인
 * @param {Object} coord - 좌표 { lat, lng }
 * @param {Object} bounds - 바운드 { sw: { lat, lng }, ne: { lat, lng } }
 * @returns {boolean} 포함 여부
 */
export function isInBounds(coord, bounds) {
    return (
        coord.lat >= bounds.sw.lat &&
        coord.lat <= bounds.ne.lat &&
        coord.lng >= bounds.sw.lng &&
        coord.lng <= bounds.ne.lng
    )
}
