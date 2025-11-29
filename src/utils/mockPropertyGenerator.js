/**
 * Mock Property Generator
 *
 * 테스트용 매물 데이터 생성 유틸리티
 * 서울 강남권 중심 50개 매물 생성
 */

import { Property } from '@/models/Property'
import {
    PROPERTY_TYPES,
    TRANSACTION_TYPES,
    PROPERTY_FEATURES,
    SEOUL_DISTRICT_COORDINATES,
    pyeongToSqm
} from '@/constants/properties'

/**
 * 강남권 주요 구 (높은 비중으로 생성)
 */
const GANGNAM_DISTRICTS = ['강남구', '서초구', '송파구']

/**
 * 기타 서울 구 (낮은 비중으로 생성)
 */
const OTHER_DISTRICTS = [
    '강동구',
    '마포구',
    '용산구',
    '영등포구',
    '성동구',
    '광진구',
    '양천구',
    '구로구'
]

/**
 * 매물 타입별 이름 템플릿
 */
const PROPERTY_NAME_TEMPLATES = {
    아파트: [
        '래미안',
        '자이',
        '푸르지오',
        '힐스테이트',
        '롯데캐슬',
        'e편한세상',
        '아크로',
        '디에이치'
    ],
    빌라: ['빌라', '빌리지', '하우스', '타운'],
    오피스텔: ['오피스텔', '레지던스', '스위트', '플레이스'],
    주택: ['단독주택', '다가구주택', '타운하우스']
}

/**
 * 부동산 이미지 키워드 (다양한 부동산 이미지 제공)
 */
const PROPERTY_IMAGE_KEYWORDS = [
    'modern-apartment',
    'luxury-home',
    'interior-design',
    'living-room',
    'bedroom',
    'kitchen',
    'apartment-building',
    'modern-architecture',
    'real-estate',
    'house-exterior',
    'city-apartment',
    'minimalist-interior'
]

/**
 * 랜덤 숫자 생성 (범위)
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 랜덤 숫자
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 랜덤 배열 요소 선택
 * @param {Array} array - 배열
 * @returns {*} 랜덤 요소
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * 랜덤 배열 요소 여러 개 선택
 * @param {Array} array - 배열
 * @param {number} count - 선택할 개수
 * @returns {Array} 선택된 요소들
 */
