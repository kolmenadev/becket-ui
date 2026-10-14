import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { AspectRatio } from './AspectRatio';
import { Avatar } from './Avatar';
import { Blockquote, BlockquoteCaption } from './Blockquote';
import { Center } from './Center';
import { Code } from './Code';
import { Figure } from './Figure';
import { Grid, GridItem } from './Grid';
import { Image } from './Image';
import { Kbd } from './Kbd';
import { List, ListItem } from './List';
import { Mark } from './Mark';
import { SkipLink } from './SkipLink';
import { VisuallyHidden } from './VisuallyHidden';

describe('typography', () => {
  it('List defaults the marker from the element', () => {
    render(
      <>
        <List data-testid="ul">
          <ListItem>One</ListItem>
        </List>
        <List as="ol" data-testid="ol">
          <ListItem>First</ListItem>
        </List>
      </>,
    );
    expect(screen.getByTestId('ul').className).toMatch(/list--marker_disc/);
    expect(screen.getByTestId('ol').tagName).toBe('OL');
    expect(screen.getByTestId('ol').className).toMatch(/list--marker_decimal/);
  });

  it('Code, Kbd and Mark render their native elements', async () => {
    const { container } = render(
      <p>
        Run <Code>pnpm build</Code>, press <Kbd>⌘</Kbd> <Kbd>K</Kbd>, read the <Mark>highlight</Mark>.
      </p>,
    );
    expect(container.querySelector('code')).toBeTruthy();
    expect(container.querySelectorAll('kbd')).toHaveLength(2);
    expect(container.querySelector('mark')).toBeTruthy();
    await assertNoAxeViolations(container);
  });

  it('Blockquote keeps the caption outside the quote', async () => {
    const { container } = render(
      <Blockquote cite="https://example.com/talk">
        <p>Props first, then tokens.</p>
        <BlockquoteCaption>Becket guide</BlockquoteCaption>
      </Blockquote>,
    );
    const quote = container.querySelector('blockquote');
    expect(quote?.getAttribute('cite')).toBe('https://example.com/talk');
    expect(quote?.textContent).toBe('Props first, then tokens.');
    expect(container.querySelector('figure > figcaption')?.textContent).toBe('Becket guide');
    await assertNoAxeViolations(container);
  });
});

describe('media', () => {
  it('Image is lazy by default and requires alt', async () => {
    const { container } = render(
      <Figure caption="Monthly signups">
        <Image src="/chart.png" alt="Signups grew 40% in March" radius="md" />
      </Figure>,
    );
    const img = screen.getByRole('img', { name: 'Signups grew 40% in March' });
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(container.querySelector('figcaption')?.textContent).toBe('Monthly signups');
    // @ts-expect-error alt is required
    const missingAlt = <Image src="/a.png" />;
    expect(missingAlt).toBeTruthy();
    await assertNoAxeViolations(container);
  });

  it('Avatar shows initials without a photo and after a failed load', async () => {
    const { container, rerender } = render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' }).textContent).toBe('AL');
    await assertNoAxeViolations(container);

    rerender(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const photo = container.querySelector('img');
    expect(photo?.getAttribute('alt')).toBe('');
    fireEvent.error(photo as HTMLImageElement);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' }).textContent).toBe('AL');
  });
});

describe('accessibility helpers', () => {
  it('SkipLink defaults to #main and VisuallyHidden keeps text accessible', async () => {
    const { container } = render(
      <>
        <SkipLink />
        <button type="button">
          <VisuallyHidden>Close dialog</VisuallyHidden>×
        </button>
        <main id="main">Content</main>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#main');
    expect(screen.getByRole('button', { name: 'Close dialog ×' })).toBeTruthy();
    await assertNoAxeViolations(container);
  });
});

describe('layout', () => {
  it('Center and AspectRatio apply their recipes', () => {
    render(
      <>
        <Center inline data-testid="center">
          x
        </Center>
        <AspectRatio ratio="16:9" data-testid="ratio">
          <iframe title="Demo" src="about:blank" />
        </AspectRatio>
      </>,
    );
    expect(screen.getByTestId('center').className).toMatch(/center--inline_true/);
    expect(screen.getByTestId('ratio').className).toMatch(/aspectRatio--ratio_16:9/);
  });

  it('every class Grid and GridItem emit exists in the prebuilt index.css', () => {
    const css = readFileSync(join(__dirname, '..', '..', '..', 'tokens', 'index.css'), 'utf8');
    render(
      <Grid columns={{ base: 1, sm: 2, md: 12, lg: 6, xl: 4, '2xl': 3 }} gap="lg" data-testid="grid">
        <GridItem colSpan={{ base: 'full', md: 6, lg: 3, xl: 12 }} data-testid="item">
          A
        </GridItem>
        <GridItem colSpan={8}>B</GridItem>
      </Grid>,
    );
    const classes = [...document.querySelectorAll('[class]')].flatMap((el) => [...el.classList]);
    const missing = classes
      .filter((name) => name.startsWith('beckui--'))
      .filter((name) => !css.includes(`.${name.replace(/[^\w-]/g, (char) => `\\${char}`)}`));
    expect(missing).toEqual([]);
  });
});
