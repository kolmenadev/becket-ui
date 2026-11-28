---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

Tabs calls the latest `onValueChange` after a parent re-render. Before, a new callback was ignored
until the selection changed, so it kept running the first one with stale parent state. A controlled
`Tabs` (`value` set) no longer needs `defaultValue`; an uncontrolled one still does. To migrate: a
wrapper whose props are `Omit<ComponentProps<typeof Tabs>, …>` (or `Pick`) now sees both `value` and
`defaultValue` as optional, so the spread fits neither branch of the union and no longer
type-checks; give the wrapper its own `value`/`defaultValue` (controlled or uncontrolled), or use a
distributive `Omit`.
