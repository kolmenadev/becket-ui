# Writing app code with Becket UI

How to write React screens with `@becket-ui/react`. It's written for people and for agents: Claude
Design while it builds a design, Claude Code when it turns a design into app code, and any coding
agent connected to the Becket MCP. If you follow this guide, the code reads top to bottom, uses
Becket for everything Becket can do, and keeps working in dark and light themes.

Each rule says **Must** (required) or **Prefer / Avoid** (the default; deviate with a reason in a
comment).

## 1. Setup, once per app

- Install `@becket-ui/react` and `@becket-ui/tokens`. Import `@becket-ui/tokens/index.css` **once**,
  at the app entry.
- The theme lives on `<html data-theme="dark|light">` (dark is the default). Set it at the app root,
  never inside a screen. There is **no provider** and no theme wrapper.
- `index.css` already paints the page background, text color and font from the theme. Don't repeat
  that on a wrapper `div`.

## 2. Must use a Becket component when one exists

Raw elements with inline styles are the most common mistake. Use this table:

| Instead of                                           | Use                                                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| page wrapper `div` (max width, centering, gutters)   | `Container as="main" size="md"`                                                                                            |
| plain block `div` with padding, background or radius | `Box padding="md" background="subtle" radius="md"`                                                                         |
| `div` with `display: flex; flex-direction: column`   | `VStack` / `Stack`                                                                                                         |
| `div` with `display: flex` (row)                     | `HStack`, or `Flex` for wrap, grow and basis                                                                               |
| `div` with `display: grid`                           | `SimpleGrid columns={{ base: 1, md: 2 }}`                                                                                  |
| `h1`–`h6` with font styles                           | `Heading as="h1" size="2xl"`                                                                                               |
| `p` / `span` with font size or color                 | `Text fontSize="sm" color="muted"`                                                                                         |
| bold `span`                                          | `Text as="strong"`                                                                                                         |
| `hr`, or a 1px `div`                                 | `Separator` (`orientation="vertical"` inside a row)                                                                        |
| `button`                                             | `Button visual="primary\|secondary\|neutral\|outline"`                                                                     |
| `input` + `label`                                    | `Field` + `FieldLabel` + `FieldControl`, or `TextField label`                                                              |
| `select` / `textarea`                                | `Select` / `Textarea` (or `FieldSelect` / `FieldTextarea` inside `Field`)                                                  |
| checkbox / radio / toggle `input`                    | `Checkbox`, `RadioGroup` + `Radio`, `Switch`                                                                               |
| `table`, `tr`, `td`                                  | `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`                                                                                |
| panel `div` with border and padding                  | `Card` + `CardHeader` / `CardBody` / `CardFooter`                                                                          |
| pill `span`                                          | `Tag` (label) or `Badge` (count or status)                                                                                 |
| inline `svg` icon                                    | `Icon` around your SVG, or a built-in glyph (`SearchIcon`, `ChevronDownIcon`, …); add `label` only when it carries meaning |
| `a`                                                  | `Link`                                                                                                                     |
| `a` styled as a button (call to action)              | `Button as="a" href="…"` (anchor props are typed)                                                                          |
| HTML from Markdown or MDX (blog posts, docs)         | `<Prose as="article">`; wrap embedded components in `data-not-prose`                                                       |
| `ul` / `ol` with `li`                                | `List` (`as="ol"` for steps, `marker="none"` for nav) + `ListItem`                                                         |
| inline `code`, `kbd`, `mark`                         | `Code`, `Kbd`, `Mark`                                                                                                      |
| `blockquote` (+ attribution)                         | `Blockquote cite` + `BlockquoteCaption`                                                                                    |
| `img`                                                | `Image alt` (required; lazy by default), inside `Figure caption` when captioned                                            |
| profile photo or initials circle                     | `Avatar name src`                                                                                                          |
| centered box                                         | `Center` (`inline` for icons in text)                                                                                      |
| 12-column page layout                                | `Grid columns={{ base: 1, md: 12 }}` + `GridItem colSpan`                                                                  |
| fixed-ratio media (video, map, cover image)          | `AspectRatio ratio="8:5"` (`"16:9"` for video)                                                                                       |
| screen-reader-only text, skip link                   | `VisuallyHidden`, `SkipLink href="#main"`                                                                                  |
| custom modal, side panel, dropdown, tabs or tooltip  | `Dialog`, `Drawer`, `Menu`, `Tabs`, `Tooltip`                                                                              |

Raw elements are fine for semantics Becket doesn't cover (`form`, `main`, `nav`, `section`). Render
them through a layout component's `as` prop when they also lay things out:
`<VStack as="form" gap="md">`.

