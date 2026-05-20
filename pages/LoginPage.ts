import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://pics.io/digital-asset-sharing', { waitUntil: 'networkidle' });
    await this.page.locator('a.nav__title:has-text("Log in")').click();
    await this.page.waitForSelector('#login-email', { state: 'visible', timeout: 8_000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.fill('#login-email', email);
    await this.page.fill('#login-password', password);
    await this.page.locator('button[type="submit"]:has-text("Log in")').click();
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/pics\.io\/(search|library|assets)/, { timeout: 20_000 });
  }
}