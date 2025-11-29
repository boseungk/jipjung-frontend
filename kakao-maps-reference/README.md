# 🗺️ Kakao Maps API Reference Demo

EnjoyTrip 프로젝트에서 추출한 카카오 맵 API 레퍼런스 데모입니다. 실제 프로젝트에서 사용된 핵심 패턴과 기능을 독립 실행 가능한 단일 HTML 파일로 정리했습니다.

## 📋 개요

이 데모는 다음 카카오 맵 API 기능들을 포함합니다:

- ✅ **기본 지도 초기화** - 지도 생성 및 컨트롤 추가
- ✅ **커스텀 이모지 마커** - CustomOverlay를 활용한 이모지 기반 마커 시스템
- ✅ **InfoWindow 툴팁** - 마우스 오버 시 정보 표시
- ✅ **LatLngBounds 자동 조정** - 여러 마커를 모두 보이도록 자동 범위 설정
- ✅ **한국관광공사 API 연동 패턴** - 실제 API 데이터 처리 방식

## 🚀 빠른 시작

### 1. 파일 다운로드
```bash
# 이 폴더의 index.html 파일 다운로드
```

### 2. 브라우저에서 열기
```bash
# 파일 탐색기에서 index.html을 더블클릭하거나
# 브라우저 주소창에 파일 경로 입력
```

### 3. 데모 사용하기
1. 지도가 로드되면 "📍 샘플 마커 추가" 버튼 클릭
2. 부산 관광지 5곳이 지도에 표시됨
3. 마커에 마우스를 올리면 이름이 표시됨
4. 마커를 클릭하면 상세 정보가 콘솔에 출력됨

## 🔑 API 키 설정

### Kakao Maps API 키 (필수)

현재 데모는 테스트용 API 키를 포함하고 있습니다. 본인의 프로젝트에 사용하려면 다음 단계를 따르세요:

1. **Kakao Developers 가입**
   - https://developers.kakao.com/ 방문
   - 카카오 계정으로 로그인

2. **애플리케이션 생성**
   - 내 애플리케이션 > 애플리케이션 추가하기
   - 앱 이름 입력 후 저장

3. **JavaScript 키 발급**
   - 생성한 앱 선택 > 앱 키 > JavaScript 키 복사

4. **index.html 파일 수정**
   ```html
   <!-- 208번째 줄 근처 -->
   <script type="text/javascript"
           src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_API_KEY&libraries=services">
   </script>
   ```

### 한국관광공사 API 키 (선택사항)

데모는 정적 데이터를 사용하므로 관광공사 API 키 없이도 동작합니다. 실제 API 연동을 원한다면:

1. https://www.data.go.kr/ 방문
2. 회원가입 후 로그인
3. "한국관광공사_국문 관광정보 서비스" 검색
4. 활용신청 > 일반 인증키(Encoding) 발급
5. JavaScript 코드에서 API 호출 구현 (주석 참고)

## 📚 코드 설명

### 1️⃣ 지도 초기화

```javascript
// KakaoMapsDemo.initializeMap() 메서드
const container = document.getElementById('map');
const options = {
    center: new kakao.maps.LatLng(35.1595, 129.1600), // 부산 중심
    level: 8 // 확대 레벨 (1~14, 숫자가 클수록 넓은 범위)
};

// 지도 생성
this.map = new kakao.maps.Map(container, options);

// 컨트롤 추가
const mapTypeControl = new kakao.maps.MapTypeControl();
this.map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

const zoomControl = new kakao.maps.ZoomControl();
this.map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
```

**핵심 포인트:**
- `kakao.maps.LatLng(위도, 경도)` 순서 주의
- 레벨 값이 클수록 더 넓은 지역을 표시
- 컨트롤은 위치 지정 가능 (TOPRIGHT, RIGHT, BOTTOMRIGHT 등)

### 2️⃣ 커스텀 이모지 마커

```javascript
// KakaoMapsDemo.createCustomMarker() 메서드
const position = new kakao.maps.LatLng(spot.mapy, spot.mapx);
const emoji = getMarkerEmoji(spot.contentTypeId); // '🏔️', '🎡' 등

const content = `
    <div class="custom-marker" id="${markerId}">
        ${emoji}
    </div>
`;

const customOverlay = new kakao.maps.CustomOverlay({
    position: position,
    content: content,  // HTML 문자열
    xAnchor: 0.5,      // 가로 중심 (0~1)
    yAnchor: 0.5       // 세로 중심 (0~1)
});

customOverlay.setMap(this.map);
```

**핵심 포인트:**
- `CustomOverlay`는 HTML 콘텐츠를 직접 표시
- CSS 스타일링 자유롭게 가능
- `xAnchor`, `yAnchor`로 위치 조정

**콘텐츠 타입별 이모지:**
- `12`: 🏔️ 관광지
- `14`: 🎡 문화시설
- `15`: 🎉 축제공연행사
- `25`: 🗺️ 여행코스
- `28`: ⛷️ 레포츠
- `32`: 🏨 숙박
- `38`: 🛍️ 쇼핑
- `39`: 🍽️ 음식점

