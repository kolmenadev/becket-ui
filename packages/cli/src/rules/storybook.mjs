// Every component has colocated stories, and stories use the agreed groups.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export default {
  id: 'storybook',
  guide: 'becket.mdc § Storybook rules',
  check: ({ source, file, repo, lines, isComponent, report }) => ({
    finish() {
      if (
        isComponent &&
        lines === null &&
        !existsSync(join(repo, file.replace(/\.tsx$/, '.stories.tsx')))
      )
        report({
          line: 1,
          level: 'must',
          message: `no ${file
            .split('/')
            .at(-1)
            .replace(/\.tsx$/, '.stories.tsx')} next to the component`,
        });
      if (!file.endsWith('.stories.tsx')) return;
      const title = source.getFullText().match(/title:\s*['"]([^'"/]+)\//);
      if (
        title &&
        ![
          'Layout',
          'Typography',
          'Buttons',
          'Forms',
          'Overlays',
          'Disclosure',
          'Feedback',
          'Data Display',
          'Navigation',
        ].includes(title[1]) &&
        (lines === null || lines.has(source.getFullText().slice(0, title.index).split('\n').length))
      )
        report({
          line: source.getFullText().slice(0, title.index).split('\n').length,
          level: 'prefer',
          message: `story group "${title[1]}" isn't one of Layout, Typography, Buttons, Forms, Overlays, Disclosure, Feedback, Data Display, Navigation`,
        });
    },
  }),
};
