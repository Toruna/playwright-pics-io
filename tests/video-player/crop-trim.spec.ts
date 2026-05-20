import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Crop / Trim', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('crop mode is entered on scissors icon click (C key)', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openCrop();
    expect(await videoPlayerPage.isThumbnailStripVisible()).toBe(true);
  });

  test('thumbnail strip becomes visible in crop mode', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openCrop();
    expect(await videoPlayerPage.isThumbnailStripVisible()).toBe(true);
  });

  test('crop duration label is visible and non-empty', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openCrop();
    const label = await videoPlayerPage.getCropDurationLabel();
    expect(label.trim().length).toBeGreaterThan(0);
    // Label should contain numeric time info like "2 min 40 sec" or "00:00 - 02:40"
    expect(label).toMatch(/\d/);
  });

  test('crop mode can be exited', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openCrop();
    expect(await videoPlayerPage.isThumbnailStripVisible()).toBe(true);

    await videoPlayerPage.closeCrop();
    expect(await videoPlayerPage.isThumbnailStripVisible()).toBe(false);
  });

  test('player currentTime is preserved after exiting crop mode', async ({ videoPlayerPage }) => {
    await videoPlayerPage.seekTo(20);
    const timeBefore = await videoPlayerPage.getCurrentTime();

    await videoPlayerPage.openCrop();
    await videoPlayerPage.closeCrop();

    const timeAfter = await videoPlayerPage.getCurrentTime();
    expect(timeAfter).toBeGreaterThanOrEqual(timeBefore - 2);
    expect(timeAfter).toBeLessThanOrEqual(timeBefore + 2);
  });
});