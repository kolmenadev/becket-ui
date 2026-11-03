import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { presets } from './presets.mjs';
import { rules } from './rules/index.mjs';

/**
 * Reads `becket.config.json` from the repo root. Without one, the check runs the `coding-style`
 * preset, which needs no paths.
 *
 *   preset      coding-style | becket | becket-library
 *   appCode     globs of code written with Becket (building-with-becket.md)
 *   components  globs of library component files (becket.mdc); their stories, tests and examples
 *               don't count
 *   rules       { "<rule id>": "off" | "must" | "prefer" | "review" } to turn a rule off or change
 *               its level
 */
export function loadConfig(repo) {
  const path = join(repo, 'becket.config.json');
  const config = {
    preset: 'coding-style',
    appCode: [],
    components: [],
    rules: {},
    ...(existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {}),
  };
  // A typo here would silently check less, so it fails loudly instead.
  if (!Object.hasOwn(presets, config.preset))
    throw new Error(
      `becket.config.json: unknown preset "${config.preset}"; use ${Object.keys(presets).join(', ')}`,
    );
  for (const [id, level] of Object.entries(config.rules)) {
    if (!rules.some((rule) => rule.id === id))
      throw new Error(`becket.config.json: unknown rule "${id}"`);
    if (!['off', 'must', 'prefer', 'review'].includes(level))
      throw new Error(
        `becket.config.json: rule "${id}" is "${level}"; use off, must, prefer or review`,
      );
  }
  return config;
}
