/**
 * useKakaoMap Composable
 *
 * 카카오맵 초기화 및 마커 관리를 위한 Composable
 * Reference: kakao-maps-reference/index.html 패턴 준수
 */

import { ref } from 'vue'
import { KAKAO_MAP_CONFIG, MARKER_COLORS } from '@/constants/kakaoMaps'
import { MARKER_EMOJIS } from '@/constants/properties'
import {
    validateCoordinates,
    waitForKakao,
    formatPrice,
    loadKakaoSdk
} from '@/utils/kakaoMapHelpers'

export function useKakaoMap(containerId, options = {}) {
    // State
    const map = ref(null)
    const markers = ref([])
    const infoWindows = ref([])
    const isLoaded = ref(false)
    const error = ref(null)

    /**
     * 지도 초기화
     * @param {Object} config - 지도 설정 { center, level }
     * @returns {Promise<void>}
     */
    async function initializeMap(config = {}) {
        try {
            const appKey = KAKAO_MAP_CONFIG.APP_KEY
            if (!appKey) {
                throw new Error('Kakao Maps API 키가 설정되지 않았습니다. .env를 확인해주세요.')
            }

            // Kakao Maps SDK 로딩
            await loadKakaoSdk(appKey)

            // Kakao Maps API 로딩 대기
            await waitForKakao()

            const container = document.getElementById(containerId)
            if (!container) {
                throw new Error(`지도 컨테이너를 찾을 수 없습니다: ${containerId}`)
            }

            // 지도 옵션 설정
            const center = config.center || KAKAO_MAP_CONFIG.DEFAULT_CENTER
            const level = config.level || KAKAO_MAP_CONFIG.DEFAULT_LEVEL

            const mapOptions = {
                center: new kakao.maps.LatLng(center.lat, center.lng),
                level: level
            }

            // 지도 생성
            map.value = new kakao.maps.Map(container, mapOptions)
            isLoaded.value = true

            // 지도 컨트롤 추가
            if (options.enableControls !== false) {
                addMapControls()
            }
        } catch (err) {
            error.value = err.message
            isLoaded.value = false
            throw err
        }
    }

    /**
     * 지도 컨트롤 추가
     */
    function addMapControls() {
        if (!map.value) return

        // 지도 타입 컨트롤
        const mapTypeControl = new kakao.maps.MapTypeControl()
        map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)

        // 줌 컨트롤
        const zoomControl = new kakao.maps.ZoomControl()
        map.value.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)
    }

    /**
     * 매물 마커 생성 (CustomOverlay 사용)
     * @param {Object} property - 매물 정보
     * @param {boolean} isSelected - 선택 여부
     * @param {boolean} isAffordable - 구매 가능 여부
     * @returns {Object|null} CustomOverlay 객체
     */
    function createPropertyMarker(property, isSelected = false, isAffordable = true) {
        if (!map.value || !property.coordinates) return null

        const { lat, lng } = property.coordinates

        // 좌표 유효성 검증
        if (!validateCoordinates(lat, lng)) {
            console.warn(`Invalid coordinates for property ${property.id}:`, lat, lng)
            return null
        }

        // 좌표 생성 (Kakao는 lat, lng 순서)
        const position = new kakao.maps.LatLng(lat, lng)

        // 마커 ID 생성
        const markerId = `marker-${property.id}-${Date.now()}`

        // 이모지 및 색상 결정
        const emoji = MARKER_EMOJIS[property.propertyType] || MARKER_EMOJIS['아파트']
        let borderColor = MARKER_COLORS.default

        if (isSelected) {
            borderColor = MARKER_COLORS.selected
        } else if (isAffordable) {
            borderColor = MARKER_COLORS.affordable
        } else {
            borderColor = MARKER_COLORS.expensive
        }

        // 마커 클래스 결정
        const markerClasses = ['property-marker']
        if (isSelected) markerClasses.push('selected')
        if (isAffordable) markerClasses.push('affordable')
        else markerClasses.push('expensive')

        // 커스텀 오버레이 콘텐츠 (HTML)
        const content = `
            <div class="${markerClasses.join(' ')}"
                 id="${markerId}"
                 data-property-id="${property.id}">
                <div class="marker-emoji" style="--marker-border-color: ${borderColor};">
                    ${emoji}
                </div>
                <div class="marker-price">
                    ${formatPrice(property.price)}
                </div>
            </div>
        `

        // CustomOverlay 생성
        const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: isSelected ? 100 : 10
        })

        // 지도에 표시
        customOverlay.setMap(map.value)

        // InfoWindow 및 이벤트 리스너 추가
        addMarkerEvents(customOverlay, property, markerId)

        // 마커 저장
        markers.value.push(customOverlay)

        return customOverlay
    }

    /**
     * 마커 이벤트 리스너 추가 (setTimeout 패턴 사용)
     * @param {Object} overlay - CustomOverlay 객체
     * @param {Object} property - 매물 정보
     * @param {string} markerId - 마커 DOM ID
     */
    function addMarkerEvents(overlay, property, markerId) {
        // InfoWindow 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: `<div class="property-info-window">${property.title}</div>`,
            removable: false
        })

        infoWindows.value.push(infowindow)

        // DOM 렌더링 대기 후 이벤트 리스너 추가 (중요!)
        setTimeout(() => {
            const markerElement = document.getElementById(markerId)
            if (!markerElement) return

            // 마우스 오버 시 InfoWindow 표시
            markerElement.addEventListener('mouseover', () => {
                infowindow.open(map.value, overlay)
            })

            // 마우스 아웃 시 InfoWindow 숨김
            markerElement.addEventListener('mouseout', () => {
                infowindow.close()
            })

            // 클릭 시 콜백 실행
            markerElement.addEventListener('click', () => {
                if (options.onMarkerClick) {
                    options.onMarkerClick(property.id)
                }
            })
        }, 0)
    }

    /**
     * 모든 마커 삭제 (메모리 관리 중요!)
     */
    function clearMarkers() {
        // 각 마커를 지도에서 제거
        markers.value.forEach((marker) => {
            marker.setMap(null)
        })

        // InfoWindow도 모두 닫기
        infoWindows.value.forEach((infowindow) => {
            infowindow.close()
        })

        markers.value = []
        infoWindows.value = []
    }

    /**
     * 매물 목록에 맞게 지도 바운드 자동 조정
     * @param {Array} properties - 매물 목록
     */
    function fitBounds(properties) {
        if (!map.value || !properties || properties.length === 0) return

        const bounds = new kakao.maps.LatLngBounds()

        properties.forEach((property) => {
            if (
                property.coordinates &&
                validateCoordinates(property.coordinates.lat, property.coordinates.lng)
            ) {
                bounds.extend(
                    new kakao.maps.LatLng(property.coordinates.lat, property.coordinates.lng)
                )
            }
        })

        map.value.setBounds(bounds)
    }

    /**
     * 특정 좌표로 지도 중심 이동
     * @param {number} lat - 위도
     * @param {number} lng - 경도
     * @param {number} level - 줌 레벨 (선택사항)
     */
    function centerMap(lat, lng, level = null) {
        if (!map.value || !validateCoordinates(lat, lng)) return

        const position = new kakao.maps.LatLng(lat, lng)
        map.value.setCenter(position)

        if (level !== null) {
            map.value.setLevel(level)
        }
    }

    /**
     * 지도 줌 레벨 설정
     * @param {number} level - 줌 레벨
     */
    function setZoomLevel(level) {
        if (!map.value) return
        map.value.setLevel(level)
    }

    /**
     * 현재 지도 중심 좌표 가져오기
     * @returns {Object|null} { lat, lng }
     */
    function getCenter() {
        if (!map.value) return null

        const center = map.value.getCenter()
        return {
            lat: center.getLat(),
            lng: center.getLng()
        }
    }

    /**
     * 현재 줌 레벨 가져오기
     * @returns {number|null}
     */
    function getZoomLevel() {
        if (!map.value) return null
        return map.value.getLevel()
    }

    /**
     * 지도 리사이즈 (컨테이너 크기 변경 시 호출)
     */
    function relayout() {
        if (!map.value) return
        map.value.relayout()
    }

    /**
     * 지도 초기화 (중심 및 줌 레벨 리셋)
     */
    function resetMap() {
        if (!map.value) return

        const center = KAKAO_MAP_CONFIG.DEFAULT_CENTER
        centerMap(center.lat, center.lng, KAKAO_MAP_CONFIG.DEFAULT_LEVEL)
    }

    /**
     * 특정 마커 업데이트 (선택 상태 변경 등)
     * @param {string|number} propertyId - 매물 ID
     * @param {Object} updates - 업데이트 정보 { isSelected, isAffordable }
     */
    function updateMarker(propertyId, updates) {
        // 기존 마커 찾기 및 제거
        const index = markers.value.findIndex((marker) => {
            const content = marker.getContent()
            return content.includes(`data-property-id="${propertyId}"`)
        })

        if (index === -1) return

        // 기존 마커 제거
        markers.value[index].setMap(null)
        markers.value.splice(index, 1)

        // 새 마커 생성은 외부에서 호출
    }

    return {
        // State
        map,
        markers,
        isLoaded,
        error,
        // Actions
        initializeMap,
        createPropertyMarker,
        clearMarkers,
        fitBounds,
        centerMap,
        setZoomLevel,
        getCenter,
        getZoomLevel,
        relayout,
        resetMap,
        updateMarker
    }
}
