/**
 * Turn one to three brand colors into a full Becket color theme that passes WCAG 2.2 AA in
 * dark and light. Works in OKLCH and only moves lightness (and chroma when a lighter or darker
 * shade leaves sRGB), so the brand hue never changes.
 */

import { contrastRatio, formatOklch, parseColor, toGamut } from './color.mjs';
import { checkBecketThemeContrast, resolveBecketColors } from './contrast.mjs';

const NEUTRAL_LIGHTNESS = {
  50: 0.96,
  100: 0.94,
  200: 0.89,
  300: 0.84,
  400: 0.75,
  500: 0.65,
  600: 0.55,
  700: 0.45,
  800: 0.35,
  900: 0.22,
};
// A whisper of the brand hue in the grays, like the default theme's warm neutrals. Below this
// the tint is invisible; above it grays start to read as a color.
const NEUTRAL_CHROMA = 0.012;
// Aim slightly above 4.5:1 so values rounded for CSS still pass.
const TEXT = 4.6;
const STEP = 0.005;

const hue = (degrees) => ((degrees % 360) + 360) % 360;
const shift = (color, degrees) => ({ ...color, h: hue(color.h + degrees) });

/**
 * Move a color's lightness in one direction, one small step at a time, until it reaches
 * `minimum` against every color in `against`. Returns the color unchanged when it already
 * passes, or null when no lightness in that direction works.
 */
function fitLightness({ color, against, minimum, direction }) {
  const passes = (candidate) =>
    against.every((other) => contrastRatio(candidate, other) >= minimum);
  if (passes(toGamut(color))) return toGamut(color);
  for (let L = color.L; L >= 0 && L <= 1; L += direction === 'lighter' ? STEP : -STEP) {
    const candidate = toGamut({ ...color, L });
    if (passes(candidate)) return candidate;
  }
  return null;
}

function describe(color) {
  return `L ${color.L.toFixed(2)}`;
}

/**
 * @param {import('./index.d.ts').DeriveBecketThemeInput} input
 * @returns {import('./index.d.ts').DerivedBecketTheme}
 */
