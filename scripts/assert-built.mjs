/**
 * `prepack` for the published packages: check the build is there instead of rebuilding.
 *
 * `changeset pack` runs every package's prepack at the same time. When each one rebuilt, React's
 * build wiped `packages/react/dist` while the MCP build was reading its .d.ts files, and the 0.5.0
 * release failed. CI, the publish workflow and `pnpm pack:check` all run `pnpm build` first.
 *
 *   node ../../scripts/assert-built.mjs dist/index.js dist/index.d.ts
 */
import { existsSync } from 'node:fs';

const missing = process.argv.slice(2).filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(
    `Missing ${missing.join(', ')}. Run \`pnpm build\` from the repo root before packing.`,
  );
  process.exit(1);
}
