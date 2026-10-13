// MAV-61 spike: a hand-built 3-component system (Button, Dialog, Field) that
// proves React 19 Becket components run in Claude Design. Throwaway: the real
// generator replaces this file.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { buildBundle } from './bundle.mjs';
import { buildReactLibs } from './reactLibs.mjs';

const root = join(import.meta.dirname, '..', 'dist', 'spike');
const project = join(root, 'project');
const components = ['Button', 'Dialog', 'Field'];

async function write(path, contents) {
  const file = join(project, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

await rm(root, { recursive: true, force: true });
await buildReactLibs(join(project, 'components', 'lib'));
await buildBundle(join(project, 'components'));

const bundlePath = join(project, 'components', 'bundle.js');
const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'Becket', components: components.map((name) => ({ name })) })} */\n`;
await writeFile(bundlePath, header + (await readFile(bundlePath, 'utf8')));

const neutral = {
  50: 'oklch(0.96 0.012 78)',
  100: 'oklch(0.94 0.012 78)',
  200: 'oklch(0.89 0.012 75)',
  300: 'oklch(0.84 0.012 72)',
  600: 'oklch(0.55 0.014 62)',
  800: 'oklch(0.35 0.015 60)',
  900: 'oklch(0.22 0.015 60)',
};

const tokens = {
  name: 'Becket UI',
  version: 1,
  color: {
    themes: [
      { id: 'dark', name: 'Dark' },
      { id: 'light', name: 'Light' },
    ],
    tokens: [
      { name: 'becketYellow', value: 'oklch(0.75 0.15 78)', usage: 'Primary brand hue. Filled buttons and badges; always neutral-900 ink on it.' },
      { name: 'hiveSage', value: 'oklch(0.70 0.13 125)', usage: 'Secondary brand hue.' },
      { name: 'combAmber', value: 'oklch(0.60 0.16 48)', usage: 'Tertiary brand hue; gradient end.' },
      ...Object.entries(neutral).map(([step, value]) => ({ name: `neutral-${step}`, value, usage: `Neutral scale step ${step}.` })),
      { name: 'background', value: { dark: '{neutral-900}', light: '{neutral-50}' }, usage: 'Page background.' },
      { name: 'text', value: { dark: '{neutral-50}', light: '{neutral-900}' }, usage: 'Body text on background.' },
      { name: 'muted', value: { dark: '{neutral-300}', light: '{neutral-600}' }, usage: 'Secondary text on background.' },
      { name: 'surface', value: { dark: '{neutral-800}', light: 'oklch(0.99 0 0)' }, usage: 'Dialog, field and menu fill.' },
      { name: 'danger', value: { dark: 'oklch(0.76 0.16 25)', light: 'oklch(0.48 0.20 25)' }, usage: 'Error text and borders only.' },
    ],
  },
  type: {
    fonts: [],
    families: { sans: "Inter, Roboto, 'Helvetica Neue', Arial, sans-serif" },
    groups: [
      {
        name: 'Text',
        family: 'sans',
        styles: [
          { name: 'body', fontSize: '1rem', lineHeight: 1.5, fontWeight: 400 },
          { name: 'heading-xl', fontSize: '1.5rem', lineHeight: 1.25, fontWeight: 700 },
        ],
      },
    ],
  },
  spacing: {
    tokens: [
      { name: 'space-sm', value: '0.5rem', usage: 'Gap inside controls.' },
      { name: 'space-md', value: '0.75rem', usage: 'Default gap between siblings.' },
      { name: 'space-lg', value: '1.25rem', usage: 'Card padding.' },
    ],
  },
  radius: {
    tokens: [
      { name: 'radius-sm', value: '4px', usage: 'Tags, small controls.' },
      { name: 'radius-md', value: '8px', usage: 'Buttons, fields, cards.' },
      { name: 'radius-full', value: '9999px', usage: 'Pills.' },
    ],
  },
};
await write('tokens.json', JSON.stringify(tokens, null, 2));

await write(
  'README.md',
  `# Becket UI

Chakra-shaped React components with compiled CSS. Dark is the default theme; set \`data-theme="dark" | "light"\` on \`<html>\`.

**Spike system (MAV-61).** Only Button, Dialog and Field are included, to prove React 19 Becket components run here.

## Implementing in code

Use \`@becket-ui/react\` and import \`@becket-ui/tokens/index.css\` once. Never call \`window.Becket\` in app code, never wrap the app in a Chakra \`Provider\`, and never copy \`.beckui--*\` class strings.
`,
);

