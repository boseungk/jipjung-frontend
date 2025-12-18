import { test } from '@playwright/test';

const SCREENSHOT_DIR = './screenshots';
const TEST_USER = {
  email: 'gda05189@gmail.com',
  password: 'qweqwe123!'
};

test('컬렉션, 프로필 캡처', async ({ page }) => {
  // 로그인
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button:has-text("로그인")');
  await page.waitForTimeout(3000);

  // 컬렉션
  await page.goto('/collection');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09-collection.png`, fullPage: true });
  console.log('✓ 09-collection.png');

  // 프로필
  await page.goto('/profile');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10-profile.png`, fullPage: true });
  console.log('✓ 10-profile.png');
});
