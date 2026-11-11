---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
---

Checked, selected and current states stay visible in Windows contrast themes (forced colors). Those
themes drop background images and repaint brand colors to one system color, so a state drawn only
with color disappeared.

- Checkbox and Radio draw a check or a dot in `HighlightText` on a `Highlight` fill.
- The selected tab is 4px thick; unselected tabs stay 2px.
- The current page is underlined, with an inset outline.
- The current step's marker border is `Highlight`.
- A gradient heading falls back to `CanvasText` instead of disappearing.

Nothing changes outside forced colors.