### 3️⃣ InfoWindow 툴팁

```javascript
// KakaoMapsDemo.addInfoWindow() 메서드
const infowindow = new kakao.maps.InfoWindow({
    content: `<div class="info-window">${spot.title}</div>`,
    removable: false
});

// DOM 렌더링 대기 (중요!)
setTimeout(() => {
    const markerElement = document.getElementById(markerId);

    markerElement.addEventListener('mouseover', () => {
        infowindow.open(this.map, overlay); // overlay 객체 전달
    });

    markerElement.addEventListener('mouseout', () => {
        infowindow.close();
    });
}, 0);
```

**핵심 포인트:**
- `setTimeout()`으로 DOM 렌더링 대기 필수
- `infowindow.open(map, overlay)` - overlay 객체 전달
- `removable: false`로 닫기 버튼 숨김

### 4️⃣ LatLngBounds 자동 범위 조정

```javascript
// KakaoMapsDemo.displaySpots() 메서드
const bounds = new kakao.maps.LatLngBounds();

spots.forEach(spot => {
    // 각 관광지의 좌표를 bounds에 추가
    bounds.extend(new kakao.maps.LatLng(spot.mapy, spot.mapx));
});

// 모든 마커가 보이도록 지도 범위 자동 조정
this.map.setBounds(bounds);
```

**핵심 포인트:**
- `LatLngBounds` 객체에 모든 좌표 추가
- `map.setBounds()`로 한 번에 범위 조정
- 마커가 많아도 모두 화면에 표시됨

### 5️⃣ 메모리 관리

```javascript
// KakaoMapsDemo.clearMarkers() 메서드
clearMarkers() {
    // ⚠️ 중요: setMap(null)로 지도에서 제거해야 메모리 누수 방지
    this.markers.forEach(marker => {
        marker.setMap(null);
    });

    this.markers = [];
}
```

**핵심 포인트:**
- 마커 제거 시 반드시 `setMap(null)` 호출
- 배열만 비우면 메모리 누수 발생
- 대량의 마커 처리 시 특히 중요

## ⚠️ 주의사항 (Gotchas)

### 1. 좌표 순서
```javascript
// ❌ 잘못된 순서
new kakao.maps.LatLng(mapx, mapy)

// ✅ 올바른 순서
new kakao.maps.LatLng(mapy, mapx)  // (위도, 경도)
```

### 2. CustomOverlay DOM 접근
```javascript
// ❌ 즉시 DOM 접근 - 요소를 찾지 못함
const element = document.getElementById(markerId);
element.addEventListener('click', ...);

// ✅ setTimeout으로 렌더링 대기
setTimeout(() => {
    const element = document.getElementById(markerId);
    element.addEventListener('click', ...);
}, 0);
```

### 3. InfoWindow 열기
```javascript
// ❌ 좌표 객체 전달
infowindow.open(this.map, position);

// ✅ Overlay 객체 전달
infowindow.open(this.map, customOverlay);
```

### 4. 좌표 유효성 검증
```javascript
// API에서 잘못된 좌표가 올 수 있음
function isValidCoordinate(mapx, mapy) {
    return mapx && mapy &&
           124.5 <= mapx && mapx <= 132 &&  // 한국 경도 범위
           33.0 <= mapy && mapy <= 38.6;    // 한국 위도 범위
}
```

### 5. API 로딩 확인
```javascript
// Kakao API가 로드되기 전에 실행하면 에러 발생
// waitForKakao() 함수로 로딩 확인 후 실행
function waitForKakao(callback, maxAttempts = 10) {
    const checkKakao = setInterval(() => {
        if (typeof kakao !== 'undefined' && kakao.maps) {
            clearInterval(checkKakao);
            callback();
        }
    }, 500);
}
```

## 🎓 학습 경로

### 초급 (현재 데모 수준)
- [x] 기본 지도 생성
- [x] 컨트롤 추가
- [x] CustomOverlay 마커
- [x] InfoWindow 툴팁
- [x] 범위 자동 조정

### 중급
- [ ] Marker 클러스터링 (많은 마커 그룹화)
- [ ] Polyline/Polygon (경로 그리기)
- [ ] 지오코딩/역지오코딩 (주소 ↔ 좌표 변환)
- [ ] 길찾기 API 연동
- [ ] 커스텀 지도 타일

### 고급
- [ ] 실시간 위치 추적
- [ ] 히트맵 (밀도 시각화)
- [ ] 3D 지도 (Skyview)
- [ ] WebGL 커스텀 렌더링
- [ ] 대량 데이터 최적화

## 🔧 문제 해결

### Q1. 지도가 표시되지 않아요
**A:** 다음 사항을 확인하세요:
1. API 키가 유효한지 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. `#map` 요소가 높이를 가지고 있는지 확인 (CSS: `height: 450px`)
4. 인터넷 연결 확인

### Q2. 마커를 클릭해도 반응이 없어요
**A:** 다음을 확인하세요:
1. `setTimeout()` 내부에서 이벤트 리스너를 등록했는지 확인
2. 브라우저 콘솔에서 에러 확인
3. `markerId`가 고유한지 확인

