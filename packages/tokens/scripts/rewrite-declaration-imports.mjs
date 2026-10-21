#!/usr/bin/env node
/**
 * Point relative imports in styled-system's declarations at the runtime `.mjs` path.
 *
 * With `forceConsistentTypeExtension`, Panda emits `.d.mts` files that import each other as
 * `./box.d.mts` (and a few as `../types`). TypeScript rejects the first in a declaration file
 * (TS2846) and nodenext resolution rejects the second (TS2834). `./box.mjs` works everywhere:
 * TypeScript maps it to `./box.d.mts`, in nodenext and bundler resolution alike (MAV-121).
 * Every specifier must point at a file Panda emitted, otherwise the build fails.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const styledSystem = join(dirname(fileURLToPath(import.meta.url)), '..', 'styled-system');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(styledSystem).filter((path) => path.endsWith('.d.mts'));
let rewritten = 0;
const unresolved = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  // from './x' | import './x' | import('./x') | export … from './x'
  const next = source.replace(
    /(\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.{1,2}\/[^'"]+?)\2/g,
    (whole, lead, quote, specifier) => {
      if (specifier.endsWith('.mjs')) return whole;
      const target = resolve(dirname(file), specifier.replace(/\.d\.mts$/, ''));
      let fixed;
      if (existsSync(`${target}.d.mts`)) fixed = `${specifier.replace(/\.d\.mts$/, '')}.mjs`;
      else if (existsSync(join(target, 'index.d.mts'))) fixed = `${specifier}/index.mjs`;
      else {
        unresolved.push(`${file.slice(styledSystem.length + 1)}: ${specifier}`);
        return whole;
      }
      rewritten += 1;
      return `${lead}${quote}${fixed}${quote}`;
    },
  );
  if (next !== source) writeFileSync(file, next);
}

if (unresolved.length > 0) {
  console.error(
    `rewrite-declaration-imports: ${unresolved.length} relative import(s) don't match an emitted declaration:\n  ${unresolved.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `rewrite-declaration-imports: ${rewritten} relative import(s) now end in .mjs across ${files.length} files`,
);
