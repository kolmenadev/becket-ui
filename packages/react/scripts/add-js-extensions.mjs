#!/usr/bin/env node
/**
 * Add `.js` to relative imports in dist (JS and .d.ts).
 *
 * tsup runs with `bundle: false` and tsc emits declarations, so `dist` keeps the
 * source's extensionless specifiers (`./components/Button`). Bundlers resolve
 * those; Node's ESM loader and TypeScript's `nodenext` resolution don't (MAV-120).
 * Every specifier must point at a file we emitted, otherwise the build fails.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// from './x' | import './x' | import('./x') | export … from './x'
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.{1,2}\/[^'"]+?)\2/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist).filter((path) => path.endsWith('.js') || path.endsWith('.d.ts'));
let rewritten = 0;
const unresolved = [];

for (const file of files) {
  const isDeclaration = file.endsWith('.d.ts');
  const source = readFileSync(file, 'utf8');
  const next = source.replace(SPECIFIER, (whole, lead, quote, specifier) => {
    if (/\.(m?js|json|css)$/.test(specifier)) return whole;
    const target = resolve(dirname(file), specifier);
    // Declarations point at the .js runtime path; TypeScript maps it to the .d.ts.
    const fileProbe = isDeclaration ? `${target}.d.ts` : `${target}.js`;
    const indexProbe = isDeclaration ? join(target, 'index.d.ts') : join(target, 'index.js');
    let fixed;
    if (existsSync(fileProbe)) fixed = `${specifier}.js`;
    else if (existsSync(indexProbe)) fixed = `${specifier}/index.js`;
    else {
      unresolved.push(`${file.slice(dist.length + 1)}: ${specifier}`);
      return whole;
    }
    rewritten += 1;
    return `${lead}${quote}${fixed}${quote}`;
  });
  if (next !== source) writeFileSync(file, next);
}

if (unresolved.length > 0) {
  console.error(`add-js-extensions: ${unresolved.length} relative import(s) don't match an emitted file:\n  ${unresolved.join('\n  ')}`);
  process.exit(1);
}
console.log(`add-js-extensions: ${rewritten} relative import(s) now end in .js across ${files.length} files`);
