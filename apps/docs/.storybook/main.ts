import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/react-vite'
import path from 'path'

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: ['../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
 
  viteFinal: async (config, { configType }) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@maverick/react': path.resolve(__dirname, '../../../packages/react/src'),
          '@maverick/tokens': path.resolve(__dirname, '../../../packages/tokens'),
        }
      },
      server: {
        fs: {
          allow: ["../../../packages"]
        }
      }
    })
  }
}

export default config