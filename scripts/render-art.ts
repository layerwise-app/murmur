// Renders the site's artwork in headless Chrome:
//   public/orb/<name>-512 and -1024 (.avif and .webp): orb stills from the real
//     shader, shown before WebGL starts and when it isn't available
//   public/og/<page>.png: 1200×630 share images, one per page
//
//   pnpm art            # both
//   pnpm art orbs       # only the orb stills
//   pnpm art share      # only the share images
//
// Needs Google Chrome installed (used through playwright-core, headless).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { STILL_TIME, ORB_RADIUS, fragmentSource, vertexSource } from '../src/components/orb/shader.ts';
import { restingOrb, voices, type OrbPalette, type OrbTexture } from '../src/content/voices.ts';
import { home } from '../src/content/home.ts';
import { siteConfig } from '../src/site.config.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
const orbDir = path.join(root, 'public', 'orb');
const ogDir = path.join(root, 'public', 'og');
// Full-size orb renders, reused by the share images.
const cacheDir = path.join(root, '.cache', 'orb');

type Look = { orb: OrbPalette; texture: OrbTexture; quiet?: boolean };

const looks: Record<string, Look> = {
  rest: restingOrb,
  quiet: { ...restingOrb, quiet: true },
  ...Object.fromEntries(voices.map((voice) => [voice.id, { orb: voice.orb, texture: voice.texture }]))
};

const orbPage = `<!doctype html><html><body style="margin:0;background:transparent">
<canvas id="c" width="1024" height="1024" style="width:1024px;height:1024px"></canvas>
<script>
const vs = ${JSON.stringify(vertexSource)};
const fs = ${JSON.stringify(fragmentSource)};
window.renderOrb = (look, size) => {
  const canvas = document.getElementById('c');
  canvas.width = size; canvas.height = size;
  canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true });
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); gl.useProgram(p);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(p, 'aPosition'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const hex = (h) => { const v = parseInt(h.slice(1), 16); return [((v>>16)&255)/255, ((v>>8)&255)/255, (v&255)/255]; };
  const u = (n) => gl.getUniformLocation(p, n);
  gl.viewport(0, 0, size, size);
  gl.uniform2f(u('uRes'), size, size);
  gl.uniform1f(u('uTime'), ${STILL_TIME});
  gl.uniform1f(u('uLevel'), 0);
  gl.uniform3f(u('uBands'), 0, 0, 0);
  gl.uniform3fv(u('uCore'), hex(look.orb.core));
  gl.uniform3fv(u('uMid'), hex(look.orb.mid));
  gl.uniform3fv(u('uEdge'), hex(look.orb.edge));
  gl.uniform3fv(u('uAccent'), hex(look.orb.accent));
  gl.uniform3f(u('uTexture'), look.texture.scale, look.texture.flow, look.texture.ripple);
  gl.uniform1f(u('uQuiet'), look.quiet ? 1 : 0);
  gl.uniform1f(u('uRadius'), ${ORB_RADIUS});
  gl.uniform1f(u('uGrain'), 0.0);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return canvas.toDataURL('image/png');
};
</script></body></html>`;

async function renderOrbs(browser: import('playwright-core').Browser) {
  fs.mkdirSync(orbDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });
  const page = await browser.newPage();
  await page.setContent(orbPage);
  for (const [name, look] of Object.entries(looks)) {
    const dataUrl = await page.evaluate(([l, s]) => (window as any).renderOrb(l, s), [look, 2048] as const);
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    // Rendered at 2048 and scaled down, for smooth edges.
    // Small thumbnails for the voice cards.
    await sharp(png)
      .resize(160, 160, { kernel: 'lanczos3' })
      .webp({ quality: 80, alphaQuality: 80 })
      .toFile(path.join(orbDir, `${name}-160.webp`));
    for (const size of [512, 1024]) {
      const resized = sharp(png).resize(size, size, { kernel: 'lanczos3' });
      await resized
        .clone()
        .avif({ quality: 55, effort: 6 })
        .toFile(path.join(orbDir, `${name}-${size}.avif`));
      await resized
        .clone()
        .webp({ quality: 70, alphaQuality: 70, effort: 6, smartSubsample: true })
        .toFile(path.join(orbDir, `${name}-${size}.webp`));
    }
    fs.writeFileSync(path.join(cacheDir, `${name}.png`), png);
    console.log(`orb ${name}`);
  }
  await page.close();
}

