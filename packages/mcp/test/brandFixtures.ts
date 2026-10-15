import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

/**
 * Brand fixtures drawn in code, so the tests carry no binary files and every expected color is
 * known exactly.
 */
type RGBA = [number, number, number, number];
type Painter = (x: number, y: number) => RGBA;

const hex = (value: string): RGBA =>
  [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16)).concat(255) as RGBA;

function draw(width: number, height: number, paint: Painter) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) data.set(paint(x, y), (y * width + x) * 4);
  }
  return { width, height, data };
}

export function png(width: number, height: number, paint: Painter): Buffer {
  const image = new PNG({ width, height });
  image.data = draw(width, height, paint).data;
  return PNG.sync.write(image);
}

export function jpg(width: number, height: number, paint: Painter): Buffer {
  return jpeg.encode(draw(width, height, paint), 95).data;
}

const transparent: RGBA = [0, 0, 0, 0];
const inRect = (x: number, y: number, [left, top, right, bottom]: number[]) =>
  x >= left && x < right && y >= top && y < bottom;

/** Navy block and an anti-aliased orange disc on a transparent canvas. */
export const transparentLogo = () =>
  png(240, 140, (x, y) => {
    if (inRect(x, y, [20, 20, 130, 120])) return hex('#0a3d91');
    const distance = Math.hypot(x - 185, y - 70);
    if (distance < 40) return hex('#f5a623');
    // One-pixel soft edge, like a real exported logo.
    if (distance < 41) return [245, 166, 35, 128];
    return transparent;
  });

/** A red mark over a noisy sky-to-grass "photo" background. */
export const photoLogo = () =>
  jpg(320, 220, (x, y) => {
    if (inRect(x, y, [110, 70, 210, 150])) return hex('#d0021b');
    const noise = ((x * 7919 + y * 104729) % 23) - 11;
    const t = y / 220;
    return [
      Math.round(90 + 60 * t + noise),
      Math.round(150 + 40 * t + noise),
      Math.round(220 - 120 * t + noise),
      255,
    ];
  });

/** Black wordmark on white, the classic one-color logo. */
export const monoLogo = () =>
  png(200, 100, (x, y) => (inRect(x, y, [30, 30, 170, 70]) ? hex('#111111') : hex('#ffffff')));

/** Four brand stripes, padded on white. */
export const stripes = ['#e63946', '#2a9d8f', '#e9c46a', '#264653'];
export const multicolorLogo = () =>
  png(260, 120, (x, y) => {
    if (!inRect(x, y, [20, 20, 240, 100])) return hex('#ffffff');
    // Widths 40%, 30%, 20%, 10% so the order is clear.
    const position = (x - 20) / 220;
    return hex(stripes[position < 0.4 ? 0 : position < 0.7 ? 1 : position < 0.9 ? 2 : 3]);
  });

export const bigLogo = () =>
  png(2000, 2000, (x, y) =>
    inRect(x, y, [400, 400, 1600, 1600]) ? hex('#0a3d91') : hex('#ffffff'),
  );

export const flatSVG = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" onload="alert('svg')">
  <script>alert('nope')</script>
  <image href="https://example.com/tracker.png" width="1" height="1"/>
  <rect width="200" height="100" fill="#FFFFFF"/>
  <path d="M10 10h80v80H10z" fill="#0a3d91"/>
  <path d="M20 20h20v20H20z" fill="#0A3D91"/>
  <circle cx="150" cy="50" r="30" style="fill: #f5a623; stroke: none"/>
  <text fill="rebeccapurple">Brand</text>
</svg>`;

export const gradientSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <defs><style>.word { fill: #1a1a2e; }</style>
    <linearGradient id="g"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="rgb(78, 205, 196)"/></linearGradient>
  </defs>
  <rect width="200" height="60" fill="url(#g)"/>
  <text class="word" y="90">Wave</text>
</svg>`;

/** A one-page brand manual: stated colors and sizes in the text, a brand font, artwork fills. */
export function brandManualPDF(): Buffer {
  const stream = [
    '0.039 0.239 0.569 rg 50 600 200 100 re f',
    '0.96 0.65 0.14 rg 300 600 100 100 re f',
    'BT /F1 14 Tf 0 0 0 rg 50 500 Td (Ocean Blue #0A3D91) Tj',
    '0 -20 Td (Sunrise CMYK 0 32 86 4) Tj',
    '0 -20 Td (Corner radius: 4 px) Tj',
    '0 -20 Td (Body text size 16 px) Tj ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    `<< /Type /Font /Subtype /TrueType /BaseFont /ABCDEF+Montserrat-SemiBold /FirstChar 32 /LastChar 126 /Widths [${Array(95).fill(600).join(' ')}] /FontDescriptor 6 0 R >>`,
    '<< /Type /FontDescriptor /FontName /ABCDEF+Montserrat-SemiBold /Flags 32 /FontBBox [0 0 1000 1000] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(out.length);
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}
