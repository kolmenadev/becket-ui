import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('links the pages around the current one inside a named navigation landmark', async () => {
    const { container } = render(
      <Pagination page={6} pageCount={12} href={(page) => `/blog/page/${page}`} />,
    );
    // The ellipses are hidden from the accessibility tree, so the visible order is read from the DOM.
    expect(
      [...screen.getByRole('navigation', { name: 'Pagination' }).querySelectorAll('li')].map(
        (listItem) => listItem.textContent,
      ),
    ).toEqual(['Previous', '1', '…', '5', '6', '7', '…', '12', 'Next']);
    const current = screen.getByRole('link', { name: 'Page 6' });
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.getAttribute('href')).toBe('/blog/page/6');
    expect(screen.getByRole('link', { name: 'Page 5' }).hasAttribute('aria-current')).toBe(false);
    expect(screen.getByRole('link', { name: 'Previous' }).getAttribute('href')).toBe(
      '/blog/page/5',
    );
    expect(screen.getByRole('link', { name: 'Next' }).getAttribute('href')).toBe('/blog/page/7');
    await assertNoAxeViolations(container);
  });

  it('shows a lone hidden page instead of an ellipsis', () => {
    render(<Pagination page={3} pageCount={12} href={(page) => `?page=${page}`} />);
    expect(screen.getByRole('link', { name: 'Page 1' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Page 2' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Page 5' })).toBeNull();
  });

  it('has no previous link on the first page and no next link on the last', async () => {
    const { container, rerender } = render(
      <Pagination page={1} pageCount={3} href={(page) => `?page=${page}`} />,
    );
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull();
    expect(screen.getByText('Previous')).toBeTruthy();
    await assertNoAxeViolations(container);

    rerender(<Pagination page={3} pageCount={3} href={(page) => `?page=${page}`} />);
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Previous' })).toBeTruthy();
  });

  it('tabs through the links in reading order', async () => {
    // One session for the whole walk: inlined in the loop, each tab would start a fresh session.
    const user = userEvent.setup();
    render(<Pagination page={2} pageCount={3} href={(page) => `?page=${page}`} />);
    for (const name of ['Previous', 'Page 1', 'Page 2', 'Page 3', 'Next']) {
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('link', { name }));
    }
  });

  it('takes translated labels and a router link component', () => {
    render(
      <Pagination
        page={2}
        pageCount={3}
        href={(page) => `/p/${page}`}
        aria-label="Paginación"
        labels={{ previous: 'Anterior', next: 'Siguiente', page: (page) => `Página ${page}` }}
        linkAs={forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>((props, ref) => (
          <a ref={ref} data-router-link="" {...props} />
        ))}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Anterior' }).hasAttribute('data-router-link')).toBe(
      true,
    );
    expect(screen.getByRole('link', { name: 'Página 2' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('applies the size variant and keeps consumer classes last', () => {
    render(
      <Pagination
        page={1}
        pageCount={2}
        href={(page) => `?page=${page}`}
        size="sm"
        className="extra"
      />,
    );
    const nav = screen.getByRole('navigation');
    expect(nav.className).toMatch(/beckui--pagination__root--size_sm/);
    expect(nav.className.endsWith('extra')).toBe(true);
  });
});
