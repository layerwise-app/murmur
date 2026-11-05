// The four sample items in Murmur's queue, as typed text, with the
// sentence-level captions that the voice samples follow.
//
// Each item's `body` is a list of paragraphs, and each paragraph a list of
// sentences. A sentence is either plain text, or `{ text, say }` when the
// voice should say it differently from how it is written (numbers, years).
// The audio sample for an item covers its first `sampleSentences` sentences;
// those sentences are the captions that highlight as it plays.
//
// After changing any sentence that is read aloud, run `pnpm voices` to render
// the audio again. It rewrites the `clips` block at the bottom of this file.
//
// Keep this file free of runtime imports: `scripts/generate-voices.ts` reads
// it with Node directly.

import type { VoiceId } from './voices';

export type Sentence = string | { text: string; say: string };

export type ItemKind = 'essay' | 'newsletter' | 'pdf' | 'email';

export type ListeningItem = {
  id: string;
  kind: ItemKind;
  /** Short label for the kind of item, shown in the queue. */
  kindLabel: string;
  title: string;
  /** Where it was saved from. */
  source: string;
  byline: string;
  /** The voice that reads this item in the player. */
  readBy: VoiceId;
  /** How many opening sentences the audio sample reads. */
  sampleSentences: number;
  body: Sentence[][];
};

/** The voice picker plays every voice reading the opening of this item. */
export const pickerSample = { itemId: 'street-trees', sentences: 3 };

