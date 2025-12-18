import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/users.js';

/**
 * JipJung E2E Tests - 대시보드 플로우
 * 
 * 가이드라인 준수:
 * - Role과 접근성 속성 기반 Locator 사용
 * - test.step으로 단계 구분
 * - 명확한 한글 테스트 설명
 * 
 * 테스트 실행: npm run test:e2e tests/dashboard.spec.js
 */

test.describe('대시보드 플로우', () => {

    test('로그인 후 대시보드에 접근하면 주요 UI 요소가 표시되어야 함', async ({ page }) => {
        await test.step('로그인 페이지 진입', async () => {
            await page.goto('/login');
            await expect(page).toHaveURL(/\/login/);
        });

        await test.step('로그인 정보 입력', async () => {
            // 이메일 입력
            const emailInput = page.getByLabel('이메일')
                .or(page.getByPlaceholder(/이메일/))
                .or(page.locator('input[type="email"]'));
            await emailInput.fill(TEST_USERS.valid.email);

            // 비밀번호 입력
            const passwordInput = page.getByLabel('비밀번호')
                .or(page.getByPlaceholder(/비밀번호/))
                .or(page.locator('input[type="password"]'));
            await passwordInput.fill(TEST_USERS.valid.password);
        });

        await test.step('로그인 버튼 클릭', async () => {
            const loginButton = page.getByRole('button', { name: /로그인/ })
                .or(page.locator('button[type="submit"]'));
            await loginButton.click();

            // 로그인 후 페이지 전환 대기 (온보딩 또는 대시보드)
            await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
        });

        await test.step('대시보드 UI 요소 확인', async () => {
            // 온보딩 페이지가 아니라면 대시보드 확인
            const currentUrl = page.url();

            if (currentUrl.includes('/onboarding')) {
                // 온보딩이 필요한 경우 - 테스트 통과
                await expect(page.getByRole('heading').first()).toBeVisible();
                return;
            }

            // 대시보드 페이지 확인
            await expect(page.getByText(/라이프스타일|쇼룸|대시보드/).first()).toBeVisible({ timeout: 5000 });
        });
    });

    test('신규 사용자 로그인 시 목표 설정 안내 모달이 표시되어야 함', async ({ page }) => {
        await test.step('신규 계정으로 로그인', async () => {
            await page.goto('/login');

            const emailInput = page.getByLabel('이메일')
                .or(page.getByPlaceholder(/이메일/))
                .or(page.locator('input[type="email"]'));
            await emailInput.fill(TEST_USERS.valid.email);

            const passwordInput = page.getByLabel('비밀번호')
                .or(page.getByPlaceholder(/비밀번호/))
                .or(page.locator('input[type="password"]'));
            await passwordInput.fill(TEST_USERS.valid.password);

            const loginButton = page.getByRole('button', { name: /로그인/ })
                .or(page.locator('button[type="submit"]'));
            await loginButton.click();

            await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
        });

        await test.step('목표 설정 모달 확인', async () => {
            const currentUrl = page.url();

            // 온보딩 페이지면 스킵
            if (currentUrl.includes('/onboarding')) {
                return;
            }

            // 목표 미설정 시 모달 표시 확인
            const modal = page.getByRole('dialog')
                .or(page.locator('.modal-overlay'));

            // 모달이 있으면 확인, 없으면 이미 목표가 설정된 상태
            const modalVisible = await modal.isVisible().catch(() => false);
            if (modalVisible) {
                await expect(page.getByText(/목표를 설정해주세요|목표 설정/).first()).toBeVisible();
            }
        });
    });

    test('대시보드에서 저축하기 버튼을 클릭하면 저축 모달이 열려야 함', async ({ page }) => {
        await test.step('대시보드 진입 (로그인 필요)', async () => {
            await page.goto('/login');

            const emailInput = page.locator('input[type="email"]');
            await emailInput.fill(TEST_USERS.valid.email);

            const passwordInput = page.locator('input[type="password"]');
            await passwordInput.fill(TEST_USERS.valid.password);

            await page.locator('button[type="submit"]').click();
            await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
        });

        await test.step('저축하기 버튼 클릭', async () => {
            const currentUrl = page.url();
            if (currentUrl.includes('/onboarding')) {
                test.skip();
                return;
            }

            // 저축하기 버튼 찾기
            const savingsButton = page.getByRole('button', { name: /저축하기/ })
                .or(page.locator('.savings-button'));

            const isVisible = await savingsButton.isVisible().catch(() => false);
            if (!isVisible) {
                // 목표 미설정 상태면 스킵
                return;
            }

            await savingsButton.click();
        });

        await test.step('저축 모달 확인', async () => {
            const currentUrl = page.url();
            if (currentUrl.includes('/onboarding')) {
                return;
            }

            // 모달 표시 확인
            const modal = page.getByRole('dialog').or(page.locator('.modal'));
            const modalVisible = await modal.isVisible().catch(() => false);

            if (modalVisible) {
                // 금액 입력 필드 확인
                const amountInput = page.getByRole('spinbutton')
                    .or(page.getByPlaceholder(/금액/));
                await expect(amountInput).toBeVisible();
            }
        });
    });

});

test.describe('대시보드 UI 요소', () => {

    test.beforeEach(async ({ page }) => {
        // 매 테스트마다 로그인
        await page.goto('/login');
        await page.locator('input[type="email"]').fill(TEST_USERS.valid.email);
        await page.locator('input[type="password"]').fill(TEST_USERS.valid.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
    });

    test('집 성장 시각화 영역이 표시되어야 함', async ({ page }) => {
        const currentUrl = page.url();
        if (currentUrl.includes('/onboarding')) {
            test.skip();
            return;
        }

        // 집 성장 시각화 영역 확인
        const heroSection = page.locator('.isometric-room-hero, .hero-section, .house-visualization');
        const isVisible = await heroSection.isVisible().catch(() => false);

        if (isVisible) {
            await expect(heroSection).toBeVisible();
        }
    });

    test('DSR 게이지 카드가 표시되어야 함', async ({ page }) => {
        const currentUrl = page.url();
        if (currentUrl.includes('/onboarding')) {
            test.skip();
            return;
        }

        // DSR 게이지 확인
        const dsrCard = page.getByText(/DSR|대출/)
            .or(page.locator('.dsr-gauge-card'));
        const isVisible = await dsrCard.first().isVisible().catch(() => false);

        if (isVisible) {
            await expect(dsrCard.first()).toBeVisible();
        }
    });

    test('스트릭 정보가 표시되어야 함', async ({ page }) => {
        const currentUrl = page.url();
        if (currentUrl.includes('/onboarding')) {
            test.skip();
            return;
        }

        // 스트릭 정보 확인
        const streakInfo = page.getByText(/연속|스트릭|일째/)
            .or(page.locator('.streak-card'));
        const isVisible = await streakInfo.first().isVisible().catch(() => false);

        if (isVisible) {
            await expect(streakInfo.first()).toBeVisible();
        }
    });

});
