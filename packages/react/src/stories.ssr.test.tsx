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
  // Neither the console.error spy nor the stubbed navigator may carry into the next test, even
  // after a failure.
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // React's `<!--$!-->` marks a Suspense boundary that errored on the server and fell back to client
  // rendering. renderToString swallows that error without logging it, so the marker is the only
  // trace; this pins it so the story check below can't go blind if React changes it. The same check
  // also rejects empty output (`^$`): a story must render something.
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
    // Node 21+ defines navigator, so a render-time read would pass here with Node's value instead of
    // failing. Undefined (not a throwing proxy) so a `typeof navigator` guard still passes.
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
