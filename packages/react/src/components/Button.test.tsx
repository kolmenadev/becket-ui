import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './Button';

describe('Button', () => {
  it('defaults to type="button"', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('button');
  });

  it('keeps an explicit type="submit"', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' }).getAttribute('type')).toBe('submit');
  });

  it('does not set type when as is not button', () => {
    render(
      <Button as="a" href="#save">
        Save
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Save' }).hasAttribute('type')).toBe(false);
  });

  it('does not submit a wrapping form', async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event.nativeEvent);
        }}
      >
        <Button>Confirm</Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('has no axe violations on a named button', async () => {
    const { container } = render(<Button>Save</Button>);
    await assertNoAxeViolations(container);
  });
});
