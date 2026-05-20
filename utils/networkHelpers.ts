import { Page, Request } from '@playwright/test';

export async function captureVideoRequest(page: Page): Promise<Request | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 10_000);
    page.on('request', (req) => {
      if (req.resourceType() === 'media' || /\.mp4|\.webm|\.mov/i.test(req.url())) {
        clearTimeout(timeout);
        resolve(req);
      }
    });
  });
}

export async function captureVideoResponse(
  page: Page,
  urlPattern: RegExp,
): Promise<{ url: string; status: number } | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 15_000);
    page.on('response', (res) => {
      if (urlPattern.test(res.url())) {
        clearTimeout(timeout);
        resolve({ url: res.url(), status: res.status() });
      }
    });
  });
}