import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Menu, MenuItem } from './Menu';

afterEach(cleanup);

describe('Menu', () => {
  it('returns focus to the summary after Enter activates an item', async () => {
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );

    await userEvent.keyboard('{Tab}{Enter}');
    // Opening focuses the first item a frame later; ArrowDown has to start there.
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(document.activeElement).toBe(screen.getByText('Actions'));
    expect(screen.getByText('Actions').closest('details')?.hasAttribute('open')).toBe(false);
  });

  it('keeps focus when an item moves it outside the menu', async () => {
    render(
      <>
        <Menu label="Actions">
          <MenuItem>Edit</MenuItem>
          <MenuItem
            onClick={() => {
              screen.getByRole('button', { name: 'Outside' }).focus();
            }}
          >
            Duplicate
          </MenuItem>
        </Menu>
        <button type="button">Outside</button>
      </>,
    );

    await userEvent.keyboard('{Tab}{Enter}');
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  });

  it('stays open on the item when the click is cancelled', async () => {
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Duplicate
        </MenuItem>
      </Menu>,
    );

    await userEvent.keyboard('{Tab}{Enter}');
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByText('Actions').closest('details')?.hasAttribute('open')).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Duplicate' }));
  });
});
