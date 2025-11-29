<template>
  <div class="property-map-panel">
    <KakaoMap ref="kakaoMapRef" />
    <MapControls
      @filter="emit('openFilters')"
      @currentLocation="handleCurrentLocation"
      @reset="handleReset"
      @fitBounds="handleFitBounds"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePropertyStore } from '@/stores/propertyStore'
import KakaoMap from '@/components/property/map/KakaoMap.vue'
import MapControls from '@/components/property/map/MapControls.vue'

const emit = defineEmits(['openFilters'])

const kakaoMapRef = ref(null)
const propertyStore = usePropertyStore()

/**
 * 현재 위치로 이동
 */
function handleCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        propertyStore.setMapCenter(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          6
        )

        kakaoMapRef.value?.centerMap(position.coords.latitude, position.coords.longitude, 6)
      },
      (error) => {
        console.error('위치 정보를 가져올 수 없습니다:', error)
        alert('위치 정보를 가져올 수 없습니다')
      }
    )
  } else {
    alert('이 브라우저는 위치 서비스를 지원하지 않습니다')
  }
}

/**
 * 지도 중심 초기화
 */
function handleReset() {
  propertyStore.resetMapCenter()
  kakaoMapRef.value?.reset()
}

/**
 * 모든 마커가 보이도록 지도 범위 조정
 */
function handleFitBounds() {
  kakaoMapRef.value?.fitBounds()
}
</script>

<style scoped>
.property-map-panel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
