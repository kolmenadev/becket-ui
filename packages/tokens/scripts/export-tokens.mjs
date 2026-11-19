import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import {
  contrastPairs,
  contrastRatio,
  formatHex,
  formatOklch,
  parseColor,
} from '@becket-ui/tokens/theme';

const { values: options } = parseArgs({
  options: {
    preset: { type: 'string' },
    'root-px': { type: 'string', default: '16' },
    manifest: { type: 'string' },
    'tokens-json': { type: 'string' },
  },
});

function fail(message) {
  console.error(`export-tokens: ${message}`);
  process.exit(1);
}

if (!(Number(options['root-px']) > 0))
  fail(`--root-px needs a positive number of pixels, got "${options['root-px']}"`);
// No default paths: each package's build writes the output it owns, so Turbo caches and restores it
// with that package.
if (!options.manifest && !options['tokens-json'])
  fail('name an output: --manifest <path>, --tokens-json <path> or both');

const { becketPreset } = await import(
  options.preset ? pathToFileURL(resolve(options.preset)).href : '@becket-ui/tokens/preset'
);

const leaves = new Map();
function collect(node, segments) {
  // Panda writes breakpoints as plain strings and every other token as `{ value }`.
  if (typeof node === 'string' || 'value' in node) {
    const path = segments.join('.');
    if (leaves.has(path)) fail(`${path} is defined twice`);
    leaves.set(path, { segments, source: typeof node === 'string' ? node : node.value });
    return;
  }
  for (const [key, child] of Object.entries(node)) collect(child, [...segments, key]);
}
// `colors` is a family in both tokens and semanticTokens, so each tree is walked on its own.
for (const tree of [
  becketPreset.theme.extend.tokens,
  becketPreset.theme.extend.semanticTokens,
  { breakpoints: becketPreset.theme.extend.breakpoints },
])
  collect(tree, []);

function resolvePath({ path, mode, from, depth = 0 }) {
  const leaf = leaves.get(path);
  if (!leaf) fail(`${from}: alias {${path}} does not resolve`);
  if (depth > 8) fail(`${from} refers to itself`);
  const source =
    typeof leaf.source === 'object'
      ? leaf.source[mode === 'dark' ? 'base' : '_light']
      : leaf.source;
  if (typeof source !== 'string') fail(`${from}: ${path} has no ${mode} value`);
  const reference = (target) => resolvePath({ path: target, mode, from, depth: depth + 1 });

  if (leaf.segments[0] === 'colors') {
    const alias = source.match(/^\{([\w.-]+)\}$/);
    if (alias) return reference(alias[1]);
    // OKLCH mix with white: white has no hue, so the hue stays the base's (CSS powerless hue).
    const mix = source.match(/^color-mix\(in oklch, \{([\w.-]+)\} ([\d.]+)%, white\)$/);
    if (mix) {
      const base = reference(mix[1]);
      const share = Number(mix[2]) / 100;
      return { L: base.L * share + (1 - share), C: base.C * share, h: base.h };
    }
    return parseColor(source) ?? fail(`${from}: can't parse the color "${source}"`);
  }

  const calc = source.match(/^calc\(\{([\w.-]+)\} \* ([\d.]+)\)$/);
  if (calc) {
    // String() turns a color object into text the pattern rejects, so it fails with the token named.
    const [, magnitude, unit] =
      String(reference(calc[1])).match(/^(-?[\d.]+)(\D*)$/) ??
      fail(`${from}: calc() can only scale a length, and {${calc[1]}} isn't one`);
    return `${Number((magnitude * calc[2]).toFixed(4))}${unit}`;
  }
  return source.replace(/\{([\w.-]+)\}/g, (_, target) => {
    const resolved = reference(target);
    return typeof resolved === 'string' ? resolved : formatOklch(resolved);
  });
}

