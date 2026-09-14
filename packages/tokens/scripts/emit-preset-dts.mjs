/**
 * tsup 8.5.1 inlines rollup-plugin-dts 6.1.1, which cannot load TypeScript 7.
 * Emit a bundled dist/preset.d.ts with rollup-plugin-dts 6.5.1 + @typescript/typescript6.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';

const outfile = 'dist/preset.d.ts';

const bundle = await rollup({
  input: 'preset/index.ts',
  external: ['@pandacss/dev'],
  plugins: [dts()],
});

await bundle.write({
  file: outfile,
  format: 'es',
});

await bundle.close();

let code = readFileSync(outfile, 'utf8');
if (/\bPreset\b/.test(code) && !code.includes('@pandacss/dev')) {
  code = `import type { Preset } from '@pandacss/dev';\n\n${code}`;
  writeFileSync(outfile, code);
}
