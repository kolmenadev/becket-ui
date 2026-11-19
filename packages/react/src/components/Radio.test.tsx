import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  it('gets each accessible name from the label', async () => {
    render(
      <RadioGroup legend="Plan" name="plan">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole('group', { name: 'Plan' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Free' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeTruthy();
    await assertNoAxeViolations(screen.getByRole('group', { name: 'Plan' }));
  });

  it('shares one name and checks the radio that is clicked', async () => {
    // jsdom leaves the checked radio in place on ArrowDown: window.CSS is missing, so user-event's
    // walk throws, and a native keydown does not move the selection either.
    render(
      <RadioGroup legend="Plan" name="plan" defaultValue="free">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Free' }).getAttribute('name')).toBe('plan');
    expect(screen.getByRole('radio', { name: 'Pro' }).getAttribute('name')).toBe('plan');
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveProperty('checked', true);
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveProperty('checked', false);
  });

  it('sets aria-invalid on the group and each radio when invalid', async () => {
    render(
      <RadioGroup legend="Plan" name="plan" invalid>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole('group', { name: 'Plan' }).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Free' }).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Pro' }).getAttribute('aria-invalid')).toBe('true');
    await assertNoAxeViolations(screen.getByRole('group', { name: 'Plan' }));
  });

  it('is skipped by tab and a click does not change the selection when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <RadioGroup legend="Plan" name="plan" disabled defaultValue="free">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveProperty('checked', false);
    await assertNoAxeViolations(screen.getByRole('group', { name: 'Plan' }));
  });

  it('forwards required to the radio', () => {
    render(
      <RadioGroup legend="Plan" name="plan">
        <Radio value="free" label="Free" required />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveProperty('required', true);
  });

  it('submits the selected name and value', async () => {
    render(
      <form
        aria-label="Billing"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <RadioGroup legend="Billing" name="billing" defaultValue="yearly">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" />
        </RadioGroup>
        <button type="submit">Send</button>
      </form>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Send' }));
    const form = screen.getByRole('form', { name: 'Billing' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Billing is not a form element');
    }
    expect(new FormData(form).get('billing')).toBe('yearly');
  });
});
