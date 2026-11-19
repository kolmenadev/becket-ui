import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Checkbox } from './Checkbox';
import { Radio, RadioGroup } from './Radio';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { TextField } from './TextField';

describe('TextField', () => {
  it('gets its accessible name from the label', async () => {
    render(<TextField label="Name" helperText="Optional hint" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Name' }).parentElement ?? document.body,
    );
  });

  it('sets aria-invalid and announces helperText as an alert', async () => {
    render(<TextField label="Name" invalid helperText="Required" />);
    expect(screen.getByRole('textbox', { name: 'Name' }).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Required');
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Name' }).parentElement ?? document.body,
    );
  });

  it('is skipped by tab and typing does not change its value when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <TextField label="Name" disabled defaultValue="kept" />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('value', 'kept');
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Name' }).parentElement ?? document.body,
    );
  });

  it('forwards required to the input', () => {
    render(<TextField label="Name" required />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveProperty('required', true);
  });

  it('submits every control name and value from one form', async () => {
    render(
      <form
        aria-label="Profile"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <TextField label="Name" name="name" defaultValue="Ada" />
        <Select label="Plan" name="plan" defaultValue="pro">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </Select>
        <Textarea label="Notes" name="notes" defaultValue="Hello" />
        <Checkbox label="Terms" name="terms" value="yes" defaultChecked />
        <RadioGroup legend="Billing" name="billing" defaultValue="yearly">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" />
        </RadioGroup>
        <button type="submit">Send</button>
      </form>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Send' }));
    const form = screen.getByRole('form', { name: 'Profile' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Profile is not a form element');
    }
    const profile = new FormData(form);
    expect(profile.get('name')).toBe('Ada');
    expect(profile.get('plan')).toBe('pro');
    expect(profile.get('notes')).toBe('Hello');
    expect(profile.get('terms')).toBe('yes');
    expect(profile.get('billing')).toBe('yearly');
  });
});
