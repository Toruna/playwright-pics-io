import { test as setup, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.PICSIO_EMAIL;
  const password = process.env.PICSIO_PASSWORD;

  if (!email || !password) {
    throw new Error('PICSIO_EMAIL and PICSIO_PASSWORD must be set in .env');
  }

  // Pics.io login is a modal on the marketing site — navigate there first
  await page.goto('https://pics.io/digital-asset-sharing', { waitUntil: 'networkidle' });

  // Open the login modal via the nav "Log in" link
  await page.locator('a.nav__title:has-text("Log in")').click();
  await page.waitForSelector('#login-email', { state: 'visible', timeout: 8_000 });

  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.locator('button[type="submit"]:has-text("Log in")').click();

  // After login the app redirects to pics.io/search or the library
  await expect(page).toHaveURL(/pics\.io\/(search|library|assets|#)/, { timeout: 20_000 });

  await page.context().storageState({ path: AUTH_FILE });
});