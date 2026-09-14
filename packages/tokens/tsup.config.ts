import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { preset: 'preset/index.ts' },
  format: ['esm'],
  // tsup 8.5.1 bundles rollup-plugin-dts 6.1.1, which crashes on TypeScript 7 (`ts.sys` is undefined).
  dts: false,
  sourcemap: true,
  clean: false,
  outDir: 'dist',
  external: ['@pandacss/dev'],
});
