// Turns the logo into every icon the site serves:
//
//   pnpm brand
//
// Reads public/logo.svg (64 × 64 viewBox) and writes public/logo.png
// (1024 × 1024), favicon.ico (16, 32, 48), favicon-16x16.png,
// favicon-32x32.png, favicon.png, apple-touch-icon.png (square corners; iOS
// rounds them), android-chrome-192x192.png and -512x512.png, and
// site.webmanifest with the name and colours from src/site.config.ts.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { siteConfig } from '../src/site.config.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const svg = fs.readFileSync(path.join(publicDir, 'logo.svg'), 'utf8');
const viewBox = Number(/viewBox="0 0 (\d+(?:\.\d+)?)/.exec(svg)?.[1] ?? 64);

/** Draws the SVG straight at the target size so small icons stay sharp. */
function render(source, size) {
  return sharp(Buffer.from(source), { density: (72 * size) / viewBox })
    .resize(size, size)
    .png({ compressionLevel: 9 });
}

/** An .ico file holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const write = async (name, image) => {
  await image.toFile(path.join(publicDir, name));
  console.log(`public/${name}`);
};

await write('logo.png', render(svg, 1024));
await write('favicon-16x16.png', render(svg, 16));
await write('favicon-32x32.png', render(svg, 32));
await write('favicon.png', render(svg, 32));
await write('android-chrome-192x192.png', render(svg, 192));
await write('android-chrome-512x512.png', render(svg, 512));
// Apple touch icons should fill the square; iOS applies its own corners.
await write('apple-touch-icon.png', render(svg.replace(/(<rect[^>]*?)\srx="[^"]*"/, '$1'), 180));

const icoImages = [];
for (const size of [16, 32, 48]) icoImages.push({ size, data: await render(svg, size).toBuffer() });
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico(icoImages));
console.log('public/favicon.ico');

const manifest = {
  name: siteConfig.product,
  short_name: siteConfig.product,
  description: siteConfig.tagline,
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
  ],
  theme_color: siteConfig.colors.cream,
  background_color: siteConfig.colors.cream,
  display: 'standalone'
};
fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('public/site.webmanifest');
