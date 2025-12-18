import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = './screenshots';

// 스크린샷 저장 디렉토리 생성
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// 테스트 계정 정보
const TEST_USER = {
  email: 'screenshot-test@test.com',
  password: 'Test1234!',
  nickname: '스크린샷테스트'
};

test.describe('화면 스크린샷 캡처', () => {

  test('1. 로그인 페이지', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-login.png`,
      fullPage: true
    });
  });

  test('2. 회원가입 페이지', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-register.png`,
      fullPage: true
    });
  });

  test('3. 회원가입 후 인증 페이지들 캡처', async ({ page }) => {
    // 먼저 회원가입 시도 (이미 존재하면 로그인으로)
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // 회원가입 폼 입력
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // 비밀번호 확인 필드가 있으면 입력
    const confirmPasswordInput = page.locator('input[placeholder*="확인"], input[name*="confirm"]');
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill(TEST_USER.password);
    }

    // 닉네임 필드가 있으면 입력
    const nicknameInput = page.locator('input[placeholder*="닉네임"], input[name*="nickname"]');
    if (await nicknameInput.count() > 0) {
      await nicknameInput.fill(TEST_USER.nickname);
    }

    // 가입 버튼 클릭 (실패해도 계속 진행)
    const submitBtn = page.locator('button[type="submit"], button:has-text("가입"), button:has-text("회원가입")');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(2000);
    }

    // 이미 가입되어 있으면 로그인 페이지로 이동
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 로그인
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginBtn = page.locator('button[type="submit"], button:has-text("로그인")');
    await loginBtn.first().click();
    await page.waitForTimeout(3000);

    // 현재 URL 확인 후 스크린샷
    const currentUrl = page.url();
    console.log('로그인 후 URL:', currentUrl);

    // 온보딩 페이지면 캡처
    if (currentUrl.includes('/onboarding')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/03-onboarding-step1.png`,
        fullPage: true
      });

      // 온보딩 단계별 캡처 시도
      for (let step = 2; step <= 4; step++) {
        const nextBtn = page.locator('button:has-text("다음"), button:has-text("Next")');
        if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: `${SCREENSHOT_DIR}/03-onboarding-step${step}.png`,
            fullPage: true
          });
        }
      }
    }
  });
});

test.describe('인증 후 페이지 캡처 (로그인 상태)', () => {
  // 각 테스트 전에 로그인
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginBtn = page.locator('button[type="submit"], button:has-text("로그인")');
    await loginBtn.first().click();
    await page.waitForTimeout(3000);

    // 온보딩으로 리다이렉트되면 건너뛰기 시도 또는 완료
    if (page.url().includes('/onboarding')) {
      // 온보딩 완료 시도 (필수 입력만)
      console.log('온보딩 페이지로 이동됨 - 스킵 또는 완료 필요');
    }
  });

  test('4. 대시보드 페이지', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 온보딩이 아닌 경우에만 캡처
    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/04-dashboard.png`,
        fullPage: true
      });
    }
  });

  test('5. 매물 검색 페이지', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-properties.png`,
        fullPage: true
      });
    }
  });

  test('6. AI 관리실 페이지', async ({ page }) => {
    await page.goto('/ai-manager');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/06-ai-manager.png`,
        fullPage: true
      });
    }
  });

  test('7. DSR 시뮬레이션 페이지', async ({ page }) => {
    await page.goto('/dsr-simulation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/07-dsr-simulation.png`,
        fullPage: true
      });
    }
  });

  test('8. 저축하기 페이지', async ({ page }) => {
    await page.goto('/savings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/08-savings.png`,
        fullPage: true
      });
    }
  });

  test('9. 컬렉션 페이지', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09-collection.png`,
        fullPage: true
      });
    }
  });

  test('10. 프로필 설정 페이지', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (!page.url().includes('/onboarding') && !page.url().includes('/login')) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/10-profile.png`,
        fullPage: true
      });
    }
  });
});
