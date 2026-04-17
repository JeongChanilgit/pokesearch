// Generates placeholder pokeball-style PNG icons into public/icons/.
// Pure Node (zlib only), no native deps. Replace with designer art before launch.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function encodePNG(width, height, rgba) {
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  };
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // Filter byte 0 per scanline + raw pixels
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function drawPokeball(size, padding = 0) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;
  const lineY = cy;
  const lineHalf = Math.max(2, size / 32);
  const innerR = r * 0.22;
  const dotR = r * 0.1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      let rC = 255;
      let gC = 255;
      let bC = 255;
      let aC = 0;
      if (d <= r) {
        aC = 255;
        if (d >= r - lineHalf * 2) {
          rC = 31; gC = 30; bC = 29; // border
        } else if (Math.abs(dy) <= lineHalf) {
          rC = 31; gC = 30; bC = 29; // equator line
        } else if (dy < 0) {
          rC = 239; gC = 68; bC = 68; // red top
        } else {
          rC = 255; gC = 255; bC = 255; // white bottom
        }
        if (d <= innerR + lineHalf && d >= innerR - lineHalf) {
          rC = 31; gC = 30; bC = 29; // inner ring
        } else if (d < innerR - lineHalf) {
          rC = 255; gC = 255; bC = 255; // inner white
          if (d <= dotR) { rC = 255; gC = 255; bC = 255; }
        }
      }
      const idx = (y * size + x) * 4;
      rgba[idx] = rC;
      rgba[idx + 1] = gC;
      rgba[idx + 2] = bC;
      rgba[idx + 3] = aC;
    }
  }
  return rgba;
}

const sizes = [
  { name: '192.png', size: 192, padding: 6 },
  { name: '512.png', size: 512, padding: 16 },
  { name: 'maskable.png', size: 512, padding: 76 }, // safe zone
];
for (const { name, size, padding } of sizes) {
  const rgba = drawPokeball(size, padding);
  const png = encodePNG(size, size, rgba);
  writeFileSync(resolve(outDir, name), png);
  console.log(`wrote ${name} (${size}x${size}, ${png.length} bytes)`);
}
