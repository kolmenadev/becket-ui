---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
---

Add `Breadcrumb` and `Steps`, the rest of the navigation basics. Both render without client JS.

- `Breadcrumb` (`size`, `separator: chevron | slash`) is a `nav` landmark around an ordered list of
  `BreadcrumbItem`s. An item is a link (`href`, `as` for a router link); `current` marks the page
  the user is on with `aria-current="page"`, as plain text when it has no `href`. Separators are
  drawn in CSS, so screen readers don't read them.
- `Steps` (`orientation`, `size`) is a display-only list of `Step`s. Each step sets its own
  `status` (`complete | current | upcoming`); the current one gets `aria-current="step"`, and the
  others announce "(completed)" or "(not started)" after the title (`statusLabel` translates it).

The `breadcrumb` and `steps` slot recipes ship in `@becket-ui/tokens`.
