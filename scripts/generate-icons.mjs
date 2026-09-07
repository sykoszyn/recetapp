// Genera los íconos PWA a partir del mismo isotipo que components/logo.tsx
// (gorro de chef sobre un cuadrado con gradiente), sin dependencias externas.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const GRADIENT_FROM = [237, 91, 47]; // hsl(14, 89%, 58%)
const GRADIENT_TO = [240, 166, 43]; // hsl(40, 95%, 55%)
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // no filter
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function isInRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const inCornerZone =
    (x < x0 + r && y < y0 + r) ||
    (x > x1 - r && y < y0 + r) ||
    (x < x0 + r && y > y1 - r) ||
    (x > x1 - r && y > y1 - r);
  if (!inCornerZone) return true;

  const corners = [
    [x0 + r, y0 + r],
    [x1 - r, y0 + r],
    [x0 + r, y1 - r],
    [x1 - r, y1 - r],
  ];
  return corners.some(([ccx, ccy]) => Math.hypot(x - ccx, y - ccy) <= r);
}

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Mismo isotipo que components/logo.tsx (viewBox 24x24): cuadrado con
// esquinas redondeadas (rx=7) + gorro de chef blanco (3 círculos + banda).
const VIEWBOX = 24;

function chefHatIcon(size, { contentScale = 1, squareCorners = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = (size * contentScale) / VIEWBOX;
  const offset = (size - VIEWBOX * scale) / 2;
  const toPx = (v) => offset + v * scale;

  const rectRadius = squareCorners ? scale * 0.5 : scale * 7;
  const x0 = toPx(0);
  const y0 = toPx(0);
  const x1 = toPx(VIEWBOX);
  const y1 = toPx(VIEWBOX);

  const circles = [
    { cx: toPx(7.5), cy: toPx(13.2), r: scale * 3 },
    { cx: toPx(16.5), cy: toPx(13.2), r: scale * 3 },
    { cx: toPx(12), cy: toPx(10.8), r: scale * 4.6 },
  ];
  const band = {
    x0: toPx(6.5),
    y0: toPx(16.2),
    x1: toPx(6.5 + 11),
    y1: toPx(16.2 + 3.4),
    r: scale * 1.7,
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const inBackground = isInRoundedRect(x, y, x0, y0, x1, y1, rectRadius);
      if (!inBackground) {
        rgba[i + 3] = 0;
        continue;
      }

      const t = (x + y) / (2 * size);
      let color = lerpColor(GRADIENT_FROM, GRADIENT_TO, t);

      const inHat = circles.some((c) => Math.hypot(x - c.cx, y - c.cy) <= c.r) || isInRoundedRect(x, y, band.x0, band.y0, band.x1, band.y1, band.r);
      if (inHat) color = WHITE;

      rgba[i] = Math.round(color[0]);
      rgba[i + 1] = Math.round(color[1]);
      rgba[i + 2] = Math.round(color[2]);
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, contentScale: 0.7 },
  { name: 'apple-touch-icon.png', size: 180, squareCorners: true },
];

for (const { name, size, contentScale, squareCorners } of sizes) {
  const rgba = chefHatIcon(size, { contentScale, squareCorners });
  const png = encodePNG(size, size, rgba);
  writeFileSync(join(outDir, name), png);
  console.log(`✓ ${name}`);
}

// favicon simple de 32x32
const faviconRgba = chefHatIcon(32);
writeFileSync(join(outDir, '..', 'favicon-32.png'), encodePNG(32, 32, faviconRgba));
console.log('✓ favicon-32.png');
