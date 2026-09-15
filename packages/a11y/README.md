# `@becket-ui/a11y`

Private Vitest helper. **Not a published design-system API.** Do not `npm publish` this package with 0.1.0 (`private: true`).

It wraps [axe-core](https://github.com/dequelabs/axe-core). It is not a Kolmena WCAG engine.

```ts
import { assertNoAxeViolations } from '@becket-ui/a11y';

await assertNoAxeViolations(container);
```

Default `runOnly` tags: `wcag2a`, `wcag2aa`, `wcag22aa`.

## jsdom limits

jsdom does not layout or paint. These rules stay **off** in the helper:

- `color-contrast`
- `target-size` (WCAG 2.2 2.5.8)

Check those in Storybook `@storybook/addon-a11y` and a recorded keyboard/contrast pass. Do not add Playwright or Chromatic to “fix” this.

## Out

Playwright, Storybook test-runner, Chromatic, Cypress, Pa11y, Lighthouse-CI.
