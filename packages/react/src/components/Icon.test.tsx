import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { CloseIcon, SearchIcon } from './Glyphs';
import { Icon } from './Icon';

describe('Icon', () => {
  it('is decorative without a label', async () => {
    const { container } = render(
      <button type="button">
        <CloseIcon /> Close
      </button>,
    );
    const icon = container.querySelector('.beckui--icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    await assertNoAxeViolations(container);
  });

  it('becomes a named image with a label', async () => {
    const { container } = render(<SearchIcon label="Search" />);
    const icon = screen.getByRole('img', { name: 'Search' });
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
    await assertNoAxeViolations(container);
  });

  it('applies the size variant and keeps consumer classes last', () => {
    render(
      <Icon size="xl" className="extra" label="Custom">
        <svg viewBox="0 0 24 24" />
      </Icon>,
    );
    const icon = screen.getByRole('img', { name: 'Custom' });
    expect(icon.className).toMatch(/beckui--icon--size_xl/);
    expect(icon.className.endsWith('extra')).toBe(true);
  });

  it('renders glyph SVGs that are never focusable or announced', () => {
    const { container } = render(<SearchIcon />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });
});
