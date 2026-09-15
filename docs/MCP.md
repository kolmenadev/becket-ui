# Consumer MCP

stdio MCP so **consumer-side AI agents** (Cursor, Claude Code, VS Code Copilot) can implement UIs **with** Becket — not invent CSS or copy Chakra.

- Epic: [MAV-36](https://kolmena.atlassian.net/browse/MAV-36)
- Confluence: [Consumer MCP](https://kolmena.atlassian.net/wiki/spaces/BU/pages/147456016/Consumer+MCP)
- Backlog: [BACKLOG.md](./BACKLOG.md) Phase F

## Decision (locked 2026-09-14)

- **v1 is consumer-only.** No tools to scaffold new Becket primitives. Library authoring stays [`.cursor-config/becket.mdc`](../.cursor-config/becket.mdc).
- **Does not block 0.1.0.** G1 remaining is public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). Kit + C4 + theming + a11y ([MAV-29](https://kolmena.atlassian.net/browse/MAV-29) / [MAV-45](https://kolmena.atlassian.net/browse/MAV-45)) are Done in-repo. Local stdio can ship in this monorepo before npm.
- **No consumer-product Jira.** Copy-paste `mcp.json` lives in this repo’s README. Product apps wire it themselves.

## Why

Agents already have [Chakra UI’s MCP](https://chakra-ui.com/docs/get-started/ai/mcp-server). Without a Becket equivalent they will implement Chakra or raw CSS in apps that should use `@becket-ui/react`.

## Done looks like

An agent with only this MCP connected can:

1. Install and boot (`@becket-ui/react` + `@becket-ui/tokens/index.css`, `data-theme` on `<html>`, no provider, Panda not required).
2. Pick the right primitive from the current catalog.
3. Use real props/variants (`visual`, `size`, `as`, compound slots).
4. Compose with `Stack` / `Flex` / `SimpleGrid` / `Card` — not raw `div` + leaked `.beckui--*` strings.
5. Stay on the thesis: native HTML, `"use client"` only where it exists, no Zag/Ark, no product presets.

## v1 tools

| Tool | Purpose |
| --- | --- |
| `installation` | Packages, CSS import, `data-theme`, Next vs Vite, no provider |
| `list_components` | Catalog + family + client vs RSC |
| `get_component_props` | Typed props + recipe variants + defaults |
| `get_component_example` | 1–3 short snippets (not Storybook files) |
| `get_theme` | Current CSS vars, spacing, radii, light/dark |
| `review_usage` | Valid Becket vs Chakra Provider, leaked class strings, product presets |
| `get_composition` | Generic layouts: form, dialog+footer, card grid |

`get_theme` ships **current** tokens. Refresh the dump when tokens change. Do not wait on remaining G1 work to start the server.

## Out of scope (v1)

- Authoring / recipe scaffold tools
- Chakra Pro–style marketing blocks
- Chakra v2→v3 review
- Hosted HTTP MCP
- Product-app dashboard presets in the catalog
- Blocking `npm publish` of `@becket-ui/react` / `@becket-ui/tokens`

## Stories

| Work | Ticket | v1 AC? |
| --- | --- | --- |
| Spec tool list + catalog schema | [MAV-37](https://kolmena.atlassian.net/browse/MAV-37) | Yes |
| Generate catalog from public exports | [MAV-38](https://kolmena.atlassian.net/browse/MAV-38) | Yes |
| AI-sized examples per primitive | [MAV-39](https://kolmena.atlassian.net/browse/MAV-39) | Yes |
| stdio `@becket-ui/mcp` | [MAV-40](https://kolmena.atlassian.net/browse/MAV-40) | Yes |
| `review_usage` + compositions | [MAV-41](https://kolmena.atlassian.net/browse/MAV-41) | Yes |
| Connect docs (Cursor / Claude / VS Code) | [MAV-42](https://kolmena.atlassian.net/browse/MAV-42) | Yes |
| Eval golden prompts | [MAV-43](https://kolmena.atlassian.net/browse/MAV-43) | Yes |
| Publish `@becket-ui/mcp` | [MAV-44](https://kolmena.atlassian.net/browse/MAV-44) | **No** — blocked on G1 / [MAV-3](https://kolmena.atlassian.net/browse/MAV-3) |

## Order

Spec → catalog → examples → server → review/compositions → connect docs → eval. Publish last and only after npm exists.

## Epic acceptance

- [ ] stdio MCP in this monorepo exposes install, catalog, props, examples, theme, review, compositions
- [ ] Catalog matches public `@becket-ui/react` exports (CI drift check)
- [ ] README documents Cursor / Claude / VS Code connect (workspace path; `npx` after publish)
- [ ] Three golden prompts use Becket primitives, CSS import, `data-theme`, no Chakra `Provider`
- [ ] 0.1.0 G1 checklist does **not** list this epic as required
