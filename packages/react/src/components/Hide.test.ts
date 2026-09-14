import { hide } from '@becket-ui/tokens/recipes';
import { describe, expect, it } from 'vitest';

describe('hide recipe', () => {
  it('hides below lg until the desktop breakpoint', () => {
    const className = hide({ below: 'lg', asContents: true });
    expect(className).toContain('beckui--d_none');
    expect(className).toContain('lg:beckui--d_contents');
  });

  it('hides from lg up and shows below desktop', () => {
    const className = hide({ from: 'lg', asContents: true });
    expect(className).toContain('beckui--d_contents');
    expect(className).toContain('lg:beckui--d_none');
  });
});
