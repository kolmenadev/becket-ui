# @becket-ui/mcp

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
