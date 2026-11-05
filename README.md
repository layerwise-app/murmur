<a href="https://layerwise.app"><img src="https://layerwise.app/powered-by.png" alt="Powered by Layerwise" width="174" height="28" /></a>

# Murmur

A landing page for Murmur, a listening app from Lowtide Audio (a fictional
twelve-person team in Bristol) that reads saved articles, newsletters, PDFs, and
email aloud. It has a shader orb that moves with each voice, a voice picker
with sentence captions, a drawn iPhone player, a "talk to the orb" microphone
demo, and a waitlist form saved to the project's database.

Built with TanStack Start, React, Tailwind CSS, and Cloudflare Workers (D1 and
Email) on Layerwise.

```bash
pnpm dev            # Layerwise runs this for you
pnpm check-types && pnpm lint && pnpm test
pnpm build
```

## Rewrite the copy

All words live in a few files, so you never need to touch a component.

| What                                                       | Where                     |
| ---------------------------------------------------------- | ------------------------- |
| Product and company names, tagline, nav, buttons, social links, contact email | `src/site.config.ts` |
| Every home section, in page order (hero, voices, player, save, talk, questions, waitlist) | `src/content/home.ts` |
| Voices page, Privacy, Terms                                | `src/content/pages.ts`    |
| Voices: name, character, colours, who they suit            | `src/content/voices.ts`   |
| Sample items and their sentences                           | `src/content/listening.ts`|
| Questions                                                  | `src/content/faq.ts`      |

Answers in `faq.ts` can link with `[words](/privacy)`. In `pages.ts`, a
paragraph that starts with `- ` becomes a list, and `{contactEmail}` becomes
the address from `site.config.ts`. Social links with an empty `href` are hidden.

