# @becket-ui/mcp

An [MCP](https://modelcontextprotocol.io) server that teaches coding agents (Claude Code, Cursor, VS
Code and others) to build UIs with Becket UI: which components exist, their exact props, real
examples, the design tokens, the app-code rules, and a check for code that drifts from them.

It runs over stdio. All its data is generated at build time from this repo's own sources:
`@becket-ui/react` exports and type declarations, recipe variant values, Storybook stories,
`@becket-ui/tokens/index.css` and `packages/react/guides/building-with-becket.md`. It can't drift
from the library it ships with.

It ships with the same version number as `@becket-ui/react`: `@becket-ui/mcp@0.4.0` describes
`@becket-ui/react@0.4.0`. Needs Node 22 or later.

## Tools

| Tool                    | What it returns                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installation`          | Packages, the one CSS import, the theme on `<html>`, no provider                                                                                           |
| `list_components`       | Every component by group, its parts, and whether it needs client JS                                                                                        |
| `get_component_props`   | Exact TypeScript declarations and recipe variant values. Accepts parts too (`CardHeader`, `Thead`, `SearchIcon`)                                           |
| `get_component_example` | Usage examples (the component's Storybook stories), all or one by name                                                                                     |
| `get_theme`             | Tokens with dark and light values: colors, spacing, radii, sizes, font-sizes, shadows                                                                      |
| `get_guidelines`        | The app-code guide, whole or one section (`component`, `tokens`, `accessibility`, `example`, `checklist`, …)                                               |
| `review_usage`          | Checks code for raw layout, text and controls, literal colors, pixel spacing, recipe classes, Chakra imports and unknown exports, each with the Becket fix |

## Connect

**Claude Code**

```bash
claude mcp add becket-ui -- npx -y @becket-ui/mcp
```

**Cursor**: `.cursor/mcp.json` in your app (or `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "becket-ui": {
      "command": "npx",
      "args": ["-y", "@becket-ui/mcp"]
    }
  }
}
```

**VS Code**: `.vscode/mcp.json`:

```json
{
  "servers": {
    "becket-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@becket-ui/mcp"]
    }
  }
}
```

To match an app that pins an older Becket, pin the server too: `@becket-ui/mcp@0.4.0`.

Then ask your agent something like "build a settings page with Becket UI". It should call
`get_guidelines` and `list_components` first, and `review_usage` before it finishes. Add a line to
your app's `CLAUDE.md` (or Cursor rules) to make that the habit:

> UI uses Becket UI. Before writing UI, call the becket-ui MCP's `get_guidelines`; before finishing,
> run `review_usage` on the changed files.

## Develop

From the repo root:

```bash
pnpm install
pnpm -F "@becket-ui/mcp..." build   # tokens, react, then the server (tsup + scripts/build-data.mjs)
pnpm -F @becket-ui/mcp test         # tool handlers + an end-to-end stdio test
```

The build writes `packages/mcp/dist/server.js` and its data in `dist/data`. Rebuild after changing
components, tokens or the guide. To try unreleased changes in an agent, point it at your clone
instead of npm:

```bash
claude mcp add becket-ui -- node /absolute/path/to/becket-ui/packages/mcp/dist/server.js
```

Releases go out with `@becket-ui/react` and `@becket-ui/tokens` (one Changesets `fixed` group); see
CONTRIBUTING.md "Versions".

`review_usage` is heuristic (line patterns, not a parser). A line containing `TODO (MAV-…)` counts
as an acknowledged gap. Examples come from Storybook stories until per-component AI examples land
(MAV-39).
