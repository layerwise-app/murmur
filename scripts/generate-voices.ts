// Renders Murmur's voice samples on this computer with Kokoro-82M, an
// open-weight text-to-speech model (Apache 2.0). No online voice service.
//
//   pnpm add -D kokoro-js      # once; downloads the model on first run
//   pnpm voices
//
// It reads src/content/voices.ts and src/content/listening.ts, renders one
// clip per sentence (cached in .cache/voices, so only changed sentences are
// rendered again), joins each sample's sentences into one AAC file in
// public/audio, and writes each sentence's start and end time into the
// `clips` block of src/content/listening.ts so captions stay in sync.
// Needs ffmpeg on your PATH.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  clipId,
  itemSentences,
  listening,
  pickerSample,
  sentenceSpeech,
  type Clip,
  type Sentence
} from '../src/content/listening.ts';
import { voices, type Voice } from '../src/content/voices.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(root, '.cache', 'voices');
const audioDir = path.join(root, 'public', 'audio');
const listeningFile = path.join(root, 'src', 'content', 'listening.ts');
const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const BUDGET_BYTES = 1.5 * 1024 * 1024;

// Silence around and between sentences, in seconds.
const LEAD = 0.12;
const GAP = 0.36;
const PARAGRAPH_GAP = 0.62;
const TAIL = 0.35;

type Job = {
  id: string;
  voice: Voice;
  sentences: Sentence[];
  /** Index of sentences that end a paragraph, for a longer pause. */
  paragraphEnds: Set<number>;
};

function sentencesWithBreaks(itemId: string, count: number) {
  const item = listening.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`No listening item "${itemId}"`);
  const paragraphEnds = new Set<number>();
  let index = -1;
  for (const paragraph of item.body) {
    index += paragraph.length;
    paragraphEnds.add(index);
  }
  return { sentences: itemSentences(item).slice(0, count), paragraphEnds };
}

function byId(id: string) {
  return (voices as readonly Voice[]).find((v) => v.id === id);
}

function plan(): Job[] {
  const jobs = new Map<string, Job>();
  const add = (id: string, voice: Voice | undefined, itemId: string, count: number) => {
    if (!voice || jobs.has(id)) return;
    jobs.set(id, { id, voice, ...sentencesWithBreaks(itemId, count) });
  };
  for (const voice of voices as readonly Voice[]) {
    add(clipId.opening(voice.id), voice, pickerSample.itemId, pickerSample.sentences);
    const item = listening.find((entry) => entry.id === voice.longSample);
    if (item) add(clipId.item(item.id, voice.id), voice, item.id, item.sampleSentences);
  }
  for (const item of listening) {
    add(clipId.item(item.id, item.readBy), byId(item.readBy), item.id, item.sampleSentences);
  }
  return [...jobs.values()];
}

type Tts = {
  generate(
    text: string,
    options: { voice: string; speed: number }
  ): Promise<{ audio: Float32Array; sampling_rate: number }>;
};

let ttsPromise: Promise<Tts> | undefined;
async function loadTts(): Promise<Tts> {
  ttsPromise ??= (async () => {
    // Loaded by name so the site builds without kokoro-js installed.
    const kokoroModule = 'kokoro-js';
    const transformersModule = '@huggingface/transformers';
    let kokoro: {
      KokoroTTS: {
        from_pretrained(model: string, options: object): Promise<unknown>;
      };
    };
    try {
      kokoro = await import(kokoroModule);
    } catch {
      console.error(
        '\nkokoro-js is not installed. Run `pnpm add -D kokoro-js`, then `pnpm voices` again.\n'
      );
      process.exit(1);
    }
    // The copy of transformers.js that kokoro-js itself uses.
    const transformersPath = createRequire(import.meta.resolve(kokoroModule)).resolve(
      transformersModule
    );
    type Transformers = { env: { cacheDir: string } };
    const loaded: Transformers & { default?: Transformers } = await import(
      pathToFileURL(transformersPath).href
    );
    const transformers = loaded.env ? loaded : loaded.default!;
    transformers.env.cacheDir =
      process.env.KOKORO_CACHE_DIR ?? path.join(root, '.cache', 'kokoro');
    console.log('Loading Kokoro-82M (the first run downloads about 330 MB)…');
    return (await kokoro.KokoroTTS.from_pretrained(MODEL, {
      dtype: 'fp32',
      device: 'cpu'
    })) as unknown as Tts;
  })();
  return ttsPromise;
}

const SAMPLE_RATE = 24000;

