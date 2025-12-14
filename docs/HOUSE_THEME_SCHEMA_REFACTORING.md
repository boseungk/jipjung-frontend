# House Theme Schema Refactoring 구현 완료 보고서

> **작성일:** 2025-12-12  
> **관련 PRD:** [HOUSE_THEME_GAMIFICATION_REFACTORING_PRD.md](./HOUSE_THEME_GAMIFICATION_REFACTORING_PRD.md)

---

## 1. 개요

집짓기 게이미피케이션의 테마 에셋 저장 구조를 간소화했습니다.

| Before | After |
|--------|-------|
| `theme_asset` 테이블 (21행) | `house_theme.image_path` 컬럼 (3행) |
| 레벨별 개별 URL 저장 | 테마당 단일 SVG URL |
| 전체 URL 저장 | 상대 경로만 저장 + CDN 프리픽스 |

---

## 2. 변경된 파일

### Backend

| 파일 | 변경 내용 |
|------|-----------|
| `schema-h2.sql` | `house_theme.image_path` 추가, `theme_asset` 삭제 |
| `schema-mysql.sql` | 동일 |
| `data-h2.sql` | 테마 INSERT에 `image_path` 추가 |
| `data-mysql.sql` | 동일 |
| `HouseTheme.java` | `imagePath` 필드, `getFullImageUrl()` 메서드 |
| `HouseThemeMapper.xml` | `image_path` 컬럼 매핑 |
| `DashboardService.java` | `ThemeAssetMapper` → `HouseThemeMapper` |
| `DashboardResponse.java` | `ShowroomSection.from()` 파라미터 변경 |

### Frontend

| 파일 | 변경 내용 |
|------|-----------|
| `IsometricRoomHero.vue` | `HOUSE_STEPS` 하드코딩 제거, `showroom` 데이터 사용 |
| `authStore.js` | `userShowroom` computed 추가 |
| `gamificationStore.js` | `@deprecated` JSDoc 추가 |

---

## 3. 코드 변경 상세

### 3.1 HouseTheme.java

```java
public class HouseTheme {
    /** CDN 베이스 URL */
    public static final String CDN_BASE_URL = "https://storage.googleapis.com/jipjung-assets/";
    
    /** 기본 SVG 경로 (폴백용) */
    public static final String DEFAULT_IMAGE_PATH = "phase7.svg";

    private String imagePath;  // DB에 상대 경로만 저장 (예: themes/modern/phase.svg)

    /**
     * 전체 이미지 URL 반환
     * @return CDN 전체 URL 또는 폴백 경로
     */
    public String getFullImageUrl() {
        if (imagePath == null || imagePath.isBlank()) {
            return "/" + DEFAULT_IMAGE_PATH;
        }
        return CDN_BASE_URL + imagePath;
    }
}
```

### 3.2 DashboardService.java

```diff
- private final ThemeAssetMapper themeAssetMapper;
+ private final HouseThemeMapper houseThemeMapper;

- ThemeAsset themeAsset = resolveThemeAsset(user.getSelectedThemeId(), userLevel);
+ HouseTheme houseTheme = resolveHouseTheme(user.getSelectedThemeId());

- private ThemeAsset resolveThemeAsset(Integer selectedThemeId, int level) {
-     ThemeAsset asset = themeAssetMapper.findByThemeAndLevel(selectedThemeId, level);
-     ...
- }
+ private HouseTheme resolveHouseTheme(Integer selectedThemeId) {
+     HouseTheme theme = houseThemeMapper.findById(selectedThemeId);
+     if (theme != null && Boolean.TRUE.equals(theme.getIsActive())) {
+         return theme;
+     }
+     // 폴백 처리
+ }
```

### 3.3 ShowroomSection.from()

```diff
- public static ShowroomSection from(User user, GrowthLevel level, ThemeAsset themeAsset, int totalSteps) {
-     String imageUrl = themeAsset != null ? themeAsset.getImageUrl() : ThemeAsset.DEFAULT_IMAGE_URL;
+ public static ShowroomSection from(User user, GrowthLevel level, HouseTheme houseTheme, int totalSteps) {
+     String imageUrl = houseTheme != null ? houseTheme.getFullImageUrl() : "/" + HouseTheme.DEFAULT_IMAGE_PATH;
```

### 3.4 Schema 변경

```sql
-- house_theme 테이블에 image_path 추가
CREATE TABLE house_theme (
    theme_id INT AUTO_INCREMENT PRIMARY KEY,
    theme_code VARCHAR(20) UNIQUE NOT NULL,
    theme_name VARCHAR(50) NOT NULL,
    image_path VARCHAR(100) COMMENT '상대 경로 (예: themes/modern/phase.svg)',  -- 신규
    is_active BOOLEAN DEFAULT TRUE,
    ...
);

-- theme_asset 테이블 삭제됨
-- (단일 SVG per theme 아키텍처로 전환)
```

### 3.5 시드 데이터

```sql
INSERT INTO house_theme (theme_id, theme_code, theme_name, image_path, is_active, is_deleted) VALUES
(1, 'MODERN', '모던 하우스', 'themes/modern/phase.svg', true, false),
(2, 'HANOK', '한옥', 'themes/hanok/phase.svg', true, false),
(3, 'CASTLE', '캐슬', 'themes/castle/phase.svg', true, false);
```

---

## 4. 데이터 흐름

```
[DB] house_theme.image_path
        ↓
[Java] HouseTheme.getFullImageUrl()
        ↓ (CDN_BASE_URL + imagePath)
[DTO] ShowroomSection.imageUrl
        ↓
[API] GET /api/dashboard → showroom.imageUrl
        ↓
[Vue] authStore.user.showroom.imageUrl
        ↓
[Component] IsometricRoomHero.vue → fetch(imageUrl)
```

---

## 5. 남은 작업

| 항목 | 상태 | 담당 |
|------|------|------|
| GCS에 SVG 파일 업로드 | ⏳ 대기 | 사용자 |
| GCS CORS 설정 | ⏳ 대기 | 사용자 |

### GCS CORS 설정 예시

```json
[
  {
    "origin": ["https://your-app-domain.com", "http://localhost:5173"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 6. 검증 체크리스트

- [x] 스키마 변경 완료 (H2, MySQL)
- [x] `HouseTheme.getFullImageUrl()` 동작 확인
- [x] `DashboardService`에서 `HouseThemeMapper` 사용
- [x] `ShowroomSection`에서 `HouseTheme` 파라미터 사용
- [x] 프론트엔드 `showroom.imageUrl` 접근 가능
- [ ] 빌드 및 통합 테스트 (수동)
- [ ] GCS 연동 테스트 (사용자)
