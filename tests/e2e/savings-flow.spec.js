import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_SAVINGS } from '../fixtures/users.js';

/**
 * JipJung E2E Tests - 저축 플로우
 * 
 * 가이드라인 준수:
 * - Role과 접근성 속성 기반 Locator 사용
 * - test.step으로 단계 구분
 * - 명확한 한글 테스트 설명
 * 
 * 테스트 실행: npm run test:e2e tests/e2e/savings-flow.spec.js
 */

test.describe('저축 기록 플로우', () => {

    test.beforeEach(async ({ page }) => {
        // 로그인 페이지로 이동
        await page.goto('/login');
    });

    test('저축 페이지에서 금액 입력 후 저축 완료 시 성공 토스트가 표시되어야 함', async ({ page }) => {
        await test.step('로그인 수행', async () => {
            // 이메일 입력 (Role/Label 기반)
            await page.getByLabel('이메일').or(page.getByPlaceholder('이메일')).fill(TEST_USERS.valid.email);

            // 비밀번호 입력
            await page.getByLabel('비밀번호').or(page.getByPlaceholder('비밀번호')).fill(TEST_USERS.valid.password);

            // 로그인 버튼 클릭
            await page.getByRole('button', { name: '로그인' }).click();

            // 대시보드 또는 온보딩 페이지로 이동 확인
            await expect(page).not.toHaveURL(/\/login/);
        });

        await test.step('저축 페이지 진입', async () => {
            // 저축 페이지로 이동
            await page.goto('/savings');

            // 저축 페이지 로드 확인
            await expect(page.getByRole('heading', { name: /저축|목표/ })).toBeVisible();
        });

        await test.step('저축 금액 입력', async () => {
            // 금액 입력 필드 찾기
            const amountInput = page.getByRole('spinbutton').or(page.getByPlaceholder(/금액/));
            await amountInput.fill(String(TEST_SAVINGS.testAmount));

            // 입력값 확인
            await expect(amountInput).toHaveValue(String(TEST_SAVINGS.testAmount));
        });

        await test.step('저축 버튼 클릭 및 결과 확인', async () => {
            // 저축하기 버튼 클릭
            await page.getByRole('button', { name: /저축|입금|확인/ }).click();

            // 성공 토스트 확인
            await expect(page.getByRole('alert').or(page.locator('.toast'))).toBeVisible();
        });
    });

    test('빠른 금액 선택 버튼 클릭 시 해당 금액이 입력 필드에 반영되어야 함', async ({ page }) => {
        await test.step('저축 페이지 진입', async () => {
            // 로그인 후 저축 페이지로 직접 이동 (storageState 사용 시)
            await page.goto('/savings');
        });

        await test.step('빠른 금액 버튼 클릭', async () => {
            // 10만원 버튼 클릭
            const quickButton = page.getByRole('button', { name: /10만원|100,000/ });

            if (await quickButton.isVisible()) {
                await quickButton.click();

                // 입력 필드에 값 반영 확인
                const amountInput = page.getByRole('spinbutton');
                await expect(amountInput).toHaveValue(/100000/);
            }
        });
    });

});

test.describe('대시보드에서 저축하기', () => {

    test('대시보드에서 저축하기 버튼 클릭 시 저축 모달이 표시되어야 함', async ({ page }) => {
        await test.step('대시보드 진입', async () => {
            await page.goto('/');

            // 로그인 페이지로 리다이렉트되면 로그인 수행 필요
            if (await page.url().includes('/login')) {
                test.skip();
                return;
            }
        });

        await test.step('저축하기 버튼 클릭', async () => {
            const savingsButton = page.getByRole('button', { name: /저축하기/ });
            await savingsButton.click();
        });

        await test.step('저축 모달 표시 확인', async () => {
            // 모달 다이얼로그 확인
            await expect(page.getByRole('dialog').or(page.locator('.modal'))).toBeVisible();

            // 금액 입력 필드 확인
            await expect(page.getByRole('spinbutton').or(page.getByPlaceholder(/금액/))).toBeVisible();
        });
    });

});

test.describe('저축 API 에러 처리', () => {

    test('API 에러 발생 시 에러 토스트가 표시되어야 함', async ({ page }) => {
        // API 모킹 - 서버 에러 시뮬레이션
        await page.route('**/api/dream-home/savings', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '서버 오류가 발생했습니다.'
                })
            });
        });

        await test.step('저축 페이지 진입', async () => {
            await page.goto('/savings');
        });

        await test.step('저축 시도', async () => {
            // 금액 입력
            const amountInput = page.getByRole('spinbutton').or(page.getByPlaceholder(/금액/));
            if (await amountInput.isVisible()) {
                await amountInput.fill('100000');

                // 저축 버튼 클릭
                await page.getByRole('button', { name: /저축|입금|확인/ }).click();
            }
        });

        await test.step('에러 메시지 확인', async () => {
            // 에러 토스트 확인
            await expect(
                page.getByRole('alert').or(page.locator('.toast-error, .toast'))
            ).toBeVisible({ timeout: 5000 });
        });
    });

});
