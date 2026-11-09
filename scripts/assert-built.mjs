// Checks the build instead of rebuilding: `changeset pack` runs every prepack at once, and when each
// rebuilt, React's build wiped its dist while the MCP build read it, failing the 0.5.0 release.
import { existsSync } from 'node:fs';

const missing = process.argv.slice(2).filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(
    `Missing ${missing.join(', ')}. Run \`pnpm build\` from the repo root before packing.`,
  );
  process.exit(1);
}
