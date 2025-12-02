/**
 * Mock Auth Service
 * localStorage를 사용하여 실제 백엔드 API를 시뮬레이션
 * 실제 백엔드 준비 시 authService.js로 교체
 */

import { DEFAULT_DREAM_HOME, DEFAULT_GAMIFICATION } from '@/constants/user'

// Mock 사용자 데이터베이스 (localStorage)
const USERS_KEY = 'jipjung_mock_users'
const SESSIONS_KEY = 'jipjung_mock_sessions'

// 초기 Mock 사용자 데이터
const INITIAL_MOCK_USERS = [
    {
        id: 1,
        email: 'test@example.com',
        password: 'password123', // 실제로는 해시되어야 함
        name: '홍길동',
        birthYear: 1995,
        annualIncome: 5000,
        existingLoanMonthly: 50,
        onboardingCompleted: true,
        dreamHome: DEFAULT_DREAM_HOME,
        gamification: DEFAULT_GAMIFICATION,
        preferredAreas: [
            { sido: '서울특별시', sigungu: '강남구' },
            { sido: '경기도', sigungu: '성남시' }
        ],
        createdAt: new Date().toISOString()
    }
]

function ensureDefaults(user) {
    if (!user) return user
    return {
        ...user,
        dreamHome: {
            ...DEFAULT_DREAM_HOME,
            ...(user.dreamHome || {})
        },
        gamification: {
            ...DEFAULT_GAMIFICATION,
            ...(user.gamification || {})
        }
    }
}

// Helper: 사용자 목록 가져오기
function getUsers() {
    const users = localStorage.getItem(USERS_KEY)
    if (!users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS))
        return INITIAL_MOCK_USERS.map(ensureDefaults)
    }
    return JSON.parse(users).map(ensureDefaults)
}

// Helper: 사용자 목록 저장
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Helper: JWT 토큰 생성 (Mock)
function generateToken(userId) {
    return `mock_token_${userId}_${Date.now()}`
}

// Helper: 토큰에서 userId 추출 (Mock)
function getUserIdFromToken(token) {
    const match = token.match(/mock_token_(\d+)_/)
    return match ? parseInt(match[1]) : null
}

