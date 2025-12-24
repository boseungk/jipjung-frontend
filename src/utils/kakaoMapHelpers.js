/**
 * Kakao Map Helper Functions
 *
 * 카카오맵 관련 유틸리티 함수 모음
 */

/**
 * 좌표 유효성 검증 (한국 범위)
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {boolean} 유효성 여부
 */
export function validateCoordinates(lat, lng) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
        return false
    }

    // 한국 좌표 범위 검증
    const isLatValid = lat >= 33.0 && lat <= 38.6
    const isLngValid = lng >= 124.5 && lng <= 132.0

    return isLatValid && isLngValid
}

/**
 * 좌표 포맷팅 (소수점 6자리)
 * @param {Object} coord - 좌표 { lat, lng }
 * @returns {Object} 포맷팅된 좌표
 */
export function formatCoordinates(coord) {
    return {
        lat: parseFloat(coord.lat.toFixed(6)),
        lng: parseFloat(coord.lng.toFixed(6))
    }
}

/**
 * 여러 좌표로부터 바운드 계산
 * @param {Array} properties - 매물 목록 (coordinates 속성 포함)
 * @returns {Object|null} 바운드 { sw: { lat, lng }, ne: { lat, lng } } 또는 null
 */
export function calculateBounds(properties) {
    if (!properties || properties.length === 0) {
        return null
    }

    const validCoords = properties
        .filter((p) => p.coordinates && validateCoordinates(p.coordinates.lat, p.coordinates.lng))
        .map((p) => p.coordinates)

    if (validCoords.length === 0) {
        return null
    }

    let minLat = validCoords[0].lat
    let maxLat = validCoords[0].lat
    let minLng = validCoords[0].lng
    let maxLng = validCoords[0].lng

    validCoords.forEach((coord) => {
        if (coord.lat < minLat) minLat = coord.lat
        if (coord.lat > maxLat) maxLat = coord.lat
        if (coord.lng < minLng) minLng = coord.lng
        if (coord.lng > maxLng) maxLng = coord.lng
    })

    return {
        sw: { lat: minLat, lng: minLng },
        ne: { lat: maxLat, lng: maxLng }
    }
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
 * 거리를 사람이 읽기 쉬운 형식으로 변환
 * @param {number} meters - 거리 (미터)
 * @returns {string} 포맷팅된 거리 (예: "1.2km", "350m")
 */
export function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`
    }
    return `${Math.round(meters)}m`
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

/**
 * 중심점 계산
 * @param {Array} properties - 매물 목록 (coordinates 속성 포함)
 * @returns {Object|null} 중심 좌표 { lat, lng } 또는 null
 */
export function calculateCenter(properties) {
    if (!properties || properties.length === 0) {
        return null
    }

    const validCoords = properties
        .filter((p) => p.coordinates && validateCoordinates(p.coordinates.lat, p.coordinates.lng))
        .map((p) => p.coordinates)

    if (validCoords.length === 0) {
        return null
    }

    const sumLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0)
    const sumLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0)

    return {
        lat: sumLat / validCoords.length,
        lng: sumLng / validCoords.length
    }
}

/**
 * 가격을 만원 단위로 포맷팅
 * @param {number} price - 가격 (만원)
 * @returns {string} 포맷팅된 가격 (예: "5억", "3.5억", "5,000만원")
 */
export function formatPrice(price) {
    if (price >= 10000) {
        const uk = price / 10000
        return uk % 1 === 0 ? `${uk}억` : `${uk.toFixed(1)}억`
    }
    return `${price.toLocaleString()}만원`
}

/**
 * Kakao Maps API 로딩 대기
 * @param {number} maxAttempts - 최대 시도 횟수 (기본값: 10)
 * @param {number} interval - 재시도 간격 (ms, 기본값: 500)
 * @returns {Promise<boolean>} 로딩 성공 여부
 */
export function waitForKakao(maxAttempts = 10, interval = 500) {
    return new Promise((resolve, reject) => {
        let attempts = 0

        const checkKakao = setInterval(() => {
            attempts++

            if (
                typeof kakao !== 'undefined' &&
                kakao.maps &&
                typeof kakao.maps.LatLng === 'function'
            ) {
                clearInterval(checkKakao)
                resolve(true)
            } else if (attempts >= maxAttempts) {
                clearInterval(checkKakao)
                reject(new Error('Kakao Maps API를 로드할 수 없습니다. API 키를 확인하세요.'))
            }
        }, interval)
    })
}

let kakaoScriptLoading = null

/**
 * Kakao Maps SDK 스크립트 동적 로드
 * @param {string} appKey - 카카오맵 앱 키
 * @param {string} libraries - 사용할 라이브러리 목록
 * @returns {Promise<void>}
 */
export function loadKakaoSdk(appKey, libraries = 'services') {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('브라우저 환경에서만 카카오맵을 사용할 수 있습니다.'))
    }

    if (typeof kakao !== 'undefined' && kakao.maps && typeof kakao.maps.LatLng === 'function') {
        return Promise.resolve()
    }

    if (!appKey) {
        return Promise.reject(new Error('Kakao Maps API 키가 설정되지 않았습니다. .env를 확인하세요.'))
    }

    if (kakaoScriptLoading) {
        return kakaoScriptLoading
    }

    kakaoScriptLoading = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-kakao-sdk]')

        if (existing) {
            existing.addEventListener('load', resolve, { once: true })
            existing.addEventListener(
                'error',
                () => {
                    kakaoScriptLoading = null
                    reject(new Error('Kakao Maps SDK 로드에 실패했습니다.'))
                },
                { once: true }
            )
            return
        }

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.dataset.kakaoSdk = 'true'
        // 항상 HTTPS 사용 (Mixed Content 정책으로 인해 HTTP는 HTTPS 페이지에서 차단됨)
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=${libraries}&autoload=false`
        script.onload = () => {
            if (!(window.kakao && kakao.maps && kakao.maps.load)) {
                kakaoScriptLoading = null
                reject(
                    new Error(
                        'Kakao Maps SDK 로드에 실패했습니다. API 키 또는 네트워크 상태를 확인하세요.'
                    )
                )
                return
            }

            // autoload=false 이므로 명시적으로 로드
            kakao.maps.load(() => resolve())
        }
        script.onerror = () => {
            script.remove()
            kakaoScriptLoading = null
            reject(
                new Error(
                    `Kakao Maps SDK 로드에 실패했습니다. API 키 유효성 및 허용 도메인(${window.location.origin}) 등록을 확인하세요.`
                )
            )
        }

        document.head.appendChild(script)
    })

    return kakaoScriptLoading
}

/**
 * 줌 레벨에 따른 적절한 마커 크기 반환
 * @param {number} level - 줌 레벨 (1-14)
 * @returns {string} 마커 크기 ('small', 'medium', 'large')
 */
export function getMarkerSizeByZoom(level) {
    if (level <= 4) return 'large'
    if (level <= 8) return 'medium'
    return 'small'
}
