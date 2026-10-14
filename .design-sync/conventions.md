## Building with Becket UI — read this first

**Setup.** No provider or theme wrapper — Becket components are styled by compiled CSS, not context. Link `styles.css` once and mount components from `window.Becket`. The generic note further down about Storybook decorators and theme/i18n providers does not apply to Becket: its only decorator paints the preview card's background, so never wrap a design in a provider.

**Code style: read `guidelines/guides/building-with-becket.md` before writing any screen.** It's Becket's coding guide (the same file ships as `@becket-ui/react/guides/building-with-becket.md`). The short version:
- Use a Becket component whenever one exists: layout is `VStack`/`HStack`/`Flex`/`SimpleGrid`, text is `Heading`/`Text`, dividers are `Separator`. Never a flex `div`, `h1`–`h6`, `p`/`span` with font styles, or a 1px divider `div`.
- Style with props, then tokens. No pixel spacing, no hex, no `.beckui--*` classes. An inline `style` (with tokens) is only for a known gap, with a `// TODO (MAV-…)` naming the ticket. Page wrappers are `Container as="main"`; plain padded or tinted blocks are `Box`.
- Write markup inline; extract a local helper only on the third copy, built from Becket components.
- Before finishing, run the guide's checklist.

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

**Pick the Becket component before writing markup.**
- Content and media: `List`/`ListItem`, `Code`, `Kbd`, `Mark`, `Blockquote` + `BlockquoteCaption`, `Image alt` (required) in `Figure caption`, `Avatar name src` (initials fallback), `AspectRatio ratio={16 / 9}`. Layout extras: `Center`, `Grid columns={{ base: 1, md: 12 }}` + `GridItem colSpan`. A11y: `SkipLink href="#main"` first in the page, `VisuallyHidden` for screen-reader-only text.
- Long-form content (articles, posts, docs from Markdown): `<Prose as="article" size="sm|md|lg">` styles plain HTML; wrap embedded components in `data-not-prose`.
- Typography: `Heading size="sm…6xl"` (`as="h1"…` for the level, `withGradient` for brand headings); `Text` takes style props (`fontSize="xs|sm|md|lg|xl|2xl"`, `color="muted"`) and `as`; `Link visual="default|muted"`.
- Layout: `Container as="main" size="sm|md|lg|xl|full" padding` for page width and gutters; `Box padding background="surface|subtle" radius` for plain blocks; `Stack`/`HStack`/`VStack` first; `Flex` (`direction`, `align`, `justify="between"`, `wrap`, `gap`) for the rest; `SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md"` for card grids; `Separator orientation="horizontal|vertical"`; `Hide below="desktop"` / `from="tablet"` for responsive branches.
- Forms: inside a labeled field use `Field` + `FieldControl` / `FieldSelect` / `FieldTextarea`. Standalone: `TextField`, `Select`, `Textarea` (`label`, `helperText`, `size="sm|md|lg"`, `invalid`). Choices: `Checkbox` and `Switch` take `label` (`Switch size="sm|md|lg"`); radios are `<RadioGroup name legend defaultValue><Radio value label description /></RadioGroup>`.
- Display: `Tag` / `Badge` with `visual="primary|secondary|neutral|outline"` and `size="sm|md|lg"`; `Table` (`size="sm|md"`) with `TableHeader`, `TableBody`, `TableRow`, `TableColumnHeader`, `TableCell`, `TableCaption` (short aliases `Thead`, `Tbody`, `Tr`, `Th`, `Td`). Loading: `Spinner size="sm|md|lg"`. Icons: `Icon size="sm|md|lg|xl"` around an SVG, or built-in glyphs (`ChevronDownIcon`, `ChevronRightIcon`, `CloseIcon`, `MenuIcon`, `CheckIcon`, `CopyIcon`, `ExternalLinkIcon`, `LinkIcon`, `SearchIcon`, `SunIcon`, `MoonIcon`, `InfoIcon`, `WarningIcon`); decorative unless given `label`.
- Disclosure: `<Tabs defaultValue="a"><TabList><Tab value="a">…</Tab></TabList><TabPanel value="a">…</TabPanel></Tabs>`.
- Overlays: `Drawer` mirrors Dialog (`DrawerHeader`, `DrawerTitle`, `DrawerBody`, `DrawerFooter`, `DrawerClose`; `placement="start|end"`); `<Menu label="Actions"><MenuItem>…</MenuItem></Menu>`; `<Tooltip content="…" placement="top">` around one focusable trigger. Dialog, Drawer and Menu cards show the open panel (`open` / `onOpenChange` for Dialog and Drawer; Menu is a native `<details>`). The Tooltip card shows only its trigger; the bubble appears on hover or focus.

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

**Shipping the design (handoff to Claude Code).** `window.Becket` exists only in this design canvas. When this design is handed off, the app code must:
- Import every component from `@becket-ui/react` (`import { Button, Card, Tabs } from '@becket-ui/react'`) and load `@becket-ui/tokens/index.css` once at the app entry. Install with `pnpm add @becket-ui/react @becket-ui/tokens`.
- Keep the theme on `<html data-theme="dark|light">`; no provider, no theme wrapper.
- Follow `@becket-ui/react/guides/building-with-becket.md` (in `node_modules`): map each element of this design to the same Becket component and props, never to raw layout or text elements, raw `<button>`/`<input>`/`<select>`, hex colors or copied `.beckui--*` classes.
