import { afterEach, describe, expect, it } from 'vitest';

import { assertNoAxeViolations } from './assertNoAxeViolations';

afterEach(() => {
  document.body.replaceChildren();
});

describe('assertNoAxeViolations', () => {
  it('fails a nameless button', async () => {
    const root = document.createElement('div');
    const button = document.createElement('button');
    root.append(button);
    document.body.append(root);

    await expect(assertNoAxeViolations(root)).rejects.toThrow(/button-name|Button name/i);
  });

  it('passes a native labelled checkbox', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<input id="terms" type="checkbox" /><label for="terms">Accept terms</label>';
    document.body.append(root);

    await expect(assertNoAxeViolations(root)).resolves.toBeUndefined();
  });
});
