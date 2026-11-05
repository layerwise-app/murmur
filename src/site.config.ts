// Site-wide settings: names, navigation, buttons, links, colours, fonts, and
// where new waitlist sign-ups are emailed. Page copy lives in src/content/.

export const siteConfig = {
  company: 'Lowtide Audio',
  companyLegalName: 'Lowtide Audio Ltd',
  companyLocation: 'Bristol, England',
  product: 'Murmur',
  tagline: 'Everything you saved, read to you.',
  description:
    'Murmur reads the articles, newsletters, PDFs, and email you save aloud, in a natural voice you choose. Coming to iPhone, Android, and the web.',
  launch: 'early 2027',
  platforms: ['iPhone', 'Android', 'the web'],

  /** Header links. `href` may be a page (`/voices`) or a home section (`/#listen`). */
  navigation: [
    { label: 'Voices', href: '/voices' },
    { label: 'Listen', href: '/#listen' },
    { label: 'Save', href: '/#save' },
    { label: 'Questions', href: '/#questions' }
  ],

  /** Every call to action goes to the one waitlist form on the home page. */
  cta: {
    label: 'Join the waitlist',
    short: 'Join',
    href: '/#waitlist'
  },

  footerLinks: [
    { label: 'Voices', href: '/voices' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' }
  ],

  /** Social profiles shown in the footer. Entries with an empty `href` are hidden. */
  social: [
    { label: 'Instagram', href: '' },
    { label: 'Bluesky', href: '' },
    { label: 'YouTube', href: '' }
  ],

  /** Where people can write to the company, shown on Privacy and Terms. */
  contactEmail: 'hello@lowtide.example',

  /**
   * New waitlist sign-ups are emailed here (at most 100 a day). Leave empty
   * to only save them; they always appear in the project's Database panel.
   */
  ownerEmail: '',

  /** Page colours. Text colours keep at least 4.5:1 contrast on cream and sand. */
  colors: {
    cream: '#f8f2e9',
    sand: '#efe4d4',
    sandDeep: '#e4d4be',
    ink: '#2a201b',
    inkSoft: '#62534a',
    line: 'rgba(42, 32, 27, 0.13)',
    apricot: '#f0a46c',
    rose: '#d8857a',
    sage: '#9fb28f',
    error: '#a23a2a'
  },

  /**
   * Font stacks. The font files are self-hosted from Fontsource packages and
   * imported in src/styles/fonts.css; change both together (see README).
   */
  fonts: {
    display: "'Fraunces Variable', 'Fraunces Fallback', Georgia, serif",
    body: "'Figtree Variable', 'Figtree Fallback', ui-sans-serif, system-ui, sans-serif"
  }
} as const;

export type SiteConfig = typeof siteConfig;