If you change a sentence a voice reads (in `listening.ts`), run `pnpm voices`
so the audio and captions match again (see [Voice samples](#voice-samples)).

## Replace a drawn screen with a screenshot or video

The player phone and the four "Save from anywhere" screens are drawn in code.
Each sits in a `ScreenSlot`, so you can swap it without editing components.

1. Add your image: `pnpm add-images ~/Desktop/player.png --name player-screen`.
   This writes 800, 1600, and 2880 px WebP files to `public/images/` and
   records the size and a blur placeholder in `src/content/images.ts`. GIFs are
   copied as they are; SVGs are refused.
2. In `src/content/home.ts`, set that screen's `screen` (the player is
   `listen.screen`, the others are under `save.ways`):
   ```ts
   screen: { image: 'player-screen', alt: 'Murmur playing an essay on iPhone' }
   ```
   For a video, put the file in `public/media/` and use
   `{ video: '/media/player.mp4', poster: 'player-screen', alt: '…' }`. Videos
   play muted and looped, only while on screen, and never with reduced motion.
3. Set it back to `null` to return to the drawing.

The player screen keeps its phone frame. Use a 393 × 852 portrait image for it,
and a 16 × 11 landscape image for the save screens.

## Add an item

Sample items are the things in the player's queue. To add one:

1. Add an entry to `listening` in `src/content/listening.ts`. Give it a new `id`,
   a `kind` (`essay`, `newsletter`, `pdf`, or `email`, which picks its cover
   art) and a `kindLabel` for the queue, a title, source, and byline, the voice
   that reads it (`readBy`), and
   its `body` as paragraphs of sentences. `sampleSentences` is how many
   sentences have audio; the rest show as text in Read along. A sentence can be
   `{ text, say }` when it should be spoken differently from how it is written.
2. Run `pnpm voices`. It renders the new sentences and writes their timings into
   the `clips` block at the bottom of the file.
3. It now appears in the player's queue. To also feature it in "A day with
   Murmur", add a moment to `listen.day` in `home.ts`. To make it a voice's
   longer sample on the Voices page, set that voice's `longSample` to its `id`.

Items have no page of their own, so the sitemap stays the same. Voices and
questions work the same way: add an entry to `voices.ts` (then run
`pnpm voices` and `pnpm art` for its audio and orb stills) or to `faq.ts`.

## Change fonts and colours

- **Colours**: edit `colors` in `src/site.config.ts`. They become CSS variables
  for the whole site. Keep `ink` and `inkSoft` at 4.5:1 contrast or more on
  `cream` and `sand`.
- **Orb colours**: each voice has an `orb` palette (core, mid, edge, accent) and
  a `texture` in `src/content/voices.ts`. The resting orb is `restingOrb`. Run
  `pnpm art` after changing them to re-render the still images and share images.
- **Fonts**: the fonts are self-hosted from Fontsource.
  1. `pnpm add @fontsource-variable/<font>`.
  2. Swap the `@import` lines in `src/styles/fonts.css`, and update the two
     `… Fallback` faces' `size-adjust` and overrides so text doesn't jump while
     the font loads.
  3. Update the preloaded file imports at the top of `src/routes/__root.tsx`.
  4. Update `fonts` in `src/site.config.ts`.

## The waitlist

- **Where sign-ups go**: every sign-up is saved in the project's database. Open
  **Database** in Layerwise and choose the `waitlist_signups` table (email,
  platform, what they listen to, and when they joined). Local previews use a
  separate local database.
- **Email me each sign-up**: set `ownerEmail` in `src/site.config.ts` to your
  address and publish. You get one short email per new sign-up, at most 100 a
  day. Visitors are never emailed. Emails send only from the published site;
  in the local preview they land in **Email → Local**.
- **Rules**: the server checks every field, ignores bots that fill the hidden
  field, adds no row for an address already on the list, and allows 5 tries per
  visitor per hour. Visitors are counted by a salted hash of their IP address;
  the raw address is never stored, and the hashes are cleared after a day. To
  use your own salt, add an `IP_HASH_SALT` secret; otherwise the site makes one.
- The rules live in `src/lib/waitlist/rules.ts`, with tests in `rules.test.ts`.

## Voice samples

The samples were made on this computer with an open model. No paid or online
voice service is used, and the site only serves the finished files.

- **Model**: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) v1.0 by
  hexgrad, Apache 2.0, run through
  [kokoro-js](https://github.com/hexgrad/kokoro) (Apache 2.0) with the ONNX
  weights `onnx-community/Kokoro-82M-v1.0-ONNX` and Transformers.js (Apache 2.0).
- **Voices** (Kokoro's built-in voices, Apache 2.0): Ada is `af_bella`, Rowan is
  `am_michael`, Mei is `af_heart`, and Theo is `bm_fable`.
- **Phonemes**: `phonemizer` (Apache 2.0), which wraps eSpeak NG (GPL-3.0). It
  runs only on your computer while generating and is not part of the site.
- **Files**: one clip per sentence, joined per sample into AAC (`.m4a`, 48 kb/s
  mono) with ffmpeg. Eight files in `public/audio/`, about 1.1 MB in total.

To regenerate: `pnpm add -D kokoro-js` (once; the model downloads on the first
run), then `pnpm voices`. You need ffmpeg on your PATH. Sentences are cached in
`.cache/voices`, so only changed ones are rendered again.

## Artwork and logo

- `pnpm art` renders the orb stills (`public/orb/`, from the real shader) and the
  1200 × 630 share images (`public/og/`) in headless Chrome. You need Google
  Chrome installed.
- `pnpm brand` turns `public/logo.svg` into `public/logo.png` and every favicon.

## Credits

- Fraunces (Undercase Type) and Figtree (Erik Kennedy), SIL Open Font License
  1.1, self-hosted through Fontsource.
- 3D simplex noise in the orb shader by Ashima Arts and Stefan Gustavson (MIT).
- Kokoro-82M and its voices, Apache 2.0 (see above).
- No maps or globe outlines are used.

## Where things are

- `src/routes/`: pages (home, voices, privacy, terms; the 404 is
  `src/components/NotFound.tsx`).
- `src/components/`: `orb/` (WebGL shader), `audio/`, `player/`, `screens/`
  (drawn screens and `ScreenSlot`), `home/` (sections), `site/` (header, footer).
- `src/lib/audio/`: one shared audio engine for samples, the player, and the
  microphone.
- `src/lib/waitlist/`: the form's server function, rules, and database store.
- `src/db/schema.ts`: tables. After changing it, run
  `pnpm db:generate --name <change>` and `pnpm db:migrate`.
- `scripts/`: `generate-voices.ts`, `render-art.ts`, `add-images.mjs`,
  `render-brand.mjs`.
