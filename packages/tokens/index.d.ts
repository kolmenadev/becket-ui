// Main TypeScript declarations for @becket-ui/tokens.
// Specifiers name the runtime .js files; TypeScript reads the .d.ts next to each (MAV-121).
export * from './styled-system/css/index.js'
export * from './styled-system/jsx/index.js'
export * from './styled-system/patterns/index.js'
export * from './styled-system/recipes/index.js'
// Patterns and recipes both export these names. Two `export *` with one name leave it out of the
// module (and TypeScript reports TS2308), so name the pattern explicitly, as index.mjs does.
export { aspectRatio, box, center, container, visuallyHidden } from './styled-system/patterns/index.js'
// index.mjs also re-exports styled-system/helpers.js: Panda's runtime internals. They aren't
// public API, so they get no types here.

// Export types
export type { RecipeVariant, RecipeVariantProps } from './styled-system/css/cva.js'
export type { JsxStyleProps } from './styled-system/types/system.js'
