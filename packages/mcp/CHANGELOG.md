# @becket-ui/mcp

## 0.9.0

### Patch Changes

- 65d1bc4: Activating a menu item closes the menu and returns focus to the trigger. An item that
  moves focus itself keeps that focus. An item that cancels the event stays open.
- e2dba1a: Text forwards DOM attributes, handlers, ref, style, and the css prop to the element it
  renders.
- 6758d76: A tooltip trigger that isn't a tab stop, such as an Icon, a Tag or a Link without an
  href, now becomes one, so its hint opens from the keyboard. The trigger keeps its own element,
  layout and ref. Controls and triggers that set their own tabIndex are left as they are, and a
  disabled tooltip adds no tab stop. The hint is added to the trigger's own aria-describedby instead
  of replacing it. A component that drops the props it's given gets a focusable wrapper. In
  development, an Icon trigger without a label logs a warning. Disabled buttons still need their own
  wrapper.

## 0.8.1

No changes in this release.

## 0.8.0

No changes in this release.

## 0.7.0

No changes in this release.

## 0.6.1

No changes in this release.

## 0.6.0

No changes in this release.

## 0.5.1

No changes in this release.

## 0.5.0

### Minor Changes

- 7f8d750: Brand themes from colors, a logo or a brand manual.

  - `@becket-ui/mcp`: two new tools. `suggest_theme` reads a logo (PNG, JPEG, SVG) or a brand manual
    (PDF) from a path, a public https URL or base64, and walks the user through brand colors, font,
    corners and text size one step at a time. `set_theme` turns the confirmed values into theme CSS
    and `defineBecketTheme()` code with a WCAG 2.2 AA report for dark and light. Neither writes
    files.
  - `@becket-ui/tokens/theme`: `deriveBecketTheme({ brand })` builds a full color theme from one to
    three brand colors that passes AA in both themes; `checkBecketThemeContrast(theme)` checks any
    theme; `contrastRatio` and `parseColor` read hex, `rgb()`, `hsl()`, `oklch()` and basic color
    names (`navy`, `teal`).
  - `defineBecketTheme` accepts `surface`, `link`, `linkHover` and `linkVisited`, so a rebrand can
    recolor light-theme links instead of leaving them Becket yellow.
