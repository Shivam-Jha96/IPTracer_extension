const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function drawCyberIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx + 0.5;
  const dy = y - cy + 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.46;

  // Transparent outside outer boundary
  if (dist > maxR + 0.8) {
    return [0, 0, 0, 0];
  }

  // Smooth outer circular boundary
  let alpha = 255;
  if (dist > maxR - 0.8) {
    alpha = Math.round(255 * (maxR + 0.8 - dist) / 1.6);
    alpha = Math.max(0, Math.min(255, alpha));
  }

  // Background dark gradient (deep navy / cyber dark #090d16 to #0f172a)
  const normY = y / h;
  let bgR = Math.round(9 + 6 * normY);
  let bgG = Math.round(13 + 10 * normY);
  let bgB = Math.round(22 + 20 * normY);

  // Outer border ring (cyan #06b6d4)
  if (Math.abs(dist - (maxR - 1.5)) < 1.2) {
    return [6, 182, 212, alpha];
  }

  // Inner radar concentric ring
  const midR = maxR * 0.6;
  if (Math.abs(dist - midR) < 1.0) {
    return [14, 165, 233, alpha]; // Sky-500
  }

  // Crosshair lines
  const lineThick = Math.max(0.7, w * 0.03);
  const onCrossX = Math.abs(dx) < lineThick && dist < maxR * 0.85 && dist > maxR * 0.25;
  const onCrossY = Math.abs(dy) < lineThick && dist < maxR * 0.85 && dist > maxR * 0.25;
  if (onCrossX || onCrossY) {
    return [56, 189, 248, Math.round(alpha * 0.85)];
  }

  // Center beacon / radar pulse point (bright emerald / cyan pulse #10b981 / #38bdf8)
  const centerR = Math.max(1.5, maxR * 0.22);
  if (dist <= centerR) {
    return [52, 211, 153, alpha]; // Emerald-400
  } else if (dist <= centerR + 1.2) {
    return [16, 185, 129, Math.round(alpha * 0.7)];
  }

  return [bgR, bgG, bgB, alpha];
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  const pngBuf = createPng(size, size, drawCyberIcon);
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, pngBuf);
  console.log(`Generated ${outPath} (${pngBuf.length} bytes)`);
});
