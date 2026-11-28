import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './Button';
import { ToastProvider, useToast, type ToastOptions } from './Toast';

// style-check keep: each test shows different toasts; the provider needs a child to call the hook.
function Trigger({ toast }: { toast: ToastOptions }) {
  const { show } = useToast();
  return <Button onClick={() => show(toast)}>Show</Button>;
}

function liveList(politeness: 'polite' | 'assertive') {
  const list = screen
    .getByRole('region', { name: 'Notifications' })
    .querySelector(`[aria-live="${politeness}"]`);
  if (!(list instanceof HTMLElement)) throw new Error(`no ${politeness} list`);
  return list;
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the notifications region and both live lists before any toast', async () => {
    const { container } = render(<ToastProvider>App</ToastProvider>);
    expect(liveList('polite').children).toHaveLength(0);
    expect(liveList('assertive').children).toHaveLength(0);
    await assertNoAxeViolations(container);
  });

  it('adds a toast to the polite list without moving focus', async () => {
    const { container } = render(
      <ToastProvider>
        <Trigger toast={{ status: 'success', title: 'Saved', description: 'Your changes are live.' }} />
      </ToastProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Show' });
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(trigger);
    expect(within(liveList('polite')).getByText('Saved')).toBeTruthy();
    expect(within(liveList('polite')).getByRole('img', { name: 'Success' })).toBeTruthy();
    expect(liveList('assertive').children).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
    await assertNoAxeViolations(container);
  });

  it('announces danger toasts assertively and keeps them until dismissed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider duration={1000}>
        <Trigger toast={{ status: 'danger', title: 'Upload failed' }} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(within(liveList('assertive')).getByText('Upload failed')).toBeTruthy();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Upload failed')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Upload failed')).toBeNull();
  });

  it('closes itself after the duration', async () => {
    render(
      <ToastProvider duration={1000}>
        <Trigger toast={{ title: 'Export started' }} />
      </ToastProvider>,
    );
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('button', { name: 'Show' }));
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('Export started')).toBeTruthy();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Export started')).toBeNull();
  });

  it('pauses the countdown while hovered or focused, then resumes with the time left', async () => {
    render(
      <ToastProvider duration={1000}>
        <Trigger toast={{ title: 'Export started' }} />
      </ToastProvider>,
    );
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('button', { name: 'Show' }));
    const region = screen.getByRole('region', { name: 'Notifications' });

    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(region);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Export started')).toBeTruthy();
    fireEvent.pointerLeave(region);

    act(() => screen.getByRole('button', { name: 'Dismiss notification' }).focus());
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Export started')).toBeTruthy();
    act(() => screen.getByRole('button', { name: 'Show' }).focus());

    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByText('Export started')).toBeTruthy();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Export started')).toBeNull();
  });

  it('stacks toasts, replaces one shown again with the same id, and dismisses by keyboard', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger toast={{ id: 'sync', title: 'Sync paused', duration: null }} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(liveList('polite').children).toHaveLength(1);

    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    await user.keyboard('{Enter}');
    expect(liveList('polite').children).toHaveLength(0);
  });

  it('throws a clear error outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger toast={{ title: 'x' }} />)).toThrow(
      'useToast must be used within ToastProvider',
    );
  });
});
