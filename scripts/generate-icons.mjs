// Genera los íconos PWA (placeholder) sin dependencias externas: un cuadrado
// con esquinas redondeadas, color primario de la marca y un plato/tenedor
// simplificado. Reemplazar por artwork final antes de publicar en las stores.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const PRIMARY = [237, 91, 47]; // ~ hsl(14, 89%, 55%)
const WHITE = [255, 250, 245];

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

function roundedSquareIcon(size, { padding = 0.08, radius = 0.22 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = size * padding;
  const r = size * radius;
  const cx = size / 2;
  const cy = size / 2;

  const plateR = size * 0.3;
  const innerR = size * 0.19;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let color = null;

      const inRoundedSquare = isInRoundedRect(x, y, pad, pad, size - pad, size - pad, r);
      if (inRoundedSquare) {
        color = PRIMARY;
        const dPlate = Math.hypot(x - cx, y - cy);
        if (dPlate < plateR) color = WHITE;
        if (dPlate < innerR) color = PRIMARY;
      }

      if (color) {
        rgba[i] = color[0];
        rgba[i + 1] = color[1];
        rgba[i + 2] = color[2];
        rgba[i + 3] = 255;
      } else {
        rgba[i + 3] = 0;
      }
    }
  }
  return rgba;
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

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, padding: 0.16 },
  { name: 'apple-touch-icon.png', size: 180, padding: 0.02, radius: 0.001 },
];

for (const { name, size, padding, radius } of sizes) {
  const rgba = roundedSquareIcon(size, { padding, radius });
  const png = encodePNG(size, size, rgba);
  writeFileSync(join(outDir, name), png);
  console.log(`✓ ${name}`);
}

// favicon simple de 32x32
const faviconRgba = roundedSquareIcon(32, { padding: 0.06, radius: 0.25 });
writeFileSync(join(outDir, '..', 'favicon.ico').replace('.ico', '-32.png'), encodePNG(32, 32, faviconRgba));
console.log('✓ favicon-32.png');
