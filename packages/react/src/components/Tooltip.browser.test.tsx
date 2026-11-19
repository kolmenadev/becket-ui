import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Button } from './Button';
import { Tooltip } from './Tooltip';

afterEach(cleanup);

describe('Tooltip', () => {
  it('opens on keyboard focus and closes on Escape without moving focus', async () => {
    render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        <Button>Hint</Button>
      </Tooltip>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('tooltip')).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Hint' }))
      .toHaveAccessibleDescription('Short glossary hint.');

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Hint' })).toHaveFocus();
  });

  it('closes when Tab moves focus to the next control', async () => {
    render(
      <>
        <Tooltip content="Short glossary hint." delayMs={0}>
          <Button>Hint</Button>
        </Tooltip>
        <Button>After</Button>
      </>,
    );
    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('tooltip')).toBeVisible();

    await userEvent.keyboard('{Tab}');

    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
  });

  it('makes plain text a tab stop that opens the tooltip', async () => {
    render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        glossary
      </Tooltip>,
    );

    await userEvent.keyboard('{Tab}');

    await expect.element(page.getByText('glossary')).toHaveFocus();
    await expect.element(page.getByRole('tooltip')).toBeVisible();
  });
});
