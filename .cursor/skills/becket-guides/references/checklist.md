# Judgment checklist

These are the rules a script can't decide. Each one points at its guide section: read that section
in the guide, because the guide wins over this summary. Rules marked ⚙ are also checked by
`scripts/style-check.mjs`. Still look at them here, because the checker sees only the lines in scope.

## docs/CODING-STYLE.md

**Coding**
- Avoid hasty abstraction ⚙. Every name, at any scope (top-level, local, type, alias of a property),
  with one use is inlined at that use. A helper or type used twice is written out twice, or
  restructured so it's needed once. Look past the checker for:
  - a component, hook or file that wraps one call
  - an options object or config table read in exactly one place
  - a wrapper type that only renames another type
- Every `// style-check keep: <reason>` ⚙ names a reason the guide accepts (for names: 3+ uses,
  recursion, public API, or inlining would change behavior). A marker that only silences the
  checker is a finding: fix the code instead.
- Prefer inline logic and styling. In JSX: no named styled wrappers, no one-off classes, no style
  objects defined away from the element. Values come from tokens.
- Prefer inversion of control. A function that branches on its caller's identity (`if (clientName ===
  …)`) or a component with growing `showX` / `isY` flags should take a callback, `children`, an
  element prop or compound parts instead.
- Prefer to reduce nesting ⚙ (`else` after `return`). Early returns, `async`/`await` over `.then`
  chains, JSX returning early for loading, empty and error states, no nested ternaries in JSX.
- Prefer code colocation. Helpers, types, constants, styles, tests and stories sit next to the one
  thing that uses them. Something moves to a shared place only when a second feature needs it.
- Must not mutate function arguments, or arrays and objects you don't own ⚙ (`sort`, `reverse`,
  `splice`, and assignments into a parameter's properties).
- Prefer object parameters past two ⚙.
- Prefer native language and platform features: `Array` methods, `Intl`, `URL`, `structuredClone`,
  `fetch`; in the browser `<dialog>`, `<details>`, `<form>`, `popover`. No utility library for what
  the language does.
- Imports ⚙. Third-party, then outer modules (absolute), then inner ones (relative), each group
  separated by a blank line. Outer modules use absolute imports, inner ones relative.

**Naming**
- No `get` prefix ⚙. Name what the function does: `select`, `find`, `format`, `to…`.
- Initialisms keep one case ⚙: `userID`, `inviteURL`, `brandThemeCSS`.
- Names don't repeat the type (`nameString`), irrelevant detail, or context the surroundings already
  give (`AnnualHolidaySale.annualSaleRebate`).
- No words that could name anything: *data, state, amount, number, value, manager, engine, object,
  entity, instance, helper, util, broker, metadata, process, handle, context, info, item, stuff*.
- Descriptive and as short as the scope allows. Past four words, group the words with `_`.
- Booleans start with `is` / `has` / `does` / `should` / `can` ⚙, except names the design system's
  API already uses (`open`, `checked`, `disabled`, `invalid`).
- Union and enum types are singular UpperCamelCase.
- camelCase for everything except components and types (UpperCamelCase) and environment variables
  (UPPER_SNAKE) ⚙.
- Folders are kebab-case, except a component folder, which matches its component. A file is named
  after its main export. Colocated files share the base name.

**Commenting**
- Comments say why, not what. Delete a comment that restates the code. Add one where a reader would
  question a decision, a magic number, or a value kept on purpose.
- Every TODO names a ticket ⚙: `// TODO (MAV-123): …`.

**React**
- Prefer design-system components over raw elements, for layout, text, dividers and controls. Raw
  elements only for semantics the design system lacks, and usually through `as`.
- Values derived from props or state are computed during render, never synced into state with an
  effect. One source of truth per piece of state, as low in the tree as it can live.
- Effects ⚙ (`review`) only sync with something outside React. Event logic goes in the handler, and
  app-wide effects go at the root.
- Stable keys from the data ⚙.
- Props are `onX`, handlers are `handleX` ⚙.
- Native, accessible elements: `<button>` for actions, `<a href>` for navigation, `<label>` for
  inputs. Every control has an accessible name. ARIA only where HTML can't do it.

**TypeScript**
- No `any` ⚙, and never `as any`, even with a comment ⚙.
- `as const` only when code needs the literal type (a derived union, a literal-only prop, a mixed
  tuple, a public constant), with a comment saying which ⚙. Try removing it: if the typecheck and
  published types don't change, it goes.
- Unions and `as const` over enums ⚙. States that can't coexist are a discriminated union, not
  several booleans.
- Inference inside, explicit types at boundaries (exported functions, props, public API).
  `import type` for type-only imports. Every `as` and `!` says why ⚙.