const entries = new Map();
const colors = new Map();
const artifactOwners = new Map();
for (const [path, leaf] of leaves) {
  const [dark, light] = ['dark', 'light'].map((mode) => resolvePath({ path, mode, from: path }));
  const [darkText, lightText] = [dark, light].map((color) =>
    typeof color === 'string' ? color : formatOklch(color),
  );
  if (typeof dark !== 'string') colors.set(path, { dark, light });
  // Only an alias, `calc(ref * n)` and `color-mix(in oklch, ref n%, white)` are resolved; anything
  // else would reach the outputs as an unresolved expression.
  for (const text of [darkText, lightText])
    if (/calc\(|color-mix\(/.test(text)) fail(`${path}: unsupported expression "${text}"`);

  // lightBackground and lightText are @deprecated in a source comment only, which the built preset
  // drops, so they're named here. A var() value depends on the page, which no design tool can hold.
  const isTargetless =
    ['colors.lightBackground', 'colors.lightText'].includes(path) || darkText.includes('var(');
  // Families without a prefix (font sizes, weights, gradients…) reach the artifact as type styles
  // or not at all.
  const prefix = isTargetless
    ? undefined
    : {
        colors: '',
        spacing: 'space-',
        sizes: 'size-',
        radii: 'radius-',
        shadows: 'shadow-',
        breakpoints: 'breakpoint-',
      }[leaf.segments[0]];
  const artifact = prefix === undefined ? null : `${prefix}${leaf.segments.slice(1).join('-')}`;
  if (artifact && artifactOwners.has(artifact))
    fail(`duplicate artifact name "${artifact}": ${artifactOwners.get(artifact)} and ${path}`);
  if (artifact) artifactOwners.set(artifact, path);

  entries.set(path, {
    panda: path,
    css: `--beckui--${leaf.segments
      .map((segment) => segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`))
      .join('-')}`,
    // Figma has no em or ch unit, so relative values stay out of the variables.
    figma: isTargetless || /^-?[\d.]+(em|ch)$/.test(darkText) ? null : leaf.segments.join('/'),
    artifact,
    type:
      {
        colors: 'color',
        gradients: 'gradient',
        fontWeights: 'fontWeight',
        lineHeights: 'number',
        fonts: 'fontFamily',
        shadows: 'shadow',
      }[leaf.segments[0]] ?? 'dimension',
    dark: darkText,
    light: lightText,
    source: leaf.source,
  });
}

const mixed = colors.get('colors.primaryHover')?.dark;
const written = colors.get('colors.linkHover')?.dark;
if (!mixed || !written) fail('the self-test needs colors.primaryHover and colors.linkHover');
const delta = {
  L: Math.abs(mixed.L - written.L),
  C: Math.abs(mixed.C - written.C),
  h: Math.abs(mixed.h - written.h),
};
// linkHover.base is primaryHover written to two decimals, so rounding alone can move L and C by
// 0.005. Written as a negated <= so a NaN delta fails too.
if (!(delta.L <= 0.005) || !(delta.C <= 0.005) || !(delta.h <= 0.5))
  fail(
    `self-test failed: primaryHover resolves to ${formatOklch(mixed)}, linkHover.base is ${formatOklch(written)}`,
  );

const failures = [];
let requiredChecked = 0;
let advisoryBelow = 0;
for (const mode of ['dark', 'light']) {
  for (const pair of contrastPairs) {
    const ratio = contrastRatio(
      ...[pair.foreground, pair.background].map((key) =>
        formatHex(colors.get(`colors.${key}`)?.[mode] ?? fail(`contrast pair needs colors.${key}`)),
      ),
    );
    if (pair.level === 'advisory') {
      if (ratio < pair.minimum) advisoryBelow += 1;
      continue;
    }
    requiredChecked += 1;
    if (ratio < pair.minimum)
      failures.push(
        `${mode} ${pair.use}: ${ratio.toFixed(2)} after hex rounding, needs ${pair.minimum}`,
      );
  }
}
if (requiredChecked === 0) fail('the contrast gate found no required pair to check');
if (failures.length > 0) fail(`contrast gate failed:\n  ${failures.join('\n  ')}`);

const list = {
  name: 'Becket UI',
  version: 1,
  color: {
    themes: [
      { id: 'dark', name: 'Dark' },
      { id: 'light', name: 'Light' },
    ],
    tokens: [],
  },
  // fonts hold woff2 files, which the artifact producer adds.
  type: { fonts: [], families: {}, groups: [] },
  spacing: { tokens: [] },
  size: { tokens: [] },
  radius: { tokens: [] },
  shadow: { tokens: [] },
  breakpoint: { tokens: [] },
};
// The source keeps these as comments, which the built preset drops, so the descriptions live here.
// style-check keep: inlining would rebuild the table on every pass of the loop below.
const colorUsage = {
  'colors.brand.becketYellow':
    'Primary brand hue. Filled buttons and badges; always neutral-900 ink on it.',
  'colors.brand.hiveSage': 'Secondary brand hue.',
  'colors.brand.combAmber': 'Tertiary brand hue; gradient end.',
  'colors.primary': 'Primary brand color. Alias of brand-becketYellow.',
  'colors.secondary': 'Secondary brand color. Alias of brand-hiveSage.',
  'colors.tertiary': 'Tertiary brand color. Alias of brand-combAmber.',
  'colors.primaryHover': 'Hover fill for primary: 88% primary mixed with white.',
  'colors.black': 'Near-black.',
  'colors.white': 'Near-white.',
  'colors.border': 'Default border. Alias of neutral-200.',
  'colors.warning': 'Warning state, lighter orange than tertiary.',
  'colors.success': 'Success state, hue clear of secondary.',
  'colors.background': 'Page background.',
  'colors.text': 'Body text on background.',
  'colors.muted': 'Secondary text on background.',
  'colors.surface': 'Dialog, field and menu fill.',
  'colors.danger': 'Error text and borders only.',
  'colors.accent': 'Sage text on the canvas: outline Button, Badge and Tag.',
  'colors.link': 'Link text.',
  'colors.linkHover': 'Link text on hover.',
  'colors.linkVisited': 'Visited link text.',
};
for (const entry of entries.values()) {
  if (!entry.artifact) continue;
  if (entry.type === 'color') {
    const [dark, light] = ['dark', 'light'].map((mode) => {
      const alias = (
        typeof entry.source === 'object'
          ? entry.source[mode === 'dark' ? 'base' : '_light']
          : entry.source
      ).match(/^\{(colors\.[\w.-]+)\}$/);
      const target = alias && entries.get(alias[1]);
      return target?.artifact ? `{${target.artifact}}` : entry[mode];
    });
    // Only neutral steps share a generated line, so a new color can't ship with a wrong description.
    const usage =
      colorUsage[entry.panda] ??
      (entry.panda.startsWith('colors.neutral.')
        ? `Neutral scale step ${entry.panda.split('.').at(-1)}.`
        : undefined);
    if (!usage)
      fail(`${entry.panda} has no usage line for the artifact list; add it to colorUsage`);
    list.color.tokens.push({
      name: entry.artifact,
      value: typeof entry.source === 'object' ? { dark, light } : dark,
      usage: `CSS: \`var(${entry.css})\`. ${usage}`,
    });
    continue;
  }
  // The artifact's value grammar takes plain numeric arguments, so 0% lightness becomes 0.
  const normalized = entry.dark.replace(
    /oklch\(([\d.]+)%/g,
    (_, lightness) => `oklch(${Number(lightness) / 100}`,
  );
  list[
    {
      spacing: 'spacing',
      sizes: 'size',
      radii: 'radius',
      shadows: 'shadow',
      breakpoints: 'breakpoint',
    }[entry.panda.split('.')[0]]
  ].tokens.push({
    name: entry.artifact,
    value: normalized,
    usage: `CSS: \`var(${entry.css})\`. ${normalized}${entry.dark.endsWith('rem') ? `, ${Number.parseFloat(entry.dark) * Number(options['root-px'])}px at a ${options['root-px']}px root` : ''}.`,
  });
}

