import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Switch } from './Switch';

afterEach(cleanup);

describe('Switch', () => {
  it.each([' ', '{Enter}'])('calls onCheckedChange once for %j', async (key) => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Notifications" onCheckedChange={onCheckedChange} />);

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(key);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await expect
      .element(page.getByRole('switch', { name: 'Notifications' }))
      .toHaveAttribute('aria-checked', 'true');
  });
});
