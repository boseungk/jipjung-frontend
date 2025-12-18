/**
 * 테스트 사용자 데이터
 * 
 * 실제 테스트 시 유효한 계정 정보로 교체 필요
 */
export const TEST_USERS = {
    valid: {
        email: 'gda05189@gmail.com  ',
        password: 'qweqwe123!',
        nickname: '강보승'
    },
    invalid: {
        email: 'wrong@example.com',
        password: 'wrongpassword'
    },
    newUser: {
        email: `test-${Date.now()}@example.com`,
        password: 'NewUser1234!',
        nickname: '새사용자'
    }
};

/**
 * 테스트용 저축 데이터
 */
export const TEST_SAVINGS = {
    quickAmounts: [10000, 50000, 100000, 500000, 1000000],
    testAmount: 100000,  // 10만원
    memo: 'E2E 테스트 저축'
};

/**
 * 테스트용 아파트 데이터
 */
export const TEST_APARTMENT = {
    searchKeyword: '강남',
    expectedResultCount: 1  // 최소 1개 이상 결과 기대
};
