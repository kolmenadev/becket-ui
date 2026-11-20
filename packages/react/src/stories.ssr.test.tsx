// @vitest-environment node
/// <reference types="vite/client" />
import { composeStories, type composeStory } from '@storybook/react';
import { createElement, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Node has no window or document, so a component that reads one while rendering throws here
// instead of in a Next or Node consumer. renderToString runs no effects, which is why browser-only
// work in effects (Dialog showModal, Tooltip measuring) stays outside this check.
describe('story server render', () => {
  // A failing file must not leave its console.error spy (and its calls) behind for the next one.
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // React's `<!--$!-->` marks a Suspense boundary that errored on the server and fell back to client
  // rendering. renderToString swallows that error without logging it, so the marker is the only
  // trace; this pins it so the story check below can't go blind if React changes it.
  it('writes the client-render marker when a Suspense boundary errors', () => {
    expect(
      renderToString(<Suspense fallback={null}>{createElement(() => window.innerWidth)}</Suspense>),
    ).toContain('<!--$!-->');
  });

  it.each(
    Object.entries(
      import.meta.glob<Parameters<typeof composeStories>[0]>('./components/*.stories.tsx', {
        eager: true,
      }),
    ),
  )('%s', (path, stories) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Node 21+ defines navigator, which a browser-only read in render would use to differ from the
    // client's value. Undefined (not a throwing proxy) so a `typeof navigator` guard still passes.
    vi.stubGlobal('navigator', undefined);
    for (const [name, Story] of Object.entries<ReturnType<typeof composeStory>>(
      composeStories(stories),
    )) {
      expect(renderToString(<Story />), `${path} ${name}`).not.toMatch(/^$|<!--\$!-->/);
    }
    expect(
      console.error,
      `${path} logged console.error during server render`,
    ).not.toHaveBeenCalled();
  });
});
