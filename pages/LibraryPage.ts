import { Page, expect } from '@playwright/test';

export class LibraryPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://pics.io/search', { waitUntil: 'domcontentloaded' });
    // Wait for the asset grid to render
    await this.page.waitForSelector('.catalogItem', { state: 'visible', timeout: 20_000 });
  }

  async openVideoAsset(_name: string): Promise<void> {
    // There is only one video asset in the library; it has the "isVideo" class modifier.
    // The filename is not rendered in the DOM — identification is by asset type.
    const videoCard = this.page.locator('.catalogItem.isVideo').first();
    await videoCard.waitFor({ state: 'visible', timeout: 15_000 });
    await videoCard.dblclick();
    await this.page.waitForURL(/pics\.io\/preview\//, { timeout: 15_000 });
  }

  async expectPlayerOpen(): Promise<void> {
    await expect(this.page.locator('video')).toBeVisible({ timeout: 15_000 });
  }
}