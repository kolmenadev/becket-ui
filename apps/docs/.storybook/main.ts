import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
const repoRoot = path.resolve(process.cwd(), '../..');

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [`${repoRoot}/packages/react/src/**/*.stories.@(ts|tsx)`],
  addons: ['@storybook/addon-a11y', '@chromatic-com/storybook'],
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.dedupe = [...(config.resolve.dedupe || []), 'react', 'react-dom'];
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };
    config.server = config.server || {};
    config.server.fs = { allow: [repoRoot, `${repoRoot}/packages`] };
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'react',
      'react-dom',
      'react-dom/client',
    ];
    return config;
  },
};

export default config;