// Helper: 세션 저장
function saveSession(userId, tokens) {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
    sessions[userId] = {
        ...tokens,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1시간
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

// Helper: 세션 검증
function validateSession(token) {
    const userId = getUserIdFromToken(token)
    if (!userId) return false

    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
    const session = sessions[userId]

    if (!session) return false
    if (new Date(session.expiresAt) < new Date()) {
        delete sessions[userId]
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
        return false
    }

    return true
}

// 지연 시뮬레이션 (실제 API처럼 보이게)
function delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function mergeUserData(existingUser, updates) {
    const merged = { ...existingUser }

    Object.entries(updates).forEach(([key, value]) => {
        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            merged[key] = {
                ...(existingUser[key] || {}),
                ...value
            }
        } else {
            merged[key] = value
        }
    })

    return merged
}

export const mockAuthService = {
    /**
     * 회원가입
     */
    async register(userData) {
        await delay()

        const users = getUsers()

        // 이메일 중복 체크
        if (users.find(u => u.email === userData.email)) {
            throw {
                response: {
                    status: 400,
                    data: { message: '이미 사용 중인 이메일입니다.' }
                }
            }
        }

        // 새 사용자 생성
        const newUser = ensureDefaults({
            id: users.length + 1,
            email: userData.email,
            password: userData.password, // 실제로는 해시되어야 함
            name: userData.name,
            birthYear: userData.birthYear,
            annualIncome: null,
            existingLoanMonthly: null,
            onboardingCompleted: false,
            preferredAreas: [],
            createdAt: new Date().toISOString()
        })

        users.push(newUser)
        saveUsers(users)

        // 토큰 생성
        const accessToken = generateToken(newUser.id)
        const refreshToken = generateToken(newUser.id)

        saveSession(newUser.id, { accessToken, refreshToken })

        // 비밀번호 제외하고 반환
        const { password, ...userWithoutPassword } = newUser

        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
        }
    },

    /**
     * 로그인
     */
    async login(email, password) {
        await delay()

        const users = getUsers()
        const user = users.find(u => u.email === email)

        if (!user || user.password !== password) {
            throw {
                response: {
                    status: 401,
                    data: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
                }
            }
        }

        // 토큰 생성
        const accessToken = generateToken(user.id)
        const refreshToken = generateToken(user.id)

        saveSession(user.id, { accessToken, refreshToken })

        const { password: _, ...userWithoutPassword } = ensureDefaults(user)

        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
        }
    },

    /**
     * 토큰 갱신
     */
    async refreshToken(refreshToken) {
        await delay(100)

        const userId = getUserIdFromToken(refreshToken)
        if (!userId) {
            throw {
                response: {
                    status: 401,
                    data: { message: '유효하지 않은 토큰입니다.' }
                }
            }
        }

        const newAccessToken = generateToken(userId)

        const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
        if (sessions[userId]) {
            sessions[userId].accessToken = newAccessToken
            sessions[userId].expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
        }

        return {
            accessToken: newAccessToken
        }
    },

    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser(token) {
        await delay(100)

        if (!validateSession(token)) {
            throw {
                response: {
                    status: 401,
                    data: { message: '인증이 만료되었습니다.' }
                }
            }
        }

        const userId = getUserIdFromToken(token)
        const users = getUsers()
        const user = users.find(u => u.id === userId)

        if (!user) {
            throw {
                response: {
                    status: 404,
                    data: { message: '사용자를 찾을 수 없습니다.' }
                }
            }
        }

        const { password, ...userWithoutPassword } = ensureDefaults(user)
        return userWithoutPassword
    },

    /**
     * 온보딩 정보 저장
     */
    async completeOnboarding(token, onboardingData) {
        await delay()

        if (!validateSession(token)) {
            throw {
                response: {
                    status: 401,
                    data: { message: '인증이 만료되었습니다.' }
                }
            }
        }

        const userId = getUserIdFromToken(token)
        const users = getUsers()
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            throw {
                response: {
                    status: 404,
                    data: { message: '사용자를 찾을 수 없습니다.' }
                }
            }
        }

        // 사용자 정보 업데이트
        users[userIndex] = mergeUserData(users[userIndex], {
            birthYear: onboardingData.birthYear,
            annualIncome: onboardingData.annualIncome,
            existingLoanMonthly: onboardingData.existingLoanMonthly,
            preferredAreas: onboardingData.preferredAreas,
            onboardingCompleted: true,
            updatedAt: new Date().toISOString()
        })

        saveUsers(users)

        const { password, ...userWithoutPassword } = ensureDefaults(users[userIndex])

        return {
            user: userWithoutPassword
        }
    },

    /**
     * 프로필 수정
     */
    async updateProfile(token, profileData) {
        await delay()

        if (!validateSession(token)) {
            throw {
                response: {
                    status: 401,
                    data: { message: '인증이 만료되었습니다.' }
                }
            }
        }

        const userId = getUserIdFromToken(token)
        const users = getUsers()
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            throw {
                response: {
                    status: 404,
                    data: { message: '사용자를 찾을 수 없습니다.' }
                }
            }
        }

        // 연소득 변경 횟수 체크 (7일 내 3회 이상)
        // TODO: 실제 구현 시 변경 이력 테이블 필요

        users[userIndex] = mergeUserData(users[userIndex], {
            ...profileData,
            updatedAt: new Date().toISOString()
        })

        saveUsers(users)

        const { password, ...userWithoutPassword } = ensureDefaults(users[userIndex])

        return {
            user: userWithoutPassword
        }
    },

    /**
     * 로그아웃 (세션 삭제)
     */
    async logout(token) {
        await delay(100)

        const userId = getUserIdFromToken(token)
        if (userId) {
            const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
            delete sessions[userId]
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
        }

        return { success: true }
    }
}
