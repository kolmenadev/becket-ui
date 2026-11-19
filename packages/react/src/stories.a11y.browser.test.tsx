/// <reference types="vite/client" />
import { composeStories, type composeStory } from '@storybook/react';
import { cleanup, render } from '@testing-library/react';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { commands, server } from 'vitest/browser';
// The faces Becket's font stacks name; contrast is measured on the text as it really renders.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';

import { assertNoAxeViolations } from '@becket-ui/a11y';
import '@becket-ui/tokens/index.css';

// Colors caught mid-transition would be measured as they fade in; freeze motion.
document.head.insertAdjacentHTML(
  'beforeend',
  '<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>',
);

// style-check keep: inlining would change behavior; the tests fill it and afterAll writes it.
const report: Record<string, Record<string, unknown>> = { dark: {}, light: {} };

afterEach(cleanup);

// One file per theme and browser; Chrome and Firefox run this file at the same time.
afterAll(() =>
  Promise.all(
    Object.entries(report).map(([theme, stories]) =>
      commands.writeFile(
        `axe-results/${server.browser}/axe-results-${theme}.json`,
        `${JSON.stringify(stories, null, 2)}\n`,
      ),
    ),
  ),
);

for (const [path, storyFile] of Object.entries(
  import.meta.glob<Parameters<typeof composeStories>[0]>('./components/*.stories.tsx', {
    eager: true,
  }),
)) {
  // style-check keep: computed once per file; inlined, it would rerun for every story's test name.
  const component = path.replace('./components/', '').replace('.stories.tsx', '');
  // style-check keep: composed once per file; inlined, the guard and the loop would compose it twice.
  const stories = Object.entries<ReturnType<typeof composeStory>>(composeStories(storyFile));

  // A story file that exports no stories would otherwise drop out of the gate without a sign.
  it(`${component} has a test per story`, () => {
    expect(stories.length).toBeGreaterThan(0);
  });

  // One test per story and theme, so a report names every story that fails.
  describe.each(['dark', 'light'])('%s', (theme) => {
    for (const [name, Story] of stories) {
      it(`${component} ${name}`, async () => {
        document.documentElement.setAttribute('data-theme', theme);
        const { container, baseElement } = render(<Story />);
        // A story is a fragment of a page. Unless it renders its own <main> (Container AsMain,
        // SkipLink), its container stands in for the page's, so `region` flags only what leaves it.
        if (!container.querySelector('main')) container.setAttribute('role', 'main');
        await document.fonts.ready;
        // baseElement, not container: Dialog, Drawer, Menu and Tooltip portal into document.body.
        await assertNoAxeViolations(baseElement, {
          environment: 'browser',
          // The a11y standard (§3): critical and serious fail; moderate and minor are reported.
          failOn: ['critical', 'serious'],
          onResults: ({ violations, incomplete }) => {
            report[theme][`${component} ${name}`] = { violations, incomplete };
          },
        });
      });
    }
  });
}
