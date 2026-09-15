#!/usr/bin/env node
/**
 * After `next build`, prove the prerendered page includes Becket CSS classes
 * (JS-disabled / view-source still styled) plus a no-Panda brand retint.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

const missing = [];
for (const needle of [
  'beckui--button',
  'beckui--heading',
  'beckui--d_flex',
  'beckui--card__root',
  'beckui--gap_md',
]) {
  if (!haystack.includes(needle)) missing.push(needle);
}
if (missing.length) {
  throw new Error(`Prerendered Next output missing recipe classes: ${missing.join(', ')}`);
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

console.log('next-example prerender includes Becket recipe classes + CSS + brand theme');
