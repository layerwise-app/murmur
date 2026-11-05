// Questions on the home page, in order. Add, remove, or reorder freely.
// Answers are plain text; a blank line starts a new paragraph, and
// [words](/path) makes a link.

export type Faq = { question: string; answer: string };

export const faq: Faq[] = [
  {
    question: 'When can I start listening?',
    answer:
      'Murmur opens in early 2027 on iPhone, Android, and the web. People on the waitlist are invited first, in the order they joined, and we will email you once when your invitation is ready.'
  },
  {
    question: 'What can Murmur read?',
    answer:
      'Anything you would read on a screen: web articles, newsletters, PDFs (scanned ones too), and email threads. It leaves out what you would skip with your eyes, like menus, ads, page numbers, footnote markers, signatures, and quoted replies.'
  },
  {
    question: 'Are Ada, Rowan, Mei, and Theo real people?',
    answer:
      'No. They are synthetic voices, and none of them is a copy of a real person’s voice. We chose each one for how it reads a particular kind of writing, and you can switch voices per item or set a favourite for each source.'
  },
  {
    question: 'Does it work without a connection?',
    answer:
      'Yes. Murmur prepares your queue while you are on Wi-Fi, so you can listen underground, on a plane, or at the far end of the garden.'
  },
  {
    question: 'What happens to the things I save?',
    answer:
      'They are processed only to read them aloud to you. Your library stays yours: we never sell it, show it to advertisers, or use it to train voice models, and deleting an item removes it from our servers within 30 days.\n\n[The privacy page](/privacy) explains exactly what we store.'
  },
  {
    question: 'How much will it cost?',
    answer:
      'There will be a free plan with a few items a week and one paid plan for unlimited listening. Everyone who joins the waitlist gets their first three months of the paid plan free.'
  }
];