async function renderSentence(voice: Voice, text: string): Promise<Float32Array> {
  const key = createHash('sha1')
    .update(JSON.stringify([MODEL, voice.tts.voice, voice.tts.speed, text]))
    .digest('hex')
    .slice(0, 16);
  const file = path.join(cacheDir, `${key}.f32`);
  if (fs.existsSync(file)) {
    const buffer = fs.readFileSync(file);
    return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
  }
  const tts = await loadTts();
  const result = await tts.generate(text, {
    voice: voice.tts.voice,
    speed: voice.tts.speed
  });
  if (result.sampling_rate !== SAMPLE_RATE) {
    throw new Error(`Expected ${SAMPLE_RATE} Hz audio, got ${result.sampling_rate}`);
  }
  const samples = trimSilence(result.audio);
  fs.writeFileSync(file, Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength));
  return samples;
}

/** Trims near-silence from both ends, keeping a short natural edge. */
function trimSilence(samples: Float32Array): Float32Array {
  const threshold = 0.006;
  const keep = Math.round(0.03 * SAMPLE_RATE);
  let start = 0;
  let end = samples.length - 1;
  while (start < end && Math.abs(samples[start]) < threshold) start++;
  while (end > start && Math.abs(samples[end]) < threshold) end--;
  return samples.slice(Math.max(0, start - keep), Math.min(samples.length, end + keep));
}

function writeWav(file: string, samples: Float32Array) {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(3, 20); // IEEE float
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(32, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

async function main() {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(audioDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'murmur-voices-'));
  const clips: Record<string, Clip> = {};
  const jobs = plan();

  for (const job of jobs) {
    const parts: Float32Array[] = [];
    const timings: [number, number][] = [];
    let cursor = Math.round(LEAD * SAMPLE_RATE);
    parts.push(new Float32Array(cursor));
    for (const [index, sentence] of job.sentences.entries()) {
      const audio = await renderSentence(job.voice, sentenceSpeech(sentence));
      timings.push([cursor / SAMPLE_RATE, (cursor + audio.length) / SAMPLE_RATE]);
      parts.push(audio);
      cursor += audio.length;
      const last = index === job.sentences.length - 1;
      const pause = last ? TAIL : job.paragraphEnds.has(index) ? PARAGRAPH_GAP : GAP;
      const silence = new Float32Array(Math.round(pause * SAMPLE_RATE));
      parts.push(silence);
      cursor += silence.length;
    }
    const joined = new Float32Array(cursor);
    let offset = 0;
    for (const part of parts) {
      joined.set(part, offset);
      offset += part.length;
    }
    const wav = path.join(tmp, `${job.id}.wav`);
    const out = path.join(audioDir, `${job.id}.m4a`);
    writeWav(wav, joined);
    execFileSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', wav,
      '-ac', '1', '-ar', String(SAMPLE_RATE),
      '-c:a', 'aac', '-b:a', '48k',
      '-movflags', '+faststart',
      '-map_metadata', '-1',
      out
    ]);
    clips[job.id] = {
      src: `/audio/${job.id}.m4a`,
      duration: round(cursor / SAMPLE_RATE),
      sentences: timings.map(([start, end]) => [round(start), round(end)])
    };
    console.log(
      `${job.id.padEnd(28)} ${job.voice.name.padEnd(6)} ${clips[job.id].duration.toFixed(1)} s`
    );
  }

  // Remove audio for clips that no longer exist.
  const keep = new Set(jobs.map((job) => `${job.id}.m4a`));
  for (const file of fs.readdirSync(audioDir)) {
    if (file.endsWith('.m4a') && !keep.has(file)) fs.rmSync(path.join(audioDir, file));
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  const source = fs.readFileSync(listeningFile, 'utf8');
  const entries = Object.entries(clips).map(
    ([id, clip]) =>
      `  '${id}': {\n    src: '${clip.src}',\n    duration: ${clip.duration},\n    sentences: [\n${clip.sentences
        .map(([start, end]) => `      [${start}, ${end}]`)
        .join(',\n')}\n    ]\n  }`
  );
  const block = `// <generated:clips>\n// Written by \`pnpm voices\`; do not edit by hand.\nexport const clips: Record<string, Clip> = {\n${entries.join(',\n')}\n};\n// </generated:clips>`;
  const next = source.replace(
    /\/\/ <generated:clips>[\s\S]*?\/\/ <\/generated:clips>/,
    block
  );
  if (next === source && !source.includes('<generated:clips>')) {
    throw new Error('Could not find the <generated:clips> block in listening.ts');
  }
  fs.writeFileSync(listeningFile, next);

  const total = fs
    .readdirSync(audioDir)
    .filter((file) => file.endsWith('.m4a'))
    .reduce((sum, file) => sum + fs.statSync(path.join(audioDir, file)).size, 0);
  console.log(`\n${jobs.length} clips, ${(total / 1024).toFixed(0)} KB in public/audio.`);
  if (total > BUDGET_BYTES) {
    console.warn('Warning: the clips are over the 1.5 MB budget. Shorten a sample or lower the bitrate.');
  }
}

await main();
