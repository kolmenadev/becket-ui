/// <reference types="vite/client" />
import { composeStories, type composeStory } from '@storybook/react';
import { cleanup, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// Markup tier (MAV-151): render every story in jsdom and snapshot its HTML, so a change in what a
// component outputs (classes, attributes, structure) shows up as a text diff. jsdom applies no CSS,
// so this never stands in for a screenshot. Known gaps: Tooltip measures zeros and Dialog falls
// back to the `open` attribute (no showModal); their markup is still a faithful record of output.
const storyFiles = import.meta.glob<Parameters<typeof composeStories>[0]>(
  './components/*.stories.tsx',
  { eager: true },
);

describe('story markup', () => {
  it.each(Object.keys(storyFiles))('%s', async (path) => {
    const sections = [];
    for (const [name, Story] of Object.entries<ReturnType<typeof composeStory>>(
      composeStories(storyFiles[path]),
    )) {
      // baseElement, not container: Dialog, Drawer, Menu and Tooltip portal into document.body.
      const { baseElement } = render(<Story />);
      // React's useId values count up across every render in the process, so the same story gets
      // different ids depending on which stories ran before it. Number them per story instead.
      const ids: string[] = [];
      sections.push(
        `<!-- ${name} -->\n${baseElement.innerHTML
          .replace(/«r[0-9a-z]+»|_r_[0-9a-z]+_|:r[0-9a-z]+:/g, (id) => {
            if (!ids.includes(id)) ids.push(id);
            return `id-${ids.indexOf(id) + 1}`;
          })
          // Class order inside the attribute doesn't affect the cascade, and Panda versions emit
          // variant classes in different orders; sort them so only real changes show up. sort() over
          // toSorted(): split() returns a new array, so nothing else is touched, and toSorted isn't
          // in this package's TypeScript lib.
          .replace(
            / class="([^"]*)"/g,
            (_, classes: string) => ` class="${classes.split(' ').sort().join(' ')}"`,
          )
          .replace(/></g, '>\n<')}\n`,
      );
      cleanup();
    }
    await expect(sections.join('\n')).toMatchFileSnapshot(
      `./__markup__/${path.replace('./components/', '').replace('.stories.tsx', '.html')}`,
    );
  });
});
