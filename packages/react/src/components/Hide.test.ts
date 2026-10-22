import { hide } from '@becket-ui/tokens/recipes';
import { describe, expect, it } from 'vitest';

// Panda compiles each breakpoint/asContents pair into one compound class; its display rules
// (none below the breakpoint, contents from it up, or the reverse) live in index.css.
describe('hide recipe', () => {
  it('hides below lg until the desktop breakpoint', () => {
    expect(hide({ below: 'lg', asContents: true })).toContain(
      'beckui--hide--compound__asContents_true__below_lg',
    );
  });

  it('hides from lg up and shows below desktop', () => {
    expect(hide({ from: 'lg', asContents: true })).toContain(
      'beckui--hide--compound__asContents_true__from_lg',
    );
  });
});
