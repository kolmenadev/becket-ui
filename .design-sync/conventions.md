## Building with Becket UI — read this first

**Setup.** No provider or theme wrapper — Becket components are styled by compiled CSS, not context. Link `styles.css` once and mount components from `window.Becket`. Dark is the default theme; for light, set `data-theme="light"` on `<html>` (`data-theme="dark"` switches back). `styles.css` already paints the page with `--beckui--colors-background` and `--beckui--colors-text`, so don't set your own page background or text color — it breaks the light/dark switch.

**Styling idiom: props first, then tokens. Never classes.**
- Use component props for the design language: `Button visual="primary|secondary|neutral|outline" size="sm|md"`, `Card visual="elevated|outline|subtle" size="sm|md|lg"`, `Field size="sm|md|lg" invalid`.
- Layout glue: `Stack` / `HStack` / `VStack` with `gap="xs|sm|md|lg|xl"` (or the Fibonacci steps `0 1 2 3 5 8 13 21 34`), `align`, `justify`. Prefer semantic gaps (`gap="md"`).
- When you need your own CSS, use the tokens as variables, never literal colors:
  - color: `var(--beckui--colors-background|surface|text|muted|border|primary|secondary|tertiary|accent|danger|warning|success)`
  - spacing: `var(--beckui--spacing-xs|sm|md|lg|xl)`; radius: `var(--beckui--radii-sm|md|lg|xl|full)`; shadow: `var(--beckui--shadows-md)`
- Never write or copy `.beckui--*` class names — they are generated recipe classes, not API.
- Brand colors (`primary` yellow, `secondary` sage, `tertiary` amber) are identity; `danger`/`warning`/`success` are status only. Don't use a brand color to mean an error or a success.

**Where the truth lives.** `styles.css` → `tokens/index.css` holds every token and recipe; each `components/<group>/<Name>/<Name>.prompt.md` has real usage, and `<Name>.d.ts` the exact props. Compound parts are separate exports: `FieldLabel`, `FieldControl`, `FieldHelper`, `FieldError`; `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`; `DialogHeader`, `DialogTitle`, `DialogBody`, `DialogFooter`, `DialogClose`.

**Idiomatic example.**

```jsx
const { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Field, FieldControl, FieldHelper, FieldLabel, HStack, Stack } = window.Becket;

<Card visual="elevated">
  <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
  <CardBody>
    <Stack gap="md">
      <Field>
        <FieldLabel>Display name</FieldLabel>
        <FieldControl placeholder="Ada Lovelace" />
        <FieldHelper>Shown on your public profile.</FieldHelper>
      </Field>
    </Stack>
  </CardBody>
  <CardFooter>
    <HStack gap="sm" justify="end">
      <Button visual="neutral">Cancel</Button>
      <Button visual="primary">Save</Button>
    </HStack>
  </CardFooter>
</Card>
```

**Shipping the design.** In app code, import from `@becket-ui/react` and load `@becket-ui/tokens/index.css` once — `window.Becket` exists only in this design canvas.
