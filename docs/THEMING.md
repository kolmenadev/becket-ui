# Consumer theming

Rebrand Becket **without Panda** and without a React theme provider.

## Three knobs

| Kind | When | How |
| --- | --- | --- |
| **Brand theme** | Recolor the whole app | Override public CSS variables after `index.css`, or `defineBecketTheme()` |
| **Scale** | Make the whole app denser, roomier, or change the text size | Three unit variables (below) |
| **Instance override** | This one Button | `style` or `className` on the component |

Do **not** use Panda `css()` in a no-Panda app — those class names are not in `index.css` and will no-op.

## Brand theme

```ts
import '@becket-ui/tokens/index.css';
import { defineBecketTheme } from '@becket-ui/tokens/theme';
```

```ts
const themeCss = defineBecketTheme({
  colors: {
    primary: 'oklch(0.82 0.14 280)',
    background: { dark: 'oklch(0.2 0.02 260)', light: 'oklch(0.98 0.01 260)' },
    text: { dark: 'oklch(0.96 0.01 260)', light: 'oklch(0.22 0.02 260)' },
  },
  radii: { md: '4px' },
  sizes: { field: '16rem' },
  density: { button: { md: { px: '0.5rem', py: '0.25rem' } } },
});
```

Prefer writing `themeCss` to a `.css` file (or copying [theme.example.css](../packages/tokens/theme.example.css)) and importing it **after** `index.css`. Injecting it in a `<style>` tag works too; a stylesheet file keeps theme values out of your HTML.

`defineBecketTheme` only writes values it can read, and throws naming the key (`radii.md`) for anything else:

| Keys | Accepts |
| --- | --- |
| `radii.*`, `fontSizes.*`, `spacing.*`, `sizes.field`, `density.*.*.px` / `py` | A number, optionally with `px`, `rem`, `em` or `%`: `4px`, `0.25rem`, `-1px`, `50%` |
| `fonts.sans`, `fonts.mono` | Font names separated by commas. Quote a name with spaces or dots: `'Segoe UI', system-ui, sans-serif`. Names use ASCII letters, digits, `-` and `_` |
| every `colors.*`, `{ dark, light }` and `neutral.*` | Hex (3, 4, 6 or 8 digits), `rgb()`, `hsl()`, `oklch()` or a basic color name, with an optional alpha |

Colors are written back out in OKLCH, the same color within rounding (at most one step of 255 on a channel): `#0a3d91` becomes `oklch(0.3856 0.1483 260.54)`, and an alpha below 1 stays (`#11223380` becomes `oklch(0.2462 0.0398 249.73 / 0.502)`). `var()`, `calc()` and other functions aren't accepted; set those in your own CSS after `index.css`. Empty values are skipped.

Unlayered `:root` wins over `@layer tokens`. Set `data-theme="dark" | "light"` on `<html>`. Dark is the default. `background` / `text` / `muted` / `danger` are semantic: one name, two values via `data-theme`. Filled brand controls use `neutral.900` ink so yellow/sage fills stay AA. The violet in the Button **Brand Theme** story is a `defineBecketTheme({ colors: { primary } })` demo (hue 280), not the default primary.

Public names: `primary` / `secondary` / `tertiary` / `primaryHover`, neutrals 50–900, `background` / `text` / `muted` / `border` / `danger` / `accent` / `surface` / `link` / `linkHover` / `linkVisited`, status, `radii.*`, `fontSizes.base` + `xs–6xl`, `spacing.unit` / `textUnit` + `xs–xl` (layout / Stack gap), `sizes.field`, `fonts.sans` / `mono`, plus component density `--beckui-button-px-md` / `--beckui-field-*` / `--beckui-tag-*`.

Setting `primary` retints hover, focus outline, and gradients. You do not also set `--beckui--colors-brand-becket-yellow`.

Do **not** shrink Stack gaps to make only buttons denser. Override `--beckui-button-px-md` (and friends), not `--beckui--spacing-md`. To make everything denser, change `--beckui--spacing-unit`.

## From brand colors, a logo or a brand manual

Changing `primary` alone rarely passes contrast: filled buttons put dark `neutral.900` labels on it, and light-theme links have their own darker shade. Let Becket derive the rest:

```ts
import { defineBecketTheme, deriveBecketTheme } from '@becket-ui/tokens/theme';

const { theme, notes, contrast } = deriveBecketTheme({ brand: ['#0a3d91', '#f5a623'] });
// contrast.passes: every pair Becket draws reaches WCAG 2.2 AA in dark and light.
// notes: why each value is what it is ("lightened from L 0.39 to 0.62 so labels reach 4.5:1").
const themeCss = defineBecketTheme(theme);
```

- One to three brand colors, most important first: hex, `rgb()`, `hsl()` or `oklch()`. Only lightness moves; the hue never does. A color that already passes is used exactly.
- `pinned: { background: { dark: '…', light: '…' } }` keeps colors you must match. They're checked and never shaded (defineBecketTheme writes them in OKLCH, the same color within rounding), and anything on them is shaded to fit.
- `checkBecketThemeContrast(theme)` checks any theme, hand-written ones included. Advisory rows (the focus ring on a light canvas, labels over the tertiary end of a gradient) are reported but not enforced, because Becket's default theme misses them too.

With an agent, the Becket MCP does this for you: `suggest_theme` reads a logo or brand manual PDF and asks you one decision at a time; `set_theme` returns the CSS. See the [MCP README](../packages/mcp/README.md#brand-themes).

## Scale: resize everything with three variables

Every length in Becket comes from a token (`pnpm -F @becket-ui/tokens test` enforces it), and every scale is derived from one unit. Override a unit and the whole scale moves in proportion:

| Variable | Default | Drives |
| --- | --- | --- |
| `--beckui--spacing-unit` | `0.25rem` | Fibonacci spacing (`gap`, padding) and sizes (avatar, textarea) and component padding (button, field, tag) |
| `--beckui--spacing-text-unit` | `0.25em` | Spacing inside running text: Prose rhythm, inline code, kbd, list indent. In em, so it also follows the text size |
| `--beckui--font-sizes-base` | `1rem` | Every font size (`xs`–`6xl` are ratios of it) |

A full rebrand fits in a few lines:

```css
/* after @becket-ui/tokens/index.css */
:root {
  --beckui--colors-primary: oklch(0.62 0.19 255);
  --beckui--fonts-sans: 'Söhne', system-ui, sans-serif;
  --beckui--spacing-unit: 0.2rem;   /* denser product UI */
  --beckui--font-sizes-base: 0.9375rem;
  --beckui--radii-md: 0.25rem;      /* squarer corners */
}
```

Or `defineBecketTheme({ spacing: { unit: '0.2rem' }, fontSizes: { base: '0.9375rem' } })`.

Keep units in `rem` (and the text unit in `em`) so browser font-size settings still work (WCAG 1.4.4). Named layout widths (`sizes.xs`–`8xl`, `prose`) and the 24px minimum target size don't scale on purpose.

## Instance override

```tsx
<Button visual="primary" style={{ background: 'rebeccapurple', borderRadius: '9999px' }}>
  One-off
</Button>
```

`className` merges after the recipe. Prefer brand tokens for product-wide color.

## Power path (optional)

Apps that already run Panda: `presets: [becketPreset]` and `theme.extend.tokens` / `semanticTokens`. Same visual result; they own codegen.
