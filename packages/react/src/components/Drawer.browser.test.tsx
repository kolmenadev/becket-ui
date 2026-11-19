import { useState, type ComponentProps } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Button } from './Button';
import { Drawer } from './Drawer';

afterEach(async () => {
  cleanup();
  // Tab past the last control of a modal <dialog> hands focus to the browser's own UI, and Firefox
  // keeps it there even after a click. Tab until the page has it back, so the next test's keys
  // reach the page.
  for (let press = 0; press < 12 && !document.hasFocus(); press++) await userEvent.tab();
});

function FiltersDrawer({
  role,
  onBehindFocus,
}: Pick<ComponentProps<typeof Drawer>, 'role'> & { onBehindFocus?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Button onFocus={onBehindFocus}>Behind</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        role={role}
        title="Filters"
        footer={
          <>
            <Button>Cancel</Button>
            <Button>Apply</Button>
          </>
        }
      >
        Drawer body.
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it.each<ComponentProps<typeof Drawer>['role']>(['dialog', 'alertdialog'])(
    'focuses the first footer action when it opens as %s',
    async (role) => {
      render(<FiltersDrawer role={role} />);

      page.getByRole('button', { name: 'Open' }).element().focus();
      await userEvent.keyboard('{Enter}');

      await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    },
  );

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<FiltersDrawer />);
    page.getByRole('button', { name: 'Open' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(document.querySelector('dialog')?.open).toBe(false);
    await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('never focuses the page behind while Tab and Shift+Tab walk the drawer', async () => {
    const onBehindFocus = vi.fn();
    render(<FiltersDrawer onBehindFocus={onBehindFocus} />);
    page.getByRole('button', { name: 'Open' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    // Shift+Tab first: the first press that leaves the page hands Firefox's keys to its own UI, so
    // the page behind has to be one step back from Close to be reached at all.
    for (let press = 0; press < 12; press++) await userEvent.tab({ shift: true });
    for (let press = 0; press < 12; press++) await userEvent.tab();

    expect(onBehindFocus).not.toHaveBeenCalled();
  });

  // Fails on main in Chrome and Firefox: a modal <dialog> doesn't wrap focus. Tab from the last
  // footer action, or Shift+Tab from Close, leaves the page for the browser's own UI, where APG
  // Dialog (Modal) wraps to the other end. Reported from MAV-209; drop `.fails` once Drawer keeps
  // focus inside.
  it.fails(
    'keeps focus inside for 12 Tab and 12 Shift+Tab presses, then Escape returns it to the trigger',
    async () => {
      render(<FiltersDrawer />);
      page.getByRole('button', { name: 'Open' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();

      for (let press = 1; press <= 12; press++) {
        await userEvent.tab();
        expect(
          page.getByRole('dialog', { name: 'Filters' }).element().contains(document.activeElement),
          `focus is in the drawer after Tab ${press}`,
        ).toBe(true);
      }
      for (let press = 1; press <= 12; press++) {
        await userEvent.tab({ shift: true });
        expect(
          page.getByRole('dialog', { name: 'Filters' }).element().contains(document.activeElement),
          `focus is in the drawer after Shift+Tab ${press}`,
        ).toBe(true);
      }
      await userEvent.keyboard('{Escape}');

      expect(document.querySelector('dialog')?.open).toBe(false);
      await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus();
    },
  );
});
