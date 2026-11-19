import { useState, type ComponentProps } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Button } from './Button';
import { Dialog } from './Dialog';

afterEach(async () => {
  cleanup();
  // Tab past the last control of a modal <dialog> hands focus to the browser's own UI, and Firefox
  // keeps it there even after a click. Tab until the page has it back, so the next test's keys
  // reach the page.
  for (let press = 0; press < 12 && !document.hasFocus(); press++) await userEvent.tab();
});

function ConfirmDialog({
  role,
  onBehindFocus,
}: Pick<ComponentProps<typeof Dialog>, 'role'> & { onBehindFocus?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Button onFocus={onBehindFocus}>Behind</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        role={role}
        title="Confirm"
        footer={
          <>
            <Button>Cancel</Button>
            <Button>Confirm</Button>
          </>
        }
      >
        Native dialog body.
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it.each<ComponentProps<typeof Dialog>['role']>(['dialog', 'alertdialog'])(
    'focuses the first footer action when it opens as %s',
    async (role) => {
      render(<ConfirmDialog role={role} />);

      page.getByRole('button', { name: 'Open' }).element().focus();
      await userEvent.keyboard('{Enter}');

      await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    },
  );

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<ConfirmDialog />);
    page.getByRole('button', { name: 'Open' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(document.querySelector('dialog')?.open).toBe(false);
    await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('never focuses the page behind while Tab and Shift+Tab walk the dialog', async () => {
    const onBehindFocus = vi.fn();
    render(<ConfirmDialog onBehindFocus={onBehindFocus} />);
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
  // Dialog (Modal) wraps to the other end. Reported from MAV-209; drop `.fails` once Dialog keeps
  // focus inside.
  it.fails(
    'keeps focus inside for 12 Tab and 12 Shift+Tab presses, then Escape returns it to the trigger',
    async () => {
      render(<ConfirmDialog />);
      page.getByRole('button', { name: 'Open' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();

      for (let press = 1; press <= 12; press++) {
        await userEvent.tab();
        expect(
          page.getByRole('dialog', { name: 'Confirm' }).element().contains(document.activeElement),
          `focus is in the dialog after Tab ${press}`,
        ).toBe(true);
      }
      for (let press = 1; press <= 12; press++) {
        await userEvent.tab({ shift: true });
        expect(
          page.getByRole('dialog', { name: 'Confirm' }).element().contains(document.activeElement),
          `focus is in the dialog after Shift+Tab ${press}`,
        ).toBe(true);
      }
      await userEvent.keyboard('{Escape}');

      expect(document.querySelector('dialog')?.open).toBe(false);
      await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus();
    },
  );
});
