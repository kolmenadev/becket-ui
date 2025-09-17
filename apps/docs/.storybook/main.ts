import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
const repoRoot = path.resolve(process.cwd(), '../..');

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [`${repoRoot}/packages/react/src/**/*.stories.@(ts|tsx)`],
  // Storybook 9 bundles many essentials by default. Keep addons minimal.
  addons: [],
  viteFinal: async (config) => {
    console.log({ repoRoot });
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };
    config.server = config.server || {};
    config.server.fs = { allow: [repoRoot, `${repoRoot}/packages`] };
    return config;
  },
};

export default config;
