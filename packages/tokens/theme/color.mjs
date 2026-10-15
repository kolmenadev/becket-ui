/**
 * Color parsing, OKLCH conversion and WCAG 2 contrast. Shared by the contrast test, the theme
 * checker and palette derivation so every one of them measures with the same math.
 */

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTION = /^(rgba?|hsla?|oklch)\(\s*([^)]*)\)$/i;

const NAMED = {
  black: '#000000',
  white: '#ffffff',
};

/** @param {number} value */
const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** sRGB channel (0–1) → linear light. */
function toLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Linear light → sRGB channel (0–1). */
function fromLinear(channel) {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** Linear sRGB → OKLCH (CSS Color 4). */
function linearToOklch([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  // Grays have no meaningful hue; 0 keeps the output stable.
  const h = C < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { L, C: C < 1e-4 ? 0 : C, h };
}

/** OKLCH → linear sRGB, unclamped (channels outside 0–1 mean out of gamut). */
function oklchToLinear({ L, C, h }) {
  const radians = (h * Math.PI) / 180;
  const a = C * Math.cos(radians);
  const b = C * Math.sin(radians);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = (((hue % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = lightness - chroma / 2;
  const [r, g, b] =
    sector < 1 ? [chroma, x, 0]
    : sector < 2 ? [x, chroma, 0]
    : sector < 3 ? [0, chroma, x]
    : sector < 4 ? [0, x, chroma]
    : sector < 5 ? [x, 0, chroma]
    : [chroma, 0, x];
  return [r + offset, g + offset, b + offset];
}

/** "50%" → 0.5 of `scale`, "0.5" → 0.5. */
function number(part, scale = 1) {
  const value = part.trim();
  if (value === 'none') return 0;
  if (value.endsWith('%')) return (Number.parseFloat(value) / 100) * scale;
  return Number.parseFloat(value);
}

/** Split `1 2 3 / 0.5` or `1, 2, 3, 0.5` into the three color channels (alpha dropped). */
function channels(body) {
  const withoutAlpha = body.split('/')[0];
  const parts = withoutAlpha.includes(',') ? withoutAlpha.split(',') : withoutAlpha.trim().split(/\s+/);
  return parts.slice(0, 3);
}

/**
 * Parse a CSS color (hex, rgb(), hsl(), oklch(), black, white) into OKLCH.
 * Alpha is ignored: Becket brand tokens are opaque.
 *
 * @param {string} input
 * @returns {{ L: number, C: number, h: number } | null} null when the format isn't supported
 */
export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const value = (NAMED[input.trim().toLowerCase()] ?? input).trim();

  const hex = value.match(HEX);
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
    const rgb = [0, 2, 4].map((start) => Number.parseInt(digits.slice(start, start + 2), 16) / 255);
    return linearToOklch(rgb.map(toLinear));
  }

  const fn = value.match(FUNCTION);
  if (!fn) return null;
  const kind = fn[1].toLowerCase();
  const parts = channels(fn[2]);
  if (parts.length !== 3) return null;

  if (kind.startsWith('rgb')) {
    const rgb = parts.map((part) => clamp01(number(part, 255) / 255));
    if (rgb.some(Number.isNaN)) return null;
    return linearToOklch(rgb.map(toLinear));
  }
  if (kind.startsWith('hsl')) {
    const [hue, saturation, lightness] = [Number.parseFloat(parts[0]), number(parts[1]), number(parts[2])];
    if ([hue, saturation, lightness].some(Number.isNaN)) return null;
    return linearToOklch(hslToRgb(hue, clamp01(saturation), clamp01(lightness)).map(toLinear));
  }
  const [L, C, h] = [number(parts[0]), number(parts[1], 0.4), number(parts[2])];
  if ([L, C, h].some(Number.isNaN)) return null;
  return { L: clamp01(L), C: Math.max(0, C), h: ((h % 360) + 360) % 360 };
}

/** @param {{ L: number, C: number, h: number }} color */
export function isInGamut(color) {
  return oklchToLinear(color).every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);
}

/**
 * Bring a color into sRGB by lowering chroma only, keeping lightness and hue. That keeps
 * contrast predictable, which matters more here than keeping saturation.
 *
 * @param {{ L: number, C: number, h: number }} color
 */
export function toGamut(color) {
  if (isInGamut(color)) return color;
  let [low, high] = [0, color.C];
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (isInGamut({ ...color, C: middle })) low = middle;
    else high = middle;
  }
  return { ...color, C: low };
}

/** @param {{ L: number, C: number, h: number }} color */
export function formatOklch({ L, C, h }) {
  const round = (value, digits) => Number(value.toFixed(digits));
  return `oklch(${round(L, 4)} ${round(C, 4)} ${round(C === 0 ? 0 : h, 2)})`;
}

/** @param {{ L: number, C: number, h: number }} color */
export function formatHex(color) {
  const rgb = oklchToLinear(toGamut(color)).map((channel) => Math.round(clamp01(fromLinear(clamp01(channel))) * 255));
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * WCAG 2 relative luminance. Channels are clamped to sRGB first, as a browser would display them.
 *
 * @param {{ L: number, C: number, h: number }} color
 */
export function luminance(color) {
  const [r, g, b] = oklchToLinear(color).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2 contrast ratio between two colors (CSS strings or parsed OKLCH), 1–21.
 *
 * @param {string | { L: number, C: number, h: number }} foreground
 * @param {string | { L: number, C: number, h: number }} background
 */
export function contrastRatio(foreground, background) {
  const [first, second] = [foreground, background].map((color) => {
    const parsed = typeof color === 'string' ? parseColor(color) : color;
    if (!parsed) throw new Error(`Can't read the color "${color}". Use hex, rgb(), hsl() or oklch().`);
    return luminance(parsed);
  });
  const [high, low] = first > second ? [first, second] : [second, first];
  return (high + 0.05) / (low + 0.05);
}

/**
 * Perceptual distance (ΔE OK, Euclidean in OKLab). Around 0.02 is a just-noticeable difference.
 *
 * @param {{ L: number, C: number, h: number }} first
 * @param {{ L: number, C: number, h: number }} second
 */
export function colorDistance(first, second) {
  const lab = ({ L, C, h }) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
  const [a, b] = [lab(first), lab(second)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * The OKLCH color for an sRGB triplet (0–255). Used by image decoders.
 *
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
export function rgbToOklch(red, green, blue) {
  return linearToOklch([red, green, blue].map((channel) => toLinear(channel / 255)));
}
