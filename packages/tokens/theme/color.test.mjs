import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatOklch, parseColor, parseColorAlpha } from './color.mjs';

test('parseColorAlpha rejects a channel with anything after the number', () => {
  for (const input of [
    'rgb(1;x 2 3)',
    'rgb(1 2 3;x)',
    'oklch(0.5 0.1 200x)',
    'hsl(200 50%; 50%)',
    'rgb(1, 2, 3x, 0.5)',
    'rgb(1 2 3 / 0.5;x)',
  ]) {
    assert.equal(parseColorAlpha(input), null, input);
    assert.equal(parseColor(input), null, input);
  }
});

test('parseColorAlpha rejects text before or after the color', () => {
  for (const input of [
    'rgb(1 2 3) x',
    'rgb(1 2 3); background: url(//x)',
    'x rgb(1 2 3)',
    '#112233;',
    'red; background: url(//x)',
  ]) {
    assert.equal(parseColorAlpha(input), null, input);
  }
});

test('parseColorAlpha needs exactly three channels, and a slash before a modern alpha', () => {
  for (const input of [
    'rgb(1 2 3 4)',
    'oklch(0.5 0.1 200 0.4)',
    'rgb(1 2)',
    'rgb(1, 2, 3, 0.5, 1)',
    'rgb(1 2 3 / 0.5 / 0.5)',
    'rgb(1, 2, 3 / 0.5)',
    'rgb(1 2 3 /)',
  ]) {
    assert.equal(parseColorAlpha(input), null, input);
  }
});

test('parseColorAlpha reads every number spelling the channel grammar allows, and only those', () => {
  for (const token of ['1', '1.', '1.5', '.5', '15%', '+1deg', '-.5', '01', '1.5%']) {
    assert.notEqual(parseColorAlpha(`oklch(0.5 0.1 ${token})`), null, token);
  }
  for (const token of ['.', '1..2', '1.5.', '.5.5', '+-1', '1e3', '+', '%']) {
    assert.equal(parseColorAlpha(`oklch(0.5 0.1 ${token})`), null, token);
  }
});

test('parseColorAlpha rejects a long run of digits or spaces in linear time', () => {
  for (const input of [
    `rgb(1 2 ${'1'.repeat(100000)}x)`,
    `oklch(0.5 0.1 ${'1'.repeat(100000)}.5.)`,
    `rgb(${' '.repeat(100000)}x`,
  ]) {
    // style-check keep: the timer starts before the parse it measures; inlined, it would start after.
    const start = performance.now();
    assert.equal(parseColorAlpha(input), null, input.slice(0, 12));
    // Linear parsing takes a few milliseconds; the quadratic regexes this replaces took seconds.
    assert.ok(performance.now() - start < 1000, input.slice(0, 12));
  }
});

test('parseColorAlpha rejects a channel too long to read as a finite number', () => {
  for (const input of [`oklch(0.5 ${'9'.repeat(309)} 200)`, `hsl(${'9'.repeat(309)} 50% 50%)`]) {
    assert.equal(parseColorAlpha(input), null, input.slice(0, 20));
  }
});

test('parseColorAlpha reads an alpha between 0 and 1, as a number or a percentage', () => {
  assert.equal(parseColorAlpha('rgb(1 2 3 / 40%)').alpha, 0.4);
  assert.equal(parseColorAlpha('rgba(1, 2, 3, 0.25)').alpha, 0.25);
  assert.equal(parseColorAlpha('oklch(0.5 0.1 200 / .5)').alpha, 0.5);
  assert.equal(parseColorAlpha('#11223380').alpha, 0x80 / 255);
  assert.equal(parseColorAlpha('#1238').alpha, 0x88 / 255);
  assert.equal(parseColorAlpha('#112233').alpha, 1);
  assert.equal(parseColorAlpha('navy').alpha, 1);
  for (const input of [
    'rgb(1 2 3 / 2)',
    'rgb(1 2 3 / 101%)',
    'rgb(1 2 3 / -0.1)',
    'rgb(1 2 3 / 1deg)',
  ]) {
    assert.equal(parseColorAlpha(input), null, input);
  }
});

test('parseColorAlpha reads % and deg channels the way parseColor always has', () => {
  assert.equal(
    formatOklch(parseColorAlpha('hsl(217.33deg 87.1% 30.39%)').color),
    formatOklch(parseColorAlpha('#0a3d91').color),
  );
  assert.equal(formatOklch(parseColorAlpha('oklch(50% 25% 200deg)').color), 'oklch(0.5 0.1 200)');
  assert.deepEqual(parseColorAlpha('oklch(0.5 none 200)').color, { L: 0.5, C: 0, h: 200 });
  assert.deepEqual(
    parseColorAlpha('hsl(none 50% 50%)').color,
    parseColorAlpha('hsl(0 50% 50%)').color,
  );
  assert.deepEqual(parseColorAlpha('oklch(none 0.1 200)').color, { L: 0, C: 0.1, h: 200 });
});

test('hsl() reads a bare saturation and lightness as percentages in the space syntax only', () => {
  const red = parseColorAlpha('hsl(0 100% 50%)').color;
  assert.deepEqual(parseColorAlpha('hsl(0 100 50)').color, red);
  assert.deepEqual(parseColorAlpha('hsl(0 100% 50)').color, red);
  assert.deepEqual(parseColorAlpha('hsl(0 100. 50.)').color, red);
  assert.deepEqual(parseColorAlpha('hsl(0deg 100 50 / 40%)').color, red);
  assert.deepEqual(parseColorAlpha('hsl(0, 100%, 50%)').color, red);
  for (const input of ['hsl(0, 100, 50)', 'hsl(0, 100%, 50)', 'hsla(0, 100, 50%, 0.5)']) {
    assert.equal(parseColorAlpha(input), null, input);
  }
});

test('rgb() reads percentages on the 0 to 255 scale', () => {
  assert.deepEqual(parseColorAlpha('rgb(100% 0% 0%)').color, parseColorAlpha('rgb(255 0 0)').color);
  assert.deepEqual(
    parseColorAlpha('rgb(100%, 0%, 0%, 50%)').color,
    parseColorAlpha('rgb(255, 0, 0)').color,
  );
});

test('parseColor drops the alpha parseColorAlpha reads', () => {
  assert.deepEqual(parseColor('#11223380'), parseColorAlpha('#112233').color);
  assert.deepEqual(parseColor('rgb(10 61 145 / 50%)'), parseColor('rgb(10, 61, 145)'));
});
