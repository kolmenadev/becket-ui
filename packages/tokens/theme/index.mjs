/** Public CSS-variable theming. No Panda, no theme provider. */

const PREFIX = '--beckui--';

const COLOR_FLAT = [
  'primary',
  'secondary',
  'tertiary',
  'primaryHover',
  'lightBackground',
  'lightText',
  'danger',
  'warning',
  'success',
];

const COLOR_THEMED = ['background', 'text', 'muted', 'border'];
const NEUTRAL_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const FONT_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
const SPACING = ['xs', 'sm', 'md', 'lg', 'xl'];
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

function pushDecl(decls, name, value) {
  if (value == null || value === '') return;
  decls.push(`  ${name}: ${value};`);
}

function pushThemed(rootDecls, lightDecls, name, value) {
  if (value == null || value === '') return;
  if (typeof value === 'object') {
    if (value.dark) pushDecl(rootDecls, name, value.dark);
    if (value.light) pushDecl(lightDecls, name, value.light);
    return;
  }
  pushDecl(rootDecls, name, value);
}

function colorDecls(colors, rootDecls, lightDecls) {
  assertAllowedKeys(colors, [...COLOR_FLAT, ...COLOR_THEMED, 'neutral'], 'colors');

  for (const key of COLOR_FLAT) {
    const value = colors[key];
    if (value == null) continue;
    if (typeof value === 'object') {
      throw new Error(`colors.${key} must be a CSS color string`);
    }
    pushDecl(rootDecls, cssVar(['colors', key]), value);
  }

  for (const key of COLOR_THEMED) {
    pushThemed(rootDecls, lightDecls, cssVar(['colors', key]), colors[key]);
  }

  if (colors.neutral) {
    assertAllowedKeys(colors.neutral, NEUTRAL_STEPS, 'colors.neutral');
    for (const step of NEUTRAL_STEPS) {
      pushDecl(rootDecls, cssVar(['colors', 'neutral', step]), colors.neutral[step]);
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
      if (box.px) decls.push(`  --beckui-${component}-px-${size}: ${box.px};`);
      if (box.py) decls.push(`  --beckui-${component}-py-${size}: ${box.py};`);
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
      pushDecl(rootDecls, cssVar(['radii', key]), config.radii[key]);
    }
  }

  if (config.fontSizes) {
    assertAllowedKeys(config.fontSizes, FONT_SIZES, 'fontSizes');
    for (const key of FONT_SIZES) {
      pushDecl(rootDecls, cssVar(['font-sizes', key]), config.fontSizes[key]);
    }
  }

  if (config.spacing) {
    assertAllowedKeys(config.spacing, SPACING, 'spacing');
    for (const key of SPACING) {
      pushDecl(rootDecls, cssVar(['spacing', key]), config.spacing[key]);
    }
  }

  if (config.sizes) {
    assertAllowedKeys(config.sizes, ['field'], 'sizes');
    pushDecl(rootDecls, cssVar(['sizes', 'field']), config.sizes.field);
  }

  if (config.fonts) {
    assertAllowedKeys(config.fonts, FONTS, 'fonts');
    for (const key of FONTS) {
      pushDecl(rootDecls, cssVar(['fonts', key]), config.fonts[key]);
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
