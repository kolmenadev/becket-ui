# Consumer theming

Rebrand Becket **without Panda** and without a React theme provider. Spec: [MAV-22](https://kolmena.atlassian.net/browse/MAV-22).

## Two knobs

| Kind | When | How |
| --- | --- | --- |
| **Brand theme** | Recolor the whole app | Override public CSS variables after `index.css`, or `defineBecketTheme()` |
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
    primary: 'oklch(0.55 0.22 280)',
    background: { dark: 'oklch(0.2 0.02 260)', light: 'oklch(0.98 0.01 260)' },
    text: { dark: 'oklch(0.96 0.01 260)', light: 'oklch(0.22 0.02 260)' },
  },
  radii: { md: '4px' },
  sizes: { field: '16rem' },
  density: { button: { md: { px: '0.5rem', py: '0.25rem' } } },
});
```

Inject `themeCss` in a `<style>` tag, or copy [theme.example.css](../packages/tokens/theme.example.css) and import it **after** `index.css`.

Unlayered `:root` wins over `@layer tokens`. Set `data-theme="dark" | "light"` on `<html>`. Dark is the default. `background` / `text` / `muted` are semantic: one name, two values via `data-theme`.

Public names: `primary` / `secondary` / `tertiary` / `primaryHover`, neutrals 50–900, `background` / `text` / `muted` / `border`, status, `radii.*`, `fontSizes.xs–6xl`, `spacing.xs–xl` (layout / Stack gap), `sizes.field`, `fonts.sans` / `mono`, plus component density `--beckui-button-px-md` / `--beckui-field-*` / `--beckui-tag-*`.

Setting `primary` retints hover, focus outline, and gradients. You do not also set `--beckui--colors-brand-becket-yellow`.

Do **not** shrink Stack gaps to make buttons denser. Override `--beckui-button-px-md` (and friends), not `--beckui--spacing-md`.

## Instance override

```tsx
<Button visual="primary" style={{ background: 'rebeccapurple', borderRadius: '9999px' }}>
  One-off
</Button>
```

`className` merges after the recipe. Prefer brand tokens for product-wide color.

## Power path (optional)

Apps that already run Panda: `presets: [becketPreset]` and `theme.extend.tokens` / `semanticTokens`. Same visual result; they own codegen.
