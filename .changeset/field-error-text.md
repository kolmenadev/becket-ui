---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

`TextField`, `Select` and `Textarea` take an `errorText` prop. When `invalid`, the error and
`helperText` show together, and the control's `aria-describedby` lists the error, then the hint.
`invalid` with only `helperText` still shows that text as the error, so nothing needs migrating.

- `FieldError` shows a warning glyph before its text, so an error isn't marked by color alone. The
  glyph is hidden from assistive tech; the alert reads the message only.
- In development, an invalid field with no message warns once in the console.