export function deriveBecketTheme({ brand, pinned = {} }) {
  if (!Array.isArray(brand) || brand.length === 0 || brand.length > 3) {
    throw new Error('Pass one to three brand colors, most important first.');
  }
  const seeds = brand.map((value) => {
    const color = parseColor(value);
    if (!color)
      throw new Error(`Can't read the brand color "${value}". Use hex, rgb(), hsl() or oklch().`);
    return color;
  });
  const [primarySeed] = seeds;
  // With fewer than three colors, follow the default theme's shape: secondary is the brand hue
  // turned ~45° and tertiary ~30° the other way, at the same lightness and chroma.
  const secondarySeed = seeds[1] ?? shift(primarySeed, 45);
  const tertiarySeed = seeds[2] ?? shift(primarySeed, -30);

  const notes = [];
  const colors = {};
  const note = (token, reason) => notes.push({ token, reason });

  const neutral = {};
  const tint = primarySeed.C < 0.02 ? 0 : NEUTRAL_CHROMA;
  for (const [step, L] of Object.entries(NEUTRAL_LIGHTNESS)) {
    neutral[step] = formatOklch({ L, C: tint, h: tint ? primarySeed.h : 0 });
  }
  colors.neutral = neutral;
  colors.muted = { light: formatOklch({ L: 0.53, C: tint, h: tint ? primarySeed.h : 0 }) };
  note(
    'neutral',
    tint
      ? `Grays tinted toward the brand hue (${primarySeed.h.toFixed(0)}°), lightness unchanged.`
      : 'The brand is near-gray, so neutrals stay untinted.',
  );

  // Fit everything against the canvases the user will actually see, pinned ones included.
  const canvases = resolveBecketColors({ colors: { ...colors, ...pinned } });
  const dark = [canvases.dark.background, canvases.dark.surface];
  const light = [canvases.light.background, canvases.light.surface];
  const ink = canvases.dark['neutral.900'];

  const fill = (token, seed, label) => {
    const fitted = fitLightness({
      color: seed,
      against: [ink],
      minimum: TEXT,
      direction: 'lighter',
    });
    colors[token] = formatOklch(fitted);
    if (fitted.L !== seed.L)
      note(
        token,
        `${label} lightened from ${describe(seed)} to ${describe(fitted)} so dark button labels reach 4.5:1.`,
      );
    else note(token, `${label} used as is.`);
  };
  fill('primary', primarySeed, 'Brand color 1');
  fill(
    'secondary',
    secondarySeed,
    seeds[1] ? 'Brand color 2' : 'Derived from brand color 1 (hue +45°)',
  );
  fill(
    'tertiary',
    tertiarySeed,
    seeds[2] ? 'Brand color 3' : 'Derived from brand color 1 (hue −30°)',
  );

  const onCanvas = ({ token, seed, label }) => {
    const darkFit = fitLightness({
      color: seed,
      against: dark,
      minimum: TEXT,
      direction: 'lighter',
    });
    const lightFit = fitLightness({
      color: seed,
      against: light,
      minimum: TEXT,
      direction: 'darker',
    });
    if (!darkFit || !lightFit) {
      note(
        token,
        `${label} can't reach 4.5:1 on your pinned canvas in ${darkFit ? 'light' : 'dark'}; left at the Becket default.`,
      );
      return null;
    }
    colors[token] = { dark: formatOklch(darkFit), light: formatOklch(lightFit) };
    const exact = [darkFit.L === seed.L && 'dark', lightFit.L === seed.L && 'light'].filter(
      Boolean,
    );
    note(
      token,
      exact.length === 2
        ? `${label} used as is in both themes.`
        : exact.length === 1
          ? `${label} used as is in ${exact[0]}; a ${exact[0] === 'dark' ? 'darker' : 'lighter'} shade (${describe(exact[0] === 'dark' ? lightFit : darkFit)}) in ${exact[0] === 'dark' ? 'light' : 'dark'} for 4.5:1 on the canvas.`
          : `${label} shaded per theme (dark ${describe(darkFit)}, light ${describe(lightFit)}) for 4.5:1 on the canvas.`,
    );
    return { dark: darkFit, light: lightFit };
  };
  const link = onCanvas({ token: 'link', seed: primarySeed, label: 'Brand color 1' });
  onCanvas({
    token: 'linkVisited',
    seed: secondarySeed,
    label: seeds[1] ? 'Brand color 2' : 'The derived secondary',
  });
  onCanvas({
    token: 'accent',
    seed: secondarySeed,
    label: seeds[1] ? 'Brand color 2' : 'The derived secondary',
  });
  if (link) {
    // Hover moves away from the canvas, so it keeps (and gains) contrast.
    const darkHover = toGamut({ ...link.dark, L: Math.min(1, link.dark.L + 0.06) });
    const lightHover = fitLightness({
      color: { ...link.light, L: Math.max(0, link.light.L - 0.08) },
      against: light,
      minimum: TEXT,
      direction: 'darker',
    });
    colors.linkHover = { dark: formatOklch(darkHover), light: formatOklch(lightHover) };
    note('linkHover', 'The link color a step lighter on dark and a step darker on light.');
  }

  // Body text only moves when a pinned canvas breaks it; otherwise the neutral ladder already passes.
  for (const token of ['text', 'muted']) {
    if (pinned[token]) continue;
    const current = resolveBecketColors({ colors: { ...colors, ...pinned } });
    const darkFit = fitLightness({
      color: current.dark[token],
      against: dark,
      minimum: TEXT,
      direction: 'lighter',
    });
    const lightFit = fitLightness({
      color: current.light[token],
      against: light,
      minimum: TEXT,
      direction: 'darker',
    });
    if (darkFit.L === current.dark[token].L && lightFit.L === current.light[token].L) continue;
    colors[token] = { dark: formatOklch(darkFit), light: formatOklch(lightFit) };
    note(token, 'Adjusted so it stays at 4.5:1 on your pinned canvas.');
  }

  const near = (color, degrees) =>
    Math.min(Math.abs(color.h - degrees), 360 - Math.abs(color.h - degrees));
  if (primarySeed.C >= 0.08 && near(primarySeed, 25) < 20) {
    note(
      'danger',
      'Your brand is red, like error text. Danger stays Becket red; make sure errors also carry an icon or text, not color alone.',
    );
  }

  for (const [token, value] of Object.entries(pinned)) {
    if (token === 'neutral') colors.neutral = { ...colors.neutral, ...value };
    else colors[token] = value;
    note(token, 'Pinned by you, kept exactly.');
  }

  const theme = { colors };
  return { theme, notes, contrast: checkBecketThemeContrast(theme) };
}