function resolveDark(path) {
  return entries.get(path)?.dark ?? fail(`a type style needs ${path}, which the preset lacks`);
}
const { heading } = becketPreset.theme.extend.recipes;
list.type.families = { sans: resolveDark('fonts.sans'), mono: resolveDark('fonts.mono') };
list.type.groups.push(
  {
    name: 'Heading',
    family: 'sans',
    styles: Object.entries(heading.variants.size).map(([size, style]) => ({
      name: `heading-${size}`,
      fontSize: resolveDark(`fontSizes.${style.fontSize}`),
      lineHeight: Number(resolveDark(`lineHeights.${heading.base.lineHeight}`)),
      fontWeight: Number(resolveDark(`fontWeights.${heading.base.fontWeight}`)),
    })),
  },
  // Text has no recipe (it takes style props), so its styles are listed here.
  {
    name: 'Text',
    family: 'sans',
    styles: ['xs', 'sm', 'md', 'lg'].map((size) => ({
      name: `body-${size}`,
      fontSize: resolveDark(`fontSizes.${size}`),
      lineHeight: Number(resolveDark('lineHeights.normal')),
      fontWeight: Number(resolveDark('fontWeights.normal')),
    })),
  },
);

console.log(
  `export-tokens: ${entries.size} manifest entries, ` +
    `${[...entries.values()].filter((entry) => entry.figma).length} with a Figma name, ` +
    `${artifactOwners.size} with an artifact name`,
);
console.log(
  `self-test: primaryHover ${formatOklch(mixed)} vs linkHover.base ${formatOklch(written)} ` +
    `(dL ${delta.L.toFixed(4)}, dC ${delta.C.toFixed(4)}, dh ${delta.h.toFixed(2)})`,
);
console.log(
  `contrast: ${requiredChecked} required pair checks pass after hex rounding; ` +
    `${advisoryBelow} advisory checks sit below their minimum`,
);
for (const [path, contents] of [
  [options['tokens-json'], list],
  [options.manifest, [...entries.values()]],
]) {
  if (!path) continue;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(contents, null, 2)}\n`);
  console.log(`wrote ${path}`);
}
