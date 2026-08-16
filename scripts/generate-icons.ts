import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size: number, pixels: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const row = Buffer.from(pixels);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    row.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inRR(x: number, y: number, cx: number, cy: number, hw: number, hh: number, r: number): boolean {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  const dx = Math.max(qx, 0);
  const dy = Math.max(qy, 0);
  return dx * dx + dy * dy <= r * r || (dx === 0 && dy === 0);
}

function render(size: number): Uint8Array {
  const px = new Uint8Array(size * size * 4);
  const bg = [17, 17, 17, 255]; // #111
  const white = [245, 245, 245, 255];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      let color: number[] | null = null;
      if (inRR(nx, ny, 0.5, 0.5, 0.5, 0.5, 0.23)) {
        color = bg;
        const bar = inRR(nx, ny, 0.5, 0.5, 0.185, 0.052, 0.05);
        const plateL = inRR(nx, ny, 0.27, 0.5, 0.115, 0.115, 0.035);
        const plateR = inRR(nx, ny, 0.73, 0.5, 0.115, 0.115, 0.035);
        if (bar || plateL || plateR) color = white;
      }
      if (color) {
        const i = (y * size + x) * 4;
        px[i] = color[0];
        px[i + 1] = color[1];
        px[i + 2] = color[2];
        px[i + 3] = color[3];
      }
    }
  }
  return px;
}

const out = join(process.cwd(), "public");
for (const size of [512, 192, 180, 32]) {
  writeFileSync(join(out, `icon-${size}.png`), encodePNG(size, render(size)));
  console.log(`wrote icon-${size}.png`);
}
writeFileSync(join(out, "apple-touch-icon.png"), encodePNG(180, render(180)));
console.log("wrote apple-touch-icon.png");