/** @param {number} value */
const clamp01 = (value) => Math.min(1, Math.max(0, value));

function toLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToOklch([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    C: C < 1e-4 ? 0 : C,
    // Grays have no meaningful hue; 0 keeps the output stable.
    h: C < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
  };
}

// Unclamped: channels outside 0–1 mean out of gamut.
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

function number(part, scale = 1) {
  const value = part.trim();
  if (value === 'none') return 0;
  if (value.endsWith('%')) return (Number.parseFloat(value) / 100) * scale;
  return Number.parseFloat(value);
}

/**
 * Parse a CSS color (hex, rgb(), hsl(), oklch() or a basic color name) into OKLCH.
 * Alpha is ignored: Becket brand tokens are opaque.
 *
 * @param {string} input
 * @returns {{ L: number, C: number, h: number } | null} null when the format isn't supported
 */
export function parseColor(input) {
  return parseColorAlpha(input)?.color ?? null;
}

export function parseColorAlpha(input) {
  if (typeof input !== 'string') return null;
  // CSS's basic color names, the ones logos and SVGs use. Rarer names aren't guessed.
  const value = (
    {
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      orange: '#ffa500',
      purple: '#800080',
      gray: '#808080',
      grey: '#808080',
      navy: '#000080',
      teal: '#008080',
      maroon: '#800000',
      olive: '#808000',
      lime: '#00ff00',
      aqua: '#00ffff',
      fuchsia: '#ff00ff',
      silver: '#c0c0c0',
    }[input.trim().toLowerCase()] ?? input
  ).trim();

  const hex = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    // #abcd → #aabbccdd; the pairs are r, g, b and an optional alpha.
    // style-check keep: read twice (color and alpha); inlining would run the regex and parse again.
    const pairs = (hex[1].length <= 4 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1])
      .match(/../g)
      .map((pair) => Number.parseInt(pair, 16));
    return { color: rgbToOklch(pairs.slice(0, 3)), alpha: (pairs[3] ?? 255) / 255 };
  }

  // No `\s*` after the `(`: next to `[^)]*` it backtracks quadratically on a long run of spaces
  // without a `)`. The channels are trimmed below instead.
  const fn = value.match(/^(rgba?|hsla?|oklch)\(([^)]*)\)$/i);
  if (!fn) return null;
  // Modern `1 2 3 / 0.5` puts alpha after one slash; legacy `1, 2, 3, 0.5` in a fourth part.
  const [channelText, ...slashParts] = fn[2].split('/');
  const isLegacy = channelText.includes(',');
  const channels = isLegacy ? channelText.split(',') : channelText.trim().split(/\s+/);
  const parts = [...channels, ...slashParts].map((part) => part.trim());
  if (
    parts.length < 3 ||
    parts.length > 4 ||
    (isLegacy ? slashParts.length > 0 : channels.length !== 3) ||
    // Anchored, so `1;x` or `200x` is rejected instead of read as a number the way parseFloat would.
    !parts.every(
      (part) =>
        part === 'none' ||
        // Finite too: a channel of 309 digits, or `1e999`, reads as Infinity and would write invalid
        // CSS. The fraction and the exponent each start with a character the digits before them
        // can't take, so no two digit runs can split the same digits; `\d+\.?\d*` backtracks
        // quadratically on a long run of digits followed by a bad character. A CSS number needs
        // digits after its decimal point, so `5.` is rejected.
        (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?(?:%|deg)?$/.test(part) &&
          Number.isFinite(Number.parseFloat(part))),
    )
  )
    return null;
  const alpha = parts.length === 4 ? number(parts[3]) : 1;
  if (alpha < 0 || alpha > 1) return null;
  const kind = fn[1].toLowerCase();
  // An angle unit is valid on a hue only: the first channel of hsl() and the last of oklch().
  if (
    parts.some(
      (part, index) =>
        part.endsWith('deg') && index !== (kind.startsWith('hsl') ? 0 : kind === 'oklch' ? 2 : -1),
    )
  )
    return null;

  if (kind.startsWith('rgb')) {
    return {
      color: linearToOklch(
        parts.slice(0, 3).map((part) => toLinear(clamp01(number(part, 255) / 255))),
      ),
      alpha,
    };
  }
  if (kind.startsWith('hsl')) {
    // CSS Color 4: the comma form takes percentages only. The space form also takes a bare number,
    // on the same 0–100 scale; read as 0–1 it would clamp `hsl(0 100 50)` to white.
    if (isLegacy && !(parts[1].endsWith('%') && parts[2].endsWith('%'))) return null;
    const lightness = clamp01(number(/%$|^none$/.test(parts[2]) ? parts[2] : `${parts[2]}%`));
    // CSS Color 4 hsl() → sRGB.
    const chroma =
      (1 - Math.abs(2 * lightness - 1)) *
      clamp01(number(/%$|^none$/.test(parts[1]) ? parts[1] : `${parts[1]}%`));
    // The hue skips number(): it would read a `50%` hue as 0.5, where parseColor has always read 50.
    const sector =
      ((((parts[0] === 'none' ? 0 : Number.parseFloat(parts[0])) % 360) + 360) % 360) / 60;
    const x = chroma * (1 - Math.abs((sector % 2) - 1));
    const [r, g, b] = [
      [chroma, x, 0],
      [x, chroma, 0],
      [0, chroma, x],
      [0, x, chroma],
      [x, 0, chroma],
      [chroma, 0, x],
    ][Math.min(5, Math.floor(sector))];
    const offset = lightness - chroma / 2;
    return { color: linearToOklch([r + offset, g + offset, b + offset].map(toLinear)), alpha };
  }
  return {
    color: {
      L: clamp01(number(parts[0])),
      C: Math.max(0, number(parts[1], 0.4)),
      h: ((number(parts[2]) % 360) + 360) % 360,
    },
    alpha,
  };
}

