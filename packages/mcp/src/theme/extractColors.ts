import {
  colorDistance,
  formatHex,
  parseColor,
  rgbToOklch,
  type Oklch,
} from '@becket-ui/tokens/theme';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

import type { Source } from './loadSource';

export type ColorRole = 'background' | 'neutral' | 'brand';
export type ExtractedColor = { hex: string; color: Oklch; share: number; role: ColorRole };
export type Extraction = { colors: ExtractedColor[]; method: string; skipped: string[] };

type Pixels = { width: number; height: number; data: Uint8Array };

// Decompression bombs: a tiny PNG can claim gigapixels. Real logos and manual pages are far below.
const MAX_PIXELS = 50_000_000;
const SAMPLES = 160_000;
// Colors closer than this (ΔE OK) are one color: anti-aliasing, JPEG noise, gradients' near steps.
const MERGE = 0.05;
const MIN_SHARE = 0.005;
// Below this chroma a color reads as white, gray or black.
const NEUTRAL_CHROMA = 0.04;

function decodePNG(bytes: Buffer): Pixels {
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width * height > MAX_PIXELS)
    throw new Error(`The PNG is ${width}×${height}; the limit is ${MAX_PIXELS / 1e6} megapixels.`);
  const png = PNG.sync.read(bytes);
  return { width: png.width, height: png.height, data: png.data };
}

function decodeJPEG(bytes: Buffer): Pixels {
  const image = jpeg.decode(bytes, {
    useTArray: true,
    formatAsRGBA: true,
    maxResolutionInMP: MAX_PIXELS / 1e6,
    maxMemoryUsageInMB: 1024,
  });
  return { width: image.width, height: image.height, data: image.data };
}

type Bin = { count: number; edge: number; r: number; g: number; b: number };
type Cluster = { count: number; edge: number; color: Oklch };

/**
 * Dominant colors of a bitmap. Transparent pixels are ignored. A color that keeps touching the
 * image's edges is the background (logos have padding; photos behind them touch every edge).
 * Each color is its most common exact shade, not an average, so edges and noise don't tint it.
 */
export function colorsFromPixels({ width, height, data }: Pixels): ExtractedColor[] {
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / SAMPLES)));
  const border = Math.max(1, Math.round(Math.min(width, height) * 0.02));
  const bins = new Map<number, Bin>();
  let opaque = 0;
  let edgeSamples = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] < 128) continue;
      const [r, g, b] = [data[offset], data[offset + 1], data[offset + 2]];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const isEdge = x < border || y < border || x >= width - border || y >= height - border;
      const bin = bins.get(key) ?? { count: 0, edge: 0, r: 0, g: 0, b: 0 };
      bin.count += 1;
      bin.r += r;
      bin.g += g;
      bin.b += b;
      if (isEdge) bin.edge += 1;
      bins.set(key, bin);
      opaque += 1;
      if (isEdge) edgeSamples += 1;
    }
  }
  if (opaque === 0) return [];

  const clusters: Cluster[] = [];
  for (const bin of [...bins.values()].toSorted((a, b) => b.count - a.count)) {
    const color = rgbToOklch(bin.r / bin.count, bin.g / bin.count, bin.b / bin.count);
    const home = clusters.find((cluster) => colorDistance(cluster.color, color) < MERGE);
    if (home) {
      home.count += bin.count;
      home.edge += bin.edge;
      continue;
    }
    if (clusters.length < 64) clusters.push({ count: bin.count, edge: bin.edge, color });
  }

  const edgeShare = edgeSamples / opaque;
  return clusters
    .filter((cluster) => cluster.count / opaque >= MIN_SHARE)
    .map((cluster) => {
      const isBackground =
        edgeSamples > 0 &&
        cluster.edge / cluster.count >= edgeShare * 0.5 &&
        cluster.edge / edgeSamples >= 0.05;
      const role: ColorRole = isBackground
        ? 'background'
        : cluster.color.C < NEUTRAL_CHROMA
          ? 'neutral'
          : 'brand';
      return {
        hex: formatHex(cluster.color),
        color: cluster.color,
        share: cluster.count / opaque,
        role,
      };
    });
}

