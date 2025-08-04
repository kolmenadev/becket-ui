import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@maverick/react': '../../../packages/react/src',
      '@maverick/tokens': '../../../packages/tokens/styled-system',
    }
  }
})