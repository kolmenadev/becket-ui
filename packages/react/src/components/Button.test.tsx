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

  it('renders a link with anchor props when as="a"', () => {
    render(
      <Button as="a" href="https://example.com" target="_blank" rel="noopener noreferrer" visual="primary">
        Get started
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Get started' });
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.className).toMatch(/beckui--button/);
  });

  it('types props by the rendered element', () => {
    // Compile-time checks: these lines fail `tsc` if the polymorphic types regress.
    const typed = (
      <>
        <Button as="a" href="/docs" download>
          Docs
        </Button>
        {/* @ts-expect-error href is not a button prop */}
        <Button href="/docs">Docs</Button>
        {/* @ts-expect-error disabled is not an anchor prop */}
        <Button as="a" href="/docs" disabled>
          Docs
        </Button>
      </>
    );
    expect(typed).toBeTruthy();
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
