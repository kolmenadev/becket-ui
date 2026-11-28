import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Alert } from './Alert';
import { Button } from './Button';

describe('Alert', () => {
  it('is a polite status with a named icon, a title and the message', async () => {
    const { container } = render(
      <Alert status="warning" title="Storage almost full">
        You have used 90% of your space.
      </Alert>,
    );
    const alert = screen.getByRole('status');
    expect(alert.textContent).toContain('Storage almost full');
    expect(alert.textContent).toContain('You have used 90% of your space.');
    // The status is in the icon's name too, not only in its color.
    expect(screen.getByRole('img', { name: 'Warning' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    await assertNoAxeViolations(container);
  });

  it('names each status for screen readers, and takes a custom name', async () => {
    const { container } = render(
      <>
        <Alert status="info">a</Alert>
        <Alert status="success">b</Alert>
        <Alert status="danger">c</Alert>
        <Alert status="danger" statusLabel="Problem">
          d
        </Alert>
      </>,
    );
    expect(
      screen.getAllByRole('img').map((icon) => icon.getAttribute('aria-label')),
    ).toEqual(['Info', 'Success', 'Error', 'Problem']);
    await assertNoAxeViolations(container);
  });

  it('uses role="alert" only when asked, and no live role with role="none"', () => {
    render(
      <>
        <Alert status="danger" role="alert" title="Payment declined" />
        <Alert role="none" title="Static notice" />
      </>,
    );
    expect(screen.getByRole('alert').textContent).toContain('Payment declined');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('dismisses from the keyboard with a named button', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { container } = render(
      <Alert title="Saved" status="success" onDismiss={onDismiss} dismissLabel="Close notice">
        Your changes are live.
      </Alert>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close notice' }));
    await user.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await assertNoAxeViolations(container);
  });

  it('renders actions after the message', async () => {
    const { container } = render(
      <Alert title="Unsaved changes" actions={<Button size="sm">Save</Button>}>
        Leave and your edits are lost.
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    await assertNoAxeViolations(container);
  });
});
