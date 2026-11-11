---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
"@becket-ui/mcp": patch
---

A tooltip trigger that isn't a tab stop, such as an Icon, a Tag or a Link without an href, now
becomes one, so its hint opens from the keyboard. The trigger keeps its own element, layout and ref.
Controls and triggers that set their own tabIndex are left as they are, and a disabled tooltip adds
no tab stop. The hint is added to the trigger's own aria-describedby instead of replacing it. A
component that drops the props it's given gets a focusable wrapper. In development, an Icon trigger
without a label logs a warning. Disabled buttons still need their own wrapper.
