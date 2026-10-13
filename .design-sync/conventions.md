## Building with Becket UI — read this first

**Setup.** No provider or theme wrapper — Becket components are styled by compiled CSS, not context. Link `styles.css` once and mount components from `window.Becket`.

**Theme (dark default, light opt-in).** Put the theme on the root element: `document.documentElement.setAttribute('data-theme', 'light')` (or `'dark'`). `data-theme` only re-colors the element it's on and its descendants, and `styles.css` paints `<body>` from the root's theme. So:
- Never put `data-theme` on an inner wrapper and leave the page around it unpainted — that gives light text and cards on a dark page (or the reverse).
- If you must scope a theme to a subtree (a side-by-side light/dark demo), that element must paint itself: `style={{ background: 'var(--beckui--colors-background)', color: 'var(--beckui--colors-text)' }}`.
- Every surface you build (page, sidebar, header, nav) uses token colors (`var(--beckui--colors-background|surface|text|muted|border)`), never hex or `#fff`/`#000`, so it flips with the theme.

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
