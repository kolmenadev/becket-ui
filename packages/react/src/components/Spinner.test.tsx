import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('announces "Loading" as text in its status region', () => {
    render(<Spinner />);
    expect(screen.getByRole('status').textContent).toBe('Loading');
  });

  it('shows the label as text and sets no aria-label', () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole('status').textContent).toBe('Saving');
    expect(screen.getByRole('status').hasAttribute('aria-label')).toBe(false);
  });

  it('keeps a consumer aria-label as the name', () => {
    render(<Spinner aria-label="Fetching results" />);
    expect(screen.getByRole('status', { name: 'Fetching results' })).toBeTruthy();
  });

  it('keeps the ring as the root, with its own class and the consumer className', () => {
    const { container } = render(<Spinner size="lg" className="extra" />);
    const ring = container.firstElementChild;
    expect(ring?.getAttribute('role')).toBe('status');
    expect(ring?.className).toMatch(/beckui--spinner--size_lg/);
    expect(ring?.className.endsWith('extra')).toBe(true);
  });

  it('fills a persistent status region with "Loading" when it mounts after first render', () => {
    const { rerender } = render(<div role="status" />);
    expect(screen.getByRole('status').textContent).toBe('');

    rerender(
      <div role="status">
        <Spinner role={undefined} />
      </div>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('Loading');
  });
});
