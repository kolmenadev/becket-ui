---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

Becket respects the OS setting "Reduce motion". Under `prefers-reduced-motion: reduce`, `index.css`
cuts every animation and transition to 0.01ms, runs animations once and turns off smooth scrolling,
and the Spinner stops rotating and shows its arc still.

Nothing changes without the setting.
