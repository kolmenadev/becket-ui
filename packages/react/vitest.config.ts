import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  // Panda's generated jsx factory in @becket-ui/tokens imports react, which tokens doesn't depend
  // on. Resolve it from here, as the Storybook config does, so components using it can be tested.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Real-browser suites have their own configs: vitest.visual.config.ts, vitest.browser.config.ts.
    exclude: [...configDefaults.exclude, 'src/**/*.visual.test.tsx', 'src/**/*.browser.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
