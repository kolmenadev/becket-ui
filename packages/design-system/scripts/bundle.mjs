import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

import { browserGlobals } from './browserGlobals.mjs';

const require = createRequire(import.meta.url);
const reactEntry = require.resolve('@becket-ui/react');
const tokensCSS = require.resolve('@becket-ui/tokens/index.css');

// One classic script assigning window.Becket. React stays on the page globals
// so previews and the bundle share a single React instance.
export async function buildBundle(outDir) {
  const result = await build({
    entryPoints: [reactEntry],
    bundle: true,
    format: 'iife',
    globalName: 'Becket',
    // The leading "use strict" keeps `var Becket` local when a host evals the
    // script instead of loading it as a <script> tag.
    footer: { js: 'window.Becket = Becket;' },
    minify: true,
    platform: 'browser',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [browserGlobals({ react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' })],
    // 'use client' directives are meaningless in a single browser script.
    logOverride: { 'unsupported-directive': 'silent' },
    metafile: true,
    outfile: `${outDir}/bundle.js`,
    logLevel: 'warning',
  });
  await copyFile(tokensCSS, `${outDir}/bundle.css`);
  return result.metafile;
}
