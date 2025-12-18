import { test, expect } from '@playwright/test';

/**
 * JipJung E2E Tests - 저축 플로우
 * 
 * 테스트 전제조건:
 * - 백엔드 서버가 http://localhost:8080 에서 실행 중
 * - 테스트 계정이 존재하고 온보딩 완료됨
 * - 드림홈(목표)이 설정되어 있음
 */

test.describe('저축 플로우', () => {

    // 테스트 전에 로그인 및 대시보드 진입
    test.beforeEach(async ({ page }) => {
        // TODO: 로그인 로직 구현
        // 현재는 skip 처리
    });

    test.skip('저축하기 버튼 클릭 시 모달 표시', async ({ page }) => {
        await page.goto('/');

        // 저축하기 버튼 찾기 및 클릭
        const savingsButton = page.locator('button:has-text("저축하기"), .savings-button');
        await savingsButton.click();

        // 저축 모달 표시 확인
        await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();
        await expect(page.locator('input[type="number"], input[inputmode="numeric"]')).toBeVisible();
    });

    test.skip('저축 금액 입력 및 저장', async ({ page }) => {
        await page.goto('/');

        // 저축하기 버튼 클릭
        await page.click('button:has-text("저축하기"), .savings-button');

        // 금액 입력 (10만원)
        await page.fill('input[type="number"], input[inputmode="numeric"]', '100000');

        // 저장 버튼 클릭
        await page.click('button:has-text("저축"), button:has-text("확인")');

        // 성공 토스트 확인
        await expect(page.locator('.toast-success, .toast:has-text("완료")')).toBeVisible({ timeout: 5000 });
    });

    test.skip('빠른 금액 선택 버튼 작동', async ({ page }) => {
        await page.goto('/savings');

        // 10만원 빠른 선택 버튼 클릭
        await page.click('button:has-text("10만원")');

        // 입력 필드에 값 반영 확인
        const input = page.locator('input[type="number"], input[inputmode="numeric"]');
        await expect(input).toHaveValue('100000');
    });

});

test.describe('저축 페이지', () => {

    test.skip('저축 페이지 접근', async ({ page }) => {
        await page.goto('/savings');

        // 저축 페이지 요소 확인
        await expect(page.locator('text=목표')).toBeVisible();
        await expect(page.locator('.progress-bar, .goal-section')).toBeVisible();
    });

    test.skip('출금 기능', async ({ page }) => {
        await page.goto('/savings');

        // 출금 탭 선택 (있다면)
        const withdrawTab = page.locator('button:has-text("출금"), [role="tab"]:has-text("출금")');
        if (await withdrawTab.isVisible()) {
            await withdrawTab.click();
        }

        // 출금 금액 입력
        await page.fill('input[type="number"]', '50000');

        // 출금 버튼 클릭
        await page.click('button:has-text("출금")');

        // 확인
        await expect(page.locator('.toast')).toBeVisible();
    });

});
