import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './Button';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('does not add an extra tab stop around Button', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Tooltip content="Short glossary hint." delayMs={0}>
          <Button>Hover me</Button>
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    expect(trigger.parentElement?.getAttribute('tabindex')).not.toBe('0');

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('has no axe violations when wrapping a named Button', async () => {
    const { container } = render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        <Button>Hover me</Button>
      </Tooltip>,
    );
    await assertNoAxeViolations(container);
  });

  it('sets aria-describedby on the Button while open and closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        <Button>Hover me</Button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    const tip = await screen.findByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('wraps plain text so it is keyboard reachable', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint" delayMs={0}>
        glossary
      </Tooltip>,
    );

    const trigger = screen.getByText('glossary');
    expect(trigger.tagName).toBe('SPAN');
    expect(trigger.getAttribute('tabindex')).toBe('0');

    trigger.focus();
    await user.hover(trigger);
    expect(await screen.findByRole('tooltip')).toBeTruthy();
  });
});
