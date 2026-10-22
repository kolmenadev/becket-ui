import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Browser, computeExecutablePath, install } from '@puppeteer/browsers';
import { webdriverio } from '@vitest/browser-webdriverio';
import { configDefaults, defineConfig } from 'vitest/config';

// Pixel tier (MAV-145): every story, dark and light, screenshotted by a pinned chrome-headless-shell
// and driven through WebdriverIO (no Playwright, MAV-143). Bumping the build changes pixels, so do
// it on purpose and expect new references. Chrome for Testing ships a matching chromedriver.
const chrome = {
  buildId: '156.0.8078.47',
  cacheDir: fileURLToPath(new URL('./.visual-browsers', import.meta.url)),
};
await Promise.all(
  [Browser.CHROMEHEADLESSSHELL, Browser.CHROMEDRIVER].map((browser) =>
    install({ browser, ...chrome }),
  ),
);

export default defineConfig({
  // Same reason as vitest.config.ts: Panda's jsx factory in @becket-ui/tokens imports react.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    include: ['src/**/*.visual.test.tsx'],
    exclude: configDefaults.exclude,
    browser: {
      enabled: true,
      headless: true,
      viewport: { width: 1024, height: 768 },
      instances: [{ browser: 'chrome' }],
      provider: webdriverio({
        capabilities: {
          'goog:chromeOptions': {
            binary: computeExecutablePath({ browser: Browser.CHROMEHEADLESSSHELL, ...chrome }),
            // Hinting and scale vary by host; fix them so the same build gives the same pixels.
            args: [
              '--font-render-hinting=none',
              '--force-device-scale-factor=1',
              '--hide-scrollbars',
            ],
          },
          'wdio:chromedriverOptions': {
            binary: computeExecutablePath({ browser: Browser.CHROMEDRIVER, ...chrome }),
          },
        },
      }),
      expect: {
        toMatchScreenshot: {
          // Base and head render on one machine with one Chrome, so any pixel that differs is a
          // real change. The default per-pixel tolerance (0.1) let a 6° brand hue shift through.
          comparatorName: 'pixelmatch',
          comparatorOptions: { threshold: 0 },
          // References live outside git: `test:visual:update` on the base branch writes them, and
          // `test:visual` on the head branch compares against them, on one machine and one Chrome.
          resolveScreenshotPath: ({ arg, ext, testFileName }) =>
            join(
              process.env.VISUAL_REFERENCE_DIR ??
                fileURLToPath(new URL('./.visual-references', import.meta.url)),
              testFileName,
              `${arg}${ext}`,
            ),
        },
      },
    },
  },
});
