import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { server: 'src/server.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  // tsup's dts plugin crashes on TypeScript 7 (same as @becket-ui/react); types aren't needed for a bin.
  dts: false,
  sourcemap: true,
  clean: true,
});
