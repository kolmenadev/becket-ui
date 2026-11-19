import { formatOklch, parseColorAlpha } from './color.mjs';

export {
  colorDistance,
  contrastRatio,
  formatHex,
  formatOklch,
  parseColor,
  parseColorAlpha,
  rgbToOklch,
  toGamut,
} from './color.mjs';
export { contrastPairs, checkBecketThemeContrast, resolveBecketColors } from './contrast.mjs';
export { deriveBecketTheme } from './derive.mjs';

const PREFIX = '--beckui--';

const COLOR_FLAT = [
  'primary',
  'secondary',
  'tertiary',
  'primaryHover',
  'lightBackground',
  'lightText',
  'warning',
  'success',
];

const COLOR_THEMED = [
  'background',
  'text',
  'muted',
  'border',
  'danger',
  'accent',
  'surface',
  'link',
  'linkHover',
  'linkVisited',
];
const NEUTRAL_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const DENSITY_SIZES = {
  button: ['sm', 'md'],
  field: ['sm', 'md', 'lg'],
  tag: ['sm', 'md', 'lg'],
};

function kebab(value) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function cssVar(parts) {
  return `${PREFIX}${parts.map(kebab).join('-')}`;
}

function assertAllowedKeys(object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.includes(key)) {
      throw new Error(`Unknown Becket theme key "${label}.${key}"`);
    }
  }
}

// Every value is checked against its kind's grammar rather than escaped: CSS has no safe generic
// escape for a declaration value. Errors quote only a prefix, so a hostile value isn't echoed whole.
// Returns a list (empty for an empty value) so callers can flatMap their declarations.
function toDecls({ name, path, value, kind }) {
  if (value == null || value === '') return [];
  // Converted once, so a value whose toString changes can't pass the check and write something else.
  const text = String(value);
  if (kind === 'color') {
    // `value`, not `text`: parseColorAlpha rejects anything that isn't a string.
    const parsed = parseColorAlpha(value);
    if (!parsed) {
      throw new Error(
        `Not a CSS color at ${path}: ${JSON.stringify(text.slice(0, 40))}. Use hex, rgb(), hsl() or oklch().`,
      );
    }
    // Written from the parsed color, never the raw string, so nothing else can ride along with it.
    return [
      `  ${name}: ${
        parsed.alpha < 1
          ? `${formatOklch(parsed.color).slice(0, -1)} / ${Number(parsed.alpha.toFixed(3))})`
          : formatOklch(parsed.color)
      };`,
    ];
  }
  if (
    !(
      kind === 'length'
        ? /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%)?$/
        : /^(?:[A-Za-z0-9_-]+|'[A-Za-z0-9 ._-]+'|"[A-Za-z0-9 ._-]+")(?:\s*,\s*(?:[A-Za-z0-9_-]+|'[A-Za-z0-9 ._-]+'|"[A-Za-z0-9 ._-]+"))*$/
    ).test(text)
  ) {
    throw new Error(
      `Not a CSS ${kind} at ${path}: ${JSON.stringify(text.slice(0, 40))}. ${
        kind === 'length'
          ? 'Use a number with px, rem, em or %.'
          : "Use font names separated by commas, quoted when they contain spaces ('Segoe UI')."
      }`,
    );
  }
  return [`  ${name}: ${text};`];
}

function sheet(selector, decls) {
  if (!decls.length) return '';
  return `${selector} {\n${decls.join('\n')}\n}\n`;
}

/**
 * Emit unlayered `:root` / `html[data-theme='light']` overrides. Import or
 * inject **after** `@becket-ui/tokens/index.css` so these win over `@layer tokens`.
 *
 * @param {import('./index.d.ts').BecketTheme} config
 * @returns {string}
 */