**Known gaps** (until these ship, an inline `style` with tokens is allowed, with a `TODO` naming the
ticket):

- Font weight on `Text`: no `weight` prop yet (MAV-106). Use `Text as="strong"` for bold.
- Status colors on `Badge` and `Tag`: no `success` / `warning` / `danger` visuals yet (MAV-107).
  Don't use a brand visual (`primary`, `secondary`) to mean a status.

## 3. Prefer props, then tokens. Never classes, never literals

Style with component props, written inline where the component is used. That's Becket's design
language: `gap`, `align`, `justify`, `visual`, `size`, `invalid`, `columns`.

- **Spacing:** semantic `gap="xs|sm|md|lg|xl"` (or the Fibonacci steps `1 2 3 5 8 13 21 34`). Never
  pixel numbers, and never Panda's in-between keys (`4`, `6`, `10`, `12`): they exist but are off
  the scale.
- **Sizes and ratios:** use the component's `size` prop rather than a width, since its steps are
  already on the scale. For fixed media, use the Fibonacci ratios (`AspectRatio ratio="3:2|8:5|13:8"`,
  or a portrait flip such as `"5:8"`), and `"16:9"` only for video. Don't bring in sizes or ratios
  from another system (`4:3`, 40px avatars).
- **When you need your own CSS** (a known gap above, or a one-off like `minWidth: 0`), use token
  variables: `var(--beckui--colors-muted)`, `var(--beckui--spacing-lg)`, `var(--beckui--sizes-4xl)`,
  `var(--beckui--radii-md)`. Never hex, `rgb()`, or raw pixel values for spacing and color.
- **Must not** write or copy `.beckui--*` class names. They're generated, not API.
- **Avoid** named styled wrappers, CSS files per screen, or style objects defined away from the
  element. A reader shouldn't have to look anything up to see how an element looks.
- **Colors carry meaning:** `primary` (yellow), `secondary` (sage) and `tertiary` (amber) are brand
  identity; `danger`, `warning` and `success` are status only.

## 4. Avoid hasty abstraction: inline first, extract on the third copy

Write markup inline. Extract a local component only when the same markup appears **three times** in
the same feature. Then:

- Build it only from Becket components and tokens; a helper made of raw `div`s and `span`s is the
  same mistake, just moved.
- Keep it in the same file, or next to it, until a second feature needs it.
- Name it for what it shows (`MemberName`), not how (`TitleCell`).

## 5. Prefer inversion of control: compose, don't configure

Pass content in instead of adding flags: `children`, element props (`actions={<Button>…</Button>}`),
and Becket's compound parts (`CardHeader` / `CardBody` / `CardFooter`, `DialogHeader` /
`DialogFooter`, `TabList` / `Tab` / `TabPanel`). A screen component with `showX`, `isY` and
`variantZ` booleans is a sign to invert.

## 6. Prefer native HTML and zero JavaScript

Becket is native-first. Prefer the components and props that work without client JavaScript.
Interactive ones (`Tabs`, `Menu`, `Tooltip`, controlled `Dialog` / `Drawer`) ship JS. Use them when
the interaction needs them, not for static content. Put `'use client'` only on the leaf component
that holds state or handlers, never on a whole page or barrel file.

## 7. State and effects

- **Derive, don't sync:** compute values from props and state during render
  (`const activeCount = members.filter((m) => m.isActive).length`). Don't mirror them into state
  with an effect.
- **Effects** are only for syncing with something outside React (subscriptions, timers, storage).
  Theme and analytics belong at the app root.
- **Must not mutate** state, props or shared constants. Create new values with spread, `map`,
  `filter` or `toSorted()`.
- Keep each piece of state in one place, as low in the tree as it can live.

## 8. Accessibility (WCAG 2.2 AA)

- Every control has a name: a visible label (`TextField label`, `FieldLabel`, `Switch label`) or
  `aria-label` when the label is visual only, such as a `Switch` in a table row:
  ``aria-label={`Access for ${member.name}`}``.
- One `h1` per page. Headings follow the document outline (`Heading as="h2"` for sections).
- Use `Button` for actions and `Link` for navigation, never a clickable `div`.
- Don't rely on color alone for status: keep the text ("Active", "Invited").

## 9. TypeScript and naming

- Type props explicitly (`type MemberTableProps = { … }`). Let TypeScript infer locals. Must not use
  `any`.
- Use string unions and `as const` data instead of `enum`:
  `const ROLES = ['owner', 'admin', 'member'] as const`.