export const listening: ListeningItem[] = [
  {
    id: 'street-trees',
    kind: 'essay',
    kindLabel: 'Essay',
    title: 'The shade we inherit',
    source: 'The Long Field',
    byline: 'Imogen Hale',
    readBy: 'theo',
    sampleSentences: 7,
    body: [
      [
        'Walk down an old street on a hot afternoon and you can feel a decision someone made a hundred years ago.',
        'The air is cooler under the planes.',
        'The light comes down in pieces, and moves across the pavement like water.',
        'The people who planted those trees never sat in that shade.',
        'They planted it for strangers, and for a city they would not live to see.'
      ],
      [
        'Cities still do this, by the thousand, every winter.',
        'The reasons are less sentimental than they first appear.',
        'A mature street tree is a piece of infrastructure, as practical as a drain or a streetlight, and in several ways it does a better job than either.'
      ],
      [
        'The habit is older than the science.',
        'Many of the great avenues of European cities were planted in the nineteenth century, when the streets were thick with coal smoke and almost nothing green would survive in them.',
        'The plane tree earned its place because it sheds its bark in flakes, shrugging off the soot along with it, and because it tolerated being pruned, paved around, and ignored.',
        'The engineers who chose it were not thinking about climate.',
        'They wanted something that would live.'
      ],
      [
        'Start with heat.',
        'Paved streets soak up the sun all day and give it back all night, which is why the middle of a city can stay several degrees warmer than the fields around it long after dark.',
        'A canopy interrupts that cycle.',
        'Leaves shade the road before it warms, and they release water as they breathe, cooling the air around them the way sweat cools skin.',
        'On a summer afternoon, the pavement under a full-grown plane tree can be fifteen degrees cooler than the pavement in the open.',
        'For an older person in a top-floor flat, that difference is not a matter of comfort.',
        'It is a matter of safety.'
      ],
      [
        'Then there is water.',
        'When heavy rain falls on a city of roofs and roads, it has nowhere to go but the drains, and the drains were sized for the rain of another century.',
        'Trees slow it down.',
        'A large canopy holds a surprising share of a storm on its leaves and bark, letting it drip and evaporate over hours instead of rushing to the gutter in minutes.',
        'Its roots open the soil beneath the pavement, so that what does reach the ground can soak in.',
        'Engineers have a name for this, which is green infrastructure, and a price for it, which is lower than the cost of digging up the street to lay a larger pipe.'
      ],
      [
        'The air is cleaner, too, though more modestly than people hope.',
        'Leaves catch fine dust on their surfaces, and a row of trees between a busy road and a footpath can soften what walkers breathe.',
        'They give the city back some of its birdsong, too: a single mature oak can host hundreds of kinds of insect, and the birds follow the insects.',
        'They also soften what walkers hear.',
        'A street lined with trees sounds different: not silent, but rounder, as if the traffic has stepped back a pace.'
      ],
      [
        'The less measurable reasons may matter most.',
        'People walk further on streets with trees, and they walk more slowly.',
        'Shops on leafy streets tend to find that visitors linger.',
        'In studies across many cities, residents who can see trees from their windows report less stress, and patients recovering in rooms that face a green view have asked for fewer painkillers.',
        'Nobody fully understands why.',
        'It may simply be that a tree is a living thing that changes with the seasons, and a street with living things in it feels like somewhere people are expected to stay.'
      ],
      [
        'None of this is easy.',
        'A street is a hostile place to grow.',
        'Roots compete with gas mains and cables for the same narrow strip of ground, the soil is compacted and starved, and a young tree needs watering through its first three summers or it will quietly die.',
        'Planting is the cheap part.',
        'Care is the expensive part, and it is the part that gets cut first when budgets tighten.',
        'The cities that do this well choose species that can cope with drought and road salt, give each tree a generous pit of good soil, and recruit neighbours to carry a bucket out on dry evenings.'
      ],
      [
        'There is also the question of where the trees go.',
        'In most cities, canopy cover follows money.',
        'The wealthiest neighbourhoods are often the shadiest, while streets of terraced houses and tower blocks swelter in July.',
        'Some cities now map their canopy street by street and plant first where the shade is thinnest and the summers hit hardest.',
        'It is slow work, and it asks for faith.',
        'A tree planted this winter will not cast a useful shadow for fifteen years.'
      ],
      [
        'That is the strange bargain at the heart of it.',
        'Almost everything else a city builds is at its best on the day it opens and declines from there.',
        'A street tree is the opposite.',
        'It is at its weakest on the day it goes in, a whip of a thing tied to a stake, and it improves every year for a lifetime.',
        'Planting one is an act of patience on behalf of people you will never meet.',
        'Somewhere, on a hot afternoon a century from now, someone will walk under it and feel cooler, and they will not think about you at all.',
        'That is rather the point.'
      ]
    ]
  },
  {
    id: 'small-hours',
    kind: 'newsletter',
    kindLabel: 'Newsletter',
    title: 'Three things before your coffee goes cold',
    source: 'Small Hours, issue 142',
    byline: 'Priya Natarajan',
    readBy: 'ada',
    sampleSentences: 5,
    body: [
      [
        {
          text: 'Good morning, and welcome to issue 142 of Small Hours.',
          say: 'Good morning, and welcome to issue one hundred and forty-two of Small Hours.'
        },
        'Three things worth knowing before your coffee goes cold.'
      ],
      [
        'First, a small library on the north coast has started lending out telescopes, and the waiting list is now longer than the one for the new crime novels.',
        'The librarians say the clear nights are booked until spring.'
      ],
      [
        'Second, the humble paper map is having a quiet comeback.',
        'Walking groups report that members who navigate with one remember the route for weeks, while the people who followed a blue dot on a phone can barely recall the car park.'
      ],
      [
        'Third, if you only read one long piece this week, make it the essay on street trees that half of you forwarded to me on Sunday.',
        'It made me look up on the walk to work, which I am told is the whole idea.'
      ],
      [
        'Elsewhere: a bakery in town is naming its loaves after readers who write in, a reader in Leeds has kept a diary of every bird on her balcony for nine years, and the answer to last week’s puzzle was, in fact, the lighthouse.',
        'Thank you to everyone who wrote in with a guess, including the four of you who were very confident it was a kettle.'
      ],
      [
        'That is all for today.',
        'Go gently, drink the coffee while it is warm, and I will see you on Thursday.'
      ]
    ]
  },
  {
    id: 'canopy-survey',
    kind: 'pdf',
    kindLabel: 'PDF report',
    title: 'Neighbourhood Canopy Survey 2026',
    source: 'canopy-survey-2026.pdf, 14 pages',
    byline: 'Westbury Field Trust',
    readBy: 'mei',
    sampleSentences: 5,
    body: [
      [
        'Summary of findings.',
        {
          text: 'Between April and September, 212 volunteers recorded 4,112 street trees across nine wards.',
          say: 'Between April and September, two hundred and twelve volunteers recorded four thousand, one hundred and twelve street trees across nine wards.'
        },
        {
          text: 'Canopy cover rose from 17.2 percent to 18.9 percent since the last survey in 2021.',
          say: 'Canopy cover rose from seventeen point two percent to eighteen point nine percent since the last survey, in twenty twenty-one.'
        },
        {
          text: 'The gain is uneven: three wards account for 71 percent of new planting, while two wards saw a small net loss.',
          say: 'The gain is uneven. Three wards account for seventy-one percent of new planting, while two wards saw a small net loss.'
        },
        {
          text: 'Young trees planted after 2022 had a first-summer survival rate of 86 percent where a watering volunteer was assigned, and 58 percent where none was.',
          say: 'Young trees planted after twenty twenty-two had a first-summer survival rate of eighty-six percent where a watering volunteer was assigned, and fifty-eight percent where none was.'
        }
      ],
      [
        'Recommendations.',
        'Prioritise planting in the two wards where cover fell, beginning with streets that have no trees at all.',
        'Pair every new planting with a named watering volunteer for its first three summers.',
        'Replace the London plane only where it has failed, and favour drought-tolerant species such as hornbeam, field maple, and the Persian ironwood.',
        'Repeat the survey in 2029, using the same routes, so that change can be measured street by street.'
      ]
    ]
  },
  {
    id: 'allotment-thread',
    kind: 'email',
    kindLabel: 'Email thread',
    title: 'Re: Saturday at the allotment',
    source: 'Inbox, 3 messages',
    byline: 'Nina, Sam, and Dad',
    readBy: 'rowan',
    sampleSentences: 7,
    body: [
      [
        'Saturday at the allotment. Three messages.',
        'Nina wrote, on Thursday evening:',
        'Is everyone still coming on Saturday? Dad says the beans are finally ready, and he wants witnesses.'
      ],
      [
        'Sam replied, an hour later:',
        'I will bring the good bread and the folding chairs. Do we need anything for the shed roof, or is that a job for next time?'
      ],
      [
        'And Dad wrote, this morning:',
        'Bring your boots, it rained all night. The roof can wait. I have put the kettle in the shed, so we are set.'
      ]
    ]
  }
];

