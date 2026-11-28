---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

Adds Combobox, FileUpload, Alert and Toast, and status visuals for Badge and Tag.

- `Combobox` is a text input with a list to pick from (ARIA 1.2 combobox). Typing filters the
  options, or searches a server through `onSearch` (debounced, and an older answer never replaces a
  newer one). Options can have a second line (`description`), and `suggestions` show in their own
  labelled group above the results. It takes `label`, `helperText` and `invalid` like `TextField`,
  works controlled or uncontrolled, and submits the chosen `value` under `name`.
- `FileUpload` is a drop zone with a native file picker. It checks `accept`, `maxSize` and
  `maxFiles`, lists the chosen files with a remove button each, and explains every rejected file
  next to the control.
- `Alert` is an inline notice for `info`, `success`, `warning` and `danger`, with an icon of its own
  shape, an optional title, actions and a dismiss button. It's `role="status"` unless you pass
  `role="alert"` for an urgent error.
- `ToastProvider` and `useToast()` show toasts in a notifications region that is on the page from
  the first render. Toasts are announced politely (`danger` assertively and kept until dismissed),
  pause while hovered or focused, never take focus, and skip their entrance animation when reduced
  motion is on.
- `Badge` and `Tag` take `visual="success" | "warning" | "danger" | "info"`, filled with the status
  color and the canvas color as ink, at 4.5:1 or more in dark and light.
- New glyphs: `ErrorIcon` and `UploadIcon`.

Tokens: `success` and `warning` now have a darker light-theme value, like `danger`, so they pass
4.5:1 on the light canvas. Their dark values don't change. A new `info` status color (hue 250) is
added. `defineBecketTheme` accepts `{ dark, light }` for `success`, `warning` and `info`, and the
contrast check covers status text, status icons and filled status chips. If you drew text or icons
in `success` or `warning` on the light theme, they get darker.
