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
const RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
// `base` rescales the whole type scale; the steps are ratios of it.
const FONT_SIZES = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
// `unit` rescales every Fibonacci spacing and size step; `textUnit` the em-based text spacing.
const SPACING = ['unit', 'textUnit', 'xs', 'sm', 'md', 'lg', 'xl'];
const FONTS = ['sans', 'mono'];
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
function pushDecl({ decls, name, path, value, kind }) {
  if (value == null || value === '') return;
  if (kind === 'color') {
    const parsed = parseColorAlpha(value);
    if (!parsed) {
      throw new Error(
        `Not a CSS color at ${path}: ${JSON.stringify(String(value).slice(0, 40))}. Use hex, rgb(), hsl() or oklch().`,
      );
    }
    // Written from the parsed color, never the raw string, so nothing else can ride along with it.
    const color = formatOklch(parsed.color);
    decls.push(
      `  ${name}: ${parsed.alpha < 1 ? `${color.slice(0, -1)} / ${Number(parsed.alpha.toFixed(3))})` : color};`,
    );
    return;
  }
  if (
    !(
      kind === 'length'
        ? /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%)?$/
        : /^(?:[A-Za-z0-9_-]+|'[A-Za-z0-9 ._-]+'|"[A-Za-z0-9 ._-]+")(?:\s*,\s*(?:[A-Za-z0-9_-]+|'[A-Za-z0-9 ._-]+'|"[A-Za-z0-9 ._-]+"))*$/
    ).test(value)
  ) {
    throw new Error(
      `Not a CSS ${kind} at ${path}: ${JSON.stringify(String(value).slice(0, 40))}. ${
        kind === 'length'
          ? 'Use a number with px, rem, em or %.'
          : "Use font names separated by commas, quoted when they contain spaces ('Segoe UI')."
      }`,
    );
  }
  decls.push(`  ${name}: ${value};`);
}

function colorDecls(colors, rootDecls, lightDecls) {
  assertAllowedKeys(colors, [...COLOR_FLAT, ...COLOR_THEMED, 'neutral'], 'colors');

  for (const key of COLOR_FLAT) {
    const value = colors[key];
    if (value == null) continue;
    if (typeof value === 'object') {
      throw new Error(`colors.${key} must be a CSS color string`);
    }
    pushDecl({
      decls: rootDecls,
      name: cssVar(['colors', key]),
      path: `colors.${key}`,
      value,
      kind: 'color',
    });
  }

  for (const key of COLOR_THEMED) {
    const value = colors[key];
    if (value == null) continue;
    const name = cssVar(['colors', key]);
    if (typeof value !== 'object') {
      pushDecl({ decls: rootDecls, name, path: `colors.${key}`, value, kind: 'color' });
      continue;
    }
    pushDecl({
      decls: rootDecls,
      name,
      path: `colors.${key}.dark`,
      value: value.dark,
      kind: 'color',
    });
    pushDecl({
      decls: lightDecls,
      name,
      path: `colors.${key}.light`,
      value: value.light,
      kind: 'color',
    });
  }

  if (colors.neutral) {
    assertAllowedKeys(colors.neutral, NEUTRAL_STEPS, 'colors.neutral');
    for (const step of NEUTRAL_STEPS) {
      pushDecl({
        decls: rootDecls,
        name: cssVar(['colors', 'neutral', step]),
        path: `colors.neutral.${step}`,
        value: colors.neutral[step],
        kind: 'color',
      });
    }
  }
}

function densityDecls(density, decls) {
  assertAllowedKeys(density, ['button', 'field', 'tag'], 'density');
  for (const component of Object.keys(DENSITY_SIZES)) {
    const sizes = density[component];
    if (!sizes) continue;
    const allowed = DENSITY_SIZES[component];
    assertAllowedKeys(sizes, allowed, `density.${component}`);
    for (const size of allowed) {
      const box = sizes[size];
      if (!box) continue;
      assertAllowedKeys(box, ['px', 'py'], `density.${component}.${size}`);
      for (const axis of ['px', 'py']) {
        pushDecl({
          decls,
          name: `--beckui-${component}-${axis}-${size}`,
          path: `density.${component}.${size}.${axis}`,
          value: box[axis],
          kind: 'length',
        });
      }
    }
  }
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

  const rootDecls = [];
  const lightDecls = [];

  if (config.colors) colorDecls(config.colors, rootDecls, lightDecls);

  if (config.radii) {
    assertAllowedKeys(config.radii, RADII, 'radii');
    for (const key of RADII) {
      pushDecl({
        decls: rootDecls,
        name: cssVar(['radii', key]),
        path: `radii.${key}`,
        value: config.radii[key],
        kind: 'length',
      });
    }
  }

  if (config.fontSizes) {
    assertAllowedKeys(config.fontSizes, FONT_SIZES, 'fontSizes');
    for (const key of FONT_SIZES) {
      pushDecl({
        decls: rootDecls,
        name: cssVar(['font-sizes', key]),
        path: `fontSizes.${key}`,
        value: config.fontSizes[key],
        kind: 'length',
      });
    }
  }

  if (config.spacing) {
    assertAllowedKeys(config.spacing, SPACING, 'spacing');
    for (const key of SPACING) {
      pushDecl({
        decls: rootDecls,
        name: cssVar(['spacing', key]),
        path: `spacing.${key}`,
        value: config.spacing[key],
        kind: 'length',
      });
    }
  }

  if (config.sizes) {
    assertAllowedKeys(config.sizes, ['field'], 'sizes');
    pushDecl({
      decls: rootDecls,
      name: cssVar(['sizes', 'field']),
      path: 'sizes.field',
      value: config.sizes.field,
      kind: 'length',
    });
  }

  if (config.fonts) {
    assertAllowedKeys(config.fonts, FONTS, 'fonts');
    for (const key of FONTS) {
      pushDecl({
        decls: rootDecls,
        name: cssVar(['fonts', key]),
        path: `fonts.${key}`,
        value: config.fonts[key],
        kind: 'font family',
      });
    }
  }

  if (config.density) densityDecls(config.density, rootDecls);

  const css = `${sheet(':root', rootDecls)}${sheet("html[data-theme='light']", lightDecls)}`;
  if (!css) {
    return '/* defineBecketTheme: empty config, Becket defaults unchanged */\n';
  }
  return css;
}

export const BECKET_PUBLIC_COLOR_KEYS = [...COLOR_FLAT, ...COLOR_THEMED];
export const BECKET_PUBLIC_NEUTRAL_STEPS = NEUTRAL_STEPS;
