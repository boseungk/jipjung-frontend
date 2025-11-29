# Kakao Maps Integration - Usage Guide

Phase 2 매물 지도 통합 가이드

## 개요

카카오맵 API를 Vue 3 프로젝트에 통합하여 매물 마커를 표시하는 컴포넌트 시스템입니다.

## 구현된 파일 목록

### 1. Core Components
- `KakaoMap.vue` - 핵심 지도 컴포넌트
- `PropertyMarker.vue` - 마커 래퍼 컴포넌트 (타입 정의용)
- `MapControls.vue` - 지도 컨트롤 버튼 UI

### 2. Composables
- `useKakaoMap.js` - 지도 초기화 및 마커 관리 로직

### 3. Utilities
- `kakaoMapHelpers.js` - 좌표 검증, 거리 계산, 포맷팅 등 유틸 함수

### 4. Configuration
- `index.html` - Kakao Maps SDK 스크립트 추가됨
- `src/constants/kakaoMaps.js` - 설정값 (이미 존재)
- `src/constants/properties.js` - 매물 관련 상수 (이미 존재)

## 사용 방법

### 기본 사용 (KakaoMap.vue)

```vue
<template>
  <div class="property-view">
    <KakaoMap height="600px" :enableControls="true" />

    <!-- 또는 MapControls를 별도로 배치 -->
    <div class="map-wrapper">
      <KakaoMap height="100vh" :enableControls="false" />
      <MapControls
        @filter="handleFilter"
        @currentLocation="handleCurrentLocation"
        @reset="handleReset"
        @fitBounds="handleFitBounds"
      />
    </div>
  </div>
</template>

<script setup>
import { KakaoMap, MapControls } from '@/components/property/map'

function handleFilter() {
  // 필터 모달 열기
}

function handleCurrentLocation(coords) {
  // coords = { lat, lng }
  console.log('Current location:', coords)
}

function handleReset() {
  // 지도 초기화
}

function handleFitBounds() {
  // 모든 마커가 보이도록 조정
}
</script>
```

### useKakaoMap Composable 직접 사용

```javascript
import { ref, onMounted } from 'vue'
import { useKakaoMap } from '@/composables/useKakaoMap'

export default {
  setup() {
    const mapId = ref('my-map-' + Date.now())

    const {
      map,
      isLoaded,
      initializeMap,
      createPropertyMarker,
      clearMarkers,
      fitBounds,
      centerMap
    } = useKakaoMap(mapId.value, {
      onMarkerClick: (propertyId) => {
        console.log('Clicked property:', propertyId)
      }
    })

    onMounted(async () => {
      await initializeMap()

      // 마커 생성 예시
      const property = {
        id: 1,
        title: '래미안 아파트',
        price: 50000,
        propertyType: '아파트',
        coordinates: { lat: 37.5665, lng: 126.9780 }
      }

      createPropertyMarker(property, false, true)
    })

    return { mapId, isLoaded }
  }
}
```

## 핵심 기능

### 1. 자동 마커 관리
- `filteredProperties` 변경 시 자동으로 마커 재생성
- 선택된 매물 변경 시 지도 중심 이동 및 하이라이트
- `targetAmount` 변경 시 구매 가능 여부에 따라 마커 색상 자동 업데이트

### 2. 마커 스타일링
- **선택됨**: Living Coral 색상 (#FF7F50), 굵은 테두리
- **구매 가능**: 초록색 테두리 (#66BB6A)
- **고가**: 빨간색 테두리 (#EF5350)

### 3. InfoWindow
- 마우스 오버 시 매물 제목 표시
- `setTimeout` 패턴으로 DOM 렌더링 대기 (중요!)

### 4. 메모리 관리
- `clearMarkers()` 호출 시 모든 마커와 InfoWindow를 메모리에서 제거
- `marker.setMap(null)` 패턴 사용

## Glassmorphism 디자인

모든 UI 요소는 프로젝트의 Glassmorphism 디자인 시스템을 따릅니다:

### Day Mode
- 배경: `rgba(255, 255, 255, 0.75)`
- Blur: `10px`
- Border: `rgba(255, 255, 255, 0.6)`

### Night Mode
- 배경: `rgba(255, 255, 255, 0.08)`
- Blur: `16px`
- Border: `rgba(255, 255, 255, 0.15)`

## 주의사항

1. **setTimeout 패턴 필수**
   - InfoWindow 이벤트 리스너는 반드시 `setTimeout`으로 감싸야 함
   - DOM 렌더링 대기 필요

2. **좌표 순서**
   - Kakao Maps는 `LatLng(위도, 경도)` 순서 사용
   - 주의: 일반적인 `(경도, 위도)` 순서와 반대

3. **메모리 관리**
   - 마커 삭제 시 반드시 `setMap(null)` 호출
   - InfoWindow도 `close()` 호출

4. **API 키**
   - 현재 테스트용 키 사용 중: `d7ba6bdb4678bbecba6efac009de6e01`
   - 프로덕션 배포 시 환경변수로 관리 필요

## Store 연동

### propertyStore
- `filteredProperties` - 필터링된 매물 목록
- `selectedProperty` - 선택된 매물
- `selectProperty(id)` - 매물 선택 액션

### dreamHomeStore
- `targetAmount` - 목표 금액 (계약금)
- 매물 가격 × 0.3 <= targetAmount로 구매 가능 여부 판단

## 성능 최적화

1. **GPU 가속**
   - `transform: translateZ(0)` 사용
   - 마커 애니메이션 최적화

2. **Lazy Loading**
   - Kakao Maps SDK는 `index.html`에서 비동기 로드
   - `waitForKakao()` 함수로 로딩 대기

3. **이벤트 위임**
   - CustomOverlay를 사용한 DOM 이벤트 관리
   - 메모리 효율적

## 향후 확장 가능성

1. **클러스터링**
   - 매물이 많을 경우 마커 클러스터링 추가 가능
   - `kakaoMaps.js`에 이미 설정 정의됨

2. **필터 연동**
   - MapControls의 필터 버튼을 실제 필터 모달과 연동

3. **현재 위치 기반 검색**
   - Geolocation API와 연동하여 주변 매물 검색

4. **지도 타입 전환**
   - 일반 지도 / 스카이뷰 / 하이브리드 전환 기능

## 트러블슈팅

### 지도가 표시되지 않는 경우
1. Kakao Maps SDK가 로드되었는지 확인
2. `waitForKakao()`가 정상적으로 완료되었는지 확인
3. 콘솔에서 API 키 에러 확인

### 마커가 클릭되지 않는 경우
1. `setTimeout` 패턴이 적용되었는지 확인
2. 마커 ID가 중복되지 않는지 확인
3. `onMarkerClick` 콜백이 정의되었는지 확인

### InfoWindow가 표시되지 않는 경우
1. DOM 렌더링이 완료되었는지 확인
2. 마커 요소가 실제로 생성되었는지 확인 (`getElementById`)
3. 이벤트 리스너가 정상적으로 등록되었는지 확인

## 참고 자료

- `kakao-maps-reference/index.html` - 핵심 패턴 레퍼런스
- Kakao Maps API 공식 문서: https://apis.map.kakao.com/web/
- CLAUDE.md - 프로젝트 가이드라인
