import { test, expect } from '@playwright/test';

/**
 * JipJung E2E Tests - 인증 플로우
 * 
 * 테스트 실행: npx playwright test auth.spec.ts
 * UI 모드: npx playwright test --ui
 * 디버그: npx playwright test --debug
 */

// 테스트용 계정 정보
const TEST_USER = {
    email: 'e2e-test@example.com',
    password: 'Test1234!',
    nickname: 'E2E테스터'
};

test.describe('인증 플로우', () => {

    test('로그인 페이지 접근', async ({ page }) => {
        // 로그인 페이지로 이동
        await page.goto('/login');

        // 로그인 페이지 요소 확인
        await expect(page.locator('h1, h2').first()).toContainText(/로그인|집-중/);
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('비인증 사용자 대시보드 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        // 대시보드 직접 접근 시도
        await page.goto('/');

        // 로그인 페이지로 리다이렉트 확인
        await expect(page).toHaveURL(/\/login/);
    });

    test('잘못된 정보로 로그인 실패', async ({ page }) => {
        await page.goto('/login');

        // 잘못된 정보 입력
        await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpassword');

        // 로그인 버튼 클릭
        await page.click('button[type="submit"]');

        // 에러 메시지 확인 (토스트 또는 에러 텍스트)
        await expect(page.locator('.toast, .error, [role="alert"]').first()).toBeVisible({ timeout: 5000 });
    });

    test('회원가입 페이지 접근', async ({ page }) => {
        await page.goto('/register');

        // 회원가입 페이지 요소 확인
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

});

test.describe('대시보드 (인증 필요)', () => {

    // 각 테스트 전에 로그인 수행
    test.beforeEach(async ({ page }) => {
        // 로그인 페이지로 이동
        await page.goto('/login');

        // 로그인 (실제 테스트 계정 필요)
        // await page.fill('input[type="email"]', TEST_USER.email);
        // await page.fill('input[type="password"]', TEST_USER.password);
        // await page.click('button[type="submit"]');

        // 대시보드로 이동 대기
        // await page.waitForURL('/');
    });

    test.skip('로그인 후 대시보드 표시', async ({ page }) => {
        // 이 테스트는 실제 테스트 계정이 있을 때 활성화
        await expect(page.locator('.dashboard-view, .dashboard')).toBeVisible();

        // 주요 UI 요소 확인
        await expect(page.locator('text=라이프스타일 쇼룸')).toBeVisible();
    });

    test.skip('목표 미설정 시 안내 모달 표시', async ({ page }) => {
        // 목표가 없는 신규 사용자의 경우
        await expect(page.locator('.modal-overlay, [role="dialog"]')).toBeVisible();
        await expect(page.locator('text=목표를 설정해주세요')).toBeVisible();
    });

});