export function sentenceText(sentence: Sentence): string {
  return typeof sentence === 'string' ? sentence : sentence.text;
}

export function sentenceSpeech(sentence: Sentence): string {
  return typeof sentence === 'string' ? sentence : sentence.say;
}

export function getItem(id: string): ListeningItem | undefined {
  return listening.find((item) => item.id === id);
}

/** Every sentence of an item, in reading order. */
export function itemSentences(item: ListeningItem): Sentence[] {
  return item.body.flat();
}

export function wordCount(item: ListeningItem): number {
  return itemSentences(item)
    .map(sentenceText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/** The audio clip ids this site uses. */
export const clipId = {
  opening: (voiceId: string) => `opening-${voiceId}`,
  item: (itemId: string, voiceId: string) => `${itemId}-${voiceId}`
};

export type Clip = {
  src: string;
  /** Seconds. */
  duration: number;
  /** Start and end of each sentence, in seconds. */
  sentences: [number, number][];
};

// <generated:clips>
// Written by `pnpm voices`; do not edit by hand.
export const clips: Record<string, Clip> = {
  'opening-ada': {
    src: '/audio/opening-ada.m4a',
    duration: 12.347,
    sentences: [
      [0.12, 5.725],
      [6.085, 7.676],
      [8.036, 11.997]
    ]
  },
  'small-hours-ada': {
    src: '/audio/small-hours-ada.m4a',
    duration: 24.483,
    sentences: [
      [0.12, 4.547],
      [4.907, 7.786],
      [8.406, 17.108],
      [17.468, 20.331],
      [20.951, 24.133]
    ]
  },
  'opening-rowan': {
    src: '/audio/opening-rowan.m4a',
    duration: 14.392,
    sentences: [
      [0.12, 6.683],
      [7.043, 9.055],
      [9.415, 14.042]
    ]
  },
  'allotment-thread-rowan': {
    src: '/audio/allotment-thread-rowan.m4a',
    duration: 33.193,
    sentences: [
      [0.12, 3.029],
      [3.389, 5.499],
      [5.859, 12.724],
      [13.344, 15.17],
      [15.53, 23.574],
      [24.194, 25.826],
      [26.186, 32.843]
    ]
  },
  'opening-mei': {
    src: '/audio/opening-mei.m4a',
    duration: 12.507,
    sentences: [
      [0.12, 5.768],
      [6.128, 7.847],
      [8.207, 12.157]
    ]
  },
  'canopy-survey-mei': {
    src: '/audio/canopy-survey-mei.m4a',
    duration: 37.421,
    sentences: [
      [0.12, 1.402],
      [1.762, 10.263],
      [10.623, 18.493],
      [18.853, 26.035],
      [26.395, 37.071]
    ]
  },
  'opening-theo': {
    src: '/audio/opening-theo.m4a',
    duration: 14.656,
    sentences: [
      [0.12, 6.272],
      [6.632, 9.252],
      [9.612, 14.306]
    ]
  },
  'street-trees-theo': {
    src: '/audio/street-trees-theo.m4a',
    duration: 32.129,
    sentences: [
      [0.12, 6.272],
      [6.632, 9.252],
      [9.612, 14.306],
      [14.666, 18.56],
      [18.92, 23.376],
      [23.996, 27.745],
      [28.105, 31.779]
    ]
  }
};
// </generated:clips>
