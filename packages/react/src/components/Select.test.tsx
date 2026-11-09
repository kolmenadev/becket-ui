import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Select } from './Select';

describe('Select', () => {
  it('gets its accessible name from the label', async () => {
    render(
      <Select label="Plan">
        <option>Free</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Plan' })).toBeTruthy();
    await assertNoAxeViolations(
      screen.getByRole('combobox', { name: 'Plan' }).parentElement ?? document.body,
    );
  });

  it('sets aria-invalid and announces helperText as an alert', async () => {
    render(
      <Select label="Plan" invalid helperText="Required">
        <option>Free</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Plan' }).getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(screen.getByRole('alert').textContent).toBe('Required');
    await assertNoAxeViolations(
      screen.getByRole('combobox', { name: 'Plan' }).parentElement ?? document.body,
    );
  });

  it('is skipped by tab and typing does not change its value when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Select label="Plan" disabled defaultValue="pro">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </Select>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.type(screen.getByRole('combobox', { name: 'Plan' }), 'f');
    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveProperty('value', 'pro');
    await assertNoAxeViolations(
      screen.getByRole('combobox', { name: 'Plan' }).parentElement ?? document.body,
    );
  });

  it('forwards required to the select', () => {
    render(
      <Select label="Plan" required>
        <option>Free</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveProperty('required', true);
  });

  it('submits its name and value', async () => {
    render(
      <form
        aria-label="Plan"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Select label="Plan" name="plan" defaultValue="pro">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </Select>
        <button type="submit">Send</button>
      </form>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Send' }));
    const form = screen.getByRole('form', { name: 'Plan' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Plan is not a form element');
    }
    expect(new FormData(form).get('plan')).toBe('pro');
  });
});
