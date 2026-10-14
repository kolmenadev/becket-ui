#!/usr/bin/env node
/**
 * Fail if packed tarballs are missing the files consumers need.
 * pnpm pack has no --dry-run; pack to a temp dir and delete after.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = mkdtempSync(join(tmpdir(), 'becket-pack-'));

function packedFiles(filter) {
  const raw = execSync(`pnpm --filter ${filter} pack --json --pack-destination ${dest}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const marker = raw.lastIndexOf('"files"');
  const start = marker >= 0 ? raw.lastIndexOf('{', marker) : raw.lastIndexOf('{');
  if (start < 0) {
    throw new Error(`No JSON in pack output for ${filter}:\n${raw.slice(0, 400)}`);
  }
  const json = JSON.parse(raw.slice(start));
  const files = json.files ?? [];
  return files.map((f) => (typeof f === 'string' ? f : f.path));
}

function assertIncludes(files, needles, label) {
  const missing = needles.filter((n) => !files.some((f) => String(f).includes(n)));
  if (missing.length) {
    console.error(`${label} pack is missing:\n  ${missing.join('\n  ')}`);
    console.error('Files seen:\n  ' + files.slice(0, 50).join('\n  '));
    process.exit(1);
  }
}

function assertNone(files, needles, label) {
  const found = needles.filter((n) => files.some((f) => String(f).includes(n)));
  if (found.length) {
    console.error(`${label} pack should not include:\n  ${found.join('\n  ')}`);
    process.exit(1);
  }
}

/**
 * Install the packed tarballs into a throwaway consumer and import the library
 * with plain Node ESM, the way scripts, `node --test` and bundler-free SSR do
 * (MAV-120). Bundlers forgive extensionless imports; Node doesn't.
 */
function assertNodeImport() {
  const consumer = mkdtempSync(join(tmpdir(), 'becket-import-'));
  try {
    const modules = join(consumer, 'node_modules');
    mkdirSync(join(modules, '@becket-ui'), { recursive: true });
    for (const tarball of readdirSync(dest).filter((name) => name.endsWith('.tgz'))) {
      const unpacked = mkdtempSync(join(tmpdir(), 'becket-tgz-'));
      execSync(`tar -xzf ${JSON.stringify(join(dest, tarball))} -C ${JSON.stringify(unpacked)}`);
      const { name } = JSON.parse(readFileSync(join(unpacked, 'package', 'package.json'), 'utf8'));
      renameSync(join(unpacked, 'package'), join(modules, name));
      rmSync(unpacked, { recursive: true, force: true });
    }
    for (const peer of ['react', 'react-dom']) {
      symlinkSync(realpathSync(join(root, 'packages', 'react', 'node_modules', peer)), join(modules, peer));
    }
    writeFileSync(join(consumer, 'package.json'), '{"type":"module","private":true}\n');
    const probe = "const m = await import('@becket-ui/react'); if (!m.Button || !m.Container) throw new Error('missing exports'); console.log(Object.keys(m).length);";
    try {
      return execSync(`node --input-type=module -e ${JSON.stringify(probe)}`, { cwd: consumer, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (error) {
      console.error(`@becket-ui/react can't be imported with Node ESM:\n${String(error.stderr || error.message).split('\n').slice(0, 3).join('\n')}`);
      process.exit(1);
    }
  } finally {
    rmSync(consumer, { recursive: true, force: true });
  }
}

try {
  const tokens = packedFiles('@becket-ui/tokens');
  assertIncludes(
    tokens,
    [
      'styled-system/recipes',
      'styled-system/css',
      'index.css',
      'dist/preset',
      'theme/index.mjs',
      'theme/index.d.ts',
      'theme.example.css',
    ],
    '@becket-ui/tokens',
  );
  assertNone(tokens, ['theme/index.test.mjs'], '@becket-ui/tokens');

  const react = packedFiles('@becket-ui/react');
  assertIncludes(react, ['dist/index.js', 'dist/index.d.ts', 'guides/building-with-becket.md'], '@becket-ui/react');
  assertNone(react, ['.test.', '.stories.', '.examples.', 'compositions', 'src/components'], '@becket-ui/react');

  const exportCount = assertNodeImport();

  console.log('pack-check ok');
  console.log(`  tokens: ${tokens.length} files`);
  console.log(`  react:  ${react.length} files`);
  console.log(`  node import: ok (${exportCount} exports)`);
} finally {
  rmSync(dest, { recursive: true, force: true });
}
