import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * WCAG 2.2 AA text contrast (4.5:1) for semantic text colors on the surfaces
 * they sit on, in both themes, read from the built index.css.
 */
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');

function block(selector) {
  const start = css.indexOf(selector);
  assert.ok(start >= 0, `index.css has no ${selector} block`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

const vars = (text) => Object.fromEntries([...text.matchAll(/(--beckui--[\w-]+):\s*([^;}]+);?/g)].map(([, n, v]) => [n, v.trim()]));
const dark = vars(block(':where(:root, :host) {'));
const light = { ...dark, ...vars(block("[data-theme='light'] {")) };

function resolve(table, name, depth = 0) {
  const value = table[`--beckui--colors-${name}`];
  assert.ok(value, `missing --beckui--colors-${name}`);
  const nested = value.match(/^var\(--beckui--colors-([\w-]+)\)$/);
  return nested && depth < 6 ? resolve(table, nested[1], depth + 1) : value;
}

// OKLCH → linear sRGB → relative luminance (CSS Color 4 / WCAG 2).
function luminance(color) {
  const match = color.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
  assert.ok(match, `contrast test only understands oklch(), got ${color}`);
  const L = match[2] ? Number(match[1]) / 100 : Number(match[1]);
  const C = Number(match[3]);
  const h = (Number(match[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const [r, g, bl] = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(foreground, background) {
  const [high, low] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const TEXT_ON = {
  text: ['background', 'surface'],
  muted: ['background', 'surface'],
  link: ['background', 'surface'],
  'link-hover': ['background', 'surface'],
  'link-visited': ['background', 'surface'],
};

for (const [themeName, table] of [['dark', dark], ['light', light]]) {
  for (const [foreground, backgrounds] of Object.entries(TEXT_ON)) {
    for (const background of backgrounds) {
      test(`${themeName}: ${foreground} on ${background} is at least 4.5:1`, () => {
        const ratio = contrast(resolve(table, foreground), resolve(table, background));
        assert.ok(ratio >= 4.5, `${foreground} on ${background} (${themeName}) is ${ratio.toFixed(2)}:1`);
      });
    }
  }
}
