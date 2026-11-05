// Adds images to the site, ready for the screen slots and anywhere else.
//
//   pnpm add-images path/to/player.png [more files…]
//   pnpm add-images path/to/shot.jpg --name player-screen
//
// For each image it writes WebP versions 800, 1600, and 2880 px wide (never
// wider than the original) to public/images/, and records the dimensions and
// a tiny blurred placeholder in src/content/images.ts under the image's name.
// GIFs are copied untouched. SVGs are rejected: draw those as components.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'images');
const manifestFile = path.join(root, 'src', 'content', 'images.ts');
const WIDTHS = [800, 1600, 2880];
const SUPPORTED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff', '.heic', '.gif']);

function usage(message) {
  if (message) console.error(`\n${message}`);
  console.error('\nUsage: pnpm add-images <image> [more images…] [--name <name>]\n');
  process.exit(1);
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readManifest() {
  const source = fs.readFileSync(manifestFile, 'utf8');
  const match = /export const images: Record<string, ImageAsset> = (\{[\s\S]*?\});\n\/\/ <\/generated:images>/.exec(source);
  if (!match) throw new Error('Could not find the <generated:images> block in src/content/images.ts');
  return { source, images: JSON.parse(match[1]) };
}

function writeManifest(source, images) {
  const sorted = Object.fromEntries(Object.entries(images).sort(([a], [b]) => a.localeCompare(b)));
  const block = `// <generated:images>\nexport const images: Record<string, ImageAsset> = ${JSON.stringify(sorted, null, 2)};\n// </generated:images>`;
  fs.writeFileSync(
    manifestFile,
    source.replace(/\/\/ <generated:images>[\s\S]*?\/\/ <\/generated:images>/, block)
  );
}

async function blurPlaceholder(input) {
  const buffer = await sharp(input, { animated: false })
    .resize(16, 16, { fit: 'inside' })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function addImage(file, name) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') {
    throw new Error(`${file}: SVG isn't accepted. Draw vector art as a React component instead.`);
  }
  if (!SUPPORTED.has(ext)) throw new Error(`${file}: unsupported file type ${ext}`);
  if (!fs.existsSync(file)) throw new Error(`${file}: file not found`);

  const meta = await sharp(file, { animated: ext === '.gif' }).metadata();
  const width = meta.width;
  // Animated GIFs report the height of all frames stacked; use one page.
  const height = meta.pageHeight ?? meta.height;
  if (!width || !height) throw new Error(`${file}: could not read its size`);
  fs.mkdirSync(outDir, { recursive: true });

  if (ext === '.gif') {
    const target = `${name}.gif`;
    fs.copyFileSync(file, path.join(outDir, target));
    return {
      src: `/images/${target}`,
      srcSet: `/images/${target} ${width}w`,
      width,
      height,
      blurDataURL: await blurPlaceholder(file)
    };
  }

  const widths = WIDTHS.filter((w) => w < width);
  if (widths.length < WIDTHS.length) widths.push(Math.min(width, WIDTHS[WIDTHS.length - 1]));
  const versions = [];
  for (const w of new Set(widths)) {
    const target = `${name}-${w}.webp`;
    await sharp(file)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(outDir, target));
    versions.push({ w, src: `/images/${target}` });
  }
  const largest = versions[versions.length - 1];
  return {
    src: largest.src,
    srcSet: versions.map((v) => `${v.src} ${v.w}w`).join(', '),
    width: largest.w,
    height: Math.round((height / width) * largest.w),
    blurDataURL: await blurPlaceholder(file)
  };
}

const args = process.argv.slice(2);
const files = [];
let name;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name') name = args[++i];
  else files.push(args[i]);
}
if (files.length === 0) usage();
if (name && files.length > 1) usage('--name works with one image at a time.');

const { source, images } = readManifest();
let failed = false;
for (const file of files) {
  const key = name ? slug(name) : slug(path.basename(file));
  try {
    images[key] = await addImage(file, key);
    console.log(`Added "${key}": ${images[key].srcSet}`);
  } catch (error) {
    failed = true;
    console.error(error instanceof Error ? error.message : error);
  }
}
writeManifest(source, images);
if (failed) process.exit(1);
