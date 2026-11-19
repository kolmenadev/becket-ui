---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
"@becket-ui/mcp": patch
---

Tabs calls the latest `onValueChange` after a parent re-render. Before, a new callback was ignored
until the selection changed, so it kept running the first one with stale parent state. A controlled
`Tabs` (`value` set) no longer needs `defaultValue`; an uncontrolled one still does.
