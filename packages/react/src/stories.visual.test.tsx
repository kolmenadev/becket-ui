/// <reference types="vite/client" />
import { composeStories, type composeStory } from '@storybook/react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import '@becket-ui/tokens/index.css';
// The faces Becket's font stacks name; the docs Storybook loads the same files.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';

// Pixel tier (MAV-145): the same stories as the markup tier, rendered by real Chrome with Becket's
// CSS and fonts. Run with vitest.visual.config.ts.

// Motion and the caret make two captures of the same story differ; freeze them. The body fills
// the viewport so top-layer overlays (Dialog, Drawer) are inside the captured box.
document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
    *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
    body { margin: 0; padding: 0.75rem; min-height: 100vh; box-sizing: border-box; }
  </style>`,
);

// A failed comparison skips the rest of its test; clean up here so the next story starts empty.
afterEach(cleanup);

// One test per story and theme, so a report names every story that changed, not the first per file.
describe.each(['dark', 'light'])('%s', (theme) => {
  for (const [path, storyFile] of Object.entries(
    import.meta.glob<Parameters<typeof composeStories>[0]>('./components/*.stories.tsx', {
      eager: true,
    }),
  )) {
    const component = path.replace('./components/', '').replace('.stories.tsx', '');
    for (const [name, Story] of Object.entries<ReturnType<typeof composeStory>>(
      composeStories(storyFile),
    )) {
      it(`${component} ${name}`, async () => {
        document.documentElement.setAttribute('data-theme', theme);
        render(<Story />);
        await document.fonts.ready;
        await expect
          .element(page.elementLocator(document.body))
          .toMatchScreenshot(`${component}-${name}-${theme}`);
      });
    }
  }
});
