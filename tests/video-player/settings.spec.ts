import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Settings', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('settings menu opens on gear icon click', async ({ videoPlayerPage, page }) => {
    await videoPlayerPage.openSettings();
    await expect(page.locator('[role="menuitem"]#speed')).toBeVisible();
  });

  test('speed options present: 0.25, 0.5, 0.75, Normal, 1.25, 1.5, 1.75, 2', async ({
    videoPlayerPage,
    page,
  }) => {
    await videoPlayerPage.openSettings();
    await page.locator('[role="menuitem"]#speed').click();

    const expectedIds = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2'];
    for (const id of expectedIds) {
      await expect(page.locator(`[role="menuitem"][id="${id}"]`)).toBeVisible();
    }
  });

  test('selecting speed 2 sets video.playbackRate to 2', async ({ videoPlayerPage }) => {
    await videoPlayerPage.setSpeed('2');
    const rate = await videoPlayerPage.getPlaybackRate();
    expect(rate).toBe(2);
  });

  test('selecting speed 0.5 sets video.playbackRate to 0.5', async ({ videoPlayerPage }) => {
    await videoPlayerPage.setSpeed('0.5');
    const rate = await videoPlayerPage.getPlaybackRate();
    expect(rate).toBe(0.5);
  });

  test('quality label shows "1080p" in settings menu', async ({ videoPlayerPage, page }) => {
    await videoPlayerPage.openSettings();
    const qualityItem = page.locator('[role="menuitem"]#quality');
    await expect(qualityItem).toContainText('1080p');
  });
});