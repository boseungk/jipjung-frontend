# 집-중 (Jip-joong) REST API 명세서

## 개요

**프로젝트**: 감성 저축 게이미피케이션 앱
**API 버전**: v1.0
**Base URL**: `http://localhost:8080/api`
**인증 방식**: JWT Bearer Token
**총 API 개수**: 24개

---

## 인증 설정

모든 API 요청은 다음 헤더를 포함합니다:

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## 응답 형식

### 성공 응답 (200, 201)
```json
{
  "data": { /* 실제 데이터 */ },
  "message": "작업 완료 메시지"
}
```

### 에러 응답 (400, 401, 404, 500)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 에러 메시지"
  }
}
```

---

# 1. 인증 API (5개)

## 1-1. POST /api/auth/register
**회원가입**

사용 화면: `RegisterView.vue`

### 요청
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "birthYear": 1995
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| email | string | O | 이메일 (유일) | user@example.com |
| password | string | O | 비밀번호 (8자 이상) | password123 |
| name | string | O | 사용자 이름 | 홍길동 |
| birthYear | number | O | 출생년도 | 1995 |

### 응답 (201 Created)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dGhpcy4uLi",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "birthYear": 1995,
    "onboardingCompleted": false,
    "createdAt": "2025-12-02T10:00:00Z"
  }
}
```

### 에러
- `400`: 이메일 중복, 유효성 검증 실패
- `500`: 서버 오류

---

## 1-2. POST /api/auth/login
**로그인**

사용 화면: `LoginView.vue`

### 요청
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 이메일 |
| password | string | O | 비밀번호 |

