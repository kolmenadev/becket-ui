import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('gets its accessible name from the label', async () => {
    render(<Textarea label="Notes" helperText="Optional hint" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeTruthy();
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Notes' }).parentElement ?? document.body,
    );
  });

  it('sets aria-invalid and announces helperText as an alert', async () => {
    render(<Textarea label="Notes" invalid helperText="Required" />);
    expect(screen.getByRole('textbox', { name: 'Notes' }).getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(screen.getByRole('alert').textContent).toBe('Required');
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Notes' }).parentElement ?? document.body,
    );
  });

  it('is skipped by tab and typing does not change its value when disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Textarea label="Notes" disabled defaultValue="kept" />
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'x');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveProperty('value', 'kept');
    await assertNoAxeViolations(
      screen.getByRole('textbox', { name: 'Notes' }).parentElement ?? document.body,
    );
  });

  it('forwards required to the textarea', () => {
    render(<Textarea label="Notes" required />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveProperty('required', true);
  });

  it('submits its name and value', async () => {
    render(
      <form
        aria-label="Notes"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Textarea label="Notes" name="notes" defaultValue="Hello" />
        <button type="submit">Send</button>
      </form>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Send' }));
    const form = screen.getByRole('form', { name: 'Notes' });
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('Notes is not a form element');
    }
    expect(new FormData(form).get('notes')).toBe('Hello');
  });
});
