#!/usr/bin/env node
/**
 * Pack @becket-ui/tokens + @becket-ui/react into apps/next-example/vendor
 * and install them as file: tarballs (publishConfig → dist, not workspace src/).
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const example = join(root, 'apps/next-example');
const vendor = join(example, 'vendor');

// Version-free names so apps/next-example/package.json survives every version bump.
const TOKENS_TGZ = 'becket-ui-tokens.tgz';
const REACT_TGZ = 'becket-ui-react.tgz';

function pack(filter, tarball) {
  const before = new Set(readdirSync(vendor));
  execSync(`pnpm --filter ${filter} pack --pack-destination ${vendor}`, {
    cwd: root,
    stdio: 'inherit',
  });
  const packed = readdirSync(vendor).filter((file) => file.endsWith('.tgz') && !before.has(file));
  if (packed.length !== 1) {
    throw new Error(`Expected one new tarball for ${filter} in vendor/, got: ${packed.join(', ') || '(none)'}`);
  }
  renameSync(join(vendor, packed[0]), join(vendor, tarball));
}

if (!existsSync(join(root, 'packages/react/dist/index.js'))) {
  execSync('pnpm --filter @becket-ui/tokens --filter @becket-ui/react build', {
    cwd: root,
    stdio: 'inherit',
  });
}

rmSync(vendor, { recursive: true, force: true });
mkdirSync(vendor, { recursive: true });
pack('@becket-ui/tokens', TOKENS_TGZ);
pack('@becket-ui/react', REACT_TGZ);

// npm, not pnpm: nested dirs still pick up the parent workspace even with --ignore-workspace.
// file: tarball names never change — drop lock + install so npm does not reuse a stale integrity hash.
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