// SVG and PDF often name basic colors. Anything rarer is reported as skipped, not guessed.
const NAMED: Record<string, string> = {
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
};

/**
 * Colors an SVG declares (fill, stroke, stop-color, color, in attributes and CSS), weighted by
 * how often each appears. The SVG is read as text: nothing renders, runs or loads.
 */
export function colorsFromSVG(svg: string): {
  colors: ExtractedColor[];
  skipped: string[];
  embedded: Buffer[];
} {
  const counts = new Map<string, { color: Oklch; count: number }>();
  const skipped = new Set<string>();
  const declaration =
    /(?:^|[\s;"'{])(fill|stroke|stop-color|color|flood-color)\s*(?:=\s*["']|:\s*)([^"';}>]+)/gi;
  for (const [, , raw] of svg.matchAll(declaration)) {
    const value = raw.trim().replace(/\s*!important$/, '');
    const lower = value.toLowerCase();
    if (
      ['none', 'currentcolor', 'transparent', 'inherit', 'initial', 'unset'].includes(lower) ||
      lower.startsWith('url(') ||
      lower.startsWith('var(')
    )
      continue;
    const color = parseColor(NAMED[lower] ?? value);
    if (!color) {
      skipped.add(value);
      continue;
    }
    const hex = formatHex(color);
    const entry = counts.get(hex) ?? { color, count: 0 };
    entry.count += 1;
    counts.set(hex, entry);
  }
  const embedded = [...svg.matchAll(/data:image\/(?:png|jpeg);base64,([A-Za-z0-9+/=\s]+)/g)].map(
    ([, data]) => Buffer.from(data.replace(/\s+/g, ''), 'base64'),
  );
  const total = [...counts.values()].reduce((sum, entry) => sum + entry.count, 0);
  const colors = [...counts.entries()].map(([hex, entry]) => ({
    hex,
    color: entry.color,
    share: entry.count / total,
    role: (entry.color.C < NEUTRAL_CHROMA ? 'neutral' : 'brand') as ColorRole,
  }));
  return { colors: mergeClose(colors), skipped: [...skipped], embedded };
}

/** Merge near-identical colors (keeping the more common one's exact value), most common first. */
export function mergeClose(colors: ExtractedColor[]): ExtractedColor[] {
  const merged: ExtractedColor[] = [];
  for (const color of colors.toSorted((a, b) => b.share - a.share)) {
    const home = merged.find(
      (each) => each.role === color.role && colorDistance(each.color, color.color) < MERGE,
    );
    if (home) home.share += color.share;
    else merged.push({ ...color });
  }
  return merged;
}

/** Dominant colors of a PNG, JPEG or SVG source. */
export function extractImageColors(source: Source): Extraction {
  if (source.kind === 'png')
    return { colors: colorsFromPixels(decodePNG(source.bytes)), method: 'PNG pixels', skipped: [] };
  if (source.kind === 'jpeg')
    return {
      colors: colorsFromPixels(decodeJPEG(source.bytes)),
      method: 'JPEG pixels',
      skipped: [],
    };
  if (source.kind === 'svg') {
    const { colors, skipped, embedded } = colorsFromSVG(source.bytes.toString('utf8'));
    const fromImages = embedded.flatMap((bytes) => {
      try {
        return bytes[0] === 0x89
          ? colorsFromPixels(decodePNG(bytes))
          : colorsFromPixels(decodeJPEG(bytes));
      } catch {
        return [];
      }
    });
    const all = mergeClose([
      ...colors,
      ...fromImages.map((color) => ({
        ...color,
        share: color.share / Math.max(1, embedded.length),
      })),
    ]);
    return {
      colors: all,
      method: embedded.length
        ? 'SVG colors and embedded images (by how often each color is used, not by area)'
        : 'SVG colors (by how often each is used, not by area)',
      skipped,
    };
  }
  if (source.kind === 'webp' || source.kind === 'gif') {
    throw new Error(
      `${source.kind.toUpperCase()} isn't supported yet. Export the logo as SVG or PNG, or tell me its colors.`,
    );
  }
  throw new Error("That isn't a PNG, JPEG, SVG or PDF file.");
}
