import { test } from '@playwright/test';
import fs from 'fs';

const SCREENSHOT_DIR = './screenshots';
const TEST_USER = {
  email: 'gda05189@gmail.com',
  password: 'qweqwe123!'
};

test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test('전체 화면 캡처', async ({ page }) => {
  // 1. 로그인 페이지
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-login.png`, fullPage: true });
  console.log('✓ 01-login.png 저장');

  // 2. 회원가입 페이지
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-register.png`, fullPage: true });
  console.log('✓ 02-register.png 저장');

  // 3. 로그인 수행
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button:has-text("로그인")');
  await page.waitForTimeout(3000);

  const afterLoginUrl = page.url();
  console.log('로그인 후 URL:', afterLoginUrl);

  // 4. 온보딩 페이지 (있다면)
  if (afterLoginUrl.includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-onboarding.png`, fullPage: true });
    console.log('✓ 03-onboarding.png 저장');
  }

  // 5. 대시보드
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-dashboard.png`, fullPage: true });
    console.log('✓ 04-dashboard.png 저장');
  }

  // 6. 매물 검색
  await page.goto('/properties');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-properties.png`, fullPage: true });
    console.log('✓ 05-properties.png 저장');
  }

  // 7. AI 관리실
  await page.goto('/ai-manager');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-ai-manager.png`, fullPage: true });
    console.log('✓ 06-ai-manager.png 저장');
  }

  // 8. DSR 시뮬레이션
  await page.goto('/dsr-simulation');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-dsr-simulation.png`, fullPage: true });
    console.log('✓ 07-dsr-simulation.png 저장');
  }

  // 9. 저축하기
  await page.goto('/savings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-savings.png`, fullPage: true });
    console.log('✓ 08-savings.png 저장');
  }

  // 10. 컬렉션
  await page.goto('/collection');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-collection.png`, fullPage: true });
    console.log('✓ 09-collection.png 저장');
  }

  // 11. 프로필 설정
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  if (!page.url().includes('/login') && !page.url().includes('/onboarding')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-profile.png`, fullPage: true });
    console.log('✓ 10-profile.png 저장');
  }

  console.log('\n모든 스크린샷 캡처 완료!');
});
