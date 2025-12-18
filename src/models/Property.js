/**
 * Property Model
 *
 * 매물 정보를 관리하는 클래스
 * 가격 포맷팅, 구매 가능 여부 판단 등의 비즈니스 로직 포함
 */

export class Property {
    /**
     * Property 생성자
     * @param {Object} data - 매물 데이터
     */
    constructor(data) {
        // 기본 정보
        this.id = data.id
        this.title = data.title
        this.propertyType = data.propertyType // 아파트, 빌라, 오피스텔, 주택
        this.transactionType = data.transactionType // 매매, 전세, 월세

        // 위치 정보
        this.sido = data.sido
        this.sigungu = data.sigungu
        this.coordinates = data.coordinates // { lat, lng }
        this.address = data.address

        // 상세 정보
        this.price = data.price // 만원 단위
        this.area = data.area // 평수
        this.sqm = data.sqm // 제곱미터
        this.rooms = data.rooms // 방 개수
        this.bathrooms = data.bathrooms // 욕실 개수
        this.floor = data.floor // 층
        this.buildYear = data.buildYear // 건축년도

        // 추가 정보
        this.images = data.images || [] // 이미지 URL 배열
        this.features = data.features || [] // 특징 배열
        this.description = data.description || ''
        const rawAgentInfo = data.agentInfo
        if (rawAgentInfo && typeof rawAgentInfo === 'object' && Object.keys(rawAgentInfo).length === 0) {
            this.agentInfo = null
        } else {
            this.agentInfo = rawAgentInfo ?? null
        }
        this.createdAt = data.createdAt || new Date().toISOString()
    }

    /**
     * 가격을 사람이 읽기 쉬운 형식으로 포맷팅
     * @returns {string} 포맷팅된 가격 (예: "5.0억", "1.2억")
     */
    getFormattedPrice() {
        const priceInEok = this.price / 10000 // 만원 -> 억

        if (priceInEok >= 1) {
            // 1억 이상: "5.0억", "1.2억"
            return `${priceInEok.toFixed(1)}억`
        } else {
            // 1억 미만: "5,000만원"
            return `${this.price.toLocaleString()}만원`
        }
    }

    /**
     * 주어진 예산으로 구매 가능한지 확인
     * @param {number} budget - 예산 (만원 단위)
     * @returns {boolean} 구매 가능 여부
     */
    isAffordable(budget) {
        return this.price <= budget
    }

    /**
     * 계약금(30%)을 계산
     * @returns {number} 계약금 (만원 단위)
     */
    getDownPayment() {
        return Math.round(this.price * 0.3)
    }

    /**
     * 계약금(기본 30%)을 계산
     * @param {number} [rate=0.3] - 계약금 비율
     * @returns {number} 계약금 (원 단위)
     */
    getDownPaymentWon(rate = 0.3) {
        const priceManwon = Number(this.price) || 0
        return Math.ceil(priceManwon * 10000 * rate)
    }

    /**
     * 드림홈 목표금(원) 기준으로 구매 가능한지 확인 (계약금 30% 기준)
     * @param {number} targetAmountWon - 드림홈 목표 금액 (원)
     * @param {number} [rate=0.3] - 계약금 비율
     * @returns {boolean} 구매 가능 여부
     */
    isAffordableByTargetAmount(targetAmountWon, rate = 0.3) {
        const budgetWon = Number(targetAmountWon) || 0
        return this.getDownPaymentWon(rate) <= budgetWon
    }

    /**
     * 월세인 경우 월세 정보 반환
     * @returns {Object|null} { deposit, monthlyRent } 또는 null
     */
    getMonthlyRentInfo() {
        if (this.transactionType === '월세') {
            return {
                deposit: this.deposit || 0,
                monthlyRent: this.monthlyRent || 0
            }
        }
        return null
    }

    /**
     * 매물의 전체 주소 반환
     * @returns {string} 전체 주소
     */
    getFullAddress() {
        return `${this.sido} ${this.sigungu} ${this.address}`
    }

    /**
     * 매물이 신축인지 확인 (5년 이내)
     * @returns {boolean} 신축 여부
     */
    isNewBuilding() {
        const currentYear = new Date().getFullYear()
        return currentYear - this.buildYear <= 5
    }

    /**
     * 역세권 여부 확인
     * @returns {boolean} 역세권 여부
     */
    isNearStation() {
        return this.features.includes('역세권')
    }

    /**
     * 주차 가능 여부 확인
     * @returns {boolean} 주차 가능 여부
     */
    hasParkingAvailable() {
        return this.features.includes('주차 가능')
    }

    /**
     * 매물 정보를 JSON 객체로 변환
     * @returns {Object} JSON 객체
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            propertyType: this.propertyType,
            transactionType: this.transactionType,
            sido: this.sido,
            sigungu: this.sigungu,
            coordinates: this.coordinates,
            address: this.address,
            price: this.price,
            area: this.area,
            sqm: this.sqm,
            rooms: this.rooms,
            bathrooms: this.bathrooms,
            floor: this.floor,
            buildYear: this.buildYear,
            images: this.images,
            features: this.features,
            description: this.description,
            agentInfo: this.agentInfo,
            createdAt: this.createdAt
        }
    }

    /**
     * JSON 데이터로부터 Property 인스턴스 생성
     * @param {Object} json - JSON 데이터
     * @returns {Property} Property 인스턴스
     */
    static fromJSON(json) {
        return new Property(json)
    }
}
