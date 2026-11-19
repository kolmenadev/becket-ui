import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('gets its accessible name from the label', async () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeTruthy();
    await assertNoAxeViolations(
      screen.getByRole('checkbox', { name: 'Accept terms' }).parentElement ?? document.body,
    );
  });

  it('is skipped by tab and a click does not check it when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Checkbox label="Accept terms" disabled />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.click(screen.getByRole('checkbox', { name: 'Accept terms' }));
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveProperty('checked', false);
    await assertNoAxeViolations(
      screen.getByRole('checkbox', { name: 'Accept terms' }).parentElement ?? document.body,
    );
  });

  it('forwards required to the input', () => {
    render(<Checkbox label="Accept terms" required />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveProperty('required', true);
  });

  it('submits its name and value when checked', async () => {
    const user = userEvent.setup();
    render(
      <form
        aria-label="Terms"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Checkbox label="Accept terms" name="terms" value="yes" />
        <button type="submit">Send</button>
      </form>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Accept terms' }));
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveProperty('checked', true);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    const form = screen.getByRole('form', { name: 'Terms' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Terms is not a form element');
    }
    expect(new FormData(form).get('terms')).toBe('yes');
  });
});
