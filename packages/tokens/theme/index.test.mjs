import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { defineBecketTheme } from './index.mjs';

const tokensRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('defineBecketTheme maps primary and sizes.field to public CSS vars', () => {
  const css = defineBecketTheme({
    colors: { primary: 'oklch(0.55 0.22 280)' },
    sizes: { field: '16rem' },
  });
  assert.match(css, /^:root \{/);
  assert.match(css, /--beckui--colors-primary: oklch\(0\.55 0\.22 280\);/);
  assert.match(css, /--beckui--sizes-field: 16rem;/);
  assert.doesNotMatch(css, /brand-becket-yellow/);
});

test('defineBecketTheme maps background { dark, light } onto one semantic var', () => {
  const css = defineBecketTheme({
    colors: {
      background: { dark: 'oklch(0.2 0.02 260)', light: 'oklch(0.98 0.01 260)' },
    },
  });
  assert.match(css, /:root \{[\s\S]*--beckui--colors-background: oklch\(0\.2 0\.02 260\);/);
  assert.match(
    css,
    /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-background: oklch\(0\.98 0\.01 260\);/,
  );
  assert.doesNotMatch(css, /light-background/);
});

test('defineBecketTheme maps danger { dark, light } onto one semantic var', () => {
  const css = defineBecketTheme({
    colors: {
      danger: { dark: 'oklch(0.76 0.16 25)', light: 'oklch(0.48 0.20 25)' },
    },
  });
  assert.match(css, /:root \{[\s\S]*--beckui--colors-danger: oklch\(0\.76 0\.16 25\);/);
  assert.match(
    css,
    // Colors are re-serialised, so `0.20` comes back as `0.2`.
    /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-danger: oklch\(0\.48 0\.2 25\);/,
  );
});

test('defineBecketTheme density vars do not touch spacing tokens', () => {
  const css = defineBecketTheme({
    density: { button: { md: { px: '0.4rem', py: '0.1rem' } } },
  });
  assert.match(css, /--beckui-button-px-md: 0\.4rem;/);
  assert.match(css, /--beckui-button-py-md: 0\.1rem;/);
  assert.doesNotMatch(css, /--beckui--spacing-md/);
});

test('defineBecketTheme exposes one unit per scale', () => {
  const css = defineBecketTheme({ spacing: { unit: '0.2rem', textUnit: '0.3em' }, fontSizes: { base: '1.0625rem' } });
  assert.match(css, /--beckui--spacing-unit: 0\.2rem;/);
  assert.match(css, /--beckui--spacing-text-unit: 0\.3em;/);
  assert.match(css, /--beckui--font-sizes-base: 1\.0625rem;/);
  const built = readFileSync(join(tokensRoot, 'index.css'), 'utf8');
  for (const name of ['--beckui--spacing-unit', '--beckui--spacing-text-unit', '--beckui--font-sizes-base']) {
    assert.match(built, new RegExp(`${name}:`));
  }
});

test('defineBecketTheme rejects unknown keys', () => {
  assert.throws(
    () => defineBecketTheme({ colors: { highlight: 'red' } }),
    /Unknown Becket theme key "colors.highlight"/,
  );
});

test('generated index.css semantic text/background follow data-theme', () => {
  const css = readFileSync(join(tokensRoot, 'index.css'), 'utf8');
  assert.match(css, /--beckui--colors-text:/);
  assert.match(css, /--beckui--colors-background:/);
  assert.match(css, /\[data-theme=['"]light['"]\]/);
  assert.match(css, /--beckui-button-px-md:\s*calc\(var\(--beckui--spacing-unit\) \* 4\)/);
  assert.match(css, /--beckui-field-px-md:\s*var\(--beckui--spacing-3\)/);
  assert.match(css, /--beckui-tag-px-md:\s*var\(--beckui--spacing-3\)/);
  assert.match(
    css,
    /--beckui--shadows-outline:\s*0 0 0 2px var\(--beckui--colors-background\), 0 0 0 4px var\(--beckui--colors-primary\)/,
  );
});

test('package.json exports ./theme for Storybook and Vite conditions', () => {
  const pkg = JSON.parse(readFileSync(join(tokensRoot, 'package.json'), 'utf8'));
  const theme = pkg.exports['./theme'];
  assert.equal(theme.types, './theme/index.d.ts');
  for (const condition of ['storybook', 'module', 'browser', 'import', 'default']) {
    assert.equal(theme[condition], './theme/index.mjs', condition);
  }
});

test('theme.example.css documents the public primary / field / radius contract', () => {
  const css = readFileSync(join(tokensRoot, 'theme.example.css'), 'utf8');
  assert.match(css, /--beckui--colors-primary:/);
  assert.match(css, /--beckui--sizes-field:/);
  assert.match(css, /--beckui--radii-md:/);
  assert.match(css, /--beckui-button-px-md:/);
});

test('empty config does not emit :root overrides', () => {
  const css = defineBecketTheme({});
  assert.doesNotMatch(css, /:root/);
});

test('generated index.css alias graph follows primary / tertiary / secondary', () => {
  const css = readFileSync(join(tokensRoot, 'index.css'), 'utf8');
  assert.match(
    css,
    /--beckui--colors-primary-hover:\s*color-mix\(in oklch, var\(--beckui--colors-primary\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-primary:\s*linear-gradient\(to right, var\(--beckui--colors-primary\), var\(--beckui--colors-tertiary\)\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-secondary:\s*linear-gradient\(to right, var\(--beckui--colors-primary\), var\(--beckui--colors-secondary\)\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-primary-hover:\s*linear-gradient\(to right, var\(--beckui--colors-primary-hover\), var\(--beckui--colors-tertiary\)\)/,
  );
  assert.doesNotMatch(
    css,
    /--beckui--colors-primary-hover:[^;]*brand-becket-yellow/,
  );
});

test('defineBecketTheme maps surface and link colors so a rebrand reaches light links', () => {
  const css = defineBecketTheme({
    colors: {
      surface: { light: 'oklch(1 0 0)' },
      link: { dark: 'oklch(0.8 0.1 255)', light: 'oklch(0.45 0.15 255)' },
      linkHover: 'oklch(0.5 0.15 255)',
      linkVisited: { light: 'oklch(0.45 0.12 300)' },
    },
  });
  assert.match(css, /:root \{[\s\S]*--beckui--colors-link: oklch\(0\.8 0\.1 255\);/);
  assert.match(css, /:root \{[\s\S]*--beckui--colors-link-hover: oklch\(0\.5 0\.15 255\);/);
  assert.match(css, /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-link: oklch\(0\.45 0\.15 255\);/);
  assert.match(css, /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-link-visited: oklch\(0\.45 0\.12 300\);/);
  assert.match(css, /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-surface: oklch\(1 0 0\);/);
});

test('defineBecketTheme accepts lengths and rejects anything else, naming the path', () => {
  for (const [path, config, declaration] of [
    ['radii.md', { radii: { md: '4px' } }, '--beckui--radii-md: 4px;'],
    ['fontSizes.base', { fontSizes: { base: '1.0625rem' } }, '--beckui--font-sizes-base: 1.0625rem;'],
    ['spacing.textUnit', { spacing: { textUnit: '.3em' } }, '--beckui--spacing-text-unit: .3em;'],
    ['sizes.field', { sizes: { field: '50%' } }, '--beckui--sizes-field: 50%;'],
    ['density.tag.lg.py', { density: { tag: { lg: { py: '-1px' } } } }, '--beckui-tag-py-lg: -1px;'],
  ]) {
    assert.ok(defineBecketTheme(config).includes(declaration), path);
  }
  for (const [path, config] of [
    ['radii.md', { radii: { md: '4px; x:y' } }],
    ['fontSizes.base', { fontSizes: { base: '1rem}</style><script>' } }],
    ['spacing.unit', { spacing: { unit: 'url(//x)' } }],
    ['sizes.field', { sizes: { field: 'calc(1rem + 2px)' } }],
    ['density.button.md.px', { density: { button: { md: { px: '1rem;color:red' } } } }],
    ['density.field.sm.py', { density: { field: { sm: { py: '4 px' } } } }],
  ]) {
    assert.throws(() => defineBecketTheme(config), new RegExp(`^Error: Not a CSS length at ${path}: `), path);
  }
});

test('defineBecketTheme accepts font family lists and rejects anything else, naming the path', () => {
  const css = defineBecketTheme({
    fonts: {
      sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      mono: '"JetBrains Mono",monospace',
    },
  });
  assert.match(css, /--beckui--fonts-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;/);
  assert.match(css, /--beckui--fonts-mono: "JetBrains Mono",monospace;/);
  for (const [path, config] of [
    ['fonts.sans', { fonts: { sans: 'Inter}</style><script>' } }],
    ['fonts.sans', { fonts: { sans: 'Inter; color: red' } }],
    ['fonts.mono', { fonts: { mono: "'Mono' url(//x)" } }],
    ['fonts.mono', { fonts: { mono: "'Unclosed, monospace" } }],
    ['fonts.sans', { fonts: { sans: 'Open Sans' } }],
  ]) {
    assert.throws(() => defineBecketTheme(config), new RegExp(`^Error: Not a CSS font family at ${path}: `), path);
  }
});

test('defineBecketTheme writes every color from the parsed value, alpha included', () => {
  assert.equal(
    defineBecketTheme({
      colors: {
        primary: 'oklch(0.5 0.1 200 / 0.4)',
        secondary: '#11223380',
        tertiary: 'rgb(1 2 3 / 40%)',
        background: { dark: '#000', light: 'white' },
        neutral: { 900: 'hsl(0 0% 100%)' },
      },
    }),
    [
      ':root {',
      '  --beckui--colors-primary: oklch(0.5 0.1 200 / 0.4);',
      '  --beckui--colors-secondary: oklch(0.2462 0.0398 249.73 / 0.502);',
      '  --beckui--colors-tertiary: oklch(0.0823 0.008 240.75 / 0.4);',
      '  --beckui--colors-background: oklch(0 0 0);',
      '  --beckui--colors-neutral-900: oklch(1 0 0);',
      '}',
      "html[data-theme='light'] {",
      '  --beckui--colors-background: oklch(1 0 0);',
      '}',
      '',
    ].join('\n'),
  );
});

test('defineBecketTheme rejects a value that is not a color, naming the path', () => {
  for (const [path, config] of [
    ['colors.primary', { colors: { primary: 'red; background: url(//x)' } }],
    ['colors.text.light', { colors: { text: { light: 'oklch(0.5 0.1 200);} body{x:y' } } }],
    ['colors.background', { colors: { background: '#fff</style>' } }],
    ['colors.neutral.50', { colors: { neutral: { 50: 'var(--x)' } } }],
    ['colors.link.dark', { colors: { link: { dark: 'rgb(1 2 3 4)' } } }],
  ]) {
    assert.throws(() => defineBecketTheme(config), new RegExp(`^Error: Not a CSS color at ${path}: `), path);
  }
});

test('a rejected value of any kind is quoted only up to its first 40 characters', () => {
  const long = `x; background: url(//x/${'a'.repeat(200)})`;
  for (const config of [{ radii: { md: long } }, { fonts: { sans: long } }, { colors: { primary: long } }]) {
    assert.throws(
      () => defineBecketTheme(config),
      (error) => error.message.includes(`${JSON.stringify(long.slice(0, 40))}.`) && !error.message.includes('a'.repeat(41)),
    );
  }
});

test('defineBecketTheme checks and writes the same string, even when toString changes between reads', () => {
  for (const [group, key, first] of [
    ['radii', 'md', '4px'],
    ['fonts', 'sans', 'Inter'],
  ]) {
    // style-check keep: counts reads across toString calls; it can't live inside the callback.
    let reads = 0;
    assert.doesNotMatch(
      defineBecketTheme({
        [group]: { [key]: { toString: () => (reads++ === 0 ? first : `${first}; background: url(//x)`) } },
      }),
      /url/,
      group,
    );
  }
});

test('defineBecketTheme skips empty values of every kind', () => {
  assert.doesNotMatch(
    defineBecketTheme({
      colors: { primary: '', background: { dark: '', light: '' } },
      radii: { md: '' },
      fonts: { sans: '' },
      density: { button: { md: { px: '' } } },
    }),
    /:root/,
  );
});
