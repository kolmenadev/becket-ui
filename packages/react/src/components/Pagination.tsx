import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { pagination as paginationRecipe } from '@becket-ui/tokens/recipes';

import { ChevronLeftIcon, ChevronRightIcon } from './Glyphs';

export type PaginationProps = Omit<ComponentPropsWithoutRef<'nav'>, 'children'> & {
  /** The current page, counting from 1. */
  page: number;
  pageCount: number;
  /** The URL of a page. Every page is a plain link, so it works with server routing and no JS. */
  href: (page: number) => string;
  /** Pages shown on each side of the current one. First and last always show. Default `1`. */
  siblings?: number;
  size?: 'sm' | 'md';
  /** Router link component (for example Next's `Link`) to render each link with. Default `a`. */
  linkAs?: ElementType;
  /** Visible and announced text. Defaults are English. */
  labels?: {
    previous?: string;
    next?: string;
    /** Accessible name of a page link; keep the number in it (WCAG 2.5.3). */
    page?: (page: number) => string;
  };
};

/**
 * Links to the pages of a paged list: previous, first, the pages around the current one, last, and
 * next. Gaps show as an ellipsis. Renders without client JS.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      pageCount,
      href,
      siblings = 1,
      size = 'md',
      linkAs: LinkComponent = 'a',
      labels,
      className,
      'aria-label': ariaLabel = 'Pagination',
      ...props
    },
    ref,
  ) => {
    const styles = paginationRecipe({ size });
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        {...props}
        className={[styles.root, className].filter(Boolean).join(' ')}
      >
        <ol className={styles.list}>
          <li>
            {page > 1 ? (
              <LinkComponent href={href(page - 1)} rel="prev" className={styles.link}>
                <ChevronLeftIcon />
                {labels?.previous ?? 'Previous'}
              </LinkComponent>
            ) : (
              <span className={styles.link}>
                <ChevronLeftIcon />
                {labels?.previous ?? 'Previous'}
              </span>
            )}
          </li>
          {[
            ...new Set([
              1,
              ...Array.from({ length: 2 * siblings + 1 }, (_, i) => page - siblings + i),
              pageCount,
            ]),
          ]
            .filter((shown) => shown >= 1 && shown <= pageCount)
            // style-check keep: `filter` returned a new array this owns; the build's lib predates `toSorted`.
            .sort((a, b) => a - b)
            // A gap of one page shows that page: an ellipsis there would hide nothing.
            .flatMap((shown, index, all) => {
              const gap = index === 0 ? 1 : shown - all[index - 1];
              if (gap === 2) return [shown - 1, shown];
              if (gap > 2) return [{ ellipsisBefore: shown }, shown];
              return [shown];
            })
            .map((pageOrGap) =>
              typeof pageOrGap === 'number' ? (
                <li key={pageOrGap}>
                  <LinkComponent
                    href={href(pageOrGap)}
                    aria-label={labels?.page?.(pageOrGap) ?? `Page ${pageOrGap}`}
                    aria-current={pageOrGap === page ? 'page' : undefined}
                    className={styles.link}
                  >
                    {pageOrGap}
                  </LinkComponent>
                </li>
              ) : (
                <li
                  key={`ellipsis-${pageOrGap.ellipsisBefore}`}
                  aria-hidden="true"
                  className={styles.ellipsis}
                >
                  …
                </li>
              ),
            )}
          <li>
            {page < pageCount ? (
              <LinkComponent href={href(page + 1)} rel="next" className={styles.link}>
                {labels?.next ?? 'Next'}
                <ChevronRightIcon />
              </LinkComponent>
            ) : (
              <span className={styles.link}>
                {labels?.next ?? 'Next'}
                <ChevronRightIcon />
              </span>
            )}
          </li>
        </ol>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