/**
 * Bring a color into sRGB by lowering chroma only, keeping lightness and hue. That keeps
 * contrast predictable, which matters more here than keeping saturation.
 *
 * @param {{ L: number, C: number, h: number }} color
 */
export function toGamut(color) {
  // In gamut: every linear channel within 0–1, give or take float noise.
  if (oklchToLinear(color).every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4))
    return color;
  let [low, high] = [0, color.C];
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (
      oklchToLinear({ ...color, C: middle }).every(
        (channel) => channel >= -1e-4 && channel <= 1 + 1e-4,
      )
    )
      low = middle;
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
  return `#${oklchToLinear(toGamut(color))
    .map((linear) => {
      const channel = clamp01(linear);
      // Linear light → sRGB channel (the inverse of toLinear).
      return Math.round(
        clamp01(channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055) *
          255,
      )
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

/**
 * WCAG 2 contrast ratio between two colors (CSS strings or parsed OKLCH), 1–21. Channels are
 * clamped to sRGB first, as a browser would display them.
 *
 * @param {string | { L: number, C: number, h: number }} foreground
 * @param {string | { L: number, C: number, h: number }} background
 */
export function contrastRatio(foreground, background) {
  const [first, second] = [foreground, background].map((color) => {
    const parsed = typeof color === 'string' ? parseColor(color) : color;
    if (!parsed)
      throw new Error(`Can't read the color "${color}". Use hex, rgb(), hsl() or oklch().`);
    const [r, g, b] = oklchToLinear(parsed).map(clamp01);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
  const [a, b] = [first, second].map(({ L, C, h }) => [
    L,
    C * Math.cos((h * Math.PI) / 180),
    C * Math.sin((h * Math.PI) / 180),
  ]);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * The OKLCH color for an sRGB triplet (0–255). Used by image decoders.
 *
 * @param {[number, number, number]} rgb
 */
export function rgbToOklch(rgb) {
  return linearToOklch(rgb.map((channel) => toLinear(channel / 255)));
}
