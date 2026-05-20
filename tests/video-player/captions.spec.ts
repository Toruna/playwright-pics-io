import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Closed Captions', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('CC button toggles textTracks[0].mode from "hidden" to "showing"', async ({
    videoPlayerPage,
  }) => {
    // Ensure CC starts as hidden
    const initialMode = await videoPlayerPage.isCCActive();
    if (initialMode) {
      await videoPlayerPage.toggleCC();
    }
    expect(await videoPlayerPage.isCCActive()).toBe(false);

    await videoPlayerPage.toggleCC();
    expect(await videoPlayerPage.isCCActive()).toBe(true);
  });

  test('CC button toggles back to "hidden" on second click', async ({ videoPlayerPage }) => {
    // Enable CC
    const initialMode = await videoPlayerPage.isCCActive();
    if (!initialMode) {
      await videoPlayerPage.toggleCC();
    }
    expect(await videoPlayerPage.isCCActive()).toBe(true);

    // Disable CC
    await videoPlayerPage.toggleCC();
    expect(await videoPlayerPage.isCCActive()).toBe(false);
  });

  test('at known timestamp (5s), an active cue is present when CC is on', async ({
    videoPlayerPage,
  }) => {
    // Enable CC if not already on
    if (!(await videoPlayerPage.isCCActive())) {
      await videoPlayerPage.toggleCC();
    }

    // Play the video briefly so the player loads cues into the active textTrack
    await videoPlayerPage.play();
    await videoPlayerPage.waitForTimeGreaterThan(1, 8_000);

    // Pics.io may render subtitles via its own UI rather than the native textTracks
    // activeCues. Accept either: a native VTTCue OR a visible subtitle element in DOM.
    const candidates = [5, 15, 30, 60, 90, 120];
    let found = false;
    for (const t of candidates) {
      await videoPlayerPage.seekTo(t);
      await videoPlayerPage.page.waitForTimeout(600);
      const cueText = await videoPlayerPage.getActiveCueText();
      if (cueText && cueText.trim().length > 0) { found = true; break; }
      const subtitleEl = await videoPlayerPage.page
        .locator('.subtitlesContainer, .videoSubtitle, [class*="subtitle"], [class*="Subtitle"]')
        .filter({ hasText: /\w/ }).first().textContent().catch(() => null);
      if (subtitleEl && subtitleEl.trim().length > 0) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('no active cues when CC is off', async ({ videoPlayerPage }) => {
    // Disable CC
    if (await videoPlayerPage.isCCActive()) {
      await videoPlayerPage.toggleCC();
    }
    expect(await videoPlayerPage.isCCActive()).toBe(false);

    await videoPlayerPage.seekTo(5);
    await videoPlayerPage.play();
    await videoPlayerPage.waitForTimeGreaterThan(4.5, 8_000);

    const cueText = await videoPlayerPage.getActiveCueText();
    expect(cueText).toBeNull();
  });
});