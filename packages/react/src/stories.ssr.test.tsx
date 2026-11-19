// @vitest-environment node
/// <reference types="vite/client" />
import { composeStories, type composeStory } from '@storybook/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

// No window, document or navigator under node, so a component that reads one while rendering
// throws here instead of in a Next or Node consumer. renderToString runs no effects, which is why
// browser-only work in effects (Dialog showModal, Tooltip measuring) stays outside this check.
describe('story server render', () => {
  // A failing file must not leave its console.error spy (and its calls) behind for the next one.
  afterEach(() => vi.restoreAllMocks());

  it.each(
    Object.entries(
      import.meta.glob<Parameters<typeof composeStories>[0]>('./components/*.stories.tsx', {
        eager: true,
      }),
    ),
  )('%s', (path, stories) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const [name, Story] of Object.entries<ReturnType<typeof composeStory>>(
      composeStories(stories),
    )) {
      expect(renderToString(<Story />), `${path} ${name}`).not.toBe('');
    }
    expect(
      console.error,
      `${path} logged console.error during server render`,
    ).not.toHaveBeenCalled();
  });
});
