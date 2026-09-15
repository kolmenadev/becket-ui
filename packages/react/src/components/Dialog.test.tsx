import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './Button';
import { Dialog } from './Dialog';

function ConfirmDialog({
  open = true,
  role = 'dialog' as 'dialog' | 'alertdialog',
  onOpenChange = () => {},
  ariaLabel,
}: {
  open?: boolean;
  role?: 'dialog' | 'alertdialog';
  onOpenChange?: (open: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      role={role}
      title={ariaLabel ? undefined : 'Confirm'}
      aria-label={ariaLabel}
      footer={
        <>
          <Button visual="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button visual="primary" onClick={() => onOpenChange(false)}>
            Confirm
          </Button>
        </>
      }
    >
      Native dialog body.
    </Dialog>
  );
}

describe('Dialog', () => {
  it('points labelledby and describedby at rendered title and body', () => {
    render(<ConfirmDialog />);
    const dialog = screen.getByRole('dialog', { name: 'Confirm' });
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(document.getElementById(labelledBy as string)?.textContent).toBe('Confirm');
    expect(document.getElementById(describedBy as string)?.textContent).toContain('Native dialog body');
  });

  it('omits labelledby when there is no title node', () => {
    render(<ConfirmDialog ariaLabel="Unnamed confirm" />);
    const dialog = screen.getByRole('dialog', { name: 'Unnamed confirm' });
    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
  });

  it('moves initial focus to Cancel, not Close', async () => {
    render(<ConfirmDialog />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
    });
    expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('tabs from the first footer action to Confirm', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
    });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Confirm' }));
  });

  it('closes a dialog on backdrop click but not an alertdialog', () => {
    const onDialog = vi.fn();
    const { rerender } = render(<ConfirmDialog onOpenChange={onDialog} />);
    fireEvent.click(screen.getByRole('dialog', { name: 'Confirm' }));
    expect(onDialog).toHaveBeenCalledWith(false);

    const onAlert = vi.fn();
    rerender(<ConfirmDialog role="alertdialog" onOpenChange={onAlert} />);
    fireEvent.click(screen.getByRole('alertdialog', { name: 'Confirm' }));
    expect(onAlert).not.toHaveBeenCalled();
  });

  it('lets Close aria-label be overridden', () => {
    render(
      <Dialog open title="Confirm">
        Body
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('closes on Escape via the native dialog close event', () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDialog onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Confirm' }), { key: 'Escape' });
    fireEvent(screen.getByRole('dialog', { name: 'Confirm' }), new Event('close', { bubbles: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no axe violations when open', async () => {
    const { container } = render(<ConfirmDialog />);
    await assertNoAxeViolations(container);
  });
});
