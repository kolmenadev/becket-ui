import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('@deprecated tags', () => {
  it('names a replacement in backticks and says when it is removed', () => {
    const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
    const failures: string[] = [];
    let tagCount = 0;

    for (const root of [
      join(repoRoot, 'packages/react/src'),
      join(repoRoot, 'packages/tokens/preset'),
      join(repoRoot, 'packages/tokens/theme'),
    ]) {
      for (const relative of readdirSync(root, { encoding: 'utf8', recursive: true })) {
        const sourcePath = join(root, relative);
        if (sourcePath.includes('/node_modules/') || sourcePath.includes('/dist/')) continue;
        if (!/\.(tsx?|mjs|js|css)$/.test(sourcePath)) continue;
        for (const comment of readFileSync(sourcePath, 'utf8').match(
          /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
        ) ?? []) {
          if (!comment.includes('@deprecated')) continue;
          tagCount += 1;
          // The replacement follows `Use` or `Prefer`, so a backticked version alone doesn't pass.
          if (!/\b(?:Use|Prefer)\b[^`]*`[^`]+`[\s\S]*Removed in/.test(comment)) {
            failures.push(`${sourcePath}: ${comment.replace(/\s+/g, ' ').trim()}`);
          }
        }
      }
    }

    expect(tagCount).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
