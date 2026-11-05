// Copy and data for every section of the home page, in page order.
// Voices, sample items, and questions have their own files in this folder.
//
// `screens` swaps a drawn product screen for your own image or video: set
// one to `{ image: 'name' }` (after `pnpm add-images`) or
// `{ video: '/media/clip.mp4', poster: 'name' }`. `null` keeps the drawing.

export type ScreenMedia =
  | null
  | { image: string; alt: string }
  | { video: string; poster?: string; alt: string };

export const home = {
  seo: {
    title: 'Murmur — everything you saved, read to you',
    description:
      'Murmur reads your saved articles, newsletters, PDFs, and email aloud in a natural voice you choose. Join the waitlist for iPhone, Android, and the web.'
  },

  hero: {
    eyebrow: 'A listening app from Lowtide Audio',
    headline: 'Everything you meant to read, read to you.',
    subhead:
      'Murmur turns the articles, newsletters, PDFs, and email you save into calm, natural listening, in a voice you choose. For the walk to work, the washing-up, and the last light of the day.',
    secondary: { label: 'Hear the voices', href: '#voices' },
    note: 'Coming to iPhone, Android, and the web in early 2027.'
  },

  voices: {
    eyebrow: 'Voices',
    heading: 'Four voices, each with a temperament.',
    body: 'Press play to hear each one read the opening of the same essay. The orb takes on the voice, and the words light up as they are spoken.',
    idleCaption: 'Choose a voice to start reading.',
    more: { label: 'More about each voice', href: '/voices' }
  },

  listen: {
    eyebrow: 'Listen anywhere',
    heading: 'Your queue, ready whenever your hands are busy.',
    body: 'Everything you save lines up in one calm queue. Change the speed, set a sleep timer, and pick up where you left off on any device.',
    dayHeading: 'A day with Murmur',
    /** Moments in a listening day. Each one opens an item in the player. */
    day: [
      { time: '7:40', place: 'On the train', itemId: 'small-hours', speed: 1.25 },
      { time: '12:30', place: 'Lunchtime walk', itemId: 'street-trees', speed: 1 },
      { time: '18:15', place: 'Cooking dinner', itemId: 'canopy-survey', speed: 1 },
      { time: '22:10', place: 'Lights low', itemId: 'allotment-thread', speed: 0.75 }
    ],
    screen: null as ScreenMedia
  },

  save: {
    eyebrow: 'Save from anywhere',
    heading: 'However it reaches you, Murmur can read it.',
    ways: [
      {
        id: 'share',
        title: 'Share sheet',
        sentence: 'Tap Share in any app on your phone and choose Murmur; it is in your queue before the screen locks.',
        screen: null as ScreenMedia
      },
      {
        id: 'extension',
        title: 'Browser extension',
        sentence: 'One click saves the page you are on, without the menus, ads, and cookie banners.',
        screen: null as ScreenMedia
      },
      {
        id: 'email',
        title: 'Email forwarding',
        sentence: 'Forward newsletters and threads to your own Murmur address and they arrive ready to play.',
        address: 'sam.k@in.murmur.example',
        screen: null as ScreenMedia
      },
      {
        id: 'pdf',
        title: 'PDF upload',
        sentence: 'Drop in a PDF and Murmur reads the text, skipping page numbers, headers, and footnote markers.',
        screen: null as ScreenMedia
      }
    ]
  },

  talk: {
    eyebrow: 'Talk to the orb',
    heading: 'Say something. It is listening, gently.',
    body: 'Turn on your microphone and the orb moves with your voice for up to 30 seconds, the same way it moves with Ada, Rowan, Mei, and Theo.',
    start: 'Talk to the orb',
    stop: 'Stop',
    seconds: 30,
    privacy:
      'Your audio stays in this browser. It is never recorded, saved, or sent anywhere.',
    denied:
      'The microphone is blocked for this site. Allow it in your browser’s site settings, then try again.',
    unsupported: 'This browser doesn’t offer microphone access here.',
    ended: 'That was lovely. Press the button to go again.'
  },

  questions: {
    eyebrow: 'Questions',
    heading: 'Good to know.'
  },

  waitlist: {
    eyebrow: 'Waitlist',
    heading: 'Be among the first to listen.',
    body: 'Leave your email and we will write once, when Murmur is ready for you. No newsletter, no sharing your address.',
    fields: {
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      platform: 'Where will you listen?',
      listensTo: 'What would you listen to most?'
    },
    platforms: [
      { value: 'iphone', label: 'iPhone' },
      { value: 'android', label: 'Android' },
      { value: 'web', label: 'Web' }
    ],
    listensTo: [
      { value: 'articles', label: 'Articles' },
      { value: 'newsletters', label: 'Newsletters' },
      { value: 'pdfs', label: 'PDFs' },
      { value: 'email', label: 'Email' }
    ],
    next: [
      'We keep your place in the queue, in the order you joined.',
      'One email when your invitation is ready, early in 2027.',
      'Your first three months of the paid plan are on us.'
    ],
    submitting: 'Joining…',
    fine: 'We store your email and these two answers, nothing else.',
    success: {
      heading: 'You’re on the list.',
      body: 'Thank you. We will email {email} once, when your invitation is ready.'
    },
    duplicate: {
      heading: 'You’re already on the list.',
      body: '{email} joined earlier, so there is nothing more to do. We will be in touch when Murmur opens.'
    },
    rateLimited:
      'That is a lot of tries from this connection. Please wait an hour, then try again.',
    failed:
      'We couldn’t reach our server. Your answers are still here; check your connection and press Join the waitlist again.'
  }
};