### 응답 (200)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dGhpcy4uLi",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "birthYear": 1995,
    "annualIncome": 50000000,
    "existingLoanMonthly": 500000,
    "onboardingCompleted": true,
    "preferredAreas": ["강남구", "서초구"],
    "dreamHome": {
      "dreamHomeId": "property_123",
      "propertyName": "강남 아파트",
      "location": "서울 강남구",
      "price": 800000000,
      "targetAmount": 240000000,
      "currentAmount": 50000000,
      "monthlyGoal": 2000000,
      "targetDate": "2027-12-31"
    },
    "gamification": {
      "currentLevel": 3,
      "levelTitle": "꾸준한 실천가",
      "experiencePoints": 450,
      "nextLevelExp": 1000,
      "currentStreak": 5,
      "longestStreak": 12,
      "treesCollected": 3
    }
  }
}
```

### 에러
- `400`: 유효성 검증 실패
- `401`: 이메일 또는 비밀번호 오류

---

## 1-3. POST /api/auth/refresh
**토큰 갱신**

### 요청
```json
{
  "refreshToken": "dGhpcy4uLi"
}
```

### 응답 (200)
```json
{
  "accessToken": "new_eyJhbGc..."
}
```

### 에러
- `401`: Refresh token 만료 또는 유효하지 않음

---

## 1-4. GET /api/auth/me
**현재 사용자 조회**

### 요청
```
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "birthYear": 1995,
  "annualIncome": 50000000,
  "existingLoanMonthly": 500000,
  "onboardingCompleted": true,
  "preferredAreas": ["강남구", "서초구"],
  "dreamHome": { /* 생략 */ },
  "gamification": { /* 생략 */ }
}
```

---

## 1-5. POST /api/auth/logout
**로그아웃**

### 요청
```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "message": "로그아웃 성공"
}
```

---

# 2. 온보딩 & 프로필 API (2개)

## 2-1. PUT /api/auth/onboarding
**온보딩 정보 저장**

사용 화면: `OnboardingView.vue`

### 요청
```json
{
  "birthYear": 1995,
  "annualIncome": 50000000,
  "existingLoanMonthly": 500000,
  "preferredAreas": ["강남구", "서초구", "송파구"]
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| birthYear | number | O | 출생년도 | 1995 |
| annualIncome | number | O | 연소득 (만원 단위) | 50000000 |
| existingLoanMonthly | number | O | 월 대출 상환액 (만원) | 500000 |
| preferredAreas | array | O | 선호 지역 배열 | ["강남구", "서초구"] |

### 응답 (200)
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "birthYear": 1995,
    "annualIncome": 50000000,
    "existingLoanMonthly": 500000,
    "preferredAreas": ["강남구", "서초구", "송파구"],
    "onboardingCompleted": true,
    "dreamHome": {
      "dreamHomeId": null,
      "propertyName": "꿈의 집",
      "location": "서울",
      "price": 500000000,
      "targetAmount": 150000000,
      "currentAmount": 0,
      "monthlyGoal": 2000000,
      "targetDate": "2027-12-31"
    },
    "gamification": {
      "currentLevel": 1,
      "levelTitle": "새내기 건축가",
      "experiencePoints": 0,
      "nextLevelExp": 100,
      "currentStreak": 0,
      "longestStreak": 0,
      "treesCollected": 0
    }
  }
}
```

---

## 2-2. PUT /api/users/profile
**프로필 수정**

사용 화면: `ProfileSettingsView.vue`

### 요청
```json
{
  "name": "홍길동",
  "birthYear": 1995,
  "annualIncome": 55000000,
  "existingLoanMonthly": 450000
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | O | 사용자 이름 |
| birthYear | number | O | 출생년도 |
| annualIncome | number | O | 연소득 (만원 단위) |
| existingLoanMonthly | number | O | 월 대출 상환액 (만원) |

### 응답 (200)
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "birthYear": 1995,
    "annualIncome": 55000000,
    "existingLoanMonthly": 450000,
    "onboardingCompleted": true,
    "preferredAreas": ["강남구", "서초구"],
    "dreamHome": { /* 생략 */ },
    "gamification": { /* 생략 */ },
    "updatedAt": "2025-12-02T15:30:00Z"
  }
}
```

---

# 3. 대시보드 API (1개)

## 3-1. GET /api/users/dashboard
**대시보드 통합 데이터 조회**

사용 화면: `DashboardView.vue`

### 요청
```
GET /api/users/dashboard
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "user": {
    "id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "birthYear": 1995,
    "annualIncome": 50000000,
    "existingLoanMonthly": 500000
  },
  "dreamHome": {
    "dreamHomeId": "property_123",
    "propertyName": "강남 아파트",
    "location": "서울 강남구",
    "price": 800000000,
    "targetAmount": 240000000,
    "currentAmount": 50000000,
    "monthlyGoal": 2000000,
    "targetDate": "2027-12-31",
    "achievementRate": 20.8,
    "daysRemaining": 1095
  },
  "gamification": {
    "currentLevel": 3,
    "levelTitle": "꾸준한 실천가",
    "experiencePoints": 450,
    "nextLevelExp": 1000,
    "expProgress": 45.0,
    "currentStreak": 5,
    "longestStreak": 12,
    "treesCollected": 3
  },
  "dsr": {
    "dsrRatio": 12,
    "dsrStatus": {
      "label": "안전",
      "class": "safe",
      "color": "#66BB6A"
    },
    "monthlyIncome": 4166666,
    "monthlyRepaymentCapacity": 1666666,
    "maxLoanAmount": 400000000,
    "requiredEquity": 400000000
  }
}
```

---

# 4. 매물 API (6개)

## 4-1. GET /api/properties
**매물 목록 조회 (필터링, 페이지네이션)**

사용 화면: `PropertyListView.vue`

### 요청
```
GET /api/properties?page=1&limit=50&propertyType=아파트&sido=서울특별시&priceMin=500000000&priceMax=1000000000
Authorization: Bearer {accessToken}
```

### 쿼리 파라미터
| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| page | number | 페이지 번호 (기본: 1) | 1 |
| limit | number | 페이지당 항목 수 (기본: 50) | 50 |
| sortBy | string | 정렬 기준 (price, area, createdAt) | price |
| sortOrder | string | 정렬 순서 (asc, desc) | asc |
| propertyType | string | 매물 타입 (아파트, 빌라, 오피스텔, 단독주택) | 아파트 |
| transactionType | string | 거래 유형 (매매, 전세, 월세) | 매매 |
| priceMin | number | 최소 가격 | 500000000 |
| priceMax | number | 최대 가격 | 1000000000 |
| areaMin | number | 최소 면적 (m²) | 50 |
| areaMax | number | 최대 면적 (m²) | 150 |
| sido | string | 시/도 | 서울특별시 |
| sigungu | string | 시/군/구 | 강남구 |
| rooms | number | 최소 방 개수 | 2 |
| bathrooms | number | 최소 욕실 개수 | 1 |
| features | array | 특징 배열 (주차가능, 엘리베이터, 반려동물) | ["주차가능"] |
| keyword | string | 검색어 | 역삼 |

### 응답 (200)
```json
{
  "properties": [
    {
      "id": 1,
      "title": "강남역 역세권 신축 아파트",
      "propertyType": "아파트",
      "transactionType": "매매",
      "price": 850000000,
      "area": 84.5,
      "rooms": 3,
      "bathrooms": 2,
      "address": "서울특별시 강남구 역삼동 123-45",
      "sido": "서울특별시",
      "sigungu": "강남구",
      "dong": "역삼동",
      "coordinates": {
        "lat": 37.5012,
        "lng": 127.0395
      },
      "images": ["https://cdn.example.com/property1_1.jpg"],
      "features": ["주차가능", "엘리베이터"],
      "description": "강남역 도보 5분 거리 신축 아파트",
      "buildYear": 2024,
      "floor": 12,
      "totalFloors": 15,
      "maintenanceFee": 250000,
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3,
  "limit": 50
}
```

---

## 4-2. GET /api/properties/{propertyId}
**단일 매물 상세 조회**

사용 화면: `PropertyListView.vue` (상세 모달)

### 요청
```
GET /api/properties/1
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "id": 1,
  "title": "강남역 역세권 신축 아파트",
  "propertyType": "아파트",
  "transactionType": "매매",
  "price": 850000000,
  "area": 84.5,
  "rooms": 3,
  "bathrooms": 2,
  "address": "서울특별시 강남구 역삼동 123-45",
  "coordinates": {
    "lat": 37.5012,
    "lng": 127.0395
  },
  "images": [
    "https://cdn.example.com/property1_1.jpg",
    "https://cdn.example.com/property1_2.jpg"
  ],
  "features": ["주차가능", "엘리베이터", "반려동물"],
  "description": "강남역 도보 5분 거리 신축 아파트. 남향, 전망 좋음.",
  "buildYear": 2024,
  "floor": 12,
  "totalFloors": 15,
  "maintenanceFee": 250000,
  "heatingType": "중앙난방",
  "parkingSpaces": 2,
  "moveInDate": "즉시입주가능",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

---

## 4-3. GET /api/users/saved-properties
**저장된 매물 목록 조회**

사용 화면: `DashboardView.vue`

### 요청
```
GET /api/users/saved-properties
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "properties": [
    {
      "id": 1,
      "title": "강남역 역세권 신축 아파트",
      "propertyType": "아파트",
      "price": 850000000,
      "area": 84.5,
      "address": "서울특별시 강남구 역삼동 123-45",
      "images": ["https://cdn.example.com/property1_1.jpg"],
      "savedAt": "2025-11-20T10:00:00Z"
    }
  ]
}
```

---

## 4-4. GET /api/users/saved-properties/ids
**저장된 매물 ID 목록**

사용 화면: `PropertyListView.vue` (저장 상태 표시)

### 요청
```
GET /api/users/saved-properties/ids
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "savedPropertyIds": [1, 5, 12, 23]
}
```

---

## 4-5. POST /api/users/saved-properties/{propertyId}/toggle
**매물 저장/취소 토글**

사용 화면: `PropertyListView.vue`

### 요청
```
POST /api/users/saved-properties/1/toggle
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "isSaved": true,
  "message": "매물이 저장되었습니다"
}
```

---

## 4-6. DELETE /api/users/saved-properties/{propertyId}
**매물 저장 취소**

사용 화면: `DashboardView.vue` (저장된 매물 관리)

### 요청
```
DELETE /api/users/saved-properties/1
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "message": "매물 저장이 취소되었습니다"
}
```

---

# 5. 영수증/지출 API (3개)

## 5-1. GET /api/receipts
**영수증 목록 조회**

사용 화면: `AiManagerView.vue`

### 요청
```
GET /api/receipts?status=pending&page=1&limit=20
Authorization: Bearer {accessToken}
```

### 쿼리 파라미터
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| status | string | 상태 (pending, processed, all) |
| page | number | 페이지 번호 |
| limit | number | 페이지당 항목 수 |

### 응답 (200)
```json
{
  "receipts": [
    {
      "id": 1,
      "merchantName": "치킨플러스",
      "amount": 31000,
      "category": "배달/식비",
      "date": "2025-12-01T18:30:00Z",
      "processed": false,
      "imageUrl": "https://cdn.example.com/receipt_1.jpg",
      "userResponse": null,
      "aiJudgment": null,
      "createdAt": "2025-12-01T18:35:00Z"
    }
  ],
  "total": 5,
  "pending": 2,
  "processed": 3
}
```

---

## 5-2. POST /api/receipts
**영수증 추가**

사용 화면: `AiManagerView.vue`

### 요청 (multipart/form-data)
```
POST /api/receipts
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

{
  "merchantName": "스타벅스",
  "amount": 4500,
  "category": "카페/음료",
  "date": "2025-12-02T14:20:00Z",
  "image": File (optional)
}
```

### 응답 (201 Created)
```json
{
  "id": 2,
  "merchantName": "스타벅스",
  "amount": 4500,
  "category": "카페/음료",
  "date": "2025-12-02T14:20:00Z",
  "processed": false,
  "imageUrl": "https://cdn.example.com/receipt_2.jpg",
  "createdAt": "2025-12-02T14:25:00Z"
}
```

---

## 5-3. PUT /api/receipts/{receiptId}/process
**영수증 처리 (AI 심문 완료)**

사용 화면: `AiManagerView.vue` (청문회 완료)

### 요청
```json
{
  "userResponse": "회식이었어요. 팀 분위기도 좋아지고 필요한 지출이었습니다.",
  "aiJudgment": "REASONABLE",
  "experienceGained": 50
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| userResponse | string | O | 사용자 변명 | "회식이었어요..." |
| aiJudgment | string | O | AI 판단 (REASONABLE, WASTE) | REASONABLE |
| experienceGained | number | O | 획득한 경험치 | 50 |

### 응답 (200)
```json
{
  "id": 1,
  "merchantName": "치킨플러스",
  "amount": 31000,
  "category": "배달/식비",
  "date": "2025-12-01T18:30:00Z",
  "processed": true,
  "userResponse": "회식이었어요...",
  "aiJudgment": "REASONABLE",
  "experienceGained": 50,
  "processedAt": "2025-12-02T15:00:00Z"
}
```

---

# 6. 드림홈 API (2개)

## 6-1. PUT /api/users/dream-home
**드림홈 변경**

사용 화면: `DashboardView.vue` (드림홈 카드)

### 요청
```json
{
  "dreamHomeId": "property_456",
  "propertyName": "부산 해운대 아파트",
  "location": "부산 해운대구",
  "price": 800000000,
  "targetAmount": 240000000,
  "monthlyGoal": 3000000,
  "targetDate": "2028-12-31"
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| dreamHomeId | string | O | 매물 ID |
| propertyName | string | O | 매물명 |
| location | string | O | 위치 |
| price | number | O | 가격 (만원) |
| targetAmount | number | O | 목표 금액 (만원) |
| monthlyGoal | number | O | 월 목표 저축액 (만원) |
| targetDate | string | O | 목표 날짜 (YYYY-MM-DD) |

### 응답 (200)
```json
{
  "dreamHome": {
    "dreamHomeId": "property_456",
    "propertyName": "부산 해운대 아파트",
    "location": "부산 해운대구",
    "price": 800000000,
    "targetAmount": 240000000,
    "currentAmount": 50000000,
    "monthlyGoal": 3000000,
    "targetDate": "2028-12-31"
  }
}
```

---

## 6-2. POST /api/users/dream-home/progress
**저축 진행률 업데이트**

사용 화면: `DashboardView.vue` (저축 액션)

### 요청
```json
{
  "amount": 1000000,
  "memo": "월급 저축"
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| amount | number | O | 증가/감소 금액 (만원, 음수 가능) |
| memo | string | O | 메모 |

### 응답 (200)
```json
{
  "dreamHome": {
    "currentAmount": 51000000,
    "targetAmount": 240000000,
    "achievementRate": 21.25
  },
  "gamification": {
    "experiencePoints": 500,
    "gainedExp": 50
  }
}
```

---

# 7. 게임화 API (2개)

## 7-1. POST /api/users/gamification/experience
**경험치 추가**

사용 화면: `DashboardView.vue` (Gamification Card)

### 요청
```json
{
  "amount": 100,
  "reason": "영수증 심문 성공"
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| amount | number | O | 경험치량 |
| reason | string | O | 경험치 획득 사유 |

### 응답 (200)
```json
{
  "gamification": {
    "currentLevel": 3,
    "levelTitle": "꾸준한 실천가",
    "experiencePoints": 550,
    "nextLevelExp": 1000,
    "leveledUp": false
  }
}
```

---

## 7-2. POST /api/users/gamification/streak
**스트릭 업데이트**

사용 화면: `DashboardView.vue` (Weekly Streak Card)

### 요청
```json
{
  "action": "increment"
}
```

### 요청 필드
| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| action | string | O | 액션 (increment, reset) | increment |

### 응답 (200)
```json
{
  "gamification": {
    "currentStreak": 6,
    "longestStreak": 12
  }
}
```

---

# 8. 통계 API (2개)

## 8-1. GET /api/users/statistics/monthly-spending
**월간 지출 통계**

사용 화면: `DashboardView.vue` (Asset Growth Card)

### 요청
```
GET /api/users/statistics/monthly-spending?months=6
Authorization: Bearer {accessToken}
```

### 쿼리 파라미터
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| months | number | 조회할 개월 수 (기본: 6) |

### 응답 (200)
```json
{
  "monthlyData": [
    {
      "month": "2025-07",
      "spending": 1500000,
      "saving": 500000,
      "receiptsCount": 23
    },
    {
      "month": "2025-08",
      "spending": 1300000,
      "saving": 700000,
      "receiptsCount": 19
    }
  ],
  "totalSpending": 8500000,
  "totalSaving": 3500000,
  "averageMonthlySpending": 1416666
}
```

---

## 8-2. GET /api/users/statistics/profile
**사용자 프로필 통계**

사용 화면: `ProfileSettingsView.vue` (프로필 페이지)

### 요청
```
GET /api/users/statistics/profile
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "profile": {
    "nickname": "건축왕",
    "title": "전설의 짠돌이",
    "level": 5,
    "badges": ["badge_no_spend_week", "badge_defense_master"],
    "joinDate": "2025-01-01"
  },
  "stats": {
    "defenseRate": 64.5,
    "totalSavings": 5000000,
    "weaknessCategory": "FOOD",
    "rankPercent": 5,
    "monthlySpending": [
      { "month": "2025-10", "amount": 800000 },
      { "month": "2025-11", "amount": 650000 }
    ]
  },
  "managerComment": {
    "mood": "HAPPY",
    "text": "지난달보다 식비를 20%나 줄였네? 칭찬해줄게."
  }
}
```

---

# 9. 컬렉션 API (1개)

## 9-1. GET /api/users/collections
**저장된 드림홈 컬렉션 조회**

사용 화면: `CollectionView.vue`

### 요청
```
GET /api/users/collections
Authorization: Bearer {accessToken}
```

### 응답 (200)
```json
{
  "collections": [
    {
      "id": 1,
      "propertyId": 123,
      "name": "서울 강남 오피스텔",
      "imageUrl": "https://cdn.example.com/property_123.jpg",
      "price": 500000000,
      "targetAmount": 150000000,
      "savedAt": "2025-10-15T10:00:00Z",
      "isActive": true
    },
    {
      "id": 2,
      "propertyId": 456,
      "name": "부산 해운대 아파트",
      "imageUrl": "https://cdn.example.com/property_456.jpg",
      "price": 800000000,
      "targetAmount": 240000000,
      "savedAt": "2025-11-20T14:30:00Z",
      "isActive": false
    }
  ]
}
```

---

# 개발 우선순위

## Phase 1: MVP 필수 (8개 API)
1. **인증 API (5개)** - 로그인/회원가입 기능
2. **온보딩 API (1개)** - 초기 사용자 설정
3. **대시보드 API (1개)** - 메인 화면 데이터
4. **프로필 수정 API (1개)** - 사용자 정보 관리

## Phase 2: 핵심 기능 (6개 API)
1. **매물 조회 API (2개)** - 목록 조회, 상세 조회
2. **드림홈 API (2개)** - 드림홈 변경, 진행률 업데이트
3. **게임화 API (2개)** - 경험치 추가, 스트릭 업데이트

## Phase 3: 확장 기능 (10개 API)
1. **매물 저장 API (4개)** - 저장된 매물 관리
2. **영수증 API (3개)** - AI 관리인 기능
3. **통계 API (2개)** - 데이터 분석
4. **컬렉션 API (1개)** - 히스토리 관리

---

## 주요 개발 고려사항

### 인증 및 보안
- 모든 요청에 `Authorization: Bearer {token}` 헤더 필수
- Refresh token 만료 시 로그아웃 처리
- 비밀번호는 bcrypt 등으로 해싱 필요

### 데이터 단위
- 모든 금액: 만원 단위 (5억 = 500000000)
- 날짜: ISO 8601 형식 (YYYY-MM-DDTHH:mm:ssZ)
- 지역: "시/도 시/군/구" 형식

### DSR 계산
- 백엔드에서 사용자의 `annualIncome`, `existingLoanMonthly`를 기반으로 계산
- 응답에 `dsrRatio`, `maxLoanAmount` 포함

### 페이지네이션
- 모든 리스트 API에 `page`, `limit`, `total`, `totalPages` 포함
- 기본 `limit`: 50

### 에러 처리
- 모든 에러 응답은 `{ error: { code, message } }` 형식
- HTTP 상태 코드 적절히 사용 (400, 401, 404, 500)

