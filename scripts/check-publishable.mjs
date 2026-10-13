#!/usr/bin/env node
/**
 * Fail if anything other than the published libraries could reach npm.
 *
 * `changeset publish` publishes every package that isn't `"private": true`
 * (Changesets' `ignore` only skips versioning), so apps, examples and internal
 * packages must be private. Published packages must not depend on private ones,
 * or installing them from npm breaks.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The only packages allowed on npm. Add @becket-ui/mcp here when MAV-44 publishes it. */
const PUBLISHABLE = new Set(['@becket-ui/react', '@becket-ui/tokens']);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readPackage(dir) {
  const file = join(dir, 'package.json');
  return existsSync(file) ? { dir, json: JSON.parse(readFileSync(file, 'utf8')) } : null;
}

const packages = ['apps', 'packages']
  .filter((group) => existsSync(join(root, group)))
  .flatMap((group) =>
    readdirSync(join(root, group), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => readPackage(join(root, group, entry.name))),
  )
  .filter(Boolean);

const rootPackage = readPackage(root);
const privateNames = new Set(packages.filter(({ json }) => json.private).map(({ json }) => json.name));
const errors = [];

if (!rootPackage.json.private) errors.push('package.json (root): must be "private": true');

for (const { dir, json } of packages) {
  const where = relative(root, dir);
  if (!PUBLISHABLE.has(json.name)) {
    if (!json.private) {
      errors.push(`${where} (${json.name}): not in the publish allowlist, so it must be "private": true`);
    }
    continue;
  }
  if (json.private) errors.push(`${where} (${json.name}): in the publish allowlist but marked private`);
  if (!Array.isArray(json.files) || json.files.length === 0) {
    errors.push(`${where} (${json.name}): needs a "files" allowlist so only built output ships`);
  }
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const dependency of Object.keys(json[field] ?? {})) {
      if (privateNames.has(dependency)) {
        errors.push(`${where} (${json.name}): ${field} includes private package ${dependency}; npm installs would fail`);
      }
    }
  }
}

for (const name of PUBLISHABLE) {
  if (!packages.some(({ json }) => json.name === name)) errors.push(`publish allowlist names ${name}, but no package has that name`);
}

if (errors.length > 0) {
  console.error('publish check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`publish check ok: ${[...PUBLISHABLE].join(', ')} publishable; ${packages.length - PUBLISHABLE.size} private`);