- Use stable keys from data (`key={member.id}`), never the array index for lists that change.
- Callback props are `onX`; handlers inside are `handleX`. Booleans start with `is`, `has`, `should`
  or `can`.
- Functions say what they do (`selectActiveMembers`, `formatSeatCount`), not `getX`. Keep
  initialisms in one case (`userID`, `inviteURL`).
- Sort imports: third-party (React, then `@becket-ui/react`), then absolute app modules, then
  relative.
- Comment **why**, not what. A `TODO` names its ticket: `// TODO (MAV-106): use Text weight`.

## 10. Example: a settings screen

### Avoid

From a real Claude Design handoff. It uses Becket's Tabs, Table and Switch correctly, but builds
everything else from raw markup:

```tsx
<div style={{ minHeight: '100vh', background: 'var(--beckui--colors-background)', padding: '48px 24px' }}>
  <div style={{ maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 28 }}>
    <h1 style={{ margin: 0, fontSize: 'var(--beckui--font-sizes-2xl)', fontWeight: 600 }}>Workspace settings</h1>
    <p style={{ margin: 0, color: 'var(--beckui--colors-muted)' }}>Manage how the workspace behaves.</p>
    {PREFS.map((pref, i) => (
      <div key={pref.k}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '16px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontWeight: 600 }}>{pref.title}</span>
            <span style={{ color: 'var(--beckui--colors-muted)' }}>{pref.desc}</span>
          </div>
          <Switch checked={prefs[pref.k]} onCheckedChange={…} aria-label={pref.title} />
        </div>
        {i < PREFS.length - 1 && <div style={{ height: 1, background: 'var(--beckui--colors-border)' }} />}
      </div>
    ))}
  </div>
</div>
```

What's wrong:

- Flex `div`s instead of `VStack` / `HStack`.
- `h1` / `p` / `span` instead of `Heading` / `Text`.
- A 1px `div` instead of `Separator`.
- Pixel gaps.
- A background the CSS already paints.
- A cryptic data key (`k`).

### Prefer

```tsx
import { useState } from "react";
import {
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Separator,
  Switch,
  Text,
  VStack,
} from "@becket-ui/react";

const PREFERENCES = [
  {
    id: "public",
    title: "Public workspace",
    description: "Anyone with the link can request to join.",
  },
  {
    id: "guests",
    title: "Allow guests",
    description: "Invite people outside your domain with limited access.",
  },
  {
    id: "sso",
    title: "Require SSO",
    description: "Members sign in through your identity provider.",
  },
] as const;

type PreferenceID = (typeof PREFERENCES)[number]["id"];

export function WorkspaceSettings() {
  const [enabled, setEnabled] = useState<Record<PreferenceID, boolean>>({
    public: false,
    guests: true,
    sso: true,
  });

  return (
    <Container as="main" size="md">
      <VStack gap="xl">
        <VStack gap="xs">
          <Heading as="h1" size="2xl">
            Workspace settings
          </Heading>
          <Text fontSize="sm" color="muted">
            Manage how the workspace behaves for everyone in it.
          </Text>
        </VStack>

        <Card visual="outline" fullWidth>
          <CardBody>
            <VStack gap="md">
              {PREFERENCES.map((preference, index) => (
                <VStack key={preference.id} gap="md">
                  {index > 0 && <Separator />}
                  <HStack justify="between" align="center" gap="lg">
                    <VStack gap="xs">
                      <Text as="strong" fontSize="sm">
                        {preference.title}
                      </Text>
                      <Text fontSize="sm" color="muted">
                        {preference.description}
                      </Text>
                    </VStack>
                    <Switch
                      aria-label={preference.title}
                      checked={enabled[preference.id]}
                      onCheckedChange={(isOn) =>
                        setEnabled((current) => ({ ...current, [preference.id]: isOn }))
                      }
                    />
                  </HStack>
                </VStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
```

No raw layout or text elements are left: `Container` renders the `main` landmark, and every visual
decision is a prop with a token value.

## 11. Before you finish

- [ ] No flex or grid `div`s, no `h1`–`h6` / `p` / `span` with font styles, no 1px divider `div`s.
- [ ] No hex or `rgb()` colors, no pixel spacing, no `.beckui--*` classes.
- [ ] Every inline `style` uses tokens and has a `TODO (MAV-…)` naming the gap it covers.
- [ ] Local helpers exist only for markup used three or more times, and are built from Becket.
- [ ] Every control has an accessible name; status isn't shown by color alone.
- [ ] Theme is set at the app root; `index.css` is imported once.
