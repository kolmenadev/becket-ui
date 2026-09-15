# Figma library

Put Becket in Figma as a **published team library**: variables, styles, and components that match `@becket-ui/tokens` + `@becket-ui/react`.

- Epic: [MAV-49](https://kolmena.atlassian.net/browse/MAV-49)
- Confluence: [Figma library](https://kolmena.atlassian.net/wiki/spaces/BU/pages/147554313/Figma+library)
- Backlog: [BACKLOG.md](./BACKLOG.md) Phase G
- Method: Figma [*Design systems 101: How to build your design system*](https://help.figma.com/hc/en-us/articles/14548865734679-Lesson-3-Build-your-design-system) (local PDF/markdown in `.reference/`, gitignored)

## Decision (locked 2026-09-14)

- **Does not block 0.1.0.** G1 remaining is public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). Kit + C4 + theming + a11y ([MAV-29](https://kolmena.atlassian.net/browse/MAV-29) / [MAV-45](https://kolmena.atlassian.net/browse/MAV-45)) are Done in-repo. Do not add this epic to the G1 checklist.
- **Code is source of truth.** Figma **mirrors** existing tokens, recipes, and v1 primitives. Do not invent a second palette, type scale, or component API in Figma.
- **Approach:** adapt Becket into Figma (not Untitled UI as the brand, not a from-scratch kit, not Magnum Opus screens). Community files/plugins are optional helpers.
- **Product-agnostic library.** No trading names, no dashboard presets. Dogfood screenshots belong in the *inventory*, not the published library.
- **No Magnum Opus / KAN tickets.** Consumers enable the library in their own Figma files.
- Dark default + light via Figma variable modes, matching `data-theme="dark" | "light"`.

## Why

Code + Storybook exist; Figma does not. Without a library, UI is drawn ad hoc and re-implemented against tokens later. The Figma file is how designers (and AI-assisted design) stay on the same primitives, spacing, and contrast rules as `@becket-ui`.

## Done looks like

A designer can:

1. Enable the published Becket library in a new file.
2. Assemble a generic screen using **only** library components + variables (no one-off hex).
3. Switch dark/light without a second component set.
4. Find names that map to `--beckui--*` / React exports (`Button`, `visual`, `size`).

## DS-101 → tickets

| DS-101 step | Work | Ticket | v1 AC? |
| --- | --- | --- | --- |
| 1. Lay the groundwork | Goals, inventory, approach, principles | [MAV-50](https://kolmena.atlassian.net/browse/MAV-50) | Yes |
| 2. Foundations | Accessibility (AA, contrast, usage notes) | [MAV-51](https://kolmena.atlassian.net/browse/MAV-51) | Yes |
| 2. Foundations | Color palette (60/30/10, dark + light) | [MAV-52](https://kolmena.atlassian.net/browse/MAV-52) | Yes |
| 2. Foundations | Typography (Heading / Text) | [MAV-53](https://kolmena.atlassian.net/browse/MAV-53) | Yes |
| 2. Foundations | Elevation + icon grid | [MAV-54](https://kolmena.atlassian.net/browse/MAV-54) | Yes |
| 2. Foundations | Variables: primitive + semantic tokens | [MAV-55](https://kolmena.atlassian.net/browse/MAV-55) | Yes |
| 2. Foundations | Spatial system (spacing, layout, breakpoints) | [MAV-56](https://kolmena.atlassian.net/browse/MAV-56) | Yes |
| 3. Build in Figma | Components + properties for v1 kit | [MAV-57](https://kolmena.atlassian.net/browse/MAV-57) | Yes |
| 3. Build in Figma | Semantic naming aligned with code | [MAV-58](https://kolmena.atlassian.net/browse/MAV-58) | Yes |
| 3. Build in Figma | Organize and publish the team library | [MAV-59](https://kolmena.atlassian.net/browse/MAV-59) | Yes |
| Ongoing | Contribution + token drift | [MAV-60](https://kolmena.atlassian.net/browse/MAV-60) | **No** — after the library exists |

## Order

Groundwork → a11y + color + type (can overlap) → elevation/icons → **variables** → spatial layout components → v1 components → naming pass → publish library → drift process last.

Do not start components before semantic variables exist. Do not publish a library full of detached hex.

## v1 component catalog

Mirror `packages/react/src/index.ts`: Button, Heading, Text, Flex, Stack, HStack, VStack, Tag, Badge, Switch, Field (and slots), TextField, Checkbox, Radio, RadioGroup, Select, Textarea, Card (and slots), SimpleGrid, Hide, Tooltip, Dialog, Drawer, Menu, Tabs, Table, Spinner, Link, Separator.

## Out of scope (v1)

- Blocking `npm publish`
- Magnum Opus widgets in the library
- Tokens Studio ↔ Panda auto-sync
- Redesigning Becket in Figma first
- Zag / Ark / Chakra v3 patterns

## Epic acceptance

- [ ] Figma file has primitive + semantic variables (color, space, radius, type) for dark and light
- [ ] v1 primitives exist as components with properties matching recipe variants
- [ ] Library is published / shareable; naming is semantic and matches code
- [ ] AA contrast documented on color styles
- [ ] 0.1.0 G1 checklist does **not** list this epic as required
