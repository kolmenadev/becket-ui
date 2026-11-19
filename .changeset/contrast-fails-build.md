---
"@becket-ui/tokens": patch
"@becket-ui/react": patch
"@becket-ui/mcp": patch
---

Contrast failures now fail the build. `@becket-ui/tokens` checks every color pair, and the scales,
at the end of `build` and again before packing.

- The pairs Becket's default theme still misses are `level: 'known-gap'` (was `'advisory'`), each
  with the `issue` that fixes it and the version it's due in (`until`).
- `checkBecketThemeContrast(theme, { version })` treats a known gap as a failure once `version`
  reaches its `until`.
- The report's `advisories` is now `knownGaps`. `advisories` still works and is removed in 1.0.
- `set_theme` labels those rows "known gap" and names the issue that fixes each one.
