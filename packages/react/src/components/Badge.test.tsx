import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Badge } from './Badge';

describe('Badge', () => {
  it('fills status visuals with their status token and canvas-colored ink', async () => {
    const { container } = render(
      <>
        <Badge visual="success">Paid</Badge>
        <Badge visual="warning">Pending</Badge>
        <Badge visual="danger">Failed</Badge>
        <Badge visual="info">Draft</Badge>
      </>,
    );
    for (const [text, status] of [
      ['Paid', 'success'],
      ['Pending', 'warning'],
      ['Failed', 'danger'],
      ['Draft', 'info'],
    ]) {
      const chip = screen.getByText(text ?? '');
      expect(chip.style.getPropertyValue('--mav-label-bg')).toBe(`var(--beckui--colors-${status})`);
      expect(chip.style.getPropertyValue('--mav-label-color')).toBe('var(--beckui--colors-background)');
    }
    await assertNoAxeViolations(container);
  });

  it('never uses a brand color for a status, not even with withGradient', () => {
    render(
      <Badge visual="danger" withGradient>
        Failed
      </Badge>,
    );
    const style = screen.getByText('Failed').getAttribute('style') ?? '';
    expect(style).toContain('--beckui--colors-danger');
    expect(style).not.toMatch(/primary|secondary|tertiary|gradients/);
  });

  it('lets customColors override a status visual', () => {
    render(
      <Badge visual="success" customColors={{ color: 'var(--beckui--colors-text)' }}>
        Paid
      </Badge>,
    );
    expect(screen.getByText('Paid').style.getPropertyValue('--mav-label-color')).toBe(
      'var(--beckui--colors-text)',
    );
  });
});
