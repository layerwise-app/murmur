// The four Murmur voices. Each one appears in the home page voice picker, on
// /voices, and as the reader of one sample item in the player.
//
// To add a voice, copy an entry, give it a new `id`, then run `pnpm voices`
// to render its samples (see README). Until its audio exists the voice still
// shows everywhere, with its play button disabled.
//
// Keep this file free of imports: `scripts/generate-voices.ts` reads it with
// Node directly.

export type OrbPalette = {
  /** Lightest tone, at the lit centre of the orb. */
  core: string;
  /** The voice's signature colour, across most of the surface. */
  mid: string;
  /** Deepest tone, around the edge and in the folds. */
  edge: string;
  /** A second colour that drifts through the surface in soft swirls. */
  accent: string;
};

export type OrbTexture = {
  /** Size of the surface pattern: lower is broader and softer. */
  scale: number;
  /** How quickly the surface drifts. */
  flow: number;
  /** How strongly the edge ripples with the voice, 0 to 1. */
  ripple: number;
};

export type Voice = {
  id: string;
  name: string;
  /** Two or three words, shown on every voice card. */
  character: string;
  /** One line about how the voice sounds. */
  line: string;
  /** What it's good for, shown on /voices. */
  goodFor: string[];
  /** A longer note for /voices. */
  about: string;
  /** Signature colour as a CSS colour, used for dots, highlights and focus. */
  color: string;
  orb: OrbPalette;
  texture: OrbTexture;
  /** The listening item this voice reads for its longer sample on /voices. */
  longSample: string;
  /** Kokoro text-to-speech settings used by `pnpm voices`. */
  tts: { model: 'kokoro-82m'; voice: string; speed: number };
};

export const voices = [
  {
    id: 'ada',
    name: 'Ada',
    character: 'Bright and quick',
    line: 'Like a friend catching you up on the walk to the station.',
    goodFor: ['Newsletters', 'Morning briefings', 'Getting through a backlog'],
    about:
      'Ada keeps a brisk, sunny pace without ever sounding rushed. She is the voice people pick for the first coffee of the day, when there are eleven newsletters waiting and a train in nine minutes.',
    color: '#e98a4f',
    orb: { core: '#ffe2bf', mid: '#f3a265', edge: '#d9694f', accent: '#f0a3a0' },
    texture: { scale: 1.35, flow: 1.25, ripple: 0.85 },
    longSample: 'small-hours',
    tts: { model: 'kokoro-82m', voice: 'af_bella', speed: 1.06 }
  },
  {
    id: 'rowan',
    name: 'Rowan',
    character: 'Warm and low',
    line: 'The voice for evenings, with the lamp on and nowhere to be.',
    goodFor: ['Email from people you love', 'Letters and long replies', 'Late reading'],
    about:
      'Rowan sits low and unhurried, with a warmth that makes a family email thread sound like someone reading it to you across the kitchen table.',
    color: '#c9675d',
    orb: { core: '#f7cdbd', mid: '#d98476', edge: '#9a4f45', accent: '#efb07c' },
    texture: { scale: 0.8, flow: 0.6, ripple: 0.6 },
    longSample: 'allotment-thread',
    tts: { model: 'kokoro-82m', voice: 'am_michael', speed: 0.94 }
  },
  {
    id: 'mei',
    name: 'Mei',
    character: 'Calm and precise',
    line: 'Every figure lands exactly where it should.',
    goodFor: ['Reports and PDFs', 'Anything with numbers', 'Studying'],
    about:
      'Mei is even and exact. She gives a table of results the same patience as a paragraph, which makes her the voice for reports, papers, and anything you would otherwise print out and underline.',
    color: '#7f9a72',
    orb: { core: '#eef0d8', mid: '#a9bd94', edge: '#647f5c', accent: '#f1c39a' },
    texture: { scale: 1.1, flow: 0.75, ripple: 0.45 },
    longSample: 'canopy-survey',
    tts: { model: 'kokoro-82m', voice: 'af_heart', speed: 0.98 }
  },
  {
    id: 'theo',
    name: 'Theo',
    character: 'Gentle storyteller',
    line: 'He lets a long essay breathe between the lines.',
    goodFor: ['Essays and long reads', 'Fiction', 'Winding down'],
    about:
      'Theo reads the way a good teacher tells a story: a little slower than you expect, with room to picture things. Long essays, short fiction, and anything you saved for a quiet hour.',
    color: '#d3954f',
    orb: { core: '#fde6c6', mid: '#e7b277', edge: '#c0745f', accent: '#b9c4a0' },
    texture: { scale: 1.0, flow: 0.85, ripple: 0.7 },
    longSample: 'street-trees',
    tts: { model: 'kokoro-82m', voice: 'bm_fable', speed: 0.95 }
  }
] as const satisfies readonly Voice[];

export type VoiceId = (typeof voices)[number]['id'];

/** The orb's resting palette, before any voice is chosen. */
export const restingOrb: { orb: OrbPalette; texture: OrbTexture } = {
  orb: { core: '#fde7cf', mid: '#f0ad84', edge: '#c98172', accent: '#b5c29e' },
  texture: { scale: 0.95, flow: 0.7, ripple: 0.6 }
};

export function getVoice(id: string): Voice | undefined {
  return (voices as readonly Voice[]).find((voice) => voice.id === id);
}
