import { describe, expect, it, vi } from 'vitest';
import {
  OWNER_EMAIL_DAILY_CAP,
  RATE_LIMIT,
  RATE_WINDOW_MS,
  hashVisitor,
  messages,
  submitWaitlist,
  validateSubmission,
  type OwnerEmail,
  type Submission,
  type WaitlistDeps,
  type WaitlistStore
} from './rules';

type Row = Submission & { id: string; createdAt: Date; ownerNotified: boolean };

function memoryStore() {
  const signups: Row[] = [];
  const attempts: { visitor: string; at: Date }[] = [];
  const store: WaitlistStore = {
    async countAttempts(visitor, since) {
      return attempts.filter((a) => a.visitor === visitor && a.at >= since).length;
    },
    async recordAttempt(visitor, at) {
      attempts.push({ visitor, at });
    },
    async insertSignup(signup) {
      if (signups.some((row) => row.email === signup.email)) return null;
      const row = { ...signup, id: `id-${signups.length + 1}`, ownerNotified: false };
      signups.push(row);
      return { id: row.id };
    },
    async countOwnerEmailsSince(since) {
      return signups.filter((row) => row.ownerNotified && row.createdAt >= since).length;
    },
    async markOwnerNotified(id) {
      const row = signups.find((entry) => entry.id === id);
      if (row) row.ownerNotified = true;
    }
  };
  return { store, signups, attempts };
}

const valid = { email: 'Ada@Example.com ', platform: 'iphone', listensTo: 'pdfs' };

function setup(overrides: Partial<WaitlistDeps> = {}) {
  const memory = memoryStore();
  const sent: OwnerEmail[] = [];
  const deps: WaitlistDeps = {
    store: memory.store,
    ip: '203.0.113.7',
    salt: 'test-salt',
    now: new Date('2026-11-06T09:00:00Z'),
    ownerEmail: '',
    productName: 'Murmur',
    sendEmail: vi.fn(async (message: OwnerEmail) => {
      sent.push(message);
      return true;
    }),
    ...overrides
  };
  return { ...memory, deps, sent };
}

describe('validation', () => {
  it('accepts a complete submission and normalises the email', () => {
    expect(validateSubmission(valid)).toEqual({
      ok: true,
      data: { email: 'ada@example.com', platform: 'iphone', listensTo: 'pdfs' }
    });
  });

  it('explains each missing or malformed field', () => {
    expect(validateSubmission({})).toEqual({
      ok: false,
      errors: {
        email: messages.emailMissing,
        platform: messages.platformMissing,
        listensTo: messages.listensToMissing
      }
    });
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
      const result = validateSubmission({ ...valid, email });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.email).toBe(messages.emailInvalid);
    }
  });

  it('only accepts the listed platforms and listening choices', () => {
    expect(validateSubmission({ ...valid, platform: 'blackberry' }).ok).toBe(false);
    expect(validateSubmission({ ...valid, listensTo: 'podcasts' }).ok).toBe(false);
    expect(validateSubmission({ ...valid, platform: ['iphone'] }).ok).toBe(false);
  });
});

describe('submitting', () => {
  it('saves a new sign-up', async () => {
    const { deps, signups } = setup();
    expect(await submitWaitlist(valid, deps)).toEqual({
      status: 'joined',
      email: 'ada@example.com'
    });
    expect(signups).toHaveLength(1);
    expect(signups[0]).toMatchObject({ email: 'ada@example.com', platform: 'iphone' });
  });

  it('returns invalid with field errors and saves nothing', async () => {
    const { deps, signups } = setup();
    const result = await submitWaitlist({ ...valid, email: 'nope' }, deps);
    expect(result).toEqual({ status: 'invalid', errors: { email: messages.emailInvalid } });
    expect(signups).toHaveLength(0);
  });

  it('treats the same email twice as already on the list, adding no row', async () => {
    const { deps, signups } = setup();
    await submitWaitlist(valid, deps);
    const again = await submitWaitlist(
      { email: '  ADA@example.COM', platform: 'web', listensTo: 'email' },
      deps
    );
    expect(again).toEqual({ status: 'duplicate', email: 'ada@example.com' });
    expect(signups).toHaveLength(1);
  });

  it('pretends to succeed when the honeypot is filled, and saves nothing', async () => {
    const { deps, signups, sent } = setup({ ownerEmail: 'owner@example.com' });
    const result = await submitWaitlist({ ...valid, website: 'http://spam.test' }, deps);
    expect(result.status).toBe('joined');
    expect(signups).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });
});