export function defineBecketTheme(config = {}) {
  assertAllowedKeys(
    config,
    ['colors', 'radii', 'fontSizes', 'spacing', 'sizes', 'fonts', 'density'],
    'theme',
  );

  if (config.colors) {
    assertAllowedKeys(config.colors, [...COLOR_FLAT, ...COLOR_THEMED, 'neutral'], 'colors');
  }
  if (config.density) assertAllowedKeys(config.density, Object.keys(DENSITY_SIZES), 'density');
  // Read twice below, for :root and the light block; inlined, every color would be parsed twice.
  const colorsByKey = [...COLOR_FLAT, ...COLOR_THEMED].map((key) => {
    const value = config.colors?.[key];
    const name = cssVar(['colors', key]);
    // A plain string goes in :root, which applies in light too unless a light value overrides it.
    if (value == null || typeof value !== 'object') {
      return { root: toDecls({ name, path: `colors.${key}`, value, kind: 'color' }), light: [] };
    }
    if (COLOR_FLAT.includes(key)) throw new Error(`colors.${key} must be a CSS color string`);
    return {
      root: toDecls({ name, path: `colors.${key}.dark`, value: value.dark, kind: 'color' }),
      light: toDecls({ name, path: `colors.${key}.light`, value: value.light, kind: 'color' }),
    };
  });
  if (config.colors?.neutral) {
    assertAllowedKeys(config.colors.neutral, NEUTRAL_STEPS, 'colors.neutral');
  }

  const css = `${sheet(':root', [
    ...colorsByKey.flatMap(({ root }) => root),
    ...NEUTRAL_STEPS.flatMap((step) =>
      toDecls({
        name: cssVar(['colors', 'neutral', step]),
        path: `colors.neutral.${step}`,
        value: config.colors?.neutral?.[step],
        kind: 'color',
      }),
    ),
    // Same shape for every group; cssVar kebab-cases `fontSizes` to `font-sizes`.
    ...[
      ['radii', ['none', 'sm', 'md', 'lg', 'xl', 'full'], 'length'],
      // `base` rescales the whole type scale; the steps are ratios of it.
      [
        'fontSizes',
        ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
        'length',
      ],
      // `unit` rescales every Fibonacci spacing and size step; `textUnit` the em-based text spacing.
      ['spacing', ['unit', 'textUnit', 'xs', 'sm', 'md', 'lg', 'xl'], 'length'],
      ['sizes', ['field'], 'length'],
      ['fonts', ['sans', 'mono'], 'font family'],
    ].flatMap(([group, keys, kind]) => {
      if (!config[group]) return [];
      assertAllowedKeys(config[group], keys, group);
      return keys.flatMap((key) =>
        toDecls({
          name: cssVar([group, key]),
          path: `${group}.${key}`,
          value: config[group][key],
          kind,
        }),
      );
    }),
    ...Object.keys(DENSITY_SIZES).flatMap((component) => {
      const sizes = config.density?.[component];
      if (!sizes) return [];
      assertAllowedKeys(sizes, DENSITY_SIZES[component], `density.${component}`);
      return DENSITY_SIZES[component].flatMap((size) => {
        const box = sizes[size];
        if (!box) return [];
        assertAllowedKeys(box, ['px', 'py'], `density.${component}.${size}`);
        return ['px', 'py'].flatMap((axis) =>
          toDecls({
            name: `--beckui-${component}-${axis}-${size}`,
            path: `density.${component}.${size}.${axis}`,
            value: box[axis],
            kind: 'length',
          }),
        );
      });
    }),
  ])}${sheet(
    "html[data-theme='light']",
    colorsByKey.flatMap(({ light }) => light),
  )}`;
  if (!css) {
    return '/* defineBecketTheme: empty config, Becket defaults unchanged */\n';
  }
  return css;
}

export const BECKET_PUBLIC_COLOR_KEYS = [...COLOR_FLAT, ...COLOR_THEMED];
export const BECKET_PUBLIC_NEUTRAL_STEPS = NEUTRAL_STEPS;
