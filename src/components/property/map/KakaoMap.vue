<template>
    <div class="kakao-map-container">
        <div :id="mapId" class="kakao-map"></div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="map-loading">
            <div class="spinner"></div>
            <p>지도를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-if="error" class="map-error">
            <p>{{ error }}</p>
            <button class="retry-btn" @click="retryLoad">다시 시도</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePropertyStore } from '@/stores/propertyStore'
import { useDreamHomeStore } from '@/stores/dreamHomeStore'
import { useKakaoMap } from '@/composables/useKakaoMap'
import { MAP_ZOOM_LEVELS } from '@/constants/properties'

// Props
const props = defineProps({
    height: {
        type: String,
        default: '100%'
    },
    enableControls: {
        type: Boolean,
        default: true
    }
})

// Stores
const propertyStore = usePropertyStore()
const dreamHomeStore = useDreamHomeStore()
const { filteredProperties, selectedProperty, mapCenter, mapZoom } = storeToRefs(propertyStore)
const { targetAmount } = storeToRefs(dreamHomeStore)

// State
const mapId = ref('property-map-' + Date.now())
const loading = ref(true)
const error = ref(null)

// Kakao Map Composable
const {
    map,
    isLoaded,
    error: mapError,
    initializeMap,
    createPropertyMarker,
    clearMarkers,
    fitBounds,
    centerMap,
    relayout,
    setZoomLevel,
    resetMap
} = useKakaoMap(mapId.value, {
    onMarkerClick: (propertyId) => {
        propertyStore.selectProperty(propertyId)
    },
    enableControls: props.enableControls
})

// Computed
const hasProperties = computed(() => filteredProperties.value.length > 0)

// 지도 초기화
onMounted(async () => {
    try {
        await initializeMap()
        loading.value = false

        // 초기 마커 생성
        if (hasProperties.value) {
            renderMarkers()
        }
    } catch (err) {
        error.value = err.message
        loading.value = false
        console.error('Failed to initialize map:', err)
    }
})

// 매물 목록 변경 시 마커 재생성
watch(
    filteredProperties,
    () => {
        if (isLoaded.value) {
            renderMarkers()
        }
    },
    { deep: true }
)

// 선택된 매물 변경 시 지도 중심 이동 및 마커 재생성
watch(selectedProperty, (newVal, oldVal) => {
    if (!isLoaded.value) return

    // 지도 중심 이동
    if (newVal && newVal.coordinates) {
        centerMap(newVal.coordinates.lat, newVal.coordinates.lng, MAP_ZOOM_LEVELS.DETAIL)
    }

    // 마커 재생성 (선택 상태 반영)
    if (newVal || oldVal) {
        renderMarkers()
    }
})

// targetAmount 변경 시 마커 재생성 (구매 가능 여부 반영)
watch(targetAmount, () => {
    if (isLoaded.value && hasProperties.value) {
        renderMarkers()
    }
})

// 지도 로딩 완료 시 마커 렌더링 (타이밍 이슈 해결)
watch(isLoaded, (loaded) => {
    if (loaded && hasProperties.value) {
        renderMarkers()
    }
})

// 외부에서 설정한 지도 중심/줌 변화 감시
watch(
    mapCenter,
    (center) => {
        if (!isLoaded.value || !center) return
        centerMap(center.lat, center.lng, mapZoom.value)
    },
    { deep: true }
)

watch(mapZoom, (level) => {
    if (!isLoaded.value || level === null || level === undefined) return
    setZoomLevel(level)
})

/**
 * 마커 렌더링
 */
function renderMarkers() {
    clearMarkers()

    if (!hasProperties.value) return

    filteredProperties.value.forEach((property) => {
        const isSelected = selectedProperty.value?.id === property.id
        const isAffordable = property.price * 0.3 <= targetAmount.value

        createPropertyMarker(property, isSelected, isAffordable)
    })

    // 선택된 매물이 없으면 모든 마커가 보이도록 자동 조정
    if (!selectedProperty.value && filteredProperties.value.length > 0) {
        fitBounds(filteredProperties.value)
    }
}

