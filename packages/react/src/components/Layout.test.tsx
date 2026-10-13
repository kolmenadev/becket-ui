import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Box } from './Box';
import { Container } from './Container';

describe('Container', () => {
  it('defaults to a centered lg container with md gutters', () => {
    render(<Container data-testid="c">Content</Container>);
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/beckui--container--size_lg/);
    expect(el.className).toMatch(/beckui--container--padding_md/);
  });

  it('renders a landmark through as', async () => {
    const { container } = render(
      <Container as="main" size="md">
        <h1>Page</h1>
      </Container>,
    );
    expect(screen.getByRole('main').className).toMatch(/beckui--container--size_md/);
    await assertNoAxeViolations(container);
  });

  it('keeps consumer classes after the recipe', () => {
    render(<Container data-testid="c" className="extra" />);
    expect(screen.getByTestId('c').className.endsWith('extra')).toBe(true);
  });
});

describe('Box', () => {
  it('applies no variant classes by default', () => {
    render(<Box data-testid="b">Plain</Box>);
    expect(screen.getByTestId('b').className).not.toMatch(
      /padding_(xs|sm|md|lg|xl)|background_(background|surface|subtle)|radius_(sm|md|lg|xl|full)/,
    );
  });

  it('maps token props to recipe classes', async () => {
    const { container } = render(
      <Box as="section" aria-label="Plan" padding="lg" background="surface" radius="md">
        Pro plan
      </Box>,
    );
    const el = screen.getByRole('region', { name: 'Plan' });
    expect(el.className).toMatch(/beckui--box--padding_lg/);
    expect(el.className).toMatch(/beckui--box--background_surface/);
    expect(el.className).toMatch(/beckui--box--radius_md/);
    await assertNoAxeViolations(container);
  });
});
