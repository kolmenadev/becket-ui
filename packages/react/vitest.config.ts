import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  // Panda's generated jsx factory in @becket-ui/tokens imports react, which tokens doesn't depend
  // on. Resolve it from here, as the Storybook config does, so components using it can be tested.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Screenshots need a real browser: vitest.visual.config.ts runs them.
    exclude: [...configDefaults.exclude, 'src/**/*.visual.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
