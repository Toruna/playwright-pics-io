import { test, expect } from '../../fixtures/auth.fixture';

const ASSET_NAME = 'How to work with assets (marks, comments, notifications).mp4';

test.describe('Video Player — Security', () => {
  test.beforeEach(async ({ libraryPage, videoPlayerPage }) => {
    await libraryPage.goto();
    await libraryPage.openVideoAsset(ASSET_NAME);
    await videoPlayerPage.waitForVideoLoaded();
  });

  test('video src URL contains a signed URL parameter (X-Amz-Signature or X-Amz-Security-Token)', async ({
    videoPlayerPage,
  }) => {
    const src = await videoPlayerPage.getVideoSrc();
    const url = new URL(src);
    const hasSignature = url.searchParams.has('X-Amz-Signature');
    const hasSecurityToken = url.searchParams.has('X-Amz-Security-Token');
    expect(hasSignature || hasSecurityToken).toBe(true);
  });

  test('signed URL has an expiry parameter (X-Amz-Expires or Expires) with value > 0', async ({
    videoPlayerPage,
  }) => {
    const expiry = await videoPlayerPage.getSignedUrlExpiry();
    expect(expiry).toBeGreaterThan(0);
  });

  test('video element has crossOrigin set to "anonymous"', async ({ videoPlayerPage }) => {
    const crossOrigin = await videoPlayerPage.getCrossOrigin();
    expect(crossOrigin).toBe('anonymous');
  });
});