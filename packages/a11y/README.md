# `@becket-ui/a11y`

Private Vitest helper. **Not a published design-system API.** Do not `npm publish` this package with 0.1.0 (`private: true`).

It wraps [axe-core](https://github.com/dequelabs/axe-core). It is not a Kolmena WCAG engine.

```ts
import { assertNoAxeViolations } from '@becket-ui/a11y';

await assertNoAxeViolations(container);
```

Default `runOnly` tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`.

Pass `environment: 'browser'` in the options when the helper runs in a real browser. The default is `'jsdom'`.

```ts
await assertNoAxeViolations(container, { environment: 'browser' });
```

## Exceptions

A rule is off only when [`src/exceptions.ts`](./src/exceptions.ts) has an entry for it, with a `scope` (`jsdom`, `browser` or `fragment`, which holds in both), a `reason` with its ticket key, an `owner` and an `expires` date. The helper turns off every entry that matches the environment. Turning a rule off through `options.rules` throws `axe rule <id> disabled without an exception entry` unless an entry covers it, and an entry past its date throws `axe exception for <id> expired on <date>`. Passing `runOnly` throws too, because the tag set is fixed. To skip a rule, add the entry; don't pass it as an option.

Results axe can't decide (`incomplete`) don't fail the test. The helper prints each rule id and its node count with `console.warn`, so check them by hand.

## Impacts and reports

By default every violation fails. `failOn` lists the impacts that fail; the helper prints the other violations with `console.warn` and resolves. `onResults` receives axe's full results before the helper decides, so a caller can keep a report that holds the failures too.

```ts
await assertNoAxeViolations(container, {
  environment: 'browser',
  failOn: ['critical', 'serious'],
  onResults: (results) => report.push(results),
});
```

## jsdom limits

jsdom does not lay out or paint. These rules have `jsdom` exceptions until browser axe runs in CI:

- `color-contrast`
- `target-size` (WCAG 2.2 2.5.8)

Check those in Storybook `@storybook/addon-a11y` and a recorded keyboard/contrast pass. Do not add Playwright or Chromatic to “fix” this.

jsdom has no `document.elementFromPoint`, so axe errors on a native open `<dialog>` and reports its rules as `incomplete` rather than passing or failing them.

## Out

Playwright, Storybook test-runner, Chromatic, Cypress, Pa11y, Lighthouse-CI.