function randomChoices(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

/**
 * 좌표에 랜덤 오프셋 추가 (반경 내)
 * @param {Object} coord - 기준 좌표 { lat, lng }
 * @param {number} radiusKm - 반경 (km)
 * @returns {Object} 오프셋 적용된 좌표
 */
function addRandomOffset(coord, radiusKm = 2) {
    // 대략적인 위도/경도 1도당 거리 (서울 기준)
    const latPerKm = 1 / 111
    const lngPerKm = 1 / 88

    const offsetLat = (Math.random() - 0.5) * 2 * radiusKm * latPerKm
    const offsetLng = (Math.random() - 0.5) * 2 * radiusKm * lngPerKm

    return {
        lat: parseFloat((coord.lat + offsetLat).toFixed(6)),
        lng: parseFloat((coord.lng + offsetLng).toFixed(6))
    }
}

/**
 * 매물 이름 생성
 * @param {string} propertyType - 매물 타입
 * @param {string} sigungu - 시군구
 * @returns {string} 매물 이름
 */
function generatePropertyName(propertyType, sigungu) {
    const templates = PROPERTY_NAME_TEMPLATES[propertyType]
    const template = randomChoice(templates)

    if (propertyType === '아파트') {
        const number = randomInt(1, 9)
        return `${template} ${sigungu.replace('구', '')} ${number}단지`
    } else if (propertyType === '빌라') {
        return `${sigungu.replace('구', '')} ${template}`
    } else if (propertyType === '오피스텔') {
        return `${sigungu.replace('구', '')} ${template}`
    } else {
        return `${sigungu.replace('구', '')} ${template}`
    }
}

/**
 * 매물 주소 생성
 * @param {string} sigungu - 시군구
 * @returns {string} 주소
 */
function generateAddress(sigungu) {
    const dong = `${randomChoice(['역삼', '삼성', '대치', '논현', '신사', '청담', '압구정', '도곡', '개포', '일원'])}동`
    const streetNumber = `${randomInt(1, 999)}-${randomInt(1, 99)}`
    return `${dong} ${streetNumber}`
}

/**
 * 중개인 정보 생성
 * @returns {Object} 중개인 정보
 */
function generateAgentInfo() {
    const names = ['김부동산', '이중개', '박공인', '최매매']
    const name = randomChoice(names)
    const phone = `010-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`

    return {
        name,
        phone,
        company: `${name} 공인중개사무소`
    }
}

/**
 * 단일 매물 생성
 * @param {number} id - 매물 ID
 * @returns {Property} Property 인스턴스
 */
function generateProperty(id) {
    // 매물 타입 결정 (60% 아파트, 30% 오피스텔, 10% 빌라)
    let propertyType
    const rand = Math.random()
    if (rand < 0.6) {
        propertyType = '아파트'
    } else if (rand < 0.9) {
        propertyType = '오피스텔'
    } else {
        propertyType = '빌라'
    }

    // 거래 유형 (90% 매매, 10% 전세)
    const transactionType = Math.random() < 0.9 ? '매매' : '전세'

    // 지역 선택 (70% 강남권, 30% 기타)
    const sigungu =
        Math.random() < 0.7 ? randomChoice(GANGNAM_DISTRICTS) : randomChoice(OTHER_DISTRICTS)

    // 좌표 생성
    const baseCoord = SEOUL_DISTRICT_COORDINATES[sigungu]
    const coordinates = addRandomOffset(baseCoord, 2)

    // 면적 (평수)
    const area = randomInt(15, 45)
    const sqm = pyeongToSqm(area)

    // 가격 (만원 단위: 3억-10억)
    const priceInEok = randomInt(30, 100) // 3억-10억
    const price = priceInEok * 1000 // 만원 단위

    // 방/욕실 개수
    const rooms = area < 20 ? randomInt(1, 2) : area < 30 ? randomInt(2, 3) : randomInt(3, 4)
    const bathrooms = rooms >= 3 ? 2 : 1

    // 층
    const totalFloors = propertyType === '아파트' ? randomInt(10, 25) : randomInt(3, 8)
    const floor = randomInt(2, totalFloors - 1)

    // 건축년도
    const buildYear = randomInt(2005, 2023)

    // 특징 (3-5개 랜덤 선택)
    const featureCount = randomInt(3, 5)
    const features = randomChoices(PROPERTY_FEATURES, featureCount)

    // 이미지 (Unsplash 실제 부동산 사진)
    const imageCount = randomInt(3, 6)
    const images = Array.from({ length: imageCount }, (_, i) => {
        // 각 이미지마다 다른 키워드 사용
        const keyword = PROPERTY_IMAGE_KEYWORDS[i % PROPERTY_IMAGE_KEYWORDS.length]
        // seed를 사용하여 동일한 매물에는 동일한 이미지가 표시되도록 함
        const seed = id * 100 + i
        return {
            url: `https://picsum.photos/seed/${seed}/400/300`,
            alt: `매물 ${id} 사진 ${i + 1}`
        }
    })

    // 설명
    const description = `${sigungu} ${propertyType} ${area}평형 매물입니다. ${features.join(', ')} 등의 특징이 있습니다. ${buildYear}년에 건축되었으며, ${floor}층에 위치해 있습니다.`

    // Property 데이터 객체
    const propertyData = {
        id,
        title: generatePropertyName(propertyType, sigungu),
        propertyType,
        transactionType,
        sido: '서울특별시',
        sigungu,
        coordinates,
        address: generateAddress(sigungu),
        price,
        area,
        sqm,
        rooms,
        bathrooms,
        floor,
        buildYear,
        images,
        features,
        description,
        agentInfo: generateAgentInfo(),
        createdAt: new Date(
            Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000
        ).toISOString() // 최근 30일 이내
    }

    return new Property(propertyData)
}

/**
 * 50개 매물 생성
 * @returns {Property[]} Property 인스턴스 배열
 */
export function generateMockProperties() {
    const properties = []

    for (let i = 1; i <= 50; i++) {
        properties.push(generateProperty(i))
    }

    return properties
}

/**
 * 특정 필터에 맞는 매물 생성
 * @param {Object} filters - 필터 조건
 * @param {number} count - 생성할 개수
 * @returns {Property[]} Property 인스턴스 배열
 */
export function generatePropertiesWithFilters(filters = {}, count = 10) {
    const properties = []
    let id = 1000 // 기본 매물과 구분하기 위해 1000부터 시작

    while (properties.length < count) {
        const property = generateProperty(id++)

        // 필터 적용
        let matches = true

        if (filters.propertyType && property.propertyType !== filters.propertyType) {
            matches = false
        }

        if (
            filters.priceMin !== undefined &&
            filters.priceMax !== undefined &&
            (property.price < filters.priceMin || property.price > filters.priceMax)
        ) {
            matches = false
        }

        if (
            filters.areaMin !== undefined &&
            filters.areaMax !== undefined &&
            (property.area < filters.areaMin || property.area > filters.areaMax)
        ) {
            matches = false
        }

        if (filters.sigungu && property.sigungu !== filters.sigungu) {
            matches = false
        }

        if (matches) {
            properties.push(property)
        }
    }

    return properties
}
