import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Settings', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('settings menu opens on gear icon click', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openSettings();
    expect(await videoPlayerPage.isSettingsMenuOpen()).toBe(true);
  });

  test('speed options present: 0.25, 0.5, 0.75, Normal, 1.25, 1.5, 1.75, 2', async ({
    videoPlayerPage,
  }) => {
    await videoPlayerPage.openSettings();
    await videoPlayerPage.openSpeedSubmenu();
    const ids = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2'];
    expect(await videoPlayerPage.areSpeedOptionsVisible(ids)).toBe(true);
  });

  test('selecting speed 2 sets video.playbackRate to 2', async ({ videoPlayerPage }) => {
    await videoPlayerPage.setSpeed('2');
    expect(await videoPlayerPage.getPlaybackRate()).toBe(2);
  });

  test('selecting speed 0.5 sets video.playbackRate to 0.5', async ({ videoPlayerPage }) => {
    await videoPlayerPage.setSpeed('0.5');
    expect(await videoPlayerPage.getPlaybackRate()).toBe(0.5);
  });

  test('quality label shows "1080p" in settings menu', async ({ videoPlayerPage }) => {
    await videoPlayerPage.openSettings();
    const text = await videoPlayerPage.getQualityMenuItemText();
    expect(text).toContain('1080p');
  });
});