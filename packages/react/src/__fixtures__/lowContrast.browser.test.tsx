import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { assertNoAxeViolations } from '@becket-ui/a11y';

it('rejects text below 4.5:1', async () => {
  await expect(
    assertNoAxeViolations(
      // #777 on #888 is about 1.3:1, far below 4.5:1.
      render(<p style={{ color: '#777', background: '#888' }}>Low contrast</p>).container,
      { environment: 'browser', failOn: ['critical', 'serious'] },
    ),
  ).rejects.toThrow(/color-contrast/);
});
