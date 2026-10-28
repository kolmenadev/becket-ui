import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('lists the trail in a named navigation landmark and marks only the current page', async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/blog">Blog</BreadcrumbItem>
        <BreadcrumbItem current>Writing tokens</BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(screen.getAllByRole('listitem').map((listItem) => listItem.textContent)).toEqual([
      'Home',
      'Blog',
      'Writing tokens',
    ]);
    expect(screen.getByRole('link', { name: 'Blog' }).getAttribute('href')).toBe('/blog');
    expect(screen.getByRole('link', { name: 'Blog' }).hasAttribute('aria-current')).toBe(false);
    // Without an href the current page is text, not a link.
    expect(screen.queryByRole('link', { name: 'Writing tokens' })).toBeNull();
    expect(screen.getByText('Writing tokens').getAttribute('aria-current')).toBe('page');
    await assertNoAxeViolations(container);
  });

  it('keeps a current page with an href as a link', async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/blog/tokens" current>
          Writing tokens
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByRole('link', { name: 'Writing tokens' }).getAttribute('aria-current')).toBe(
      'page',
    );
    await assertNoAxeViolations(container);
  });

  it('takes a router link, a translated name and the variants', () => {
    render(
      <Breadcrumb aria-label="Ruta de navegación" size="md" separator="slash" className="extra">
        <BreadcrumbItem
          href="/"
          as={forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>((props, ref) => (
            <a ref={ref} data-router-link="" {...props} />
          ))}
        >
          Inicio
        </BreadcrumbItem>
        <BreadcrumbItem current>Blog</BreadcrumbItem>
      </Breadcrumb>,
    );
    const nav = screen.getByRole('navigation', { name: 'Ruta de navegación' });
    expect(nav.className.endsWith('extra')).toBe(true);
    expect(nav.querySelector('ol')?.className).toMatch(/breadcrumb__list--size_md/);
    expect(nav.querySelector('ol')?.className).toMatch(/breadcrumb__list--separator_slash/);
    expect(screen.getByRole('link', { name: 'Inicio' }).hasAttribute('data-router-link')).toBe(
      true,
    );
  });
});
