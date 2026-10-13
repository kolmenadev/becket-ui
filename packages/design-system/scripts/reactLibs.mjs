import { build } from 'esbuild';

import { browserGlobals } from './browserGlobals.mjs';

// React 19 ships no UMD build, so we produce our own classic scripts that
// assign window.React and window.ReactDOM (client APIs merged in).
export async function buildReactLibs(outDir) {
  const shared = {
    bundle: true,
    format: 'iife',
    minify: true,
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: true,
    logLevel: 'warning',
  };

  await build({
    ...shared,
    stdin: { contents: "window.React = require('react');", resolveDir: import.meta.dirname },
    outfile: `${outDir}/react.js`,
  });

  await build({
    ...shared,
    stdin: {
      contents: "window.ReactDOM = { ...require('react-dom'), ...require('react-dom/client') };",
      resolveDir: import.meta.dirname,
    },
    plugins: [browserGlobals({ react: 'React' })],
    outfile: `${outDir}/react-dom.js`,
  });
}
