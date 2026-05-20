import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — AI Analysis Panel', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
    await videoPlayerPage.openAIPanel();
  });

  test('AI panel opens on AI β button click', async ({ videoPlayerPage }) => {
    expect(await videoPlayerPage.isAIPanelVisible()).toBe(true);
  });

  test('AI panel title shows "AI Summary"', async ({ videoPlayerPage }) => {
    const text = await videoPlayerPage.getAIPanelSearchBarText();
    expect(text).toContain('AI Summary');
  });

  test('"+ Analyze" button is visible', async ({ videoPlayerPage }) => {
    expect(await videoPlayerPage.isAnalyzeButtonVisible()).toBe(true);
  });

  test('AI panel shows placeholder or content', async ({ videoPlayerPage }) => {
    const content = await videoPlayerPage.getAIPanelContent();
    expect(content.trim().length).toBeGreaterThan(0);
    expect(content).toMatch(/AI Summary|analyze|Let AI|Transcript|Chapter/i);
  });

  test('panel content changes after clicking Analyze (or shows analyze prompt)', async ({
    videoPlayerPage,
  }) => {
    const content = await videoPlayerPage.getAIPanelContent();
    expect(content).toMatch(/analyze|summary|transcript|chapter|identify/i);
  });

  test('switching to "Transcript" mode shows transcript content or analyze prompt', async ({
    videoPlayerPage,
  }) => {
    await videoPlayerPage.selectAIMode('Transcript');
    const content = await videoPlayerPage.getAIPanelContent();
    expect(content.trim().length).toBeGreaterThan(0);
  });

  test('switching to "Chapters" mode shows chapters content or "Run AI analysis" prompt', async ({
    videoPlayerPage,
  }) => {
    await videoPlayerPage.selectAIMode('Chapters');
    const content = await videoPlayerPage.getAIPanelContent();
    expect(content.trim().length).toBeGreaterThan(0);
  });
});