/**
 * 지도 다시 로드
 */
async function retryLoad() {
    error.value = null
    loading.value = true

    try {
        await initializeMap()
        loading.value = false

        if (hasProperties.value) {
            renderMarkers()
        }
    } catch (err) {
        error.value = err.message
        loading.value = false
    }
}

// Expose methods for parent components
defineExpose({
    relayout,
    fitBounds: () => fitBounds(filteredProperties.value),
    reset: resetMap,
    centerMap,
    setZoomLevel,
    renderMarkers
})
</script>

<style scoped>
.kakao-map-container {
    position: relative;
    width: 100%;
    height: v-bind(height);
    border-radius: 16px;
    overflow: hidden;
    background: var(--showroom-bg-day);
}

html[data-theme='night'] .kakao-map-container {
    background: var(--showroom-bg-night);
}

.kakao-map {
    width: 100%;
    height: 100%;
}

/* 로딩 상태 */
.map-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: var(--shadow-lg-day);
}

html[data-theme='night'] .map-loading {
    background: rgba(58, 53, 48, 0.95);
    box-shadow: var(--shadow-lg-night);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top-color: var(--showroom-accent-day);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

html[data-theme='night'] .spinner {
    border-color: rgba(255, 255, 255, 0.1);
    border-top-color: var(--showroom-accent-night);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.map-loading p {
    color: var(--showroom-text-day);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
}

html[data-theme='night'] .map-loading p {
    color: var(--showroom-text-night);
}

/* 에러 상태 */
.map-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: var(--shadow-lg-day);
}

html[data-theme='night'] .map-error {
    background: rgba(58, 53, 48, 0.95);
    box-shadow: var(--shadow-lg-night);
}

.map-error p {
    color: #ef5350;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
}

.retry-btn {
    padding: 0.5rem 1.5rem;
    background: var(--showroom-accent-day);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: var(--font-size-body-small);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.retry-btn:active {
    transform: translateY(0);
}

/* ========================================
   Global Marker Styles (CustomOverlay에서 사용)
   ======================================== */

:global(.property-marker) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;
    transform: translateZ(0);
    /* GPU 가속 */
}

:global(.property-marker:hover) {
    transform: scale(1.15) translateZ(0);
    z-index: 1000;
}

:global(.marker-emoji) {
    font-size: 28px;
    background: white;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--marker-border-color, #4285f4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
}

html[data-theme='night'] :global(.marker-emoji) {
    background: rgba(58, 53, 48, 0.95);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

:global(.marker-price) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--showroom-text-day);
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

html[data-theme='night'] :global(.marker-price) {
    background: rgba(58, 53, 48, 0.95);
    color: var(--showroom-text-night);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 선택된 마커 */
:global(.property-marker.selected .marker-emoji) {
    border-color: #ff7f50;
    /* Living Coral */
    border-width: 4px;
    box-shadow: 0 6px 16px rgba(255, 127, 80, 0.4);
}

/* 구매 가능 마커 */
:global(.property-marker.affordable .marker-emoji) {
    border-color: #66bb6a;
}

/* 고가 마커 */
:global(.property-marker.expensive .marker-emoji) {
    border-color: #ef5350;
}

/* InfoWindow 스타일 */
:global(.property-info-window) {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--showroom-text-day);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
}

html[data-theme='night'] :global(.property-info-window) {
    background: rgba(58, 53, 48, 0.98);
    color: var(--showroom-text-night);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* 반응형 */
@media (max-width: 768px) {
    :global(.marker-emoji) {
        width: 40px;
        height: 40px;
        font-size: 24px;
    }

    :global(.marker-price) {
        font-size: 11px;
        padding: 3px 6px;
    }
}
</style>
