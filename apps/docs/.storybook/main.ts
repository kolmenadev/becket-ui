import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: ['../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  // Storybook 9 bundles many essentials by default. Keep addons minimal.
  addons: [],
  viteFinal: async (config) => {
    const repoRoot = process.cwd()
    console.log({repoRoot})
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@maverick/react': `${repoRoot}/packages/react/src`,
      '@maverick/tokens': `${repoRoot}/packages/tokens`,
      //'@maverick/tokens/styled-system': `${repoRoot}/packages/tokens/styled-system`
    }
    config.server = config.server || {}
    config.server.fs = { allow: [repoRoot, `${repoRoot}/packages`] }
    return config
  }
}

export default config