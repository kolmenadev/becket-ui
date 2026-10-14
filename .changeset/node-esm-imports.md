---
'@becket-ui/react': patch
---

Make `@becket-ui/react` importable with plain Node ESM. Relative imports in `dist` (JS and `.d.ts`) now end in `.js`, so scripts, `node --test` and bundler-free SSR can `import '@becket-ui/react'` instead of failing with `ERR_MODULE_NOT_FOUND`. Bundled apps are unaffected.