describe('rate limit', () => {
  it(`allows ${RATE_LIMIT} submissions per visitor per hour`, async () => {
    const { deps } = setup();
    for (let i = 0; i < RATE_LIMIT; i++) {
      const result = await submitWaitlist({ ...valid, email: `n${i}@example.com` }, deps);
      expect(result.status).toBe('joined');
    }
    expect(await submitWaitlist({ ...valid, email: 'six@example.com' }, deps)).toEqual({
      status: 'rate_limited'
    });
  });

  it('counts every kind of submission, including invalid and honeypot ones', async () => {
    const { deps } = setup();
    await submitWaitlist({ email: 'bad' }, deps);
    await submitWaitlist({ ...valid, website: 'x' }, deps);
    await submitWaitlist(valid, deps);
    await submitWaitlist(valid, deps);
    await submitWaitlist({}, deps);
    expect((await submitWaitlist(valid, deps)).status).toBe('rate_limited');
  });

  it('opens again after an hour and is separate for each visitor', async () => {
    const { deps } = setup();
    for (let i = 0; i < RATE_LIMIT; i++) await submitWaitlist({}, deps);
    expect((await submitWaitlist(valid, deps)).status).toBe('rate_limited');
    expect((await submitWaitlist(valid, { ...deps, ip: '198.51.100.2' })).status).toBe(
      'joined'
    );
    const later = new Date(deps.now.getTime() + RATE_WINDOW_MS + 1000);
    expect(
      (await submitWaitlist({ ...valid, email: 'later@example.com' }, { ...deps, now: later }))
        .status
    ).toBe('joined');
  });

  it('keys visitors by a salted hash, never the raw IP', async () => {
    const { deps, attempts } = setup();
    await submitWaitlist(valid, deps);
    expect(attempts[0].visitor).not.toContain('203.0.113.7');
    expect(attempts[0].visitor).toMatch(/^[0-9a-f]{64}$/);
    expect(attempts[0].visitor).toBe(await hashVisitor('203.0.113.7', 'test-salt'));
    expect(await hashVisitor('203.0.113.7', 'other-salt')).not.toBe(attempts[0].visitor);
  });
});

describe('owner email', () => {
  it('sends nothing when ownerEmail is empty', async () => {
    const { deps, sent } = setup();
    await submitWaitlist(valid, deps);
    expect(sent).toHaveLength(0);
  });

  it('emails the owner, never the visitor, for each new sign-up', async () => {
    const { deps, sent, signups } = setup({ ownerEmail: 'owner@example.com' });
    await submitWaitlist(valid, deps);
    await submitWaitlist(valid, deps); // duplicate: no second email
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('owner@example.com');
    expect(sent[0].text).toContain('ada@example.com');
    expect(sent[0].text).toContain('iPhone');
    expect(signups[0].ownerNotified).toBe(true);
  });

  it('escapes what the visitor typed in the HTML body', async () => {
    const { deps, sent } = setup({ ownerEmail: 'owner@example.com' });
    await submitWaitlist({ ...valid, email: '<b>x</b>@example.com' }, deps);
    expect(sent[0].html).not.toContain('<b>x</b>');
    expect(sent[0].html).toContain('&#60;b&#62;x');
  });

  it(`stops emailing after ${OWNER_EMAIL_DAILY_CAP} a day but keeps saving`, async () => {
    const { deps, sent, signups } = setup({ ownerEmail: 'owner@example.com' });
    for (let i = 0; i < OWNER_EMAIL_DAILY_CAP + 3; i++) {
      // A new visitor each time, so the rate limit doesn't interfere.
      await submitWaitlist(
        { ...valid, email: `person${i}@example.com` },
        { ...deps, ip: `10.0.${Math.floor(i / 250)}.${i % 250}` }
      );
    }
    expect(signups).toHaveLength(OWNER_EMAIL_DAILY_CAP + 3);
    expect(sent).toHaveLength(OWNER_EMAIL_DAILY_CAP);
    const tomorrow = new Date('2026-11-07T00:05:00Z');
    await submitWaitlist(
      { ...valid, email: 'tomorrow@example.com' },
      { ...deps, now: tomorrow, ip: '10.9.9.9' }
    );
    expect(sent).toHaveLength(OWNER_EMAIL_DAILY_CAP + 1);
  });

  it('still saves the sign-up when the email fails', async () => {
    const { deps, signups } = setup({
      ownerEmail: 'owner@example.com',
      sendEmail: async () => {
        throw new Error('offline');
      }
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect((await submitWaitlist(valid, deps)).status).toBe('joined');
    expect(signups).toHaveLength(1);
    expect(signups[0].ownerNotified).toBe(false);
  });
});
