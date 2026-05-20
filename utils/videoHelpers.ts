import { Page } from '@playwright/test';

export async function waitForVideoPlayback(page: Page, seconds: number): Promise<void> {
  await page.waitForTimeout(seconds * 1000);
}

export async function getVideoElementProperty<T>(page: Page, property: string): Promise<T> {
  return page.evaluate((prop) => {
    const v = document.querySelector('video') as HTMLVideoElement;
    if (!v) throw new Error('No video element');
    return (v as unknown as Record<string, T>)[prop];
  }, property);
}

export function isS3Domain(hostname: string): boolean {
  return hostname.includes('s3.amazonaws.com') || hostname.includes('s3-') || hostname.endsWith('.amazonaws.com');
}

export function parseSignedUrlParam(src: string, param: string): string | null {
  try {
    return new URL(src).searchParams.get(param);
  } catch {
    return null;
  }
}