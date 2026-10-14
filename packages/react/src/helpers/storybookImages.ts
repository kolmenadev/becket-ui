/**
 * Story-only sample images as data URIs, so stories render in Storybook and in
 * Claude Design previews without hosting files. Not exported from the package.
 */
const svg = (body: string, width = 640, height = 360) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  )}`;

export const SAMPLE_LANDSCAPE = svg(
  '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e3a21a"/><stop offset="1" stop-color="#c25a1c"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="470" cy="120" r="56" fill="#fff4d6" opacity="0.85"/><path d="M0 300 L180 170 L320 280 L440 200 L640 320 L640 360 L0 360 Z" fill="#3a2d1c" opacity="0.8"/>',
);

export const SAMPLE_PORTRAIT = svg(
  '<rect width="160" height="160" fill="#8aa05a"/><circle cx="80" cy="64" r="30" fill="#f4ecd8"/><path d="M24 160 C30 112 130 112 136 160 Z" fill="#f4ecd8"/>',
  160,
  160,
);
