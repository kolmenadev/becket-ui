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
// CI uses the runner's Google Chrome and ChromeDriver instead. Ubuntu 24.04's AppArmor blocks the
// sandbox of a downloaded chrome-headless-shell; the system Chrome ships a profile that allows it.
// These are behavior tests, not pixels, so the runner's Chrome version is fine there.
if (!process.env.CI) {
  await Promise.all(
    [Browser.CHROMEHEADLESSSHELL, Browser.CHROMEDRIVER].map((browser) =>
      install({ browser, ...chrome }),
    ),
  );
}

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
      instances: [
        {
          browser: 'chrome',
          provider: webdriverio({
            capabilities: {
              'goog:chromeOptions': {
                binary: process.env.CI
                  ? '/usr/bin/google-chrome'
                  : computeExecutablePath({ browser: Browser.CHROMEHEADLESSSHELL, ...chrome }),
                // Hinting and scale vary by host; fix them so the same build gives the same pixels.
                args: [
                  '--font-render-hinting=none',
                  '--force-device-scale-factor=1',
                  '--hide-scrollbars',
                ],
              },
              'wdio:chromedriverOptions': {
                // The runner image sets CHROMEWEBDRIVER to the folder of the ChromeDriver that matches its Chrome.
                binary: process.env.CI
                  ? `${process.env.CHROMEWEBDRIVER}/chromedriver`
                  : computeExecutablePath({ browser: Browser.CHROMEDRIVER, ...chrome }),
              },
            },
          }),
        },
        // MAV-188 asks for the key sequence in Firefox too. Safari needs a macOS runner, so it stays
        // a manual pass.
        {
          browser: 'firefox',
          provider: webdriverio({
            capabilities: {
              'moz:firefoxOptions': {
                // Pinned like Chrome, into the same cache; CI uses the runner's Firefox for the same
                // reason it uses the runner's Chrome.
                binary: process.env.CI
                  ? '/usr/bin/firefox'
                  : (
                      await install({
                        browser: Browser.FIREFOX,
                        ...chrome,
                        buildId: 'stable_160.0',
                      })
                    ).executablePath,
              },
              // The runner image sets GECKOWEBDRIVER to the folder of its geckodriver. Locally
              // WebdriverIO downloads this version.
              'wdio:geckodriverOptions': process.env.CI
                ? { binary: `${process.env.GECKOWEBDRIVER}/geckodriver` }
                : { geckoDriverVersion: '0.37.1' },
            },
          }),
        },
      ],
    },
  },
});
