---
"@becket-ui/tokens": patch
---

Make the declarations typecheck with TypeScript's `nodenext` resolution.

- Panda's generated declarations ship as `.d.mts` next to their `.mjs` runtime, and their relative
  imports name the `.mjs` file. A `nodenext` project with `skipLibCheck: false` went from 111 errors
  to none; `bundler` projects went from 10 to none.
- The root entry now exports the `aspectRatio`, `box`, `center`, `container` and `visuallyHidden`
  patterns. Recipes with the same names made both `export *` cancel out, so the root had neither.
  The recipes are still at `@becket-ui/tokens/recipes`.
- The root declarations no longer re-export Panda's internal helpers, which have no types. The
  runtime still exports them.
