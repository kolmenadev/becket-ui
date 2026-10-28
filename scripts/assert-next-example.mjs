#!/usr/bin/env node
/**
 * After `next build`, start the built app and prove the HTML a request gets (before any client
 * JS) carries Becket's recipe classes and the current page from `?page=`, plus the packed CSS
 * and a no-Panda brand retint.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nextDir = join(root, 'apps/next-example/.next');
const exampleDir = join(root, 'apps/next-example');

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(path, acc);
    else acc.push(path);
  }
  return acc;
}

const files = walkFiles(join(nextDir, 'server')).concat(walkFiles(join(nextDir, 'static')));
if (!files.length) {
  throw new Error('apps/next-example/.next is empty — run pnpm example:build first');
}

const haystack = files
  .filter((f) => /\.(html|js|css|rsc)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

// The page renders per request (`?page=` picks the current page), so the build has no HTML to read.
// Serve the build on a free port and check what a request gets. Searching the build's files can't
// tell server-rendered HTML from class names that only sit in a JS bundle.
const port = await new Promise((resolvePort) => {
  const probe = createServer().listen(0, () => {
    const { port: free } = probe.address();
    probe.close(() => resolvePort(free));
  });
});
// style-check keep: evaluation order; the server starts before the requests and is stopped after them.
const server = spawn(
  join(exampleDir, 'node_modules/.bin/next'),
  ['start', '--port', String(port)],
  {
    cwd: exampleDir,
    stdio: 'ignore',
  },
);
const pages = {};
try {
  for (const path of ['/', '/?page=5', '/?page=abc']) {
    for (let attempt = 0; pages[path] === undefined; attempt += 1) {
      try {
        pages[path] = await (await fetch(`http://localhost:${port}${path}`)).text();
      } catch (error) {
        if (attempt === 60) throw new Error(`next start never answered ${path}: ${error.message}`);
        await new Promise((wait) => setTimeout(wait, 500));
      }
    }
  }
} finally {
  server.kill();
}

const missing = [
  'beckui--button',
  'beckui--heading',
  'beckui--d_flex',
  'beckui--card__root',
  'beckui--gap_md',
  'beckui--pagination__link',
].filter((needle) => !pages['/'].includes(needle));
if (missing.length) {
  throw new Error(`Server-rendered HTML missing recipe classes: ${missing.join(', ')}`);
}

// The current page is the one link with aria-current="page"; an invalid `?page=` falls back to 1.
for (const [path, expected] of [
  ['/', 'Page 1'],
  ['/?page=5', 'Page 5'],
  ['/?page=abc', 'Page 1'],
]) {
  const current = [...pages[path].matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(
    ([tag]) => tag.match(/aria-label="([^"]*)"/)?.[1],
  );
  if (current.length !== 1 || current[0] !== expected) {
    throw new Error(
      `${path}: expected only "${expected}" as the current page, got ${JSON.stringify(current)}`,
    );
  }
}
// Read the href off the rel="prev" anchor itself: the numbered Page 4 link has the same href, so
// finding it anywhere in the page would pass with Previous missing.
const previous = pages['/?page=5']
  .match(/<a\b[^>]*\brel="prev"[^>]*>/)?.[0]
  .match(/\bhref="([^"]*)"/)?.[1];
if (previous !== '/?page=4') {
  throw new Error(`/?page=5: Previous should link to /?page=4, got ${JSON.stringify(previous)}`);
}

const hasCss =
  haystack.includes('beckui--colors-background') ||
  files.some((f) => f.endsWith('.css') && readFileSync(f, 'utf8').includes('--beckui--'));
if (!hasCss) {
  throw new Error('Prerendered Next output has no Becket CSS (FOUC / missing index.css)');
}

if (!/--beckui--colors-primary:\s*oklch\(0\.55 0\.22 280\)/.test(haystack)) {
  throw new Error(
    'Prerendered Next output missing brand primary override (defineBecketTheme / CSS vars)',
  );
}

const packedCssPath = join(exampleDir, 'node_modules/@becket-ui/tokens/index.css');
if (!existsSync(packedCssPath)) {
  throw new Error('Packed @becket-ui/tokens/index.css missing — run pnpm example:prepare first');
}
const packedCss = readFileSync(packedCssPath, 'utf8');
if (
  !/--beckui--colors-primary-hover:\s*color-mix\(in oklch, var\(--beckui--colors-primary\)/.test(
    packedCss,
  )
) {
  throw new Error('Packed tokens CSS alias graph still points hover at brand yellow, not primary');
}
if (/--beckui--colors-primary-hover:[^;]*brand-becket-yellow/.test(packedCss)) {
  throw new Error('Packed tokens CSS primary-hover still references brand-becket-yellow');
}

for (const name of ['panda.config.ts', 'panda.config.js', 'panda.config.mjs']) {
  if (existsSync(join(exampleDir, name))) {
    throw new Error(`next-example must not ship ${name} (no-Panda consume path)`);
  }
}

console.log('next-example server HTML includes Becket recipe classes + ?page= + CSS + brand theme');
