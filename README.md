# Pics.io Video Player — Playwright Test Suite

## Overview

This suite validates the Pics.io video player feature end-to-end. It covers playback controls, closed captions, crop/trim, settings (speed & quality), annotation markers, the AI Analysis panel, and security properties of the signed S3 video URL. The goal is to catch regressions across the full player surface, including known quirks like the Escape-key behaviour and the `preload="auto"` delivery model.

## Prerequisites

- Node.js 20 or later
- npm 9+
- A Pics.io account with access to the test asset

## Installation

```bash
npm install
npx playwright install
```

## Configuration

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PICSIO_EMAIL` | Login email for your Pics.io account |
| `PICSIO_PASSWORD` | Login password |
| `PICSIO_BASE_URL` | Base URL (default: `https://app.pics.io`) |

Auth state is written to `playwright/.auth/user.json` on first run and reused for all subsequent tests — login only happens once per full suite run.

## Running Tests

```bash
# Run the full suite (all browsers)
npm test

# Run in headed mode (visible browser window)
npm run test:headed

# Run a single spec file
npx playwright test tests/video-player/playback.spec.ts

# Run on a specific browser only
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Open the interactive UI
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# Open the HTML report after a run
npx playwright show-report
```

## CI / GitHub Actions

The workflow at `.github/workflows/playwright.yml` runs on three triggers:

| Trigger | Behaviour |
|---|---|
| **Nightly schedule** (`0 1 * * *` UTC) | Runs all three browser projects |
| **Push / PR to `main` or `develop`** | Runs all three browser projects |
| **Manual dispatch (`workflow_dispatch`)** | Runs only the browser selected via the `browser` input (default: `chromium`) |

After every run — successful or failed — two artifacts are uploaded and retained for 30 days:

- **`playwright-report`** — the full HTML report. Download and open `index.html` locally, or view it inline in GitHub Actions via the artifact preview.
- **`test-results`** — raw trace files, screenshots, and videos for failed/retried tests.

Required GitHub Secrets: `PICSIO_EMAIL`, `PICSIO_PASSWORD`, `PICSIO_BASE_URL`.

## Test Structure

```
tests/video-player/   # One spec file per feature area
pages/                # Page Object Model classes
  LoginPage.ts        # /login navigation and form submission
  LibraryPage.ts      # Asset library grid, search, asset open
  VideoPlayerPage.ts  # All player interactions and JS evaluations
fixtures/
  auth.fixture.ts     # Extends base test with typed page-object fixtures
utils/
  videoHelpers.ts     # Pure helpers for video element properties
  networkHelpers.ts   # Network request/response capture helpers
```

**Page Object Model:** Every selector and every `page.evaluate()` call lives inside a page object method. Test files import page objects through the `auth.fixture` and never call `page.locator()` or `page.evaluate()` directly.

**Auth fixture:** `tests/global.setup.ts` performs a single login and saves cookies/storage to `playwright/.auth/user.json`. The three browser projects declare `dependencies: ['setup']`, so the auth step runs exactly once before any test.

**No shared state:** Each test opens the library and the asset independently via `test.beforeEach`. Tests are safe to run in parallel.

## AI Tools Used

- **Claude (Anthropic)** was used to: (1) explore the live Pics.io product via browser automation and extract real technical observations — including video element properties (`preload`, `crossOrigin`, `textTracks`), S3 delivery hostname patterns, signed URL query parameter names, and closed-caption cue structure; (2) generate the initial test scaffold, page object method signatures, and selector strategy; (3) review selector fragility and suggest attribute-based fallbacks over positional selectors.
- **GitHub Copilot** was used for inline autocompletion during method implementation.

## Known Issues / Tagged Tests

| Tag / Test | Notes |
|---|---|
| `@performance` on the `preload="auto"` test | This is a **documented behaviour**, not a bug. The video begins downloading from S3 immediately when the player opens because `preload` is `"auto"`. The test asserts this is the case so any future change to preload strategy is caught. |
| Escape key closes the entire player | Pressing `Escape` dismisses the full player rather than just closing an open sub-menu (e.g., settings, crop mode). This is a known bug. The `pressEscape()` helper in `VideoPlayerPage` presses Escape and then checks `isPlayerVisible()` — expect this assertion to fail until the bug is fixed. There is no `test.skip` on this path because the bug is observable and worth tracking. |