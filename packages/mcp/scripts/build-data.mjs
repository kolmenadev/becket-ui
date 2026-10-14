#!/usr/bin/env node
/**
 * Build the data the MCP server serves, from the library's own sources:
 *   - catalog.json: every public component (exports, group, props from the
 *     emitted .d.ts, recipe variant values, story examples, client/RSC)
 *   - theme.json: semantic tokens with dark and light values from index.css
 *   - guidelines.md: the app-code guide, copied as-is
 *
 * Everything is copied into dist/data so the server never depends on the
 * workspace at runtime (and could be published on its own later, MAV-44).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const reactDir = join(repo, 'packages', 'react');
const tokensDir = join(repo, 'packages', 'tokens');
const out = join(here, '..', 'dist', 'data');

const read = (path) => readFileSync(path, 'utf8');

// -- exports: src/index.ts is the source of truth for the public API --------
function parseExports(indexSource) {
  const byFile = new Map();
  const statement = /export\s+(type\s+)?\{([^}]*)\}\s+from\s+'\.\/(components|helpers)\/([\w-]+)'/g;
  for (const [, isType, names, folder, file] of indexSource.matchAll(statement)) {
    const key = `${folder}/${file}`;
    const entry = byFile.get(key) ?? { folder, file, values: [], types: [] };
    const list = names.split(',').map((name) => name.trim()).filter(Boolean);
    (isType ? entry.types : entry.values).push(...list);
    byFile.set(key, entry);
  }
  return [...byFile.values()];
}

// -- stories: group from the title, one example per exported story ----------
function parseStories(source) {
  const title = source.match(/title:\s*'([^']+)'/)?.[1] ?? null;
  const examples = [];
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^export const (\w+)(?::\s*\w+(?:<[^>]*>)?)?\s*=/);
    if (!match) continue;
    const start = i;
    // A story ends at the first top-level line that closes it.
    let end = i;
    while (end < lines.length && !/^\};?\s*$/.test(lines[end]) && !(end === start && /;\s*$/.test(lines[end]))) end += 1;
    const docStart = start > 0 && /^\s*\*\/\s*$/.test(lines[start - 1])
      ? lines.slice(0, start).findLastIndex((line) => /^\s*\/\*\*/.test(line))
      : start;
    examples.push({ name: match[1], code: lines.slice(docStart, end + 1).join('\n') });
  }
  return { title, examples };
}

function summaryOf(source, name) {
  const at = source.search(new RegExp(`export const ${name}\\b`));
  if (at < 0) return null;
  const before = source.slice(0, at).trimEnd();
  if (!before.endsWith('*/')) return null;
  const doc = before.slice(before.lastIndexOf('/**'));
  return doc.replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\* ?/gm, '').trim() || null;
}

async function loadRecipes() {
  const recipes = await import('@becket-ui/tokens/recipes');
  return Object.fromEntries(
    Object.entries(recipes)
      .filter(([, recipe]) => recipe && recipe.variantMap)
      .map(([key, recipe]) => [key, recipe.variantMap]),
  );
}

function recipeFor(name, recipes) {
  const camel = name[0].toLowerCase() + name.slice(1);
  return recipes[camel] ? camel : recipes[`${camel}Recipe`] ? `${camel}Recipe` : null;
}

