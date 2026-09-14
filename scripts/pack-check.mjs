#!/usr/bin/env node
/**
 * Fail if packed tarballs are missing the files consumers need.
 * pnpm pack has no --dry-run; pack to a temp dir and delete after.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
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

try {
  const tokens = packedFiles('@becket-ui/tokens');
  assertIncludes(
    tokens,
    ['styled-system/recipes', 'styled-system/css', 'index.css', 'dist/preset'],
    '@becket-ui/tokens',
  );

  const react = packedFiles('@becket-ui/react');
  assertIncludes(react, ['dist/index.js', 'dist/index.d.ts'], '@becket-ui/react');
  assertNone(react, ['.test.ts', '.stories.tsx', 'src/components'], '@becket-ui/react');

  console.log('pack-check ok');
  console.log(`  tokens: ${tokens.length} files`);
  console.log(`  react:  ${react.length} files`);
} finally {
  rmSync(dest, { recursive: true, force: true });
}
