import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Text } from './Text';

describe('Text', () => {
  it('forwards attributes and inline style to the paragraph', () => {
    render(
      <Text
        id="t"
        lang="es"
        dir="rtl"
        role="note"
        aria-label="x"
        data-x="1"
        style={{ color: 'red' }}
      >
        Hola
      </Text>,
    );

    const note = screen.getByRole('note');
    expect(note.tagName).toBe('P');
    expect(note.id).toBe('t');
    expect(note.lang).toBe('es');
    expect(note.getAttribute('dir')).toBe('rtl');
    expect(note.getAttribute('aria-label')).toBe('x');
    expect(note.getAttribute('data-x')).toBe('1');
    expect(note.style.color).toBe('red');
  });

  it('labels an input when rendered as a label', async () => {
    const { container } = render(
      <>
        <Text as="label" htmlFor="email">
          Email
        </Text>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText('Email').id).toBe('email');
    await assertNoAxeViolations(container);
  });

  it('forwards click, hover and key handlers', async () => {
    const onClick = vi.fn();
    const onMouseEnter = vi.fn();
    const onKeyDown = vi.fn();
    const user = userEvent.setup();
    render(
      <Text tabIndex={0} onClick={onClick} onMouseEnter={onMouseEnter} onKeyDown={onKeyDown}>
        Go
      </Text>,
    );

    await user.hover(screen.getByText('Go'));
    await user.click(screen.getByText('Go'));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref to the element it renders', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text as="span" ref={ref}>
        Hi
      </Text>,
    );
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('turns style props and the css prop into classes', () => {
    render(
      <Text fontWeight="bold" css={{ textDecoration: 'underline' }} className="mine">
        Hi
      </Text>,
    );

    const text = screen.getByText('Hi');
    expect(text.classList.contains('beckui--fw_bold')).toBe(true);
    expect(text.classList.contains('beckui--td_underline')).toBe(true);
    expect(text.classList.contains('mine')).toBe(true);
    expect(text.hasAttribute('fontweight')).toBe(false);
    expect(text.hasAttribute('css')).toBe(false);
  });
});
