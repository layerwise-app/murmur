// Copy for the Voices, Privacy, and Terms pages. Voices themselves live in
// voices.ts. In legal text, a blank line starts a new paragraph and lines
// starting with "- " become a list. {contactEmail} becomes a link to
// siteConfig.contactEmail; while that is empty, any sentence mentioning it is
// left out.

export const voicesPage = {
  seo: {
    title: 'Voices — Murmur',
    description:
      'Meet Ada, Rowan, Mei, and Theo: four natural Murmur voices, each tuned for one kind of reading. Hear each one read a longer passage.'
  },
  eyebrow: 'Voices',
  heading: 'Meet Ada, Rowan, Mei, and Theo.',
  lede: 'Each Murmur voice is synthetic and tuned for one kind of reading. Press play to hear a longer passage, read just as it would be in the app.',
  goodFor: 'Good for',
  reading: 'Reading',
  samplesNote:
    'About these samples: they were rendered on our own computers with Kokoro-82M, an open-weight text-to-speech model. None of them is a recording of a real person.',
  closing: {
    heading: 'Pick a favourite, or one for every source.',
    body: 'In the app you can set a voice per newsletter, per sender, or per kind of item, and change it whenever you like.'
  }
};

export type LegalPage = {
  seo: { title: string; description: string };
  eyebrow: string;
  heading: string;
  lede: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

export const privacyPage: LegalPage = {
  seo: {
    title: 'Privacy — Murmur',
    description:
      'What Murmur stores, why saved items are processed only to read them aloud, and what the waitlist keeps. Written plainly.'
  },
  eyebrow: 'Privacy',
  heading: 'What Murmur keeps, and what it never does.',
  lede: 'Murmur reads your things aloud. That is the only thing we do with them.',
  updated: '6 November 2026',
  sections: [
    {
      heading: 'The short version',
      body: 'We store what we need to read to you and to keep your account working. We do not sell your data, show you advertising, or use your library to train voice models.'
    },
    {
      heading: 'What Murmur stores',
      body: '- Your account: your email address and your settings, such as voices, speeds, and sources.\n- Your library: the text of each item you save, where it came from (a link or a sender), and how far you have listened.\n- Diagnostics: crash reports, only if you turn them on.'
    },
    {
      heading: 'How saved items are used',
      body: 'Saved items are processed only to read them aloud to you. We extract the text, prepare it for the voice you chose, and generate the audio. Audio is made on servers we run in the European Union and deleted from them once it reaches your device.\n\nNobody at Lowtide Audio reads your library unless you send us an item for support. Your items are never shared with advertisers or data brokers, and never used to train models.'
    },
    {
      heading: 'Deleting things',
      body: 'Delete an item and it is removed from our servers within 30 days, backups included. Delete your account and everything goes with it, on the same schedule.'
    },
    {
      heading: 'The waitlist',
      body: 'When you join the waitlist we store your email address, the platform you chose, what you would listen to most, and the date you joined. We use your email only to invite you when Murmur opens.\n\nTo stop the form being abused, we briefly keep a one-way, salted hash of your IP address and clear entries older than 24 hours. We never store the address itself. Ask us at any time and we will remove you from the list.'
    },
    {
      heading: 'This website',
      body: 'This site sets no advertising or tracking cookies. Voice samples load only when you press play.\n\nIf you use Talk to the orb, your browser asks for the microphone. The sound is analysed inside your browser to move the orb for up to 30 seconds. It is never recorded, saved, or sent to us or anyone else.'
    },
    {
      heading: 'Your rights',
      body: 'Murmur is made by Lowtide Audio Ltd in Bristol, England. Under UK data protection law you can ask to see, correct, or delete what we hold about you, and you can complain to the Information Commissioner’s Office. Write to us at {contactEmail} and a person will reply.'
    }
  ]
};

export const termsPage: LegalPage = {
  seo: {
    title: 'Terms — Murmur',
    description:
      'The plain terms for the Murmur website, the waitlist, and the app once you are invited, from Lowtide Audio Ltd in Bristol.'
  },
  eyebrow: 'Terms',
  heading: 'The plain terms for using Murmur.',
  lede: 'These terms cover this website, the waitlist, and the Murmur app once you are invited. They are short on purpose.',
  updated: '6 November 2026',
  sections: [
    {
      heading: 'Who we are',
      body: 'Murmur is made by Lowtide Audio Ltd, a twelve-person company in Bristol, England. “We” means us; “you” means you.'
    },
    {
      heading: 'The waitlist',
      body: 'Joining the waitlist is free and does not commit you to anything. We invite people in the order they joined, and we expect to open in early 2027, but we cannot promise a date. You can leave the list whenever you like.'
    },
    {
      heading: 'Using Murmur',
      body: '- Save only things you have the right to read, such as articles you can access and email sent to you.\n- Murmur is for your own listening. Do not use it to publish or share other people’s work as audio.\n- Do not try to break, overload, or copy the service, or get around its limits.'
    },
    {
      heading: 'The voices',
      body: 'Ada, Rowan, Mei, and Theo are synthetic voices. The audio Murmur makes is for your personal listening. Please do not present it as the voice of a real person or use it to mislead anyone.'
    },
    {
      heading: 'Plans and payment',
      body: 'There will be a free plan and one paid plan. Nothing is charged before launch, and we will show prices clearly before you choose a plan. Waitlist members get their first three months of the paid plan free.'
    },
    {
      heading: 'If things go wrong',
      body: 'We work hard to keep Murmur running and accurate, but it is provided as it is, and a voice can occasionally misread a word. As far as the law allows, we are not responsible for losses that come from using Murmur. Nothing here limits rights you have by law as a consumer.'
    },
    {
      heading: 'Ending and changes',
      body: 'You can delete your account at any time. We may suspend accounts that break these terms. If we change the terms in a way that matters, we will update the date above and tell you in the app before it takes effect.'
    },
    {
      heading: 'The law',
      body: 'These terms are governed by the law of England and Wales. Questions are welcome at {contactEmail}.'
    }
  ]
};
