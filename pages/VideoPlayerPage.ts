import { Page, Locator, expect } from '@playwright/test';

export class VideoPlayerPage {
  readonly video: Locator;
  readonly progressBar: Locator;
  readonly playOverlay: Locator;
  readonly pauseButton: Locator;
  readonly muteButton: Locator;
  readonly settingsButton: Locator;
  readonly ccButton: Locator;
  readonly closeButton: Locator;
  readonly fullscreenButton: Locator;
  readonly cropButton: Locator;
  readonly snapshotMenuButton: Locator;
  readonly aiPanelButton: Locator;
  readonly infoPanelButton: Locator;
  readonly addMarkerButton: Locator;
  readonly approveToggle: Locator;

  constructor(readonly page: Page) {
    this.video = page.locator('video').first();
    // Seek/progress bar — the videoControls div contains the clickable track area
    this.progressBar = page.locator('.videoControls').first();
    // Initial play overlay shown before video starts playing
    this.playOverlay = page.locator('.popupPlayVideo').first();
    // Play/pause toggle — div that has "playing" class while playing
    this.pauseButton = page.locator('.btnPlayVideo').first();
    // Volume/mute toggle
    this.muteButton = page.locator('.btnVolumeVideo').first();
    // Settings gear
    this.settingsButton = page.locator('button.playerGearMenu').first();
    // Closed captions button (CC) — button#btnShowSubtitle
    this.ccButton = page.locator('button#btnShowSubtitle').first();
    // ✕ close button — the "previewClose" toolbar button in top-right
    this.closeButton = page.locator('#button-previewClose').first();
    // Fullscreen
    this.fullscreenButton = page.locator('button.btnFullscreenVideo').first();
    // Crop/trim — button#btnCrop in the bottom right controls
    this.cropButton = page.locator('button#btnCrop, button.btnCrop').first();
    // Snapshot / thumbnail menu
    this.snapshotMenuButton = page.locator('button.playerThumbnailMenu').first();
    // AI panel button — transcript/AI summary icon in top toolbar
    this.aiPanelButton = page.locator('#button-previewTranscripts').first();
    // ⓘ info panel button
    this.infoPanelButton = page.locator('.toolbarButton:last-of-type, [class*="info"]').last();
    // Add marker button in right panel
    this.addMarkerButton = page.locator('.btnAddMarker').first();
    // Approve toggle in right panel
    this.approveToggle = page.locator('.slideCheckboxWrapper').first();
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  async play(): Promise<void> {
    if (await this.isPlaying()) return;
    if (await this.playOverlay.isVisible({ timeout: 500 }).catch(() => false)) {
      await this.playOverlay.click();
    } else {
      await this.pauseButton.click();
    }
  }

  async pause(): Promise<void> {
    if (await this.isPlaying()) {
      await this.pauseButton.click();
    }
  }

  async togglePlayPause(): Promise<void> {
    await this.pauseButton.click();
  }

  async pressKey(key: string): Promise<void> {
    await this.dismissChatPopup();
    // Use Locator.press on html — focuses the root element (no side effects on the
    // video) and sends the keyboard event so Pics.io's document-level shortcuts fire.
    await this.page.locator('html').press(key);
    await this.page.waitForTimeout(400);
  }

  async getCurrentTime(): Promise<number> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.currentTime;
    });
  }

  async getDuration(): Promise<number> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.duration;
    });
  }

  async getVideoSrc(): Promise<string> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.currentSrc;
    });
  }

  async isPlaying(): Promise<boolean> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return !v.paused;
    });
  }

  async seekTo(seconds: number): Promise<void> {
    // Set currentTime directly — more reliable than clicking the custom track div
    await this.page.evaluate((t) => {
      const v = document.querySelector('video') as HTMLVideoElement;
      if (!v) throw new Error('No video element');
      v.currentTime = t;
    }, seconds);
    await this.page.waitForTimeout(300);
  }

  async waitForTimeGreaterThan(seconds: number, timeout = 10_000): Promise<void> {
    await expect
      .poll(async () => await this.getCurrentTime(), { timeout })
      .toBeGreaterThan(seconds);
  }

  async getVolume(): Promise<number> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.volume;
    });
  }

  async isMuted(): Promise<boolean> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.muted;
    });
  }

  async getPlaybackRate(): Promise<number> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.playbackRate;
    });
  }

  async getVideoResolution(): Promise<{ width: number; height: number }> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement;
      if (!v) throw new Error('No video element found');
      return { width: v.videoWidth, height: v.videoHeight };
    });
  }

  async getPreloadAttribute(): Promise<string> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) throw new Error('No video element found');
      return v.preload;
    });
  }

  async getVideoSrcDomain(): Promise<string> {
    const src = await this.getVideoSrc();
    return new URL(src).hostname;
  }

  async getSignedUrlExpiry(): Promise<number> {
    const src = await this.getVideoSrc();
    const url = new URL(src);
    const amzExpires = url.searchParams.get('X-Amz-Expires');
    const expires = url.searchParams.get('Expires');
    const raw = amzExpires ?? expires;
    if (!raw) throw new Error('No expiry parameter found in video URL');
    return parseInt(raw, 10);
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  async openSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.page.waitForSelector('[role="menuitem"]#speed', {
      state: 'visible',
      timeout: 5_000,
    });
  }

  async setSpeed(speed: string): Promise<void> {
    await this.openSettings();
    // Click the Speed row to open the submenu
    await this.page.locator('[role="menuitem"]#speed').click();
    // Speed items have id matching the numeric value; "Normal" has id "1"
    const itemId = speed === 'Normal' ? '1' : speed;
    await this.page.locator(`[role="menuitem"][id="${itemId}"]`).click();
  }

  async setQuality(quality: string): Promise<void> {
    await this.openSettings();
    await this.page.locator('[role="menuitem"]#quality').click();
    await this.page.locator(`[role="menuitem"]`).filter({ hasText: quality }).first().click();
  }

  // ---------------------------------------------------------------------------
  // Captions
  // ---------------------------------------------------------------------------

  async toggleCC(): Promise<void> {
    await this.ccButton.click();
  }

  async isCCActive(): Promise<boolean> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v || !v.textTracks.length) return false;
      return v.textTracks[0].mode === 'showing';
    });
  }

  async getActiveCueText(): Promise<string | null> {
    return this.page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v || !v.textTracks.length) return null;
      const track = v.textTracks[0];
      if (!track.activeCues || !track.activeCues.length) return null;
      const cue = track.activeCues[0] as VTTCue;
      return cue.text ?? null;
    });
  }

  // ---------------------------------------------------------------------------
  // Crop / Trim
  // ---------------------------------------------------------------------------

  async openCrop(): Promise<void> {
    await this.cropButton.click();
    await this.page.waitForSelector('.cropVideoControls', {
      state: 'visible',
      timeout: 8_000,
    });
  }

  async closeCrop(): Promise<void> {
    await this.cropButton.click();
  }

  async isThumbnailStripVisible(): Promise<boolean> {
    return this.page.locator('.cropVideoControls').first().isVisible();
  }

  async getCropDurationLabel(): Promise<string> {
    // Pics.io renders the crop duration as text like "01 min 36 sec" within the crop controls
    const label = this.page.locator('.cropVideoControls')
      .locator('text=/\\d+\\s*(min|sec)/i').first();
    await label.waitFor({ state: 'visible', timeout: 5_000 });
    return (await label.textContent()) ?? '';
  }

  // ---------------------------------------------------------------------------
  // Snapshot
  // ---------------------------------------------------------------------------

  async openSnapshotMenu(): Promise<void> {
    await this.snapshotMenuButton.click();
  }

  async takeSnapshot(): Promise<void> {
    await this.openSnapshotMenu();
    await this.page.locator('.popupMenu li, [class*="menuItem"]').filter({ hasText: /snapshot/i }).first().click();
  }

  async createCustomThumbnail(): Promise<void> {
    await this.openSnapshotMenu();
    await this.page.locator('.popupMenu li, [class*="menuItem"]').filter({ hasText: /thumbnail/i }).first().click();
  }

  // ---------------------------------------------------------------------------
  // AI Panel
  // ---------------------------------------------------------------------------

  async openAIPanel(): Promise<void> {
    await this.page.locator('#button-previewTranscripts').click();
    await this.page.waitForSelector('.previewInfoboxTranscriptions, .TranscriptList', {
      state: 'visible',
      timeout: 8_000,
    });
  }

  async selectAIMode(
    mode:
      | 'AI Summary'
      | 'Transcript'
      | 'Chapters'
      | 'Actions'
      | 'Recognized text (OCR)'
      | 'Keywords'
      | 'Transcript reader view',
  ): Promise<void> {
    // The mode selector is the search-bar title area — clicking it opens a dropdown
    await this.page.locator('.TranscriptList__search-bar').click();
    await this.page.locator(`[role="option"]:has-text("${mode}"), li:has-text("${mode}"), .PicsioMenuItem:has-text("${mode}")`).first().click();
  }

  async clickAnalyze(): Promise<void> {
    await this.page.locator('button:has-text("Analyze"), button:has-text("+ Analyze"), [class*="btnAnalyze"], button[class*="analyze"]').first().click();
  }

  async isAnalyzeButtonVisible(): Promise<boolean> {
    return this.page.locator('button:has-text("Analyze"), button:has-text("+ Analyze"), [class*="TranscriptPlaceholder"] button').first().isVisible();
  }

  async getAIPanelContent(): Promise<string> {
    const panel = this.page.locator('.previewInfoboxTranscriptions, .TranscriptList').first();
    return (await panel.textContent()) ?? '';
  }

  // ---------------------------------------------------------------------------
  // Annotations
  // ---------------------------------------------------------------------------

  async openAddMarker(): Promise<void> {
    await this.addMarkerButton.click();
  }

  async getMarkerCount(): Promise<number> {
    return this.page.locator('[class*="marker"], [class*="annotation-item"], [class*="markerItem"]').count();
  }

  async toggleApprove(): Promise<void> {
    await this.approveToggle.click();
  }

  // ---------------------------------------------------------------------------
  // Info Panel
  // ---------------------------------------------------------------------------

  async openInfoPanel(): Promise<void> {
    await this.infoPanelButton.click();
    await this.page.waitForSelector('[class*="infoPanel"], [class*="InfoPanel"], [class*="metadataPanel"]', {
      state: 'visible',
      timeout: 5_000,
    });
  }

  async getTranscriptPreview(): Promise<string> {
    const el = this.page.locator('[class*="transcriptPreview"], [class*="audioIntelligence"]').first();
    return (await el.textContent()) ?? '';
  }

  // ---------------------------------------------------------------------------
  // General
  // ---------------------------------------------------------------------------

  async closePlayer(): Promise<void> {
    await this.closeButton.click();
    // The close button navigates back to the library — wait for URL or fall back to goto
    await this.page
      .waitForURL(/pics\.io\/search/, { timeout: 8_000 })
      .catch(() => this.page.goto('https://pics.io/search', { waitUntil: 'domcontentloaded' }));
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async isPlayerVisible(): Promise<boolean> {
    return this.video.isVisible();
  }

  private async dismissChatPopup(): Promise<void> {
    // Hide all Intercom elements via CSS — the widget intercepts keyboard focus and click events
    await this.page.evaluate(() => {
      const selectors = [
        '.intercom-lightweight-app',
        '#intercom-frame',
        '.intercom-messenger-frame',
        '[id^="intercom-"]',
        '[class^="intercom-"]',
      ];
      for (const sel of selectors) {
        document.querySelectorAll<HTMLElement>(sel).forEach(el => { el.style.display = 'none'; });
      }
    }).catch(() => {});
  }

  async waitForVideoLoaded(): Promise<void> {
    // Hide Intercom before anything else — it intercepts clicks and keyboard events
    await this.dismissChatPopup();
    // Brief pause to let the app finish initializing before S3 requests fire —
    // back-to-back test navigations can trigger throttling without this.
    await this.page.waitForTimeout(1_000);

    // Wait for video OR the "Something went wrong" S3 error — whichever appears first.
    // Reload up to 2 times if the error state is shown (S3 throttling).
    for (let attempt = 0; attempt < 3; attempt++) {
      const errorLocator = this.page.locator(':text("Something went wrong")');
      const outcome = await Promise.race([
        this.video.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'video' as const),
        errorLocator.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'error' as const),
      ]).catch(() => 'timeout' as const);

      if (outcome === 'video') break;

      // Error or timeout — reload and retry
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForSelector('.catalogItem, video', { timeout: 20_000 }).catch(() => {});
      if (await this.page.locator('.catalogItem').isVisible({ timeout: 2_000 }).catch(() => false)) {
        // Reloaded to library — navigate back to the preview
        await this.page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }

    // Click play overlay to start the player — syncs internal play-state
    if (await this.playOverlay.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await this.playOverlay.click();
      // Wait until the video is actually playing before pausing via the UI button
      await expect
        .poll(
          () => this.page.evaluate(() => {
            const v = document.querySelector('video') as HTMLVideoElement | null;
            return v ? !v.paused && v.readyState >= 1 : false;
          }),
          { timeout: 10_000 },
        )
        .toBe(true);
      // Now pause via the player's own toggle so internal state is consistent
      await this.pauseButton.click();
      await this.page.waitForTimeout(300);
    }

    // Wait for HAVE_METADATA (readyState >= 1)
    await expect
      .poll(
        () =>
          this.page.evaluate(() => {
            const v = document.querySelector('video');
            return v ? v.readyState : 0;
          }),
        { timeout: 15_000 },
      )
      .toBeGreaterThanOrEqual(1);

    await this.dismissChatPopup();
  }
}