const fontUrl = (file: string) =>
  pathToFileURL(path.join(root, 'node_modules', '@fontsource-variable', file)).href;

type Share = { file: string; eyebrow: string; title: string; note: string; orbs: string[] };

const shares: Share[] = [
  {
    file: 'home',
    eyebrow: home.hero.eyebrow,
    title: home.hero.headline,
    note: home.hero.note,
    orbs: ['rest']
  },
  {
    file: 'voices',
    eyebrow: 'Voices',
    title: 'Ada, Rowan, Mei, and Theo.',
    note: 'Four natural voices, each with a temperament.',
    orbs: voices.map((voice) => voice.id)
  },
  {
    file: 'privacy',
    eyebrow: 'Privacy',
    title: 'What Murmur keeps, and what it never does.',
    note: 'Saved items are processed only to read them aloud to you.',
    orbs: ['mei']
  },
  {
    file: 'terms',
    eyebrow: 'Terms',
    title: 'The plain terms for using Murmur.',
    note: `${siteConfig.companyLegalName}, ${siteConfig.companyLocation}`,
    orbs: ['theo']
  },
  {
    file: 'not-found',
    eyebrow: 'Page not found',
    title: 'This page is quiet.',
    note: 'The page you were looking for isn’t here.',
    orbs: ['quiet']
  }
];

function orbData(name: string) {
  const png = fs.readFileSync(path.join(cacheDir, `${name}.png`));
  return `data:image/png;base64,${png.toString('base64')}`;
}

function sharePage(share: Share) {
  const c = siteConfig.colors;
  const single = share.orbs.length === 1;
  const orbs = single
    ? `<img src="${orbData(share.orbs[0])}" style="position:absolute;right:-70px;top:50%;width:700px;height:700px;transform:translateY(-50%)">`
    : `<div style="position:absolute;right:40px;top:50%;transform:translateY(-50%);display:grid;grid-template-columns:repeat(2,240px);gap:0">${share.orbs
        .map((name) => `<img src="${orbData(name)}" style="width:240px;height:240px">`)
        .join('')}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:F;src:url(${fontUrl('fraunces/files/fraunces-latin-full-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:G;src:url(${fontUrl('figtree/files/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:300 900}
html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:radial-gradient(120% 140% at 85% 50%, ${c.sand} 0%, ${c.cream} 62%);color:${c.ink};font-family:G}
h1{font-family:F;font-weight:300;font-variation-settings:'SOFT' 100,'WONK' 0;font-optical-sizing:auto;font-size:76px;line-height:1.02;letter-spacing:-0.025em;margin:0;max-width:640px;text-wrap:balance}
.brand{display:flex;align-items:center;gap:14px;font-family:F;font-variation-settings:'SOFT' 100;font-weight:380;font-size:36px;letter-spacing:-0.02em}
.eyebrow{font-size:22px;font-weight:600;color:${c.inkSoft};display:flex;align-items:center;gap:12px;margin-bottom:26px}
.eyebrow:before{content:'';width:11px;height:11px;border-radius:99px;background:${c.apricot}}
.note{font-size:24px;color:${c.inkSoft};margin-top:28px;max-width:600px}
</style></head><body>
${orbs}
<div style="position:absolute;left:72px;top:64px" class="brand">${fs.readFileSync(path.join(root, 'public', 'logo.svg'), 'utf8').replace('<svg ', '<svg width="44" height="44" ')}${siteConfig.product}</div>
<div style="position:absolute;left:72px;bottom:72px">
<div class="eyebrow">${share.eyebrow}</div>
<h1>${share.title}</h1>
<div class="note">${share.note}</div>
</div>
</body></html>`;
}

async function renderShares(browser: import('playwright-core').Browser) {
  fs.mkdirSync(ogDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const share of shares) {
    const file = path.join(cacheDir, `share-${share.file}.html`);
    fs.writeFileSync(file, sharePage(share));
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: 'png' });
    await sharp(png).png({ compressionLevel: 9, palette: false }).toFile(path.join(ogDir, `${share.file}.png`));
    fs.rmSync(file);
    console.log(`share ${share.file}`);
  }
  await page.close();
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  if (only !== 'share') await renderOrbs(browser);
  if (only !== 'orbs') await renderShares(browser);
} finally {
  await browser.close();
}