// -- theme: semantic tokens, dark (base) and light values -------------------
function parseTheme(css) {
  const block = (selector) => {
    const start = css.indexOf(selector);
    if (start < 0) return '';
    const open = css.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
    }
    return '';
  };
  const vars = (text) =>
    Object.fromEntries([...text.matchAll(/(--beckui--[\w-]+):\s*([^;}]+);?/g)].map(([, name, value]) => [name, value.trim()]));
  const base = vars(block(':where(:root, :host) {'));
  const light = { ...base, ...vars(block("[data-theme='light'] {")) };
  // Scales are `calc(<unit> * n)`; show the computed length so agents see 1.25rem, not a formula.
  const multiply = (value) => value.replace(/^calc\(([\d.]+)(r?em) \* ([\d.]+)\)$/, (_, unit, suffix, factor) => `${Number((unit * factor).toFixed(4))}${suffix}`);
  const resolve = (table, value, depth = 0) =>
    depth > 5
      ? value
      : multiply(value.replace(/var\((--beckui--[\w-]+)\)/g, (whole, name) => (table[name] ? resolve(table, table[name], depth + 1) : whole)));

  const groups = {
    colors: ['background', 'text', 'muted', 'surface', 'border', 'primary', 'secondary', 'tertiary', 'accent', 'danger', 'warning', 'success', 'link', 'link-hover', 'link-visited'],
    spacing: ['unit', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '0', '1', '2', '3', '5', '8', '13', '21', '34', 'text-unit', 'text-1', 'text-2', 'text-3', 'text-5', 'text-8', 'text-13'],
    radii: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
    sizes: ['5', '8', '13', '21', '34', '55', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', 'prose', 'field'],
    'font-sizes': ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'text-xs', 'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl'],
    shadows: ['sm', 'md', 'lg', 'elevated'],
  };
  return Object.fromEntries(
    Object.entries(groups).map(([group, keys]) => [
      group,
      keys
        .map((key) => `--beckui--${group}-${key}`)
        .filter((name) => base[name])
        .map((name) => {
          const dark = resolve(base, base[name]);
          const lightValue = resolve(light, light[name]);
          return { token: name.replace(`--beckui--${group}-`, ''), cssVar: `var(${name})`, value: dark, ...(lightValue !== dark ? { light: lightValue } : {}) };
        }),
    ]),
  );
}

// -- build -----------------------------------------------------------------
const recipes = await loadRecipes();
const pkg = JSON.parse(read(join(reactDir, 'package.json')));
const components = [];
const helpers = [];

for (const entry of parseExports(read(join(reactDir, 'src', 'index.ts')))) {
  if (entry.folder !== 'components') {
    helpers.push({ file: entry.file, exports: entry.values, types: entry.types });
    continue;
  }
  const sourcePath = join(reactDir, 'src', 'components', `${entry.file}.tsx`);
  const dtsPath = join(reactDir, 'dist', 'components', `${entry.file}.d.ts`);
  const storiesPath = join(reactDir, 'src', 'components', `${entry.file}.stories.tsx`);
  if (!existsSync(dtsPath)) throw new Error(`Missing ${dtsPath}; build @becket-ui/react first.`);

  const source = read(sourcePath);
  const stories = existsSync(storiesPath) ? parseStories(read(storiesPath)) : { title: null, examples: [] };
  const componentExports = entry.values.filter((name) => /^[A-Z]/.test(name));
  // A file exporting a family (Glyphs: CheckIcon, CloseIcon, …) is listed under the file name.
  const primary = componentExports.includes(entry.file) || componentExports.length !== 1 ? entry.file : componentExports[0];
  const hooks = entry.values.filter((name) => /^use[A-Z]/.test(name));

  // Files like Glyphs export a family of components without stories of their own.
  const recipe = recipeFor(primary, recipes);
  components.push({
    name: primary,
    file: entry.file,
    exports: componentExports,
    hooks,
    types: entry.types,
    group: stories.title ? stories.title.split('/')[0] : null,
    storyTitle: stories.title,
    client: /^\s*['"]use client['"]/.test(source),
    summary: summaryOf(source, primary),
    recipe,
    variants: recipe ? recipes[recipe] : null,
    dts: read(dtsPath).trim(),
    examples: stories.examples,
  });
}

mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, 'catalog.json'),
  JSON.stringify({ package: pkg.name, version: pkg.version, components, helpers }, null, 2) + '\n',
);
writeFileSync(join(out, 'theme.json'), JSON.stringify(parseTheme(read(join(tokensDir, 'index.css'))), null, 2) + '\n');
copyFileSync(join(reactDir, 'guides', 'building-with-becket.md'), join(out, 'guidelines.md'));

console.log(`mcp data: ${components.length} component files, ${components.reduce((n, c) => n + c.exports.length, 0)} component exports, @becket-ui/react ${pkg.version}`);
