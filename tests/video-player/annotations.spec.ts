import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Annotations & Markers', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('marker panel is visible on player open (right panel)', async ({ videoPlayerPage }) => {
    expect(await videoPlayerPage.isMarkerPanelVisible()).toBe(true);
  });

  test('existing time-range marker "00:00 - 00:31 Intro" is present', async ({ videoPlayerPage }) => {
    expect(await videoPlayerPage.isIntroMarkerVisible()).toBe(true);
  });

  test('Add marker button is visible', async ({ videoPlayerPage }) => {
    await expect(videoPlayerPage.addMarkerButton).toBeVisible({ timeout: 8_000 });
  });

  test('Approve toggle is visible', async ({ videoPlayerPage }) => {
    await expect(videoPlayerPage.approveToggle).toBeVisible({ timeout: 8_000 });
  });
});