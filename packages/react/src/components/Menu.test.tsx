import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Menu, MenuItem } from './Menu';

describe('Menu', () => {
  it('exposes expanded and haspopup on the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByText('Actions');
    expect(trigger.tagName).toBe('SUMMARY');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps open items out of Tab order', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Menu label="Actions">
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </Menu>
        <button type="button">After</button>
      </>,
    );

    await user.click(screen.getByText('Actions'));
    expect(screen.getByRole('menuitem', { name: 'Edit' }).getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' }).getAttribute('tabindex')).toBe('-1');

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('moves between items with arrows', async () => {
    const user = userEvent.setup();
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );
    await user.click(screen.getByText('Actions'));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    });
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Duplicate' }));
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );
    await assertNoAxeViolations(container);
  });
});
