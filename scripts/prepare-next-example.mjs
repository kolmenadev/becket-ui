#!/usr/bin/env node
/**
 * Pack @becket-ui/tokens + @becket-ui/react into apps/next-example/vendor
 * and install them as file: tarballs (publishConfig → dist, not workspace src/).
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const example = join(root, 'apps/next-example');
const vendor = join(example, 'vendor');

const TOKENS_TGZ = 'becket-ui-tokens-0.1.0.tgz';
const REACT_TGZ = 'becket-ui-react-0.1.0.tgz';

function pack(filter) {
  execSync(`pnpm --filter ${filter} pack --pack-destination ${vendor}`, {
    cwd: root,
    stdio: 'inherit',
  });
}

if (!existsSync(join(root, 'packages/react/dist/index.js'))) {
  execSync('pnpm --filter @becket-ui/tokens --filter @becket-ui/react build', {
    cwd: root,
    stdio: 'inherit',
  });
}

rmSync(vendor, { recursive: true, force: true });
mkdirSync(vendor, { recursive: true });
pack('@becket-ui/tokens');
pack('@becket-ui/react');

const packed = readdirSync(vendor);
for (const expected of [TOKENS_TGZ, REACT_TGZ]) {
  if (!packed.includes(expected)) {
    throw new Error(`Expected ${expected} in vendor/, got: ${packed.join(', ') || '(empty)'}`);
  }
}

// npm, not pnpm: nested dirs still pick up the parent workspace even with --ignore-workspace.
// file: tarballs stay at 0.1.0 — drop lock + install so npm does not reuse a stale integrity hash.
rmSync(join(example, 'node_modules'), { recursive: true, force: true });
rmSync(join(example, 'package-lock.json'), { force: true });
execSync('npm install', { cwd: example, stdio: 'inherit' });

const reactPkg = JSON.parse(
  readFileSync(join(example, 'node_modules/@becket-ui/react/package.json'), 'utf8'),
);
const entry = reactPkg.exports?.['.']?.import ?? reactPkg.main;
if (!String(entry).includes('dist/')) {
  throw new Error(`@becket-ui/react did not resolve to dist (got ${entry}). src/ leak?`);
}
if (existsSync(join(example, 'node_modules/@becket-ui/react/src/components'))) {
  throw new Error('@becket-ui/react still contains src/components — not a packed tarball');
}
if (!existsSync(join(example, 'node_modules/@becket-ui/tokens/index.css'))) {
  throw new Error('@becket-ui/tokens/index.css missing from packed install');
}
if (!existsSync(join(example, 'node_modules/@becket-ui/tokens/theme/index.mjs'))) {
  throw new Error('@becket-ui/tokens/theme missing from packed install');
}

console.log('next-example installed from packed tarballs (react dist + tokens CSS)');
