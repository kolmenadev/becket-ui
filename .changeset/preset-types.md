---
"@becket-ui/tokens": patch
---

Fix the published types of `@becket-ui/tokens/preset`. In 0.6.0, `dist/preset.d.ts` referred to
`RecipeConfig`, `SlotRecipeConfig` and a `Panda` namespace without importing them. With
`skipLibCheck: false`, TypeScript reported about 90 errors in Becket's file; with the default
`skipLibCheck: true`, `becketPreset` was silently typed `any`. `becketPreset` is now typed as
Panda's `Preset`, as it was in 0.5.1. The preset's runtime value and the generated CSS are
unchanged.
