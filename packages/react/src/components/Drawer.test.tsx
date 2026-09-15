import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './Button';
import { Drawer } from './Drawer';

function FiltersDrawer({
  onOpenChange = () => {},
  role = 'dialog' as 'dialog' | 'alertdialog',
}: {
  onOpenChange?: (open: boolean) => void;
  role?: 'dialog' | 'alertdialog';
}) {
  return (
    <Drawer
      open
      role={role}
      onOpenChange={onOpenChange}
      title="Filters"
      footer={
        <Button visual="primary" onClick={() => onOpenChange(false)}>
          Done
        </Button>
      }
    >
      Same a11y as Dialog.
    </Drawer>
  );
}

describe('Drawer', () => {
  it('names the dialog from the title and describes it from the body', () => {
    render(<FiltersDrawer />);
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(document.getElementById(labelledBy as string)?.textContent).toBe('Filters');
    expect(document.getElementById(describedBy as string)?.textContent).toContain('Same a11y as Dialog');
  });

  it('moves initial focus to the footer action, not Close', async () => {
    render(<FiltersDrawer />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Done' }));
    });
  });

  it('does not light-dismiss an alertdialog', () => {
    const onOpenChange = vi.fn();
    render(<FiltersDrawer role="alertdialog" onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('alertdialog', { name: 'Filters' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('has no axe violations when open', async () => {
    const { container } = render(<FiltersDrawer />);
    await assertNoAxeViolations(container);
  });
});
