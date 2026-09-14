import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/*.tsx',
    'src/helpers/*.ts',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.ts',
  ],
  format: ['esm'],
  // tsup 8.5.1 bundles rollup-plugin-dts 6.1.1, which crashes on TypeScript 7 (`ts.sys` is undefined).
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  treeshake: false,
  external: ['react', 'react-dom', /^@becket-ui\/tokens/],
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json',
});
