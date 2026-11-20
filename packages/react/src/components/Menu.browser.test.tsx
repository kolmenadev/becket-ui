import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Button } from './Button';
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
    expect(screen.getByText('Actions').closest('details')?.hasAttribute('open')).toBe(false);
  });

  it('returns focus to the summary when focus falls to the body', async () => {
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem onClick={(event) => event.currentTarget.blur()}>Duplicate</MenuItem>
      </Menu>,
    );

    await userEvent.keyboard('{Tab}{Enter}');
    await expect
      .poll(() => document.activeElement)
      .toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(document.activeElement).toBe(screen.getByText('Actions'));
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

  // APG Menu Button, keyboard interaction (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/):
  // Enter, Space and Down Arrow open the menu and focus its first item. Up Arrow has its own test.
  it.each([
    ['{Enter}', 'Edit'],
    [' ', 'Edit'],
    ['{ArrowDown}', 'Edit'],
  ])('opens on %j from the summary and focuses %s', async (key, item) => {
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Archive</MenuItem>
      </Menu>,
    );

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(key);
    // Menu focuses an item a frame after the toggle event. Give a second move two frames to land
    // before reading focus, so a right answer on the way can't pass for the final one.
    await expect.poll(() => document.activeElement).not.toBe(page.getByText('Actions').element());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(page.getByRole('menuitem', { name: item }).element()).toHaveFocus();
  });

  // Fails on main in Chrome and Firefox: ArrowUp focuses Archive, then the frame Menu schedules on
  // toggle moves focus back to Edit. Reported from MAV-209; drop `.fails` once Archive keeps focus.
  it.fails('opens on ArrowUp from the summary and focuses the last item', async () => {
    render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Archive</MenuItem>
      </Menu>,
    );

    await userEvent.keyboard('{Tab}{ArrowUp}');
    // Same two frames as the rows above: the move back to Edit lands in the second.
    await expect.poll(() => document.activeElement).not.toBe(page.getByText('Actions').element());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(page.getByRole('menuitem', { name: 'Archive' }).element()).toHaveFocus();
  });

  // APG Menu Button and Menu, keyboard interaction, in an open menu: Home and End move to the first
  // and last item, Escape closes the menu and returns focus to the button, Tab closes it and moves
  // to the next element in the tab sequence.
  it.each([
    ['{End}', 'Archive', true],
    ['{End}{Home}', 'Edit', true],
    ['{Escape}', 'Actions', false],
    ['{Tab}', 'After', false],
  ])('moves focus for %s in the open menu to %s', async (keys, target, isOpen) => {
    render(
      <>
        <Menu label="Actions">
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem>Archive</MenuItem>
        </Menu>
        <Button>After</Button>
      </>,
    );
    await userEvent.keyboard('{Tab}{Enter}');
    await expect.element(page.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    await userEvent.keyboard(keys);

    expect(page.getByText(target, { exact: true }).element()).toHaveFocus();
    expect(document.querySelector('details')?.open).toBe(isOpen);
  });
});
