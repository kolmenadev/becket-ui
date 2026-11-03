#!/usr/bin/env node
// Becket's entry to its style check. The check itself is packages/cli (MAV-171); the git hook, the
// Claude Code hook and `pnpm lint:style` call this path, and the hook hands off to the committing
// checkout's copy of it. Usage: packages/cli/src/cli.mjs.
import '../../../../packages/cli/src/cli.mjs';
