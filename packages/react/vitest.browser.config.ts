import { fileURLToPath } from 'node:url';
import { Browser, computeExecutablePath, install } from '@puppeteer/browsers';
import { webdriverio } from '@vitest/browser-webdriverio';
import { configDefaults, defineConfig } from 'vitest/config';

// Same pinned chrome-headless-shell as vitest.visual.config.ts, driven through WebdriverIO
// (no Playwright, MAV-143). Bumping the build changes the browser, so do it on purpose.
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
    include: ['src/**/*.browser.test.tsx'],
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
    },
  },
});
