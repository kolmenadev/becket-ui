import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Switch } from './Switch';

describe('Switch', () => {
  it('gets its accessible name from label', () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeTruthy();
  });

  it('toggles on Space and Enter', async () => {
    const user = userEvent.setup();
    render(<Switch label="Notifications" />);
    const control = screen.getByRole('switch', { name: 'Notifications' });
    expect(control.getAttribute('aria-checked')).toBe('false');
    control.focus();
    await user.keyboard(' ');
    expect(control.getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{Enter}');
    expect(control.getAttribute('aria-checked')).toBe('false');
  });

  it('has no axe violations with a visible label', async () => {
    const { container } = render(<Switch label="Notifications" />);
    await assertNoAxeViolations(container);
  });
});