- Every lint or TS ignore says why ⚙. Use `@ts-expect-error`, not `@ts-ignore`.

**Testing**
- Test what the user sees. Query by role and name, interact with `user-event`, assert visible
  results.
- A test that breaks on a refactor that changed nothing for the user is testing the wrong thing.
- Interactive components get an axe check.

## .cursor-config/becket.mdc (library code)

- **Golden rules.** Publishable and product-agnostic: no product presets, dashboard class strings or
  domain names. WCAG 2.2 AA now, not in a later pass. Recipes, not hardcoded styles. Every length on
  a scale.
- **Folders.** `src/components` holds components and their stories only, with no generic utilities.
  Shared non-JSX logic lives in `src/helpers`, and only once a second component uses it.
- **API.** `forwardRef` exposes the element. Optional `as`. Extends the base element's intrinsic
  props. Visual props come from the recipe's variant types. Optional props go into a pattern only
  when defined (conditional spread). No business logic.
- **Layout components.** Option types come from the pattern
  (`NonNullable<Parameters<typeof flex>[0]>`). Class merge order: recipe, helper class, consumer
  `className`. `style` and `...props` reach the root.
- **Accessibility.** Keyboard (Tab, Space/Enter, Escape), the right semantic element, labels tied to
  inputs, a visible focus ring from tokens, and state in attributes and ARIA. `aria-live` only when
  needed. Overlays and disclosures follow APG.
- **Styling.** No literal colors in components ⚙ (app code), tokens instead.
  - Sizing: pick the scale first, then the step. Fibonacci for boxes, the type scale for inline
    glyphs, Fibonacci ratios for proportions, named sizes for panels, em text spacing inside text.
  - Allowed px: borders, outlines, focus rings, shadows (1–3px), 1px visually hidden clipping, the
    24px minimum target.
  - Internal geometry comes from one `--becket-<component>-<dimension>` property.
  - Tokens are referenced with braces inside values, and a missing key is checked in the built
    `index.css`.
- **Brand vs status.** Status tokens never point at a brand color. Filled brand surfaces use
  `neutral.900` ink. Neutral chips are `neutral.800` on `neutral.50`.
- **Storybook.**
  - Stories sit next to the component ⚙ and use the agreed groups ⚙.
  - Every recipe variant has a control from `variantMap`.
  - Layout props get select, boolean or number controls (never "Set object"), and
    `parameters.controls.include` is set.
  - Stories cover at least Default, Disabled, Sizes, States, and With label/description when it
    applies.
- **Tests.** Interactive primitives ship with axe through `@becket-ui/a11y` and keyboard tests for
  APG widgets. No Playwright, Chromatic or test-runner. jsdom can't prove contrast or target size, so
  those are recorded in Storybook.
- **New component.** Recipe first (exported, Panda regenerated), then the component, stories and
  tests. Sizes come from the scale, not from another library.

## packages/react/guides/building-with-becket.md (app code, examples, stories)

- **Setup.** `index.css` imported once at the entry. `data-theme` only on `<html>`. No provider. No
  repeated page background or text color on wrappers.
- **Must use a Becket component** ⚙ for every row of the guide's table. Raw `form`, `main`, `nav` and
  `section` are fine, through `as` when they also lay things out.
- **Known gaps** (MAV-106 weight, MAV-107 status visuals). An inline `style` uses tokens and has a
  `TODO (MAV-…)` ⚙.
- **Props, then tokens** ⚙.
  - Semantic gaps or Fibonacci steps, never Panda's in-between keys.
  - `size` props rather than widths.
  - Ratios: Fibonacci, plus 16:9 for video only.
  - Own CSS uses `var(--beckui--…)`.
  - Never `.beckui--*` classes.
  - Brand colors are never a status.
- **Abstraction.** A local component appears only on the third copy, is built from Becket, sits in
  the same file, and is named for what it shows.
- **Composition.** Pass `children`, element props and compound parts, not flags.
- **Native and zero JS.** Interactive components only when the interaction needs them. `'use client'`
  goes on the leaf only.
- **State, a11y and TypeScript.** As in CODING-STYLE, plus one `h1` per page, headings in outline
  order, and status not shown by color alone.
- **Before you finish.** Run the guide's own checklist, all six boxes.

## Shipping

- **Branch.** `<type>/<scope>/<short-description>` (see `.cursor-config/git-branch-naming.mdc`).
- **Changeset.** Present for consumer-facing changes, with the right bump (CONTRIBUTING "Versions").
  None for docs, test or CI-only changes. The changeset text says what to migrate.
- **Tree.** No internal runbooks in `docs/`, and no first-party product names. The root README is in
  consumer voice (`.cursor-config/remotes.mdc`).