### Q3. 범위 자동 조정이 안 돼요
**A:** 다음을 확인하세요:
1. 모든 좌표가 유효한지 확인 (`isValidCoordinate()`)
2. `bounds.extend()` 호출 후 `map.setBounds()` 호출했는지 확인
3. 마커가 1개 이상인지 확인

### Q4. 메모리 사용량이 계속 증가해요
**A:** 마커 제거 시 `setMap(null)`을 호출하지 않았을 가능성이 높습니다. `clearMarkers()` 메서드를 참고하세요.

### Q5. 모바일에서 터치가 안 돼요
**A:** 데스크톱 이벤트(`mouseover`, `mouseout`) 대신 터치 이벤트(`touchstart`, `touchend`)를 추가로 처리해야 합니다.

## 📁 프로젝트 구조

```
kakao-maps-reference/
├── index.html          # 올인원 데모 파일 (~650 lines)
│   ├── <style>        # CSS (150 lines)
│   │   ├── 기본 레이아웃
│   │   ├── 맵 컨테이너 스타일
│   │   ├── 커스텀 마커 스타일
│   │   └── 로그 출력 스타일
│   └── <script>       # JavaScript (400 lines)
│       ├── 데모 데이터 (DEMO_SPOTS, MARKER_EMOJIS 등)
│       ├── 헬퍼 함수 (getMarkerEmoji, isValidCoordinate 등)
│       ├── KakaoMapsDemo 객체
│       │   ├── initializeMap()
│       │   ├── createCustomMarker()
│       │   ├── addInfoWindow()
│       │   ├── displaySpots()
│       │   ├── clearMarkers()
│       │   └── fitToBounds()
│       └── 이벤트 리스너
└── README.md           # 이 문서
```

## 📖 참고 자료

### 공식 문서
- [Kakao Maps API 공식 문서](https://apis.map.kakao.com/web/)
- [Kakao Maps API 가이드](https://apis.map.kakao.com/web/guide/)
- [한국관광공사 API](https://www.data.go.kr/data/15101578/openapi.do)

### EnjoyTrip 원본 파일
이 데모는 다음 파일들에서 추출되었습니다:
- `/assets/js/map-manager.js` - 지도 관리 로직
- `/assets/js/tourism-api.js` - API 연동 및 데이터 처리
- `/assets/js/attractions.js` - 관광지 페이지 통합
- `/assets/css/style.css` - 스타일링
- `/attractions/index.html` - HTML 구조

### 학습 예제
- [Kakao Maps 샘플 코드](https://apis.map.kakao.com/web/sample/)
- [CustomOverlay 예제](https://apis.map.kakao.com/web/sample/basicCustomOverlay1/)
- [InfoWindow 예제](https://apis.map.kakao.com/web/sample/basicInfoWindow/)

## 💡 활용 예제

### 예제 1: 다른 지역 표시하기
```javascript
// DEMO_SPOTS 배열을 서울 데이터로 교체
const SEOUL_SPOTS = [
    {
        id: '126508',
        title: '경복궁',
        address: '서울특별시 종로구 사직로 161',
        contentTypeId: '12',
        mapx: 126.976982,
        mapy: 37.579617
    }
    // ... 더 추가
];

// 지도 중심도 서울로 변경
const options = {
    center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
    level: 8
};
```

### 예제 2: 마커 클릭 시 사이드바 표시
```javascript
markerElement.addEventListener('click', () => {
    // 사이드바에 상세 정보 표시
    document.getElementById('sidebar-title').textContent = spot.title;
    document.getElementById('sidebar-address').textContent = spot.address;
    document.getElementById('sidebar-tel').textContent = spot.tel;
    document.getElementById('sidebar').style.display = 'block';
});
```

### 예제 3: 실제 API 연동
```javascript
async function fetchRealData(areaCode) {
    const apiKey = 'YOUR_TOURISM_API_KEY';
    const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2`;

    const params = new URLSearchParams({
        serviceKey: apiKey,
        areaCode: areaCode,
        numOfRows: 20,
        MobileOS: 'ETC',
        MobileApp: 'Demo',
        _type: 'json'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    const spots = data.response.body.items.item.map(item => ({
        id: item.contentid,
        title: item.title,
        address: item.addr1,
        contentTypeId: item.contenttypeid,
        mapx: parseFloat(item.mapx),
        mapy: parseFloat(item.mapy)
    }));

    KakaoMapsDemo.displaySpots(spots);
}
```

## 🤝 기여 및 피드백

이 레퍼런스는 학습 목적으로 제작되었습니다. 개선 사항이나 질문이 있으시면:

1. 원본 프로젝트: EnjoyTrip
2. 추출 날짜: 2025년
3. 기반 버전: Kakao Maps API v2

## 📄 라이선스

이 데모는 학습 및 참고 목적으로 자유롭게 사용 가능합니다.

- Kakao Maps API는 Kakao의 이용약관을 따릅니다.
- 한국관광공사 API는 공공데이터포털의 이용약관을 따릅니다.

---

**Happy Mapping! 🗺️**
