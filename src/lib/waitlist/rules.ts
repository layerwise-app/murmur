// The waitlist form's rules, independent of the database and email service so
// they can be tested on their own. The server function in ./server.ts wires
// them to D1 and env.EMAIL.

export const PLATFORMS = ['iphone', 'android', 'web'] as const;
export const LISTENS_TO = ['articles', 'newsletters', 'pdfs', 'email'] as const;

export type Platform = (typeof PLATFORMS)[number];
export type ListensTo = (typeof LISTENS_TO)[number];

/** Submissions allowed per visitor (salted IP hash) per window. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;
/** Owner notification emails per UTC day; past this, sign-ups are only saved. */
export const OWNER_EMAIL_DAILY_CAP = 100;
/** The hidden field people never see; anything typed in it is a bot. */
export const HONEYPOT_FIELD = 'website';

export type RawSubmission = {
  email?: unknown;
  platform?: unknown;
  listensTo?: unknown;
  [HONEYPOT_FIELD]?: unknown;
};

export type Submission = {
  email: string;
  platform: Platform;
  listensTo: ListensTo;
};

export type FieldErrors = Partial<Record<keyof Submission, string>>;

export type SubmitResult =
  | { status: 'joined'; email: string }
  | { status: 'duplicate'; email: string }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'rate_limited' };

export const messages = {
  emailMissing: 'Enter your email address.',
  emailInvalid: 'That doesn’t look like an email address. Check for typos.',
  platformMissing: 'Choose where you will listen.',
  listensToMissing: 'Choose what you would listen to most.'
};

// Deliberately simple: something@something.tld, no spaces, sensible length.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isHoneypotFilled(raw: RawSubmission): boolean {
  const value = raw[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim() !== '';
}

export function validateSubmission(
  raw: RawSubmission
): { ok: true; data: Submission } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const email = typeof raw.email === 'string' ? normalizeEmail(raw.email) : '';
  if (!email) errors.email = messages.emailMissing;
  else if (email.length > 254 || !EMAIL_PATTERN.test(email))
    errors.email = messages.emailInvalid;

  const platform = PLATFORMS.find((value) => value === raw.platform);
  if (!platform) errors.platform = messages.platformMissing;

  const listensTo = LISTENS_TO.find((value) => value === raw.listensTo);
  if (!listensTo) errors.listensTo = messages.listensToMissing;

  if (!platform || !listensTo || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { email, platform, listensTo } };
}

/** SHA-256 of salt and IP, hex encoded. The raw IP is never stored. */
export async function hashVisitor(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export interface WaitlistStore {
  countAttempts(visitor: string, since: Date): Promise<number>;
  recordAttempt(visitor: string, at: Date): Promise<void>;
  /** Saves a sign-up; returns null when the email is already on the list. */
  insertSignup(signup: Submission & { createdAt: Date }): Promise<{ id: string } | null>;
  countOwnerEmailsSince(since: Date): Promise<number>;
  markOwnerNotified(id: string): Promise<void>;
}

export type OwnerEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type WaitlistDeps = {
  store: WaitlistStore;
  /** The visitor's IP address, used only to compute the rate-limit hash. */
  ip: string;
  salt: string;
  now: Date;
  /** From site.config; empty means no notification email. */
  ownerEmail: string;
  productName: string;
  /** Sends one email. Resolves to whether it was accepted. */
  sendEmail: (message: OwnerEmail) => Promise<boolean>;
};

export async function submitWaitlist(
  raw: RawSubmission,
  deps: WaitlistDeps
): Promise<SubmitResult> {
  const visitor = await hashVisitor(deps.ip, deps.salt);
  const since = new Date(deps.now.getTime() - RATE_WINDOW_MS);
  if ((await deps.store.countAttempts(visitor, since)) >= RATE_LIMIT) {
    return { status: 'rate_limited' };
  }
  await deps.store.recordAttempt(visitor, deps.now);

  // Bots get the same answer as people, and nothing is saved.
  if (isHoneypotFilled(raw)) {
    return {
      status: 'joined',
      email: typeof raw.email === 'string' ? normalizeEmail(raw.email) : ''
    };
  }

  const result = validateSubmission(raw);
  if (!result.ok) return { status: 'invalid', errors: result.errors };

  const saved = await deps.store.insertSignup({ ...result.data, createdAt: deps.now });
  if (!saved) return { status: 'duplicate', email: result.data.email };

  await notifyOwner(saved.id, result.data, deps);
  return { status: 'joined', email: result.data.email };
}

const label: Record<string, string> = {
  iphone: 'iPhone',
  android: 'Android',
  web: 'Web',
  articles: 'Articles',
  newsletters: 'Newsletters',
  pdfs: 'PDFs',
  email: 'Email'
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function ownerEmailFor(
  signup: Submission,
  to: string,
  productName: string,
  joinedAt: Date
): OwnerEmail {
  const rows: [string, string][] = [
    ['Email', signup.email],
    ['Platform', label[signup.platform]],
    ['Would listen to', label[signup.listensTo]],
    ['Joined', joinedAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC']
  ];
  return {
    // Always the owner's address from site.config, never the visitor's.
    to,
    subject: `New ${productName} waitlist sign-up`,
    text: `Someone joined the ${productName} waitlist.\n\n${rows
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}\n`,
    html: `<p>Someone joined the ${escapeHtml(productName)} waitlist.</p><table>${rows
      .map(
        ([key, value]) =>
          `<tr><td style="padding:2px 12px 2px 0;color:#62534a">${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`
      )
      .join('')}</table>`
  };
}

async function notifyOwner(id: string, signup: Submission, deps: WaitlistDeps) {
  const to = deps.ownerEmail.trim();
  if (!to) return;
  const sentToday = await deps.store.countOwnerEmailsSince(startOfUtcDay(deps.now));
  if (sentToday >= OWNER_EMAIL_DAILY_CAP) return;
  try {
    const sent = await deps.sendEmail(ownerEmailFor(signup, to, deps.productName, deps.now));
    if (sent) await deps.store.markOwnerNotified(id);
  } catch (error) {
    // A failed notification never fails the visitor's sign-up.
    console.warn('[waitlist] owner email failed', error);
  }
}
