import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LibraryPage } from '../pages/LibraryPage';
import { VideoPlayerPage } from '../pages/VideoPlayerPage';

type PicsioFixtures = {
  loginPage: LoginPage;
  libraryPage: LibraryPage;
  videoPlayerPage: VideoPlayerPage;
};

export const test = base.extend<PicsioFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  libraryPage: async ({ page }, use) => {
    await use(new LibraryPage(page));
  },
  videoPlayerPage: async ({ page }, use) => {
    await use(new VideoPlayerPage(page));
  },
});

export { expect };