await write(
  'components/index.d.ts',
  `import type * as React from 'react';
export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  visual?: 'primary' | 'secondary' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  withGradient?: boolean;
  fullWidth?: boolean;
  as?: React.ElementType;
}
export interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface FieldProps extends React.ComponentPropsWithoutRef<'div'> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  fullWidth?: boolean;
}
`,
);

const previews = {
  Button: {
    group: 'Buttons',
    height: 88,
    readme: `Triggers an action; renders a native \`<button type="button">\` by default.

\`\`\`tsx
import { Button } from '@becket-ui/react';

<Button visual="primary">Save</Button>
\`\`\`

Visuals: primary, secondary, neutral, outline. Sizes: sm, md.`,
    script: `h('div', { style: { display: 'flex', gap: '0.75rem', padding: '1rem', flexWrap: 'wrap' } },
      h(B.Button, { visual: 'primary' }, 'Save'),
      h(B.Button, { visual: 'secondary' }, 'Preview'),
      h(B.Button, { visual: 'neutral' }, 'Cancel'),
      h(B.Button, { visual: 'outline' }, 'Learn more'))`,
  },
  Dialog: {
    group: 'Overlays',
    height: 320,
    readme: `Modal dialog on the native \`<dialog>\` element, with focus management and Escape to close.

\`\`\`tsx
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@becket-ui/react';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogHeader><DialogTitle>Delete project?</DialogTitle></DialogHeader>
  <DialogBody>This cannot be undone.</DialogBody>
  <DialogFooter><Button visual="neutral">Cancel</Button></DialogFooter>
</Dialog>
\`\`\``,
    script: `h(function Demo() {
      const [open, setOpen] = React.useState(true);
      return h('div', { style: { padding: '1rem' } },
        h(B.Button, { onClick: () => setOpen(true) }, 'Open dialog'),
        h(B.Dialog, { open, onOpenChange: setOpen },
          h(B.DialogHeader, null, h(B.DialogTitle, null, 'Delete project?')),
          h(B.DialogBody, null, 'This cannot be undone.'),
          h(B.DialogFooter, null,
            h(B.Button, { visual: 'neutral', onClick: () => setOpen(false) }, 'Cancel'),
            h(B.Button, { visual: 'primary', onClick: () => setOpen(false) }, 'Delete'))));
    })`,
  },
  Field: {
    group: 'Forms',
    height: 200,
    readme: `Labels a form control and wires helper and error text to it.

\`\`\`tsx
import { Field, FieldControl, FieldHelper, FieldLabel } from '@becket-ui/react';

<Field>
  <FieldLabel>Email</FieldLabel>
  <FieldControl placeholder="you@example.com" />
  <FieldHelper>We never share it.</FieldHelper>
</Field>
\`\`\``,
    script: `h('div', { style: { display: 'grid', gap: '1.25rem', padding: '1rem', maxWidth: '22rem' } },
      h(B.Field, null,
        h(B.FieldLabel, null, 'Email'),
        h(B.FieldControl, { placeholder: 'you@example.com' }),
        h(B.FieldHelper, null, 'We never share it.')),
      h(B.Field, { invalid: true },
        h(B.FieldLabel, null, 'Project name'),
        h(B.FieldControl, { defaultValue: 'x' }),
        h(B.FieldError, null, 'Use at least 3 characters.')))`,
  },
};

for (const [name, { group, height, readme, script }] of Object.entries(previews)) {
  await write(`components/${name}/README.md`, `# ${name}\n\n${readme}\n`);
  await write(
    `components/${name}/preview.html`,
    `<!-- @dsCard group="${group}" height=${height} -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>${name} — preview</title></head>
<body>
<div id="root"></div>
<script>
  var B = window.Becket, h = React.createElement;
  ReactDOM.createRoot(document.getElementById('root')).render(${script});
</script>
</body>
</html>
`,
  );
}

const now = new Date().toISOString();
await write(
  'design-system.json',
  JSON.stringify(
    {
      v: 3,
      layout: 'files',
      createdOnFiles: { v: 1, at: now },
      title: 'Becket UI (spike)',
      namespace: 'Becket',
      libraries: [
        { name: 'react', version: '19.3.0', global: 'React', file: 'components/lib/react.js' },
        { name: 'react-dom', version: '19.3.0', global: 'ReactDOM', file: 'components/lib/react-dom.js' },
      ],
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: { readme: 'project/README.md', sections: [] },
      lastChange: { by: 'Miguel Angel Gonzalez', at: now, via: 'Claude Code', note: 'MAV-61 spike: Button, Dialog, Field on React 19.3' },
    },
    null,
    2,
  ),
);

console.log(`spike system written to ${project}`);
