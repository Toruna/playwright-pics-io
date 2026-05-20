import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';
const EXPECTED_DURATION = 160;

test.describe('Video Player — Playback', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('video loads with correct duration (160s ± 1s)', async ({ videoPlayerPage }) => {
    const duration = await videoPlayerPage.getDuration();
    expect(duration).toBeGreaterThanOrEqual(EXPECTED_DURATION - 1);
    expect(duration).toBeLessThanOrEqual(EXPECTED_DURATION + 1);
  });

  test('play/pause via button changes video.paused state', async ({ videoPlayerPage }) => {
    await videoPlayerPage.play();
    await videoPlayerPage.waitForTimeGreaterThan(0.1, 5_000);
    expect(await videoPlayerPage.isPlaying()).toBe(true);

    await videoPlayerPage.pause();
    await videoPlayerPage.waitForPauseConfirmed();
    expect(await videoPlayerPage.isPlaying()).toBe(false);
  });

  test('play/pause via K keyboard shortcut changes video.paused state', async ({ videoPlayerPage }) => {
    await videoPlayerPage.pressKey('k');
    expect(await videoPlayerPage.isPlaying()).toBe(true);

    await videoPlayerPage.pressKey('k');
    expect(await videoPlayerPage.isPlaying()).toBe(false);
  });

  test('currentTime advances during playback (poll after 2s, expect > 0)', async ({ videoPlayerPage }) => {
    await videoPlayerPage.play();
    await videoPlayerPage.waitForTimeGreaterThan(0, 5_000);
    const time = await videoPlayerPage.getCurrentTime();
    expect(time).toBeGreaterThan(0);
  });

  test('seek via progress bar updates currentTime to approximately expected value', async ({
    videoPlayerPage,
  }) => {
    const target = 30;
    await videoPlayerPage.seekTo(target);
    const current = await videoPlayerPage.getCurrentTime();
    expect(current).toBeGreaterThanOrEqual(target - 3);
    expect(current).toBeLessThanOrEqual(target + 3);
  });

  test('volume defaults to 0.7', async ({ videoPlayerPage }) => {
    const volume = await videoPlayerPage.getVolume();
    // Default volume is approximately 0.7 (exact value may differ slightly)
    expect(volume).toBeGreaterThan(0.6);
    expect(volume).toBeLessThanOrEqual(0.8);
  });

  test('mute via M key toggles video.muted', async ({ videoPlayerPage }) => {
    const initialMuted = await videoPlayerPage.isMuted();

    await videoPlayerPage.pressKey('m');
    const afterFirstPress = await videoPlayerPage.isMuted();
    expect(afterFirstPress).toBe(!initialMuted);

    await videoPlayerPage.pressKey('m');
    const afterSecondPress = await videoPlayerPage.isMuted();
    expect(afterSecondPress).toBe(initialMuted);
  });

  test('player can be closed and reopened and video is still playable', async ({
    libraryPage,
    videoPlayerPage,
  }) => {
    await videoPlayerPage.closePlayer();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();

    expect(await videoPlayerPage.isPlayerVisible()).toBe(true);
    const duration = await videoPlayerPage.getDuration();
    expect(duration).toBeGreaterThan(0);
  });

  test('video src is served from S3 domain', async ({ videoPlayerPage }) => {
    const hostname = await videoPlayerPage.getVideoSrcDomain();
    expect(hostname).toMatch(/amazonaws\.com/);
  });

  test('@performance preload attribute is set to "auto"', async ({ videoPlayerPage }) => {
    const preload = await videoPlayerPage.getPreloadAttribute();
    expect(preload).toBe('auto');
  });

  test('rewind via J key decreases currentTime by 5 seconds', async ({ videoPlayerPage }) => {
    // J rewinds 5 seconds — Pics.io may only handle this shortcut while the video is playing
    await videoPlayerPage.play();
    await videoPlayerPage.seekTo(30);
    await videoPlayerPage.waitForTimeGreaterThan(30, 5_000).catch(() => {});
    const before = await videoPlayerPage.getCurrentTime();

    await videoPlayerPage.pressKey('j');
    await videoPlayerPage.pause();
    const after = await videoPlayerPage.getCurrentTime();
    expect(after).toBeLessThan(before);
    expect(before - after).toBeGreaterThanOrEqual(3);
    expect(before - after).toBeLessThanOrEqual(10);
  });

  test('video resolution is 1920x1080', async ({ videoPlayerPage }) => {
    // videoWidth/videoHeight are available once metadata is loaded (readyState >= 1)
    const { width, height } = await videoPlayerPage.getVideoResolution();
    expect(width).toBe(1920);
    expect(height).toBe(1080);
  });
});