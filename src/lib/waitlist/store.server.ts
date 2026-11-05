import { and, count, eq, gte, lt } from 'drizzle-orm';
import { db } from '~/db';
import { siteSecrets, waitlistAttempts, waitlistSignups } from '~/db/schema';
import type { WaitlistStore } from './rules';

const DAY_MS = 24 * 60 * 60 * 1000;

export const d1WaitlistStore: WaitlistStore = {
  async countAttempts(visitor, since) {
    const [row] = await db
      .select({ value: count() })
      .from(waitlistAttempts)
      .where(
        and(eq(waitlistAttempts.visitor, visitor), gte(waitlistAttempts.createdAt, since))
      );
    return row?.value ?? 0;
  },

  async recordAttempt(visitor, at) {
    await db.batch([
      db.insert(waitlistAttempts).values({ visitor, createdAt: at }),
      db
        .delete(waitlistAttempts)
        .where(lt(waitlistAttempts.createdAt, new Date(at.getTime() - DAY_MS)))
    ]);
  },

  async insertSignup(signup) {
    const [row] = await db
      .insert(waitlistSignups)
      .values(signup)
      .onConflictDoNothing({ target: waitlistSignups.email })
      .returning({ id: waitlistSignups.id });
    return row ?? null;
  },

  async countOwnerEmailsSince(since) {
    const [row] = await db
      .select({ value: count() })
      .from(waitlistSignups)
      .where(
        and(eq(waitlistSignups.ownerNotified, true), gte(waitlistSignups.createdAt, since))
      );
    return row?.value ?? 0;
  },

  async markOwnerNotified(id) {
    await db
      .update(waitlistSignups)
      .set({ ownerNotified: true })
      .where(eq(waitlistSignups.id, id));
  }
};

function readSalt() {
  return db
    .select({ value: siteSecrets.value })
    .from(siteSecrets)
    .where(eq(siteSecrets.name, 'visitor_salt'));
}

/**
 * The salt for visitor hashes: the IP_HASH_SALT secret when it is set,
 * otherwise a random value this site generates once and keeps in D1.
 */
export async function visitorSalt(configured: string | undefined): Promise<string> {
  if (configured) return configured;
  const [existing] = await readSalt();
  if (existing) return existing.value;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  await db
    .insert(siteSecrets)
    .values({ name: 'visitor_salt', value })
    .onConflictDoNothing({ target: siteSecrets.name });
  const [saved] = await readSalt();
  return saved?.value ?? value;
}
