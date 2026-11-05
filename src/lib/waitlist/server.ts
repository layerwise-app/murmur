import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { siteConfig } from '~/site.config';
import { HONEYPOT_FIELD, submitWaitlist, type RawSubmission } from './rules';
import { d1WaitlistStore, visitorSalt } from './store.server';

const MAX_FIELD_LENGTH = 320;

function text(value: unknown) {
  return typeof value === 'string' ? value.slice(0, MAX_FIELD_LENGTH) : undefined;
}

function pick(input: unknown): RawSubmission {
  const source = (input && typeof input === 'object' ? input : {}) as Record<
    string,
    unknown
  >;
  return {
    email: text(source.email),
    platform: text(source.platform),
    listensTo: text(source.listensTo),
    [HONEYPOT_FIELD]: text(source[HONEYPOT_FIELD])
  };
}

/** The waitlist form's only endpoint. Every rule is checked here. */
export const joinWaitlist = createServerFn({ method: 'POST' })
  .validator(pick)
  .handler(async ({ data }) => {
    const ip =
      getRequestHeader('cf-connecting-ip') ??
      getRequestIP({ xForwardedFor: true }) ??
      'unknown';
    const saltSecret = (env as { IP_HASH_SALT?: string }).IP_HASH_SALT;
    return submitWaitlist(data, {
      store: d1WaitlistStore,
      ip,
      salt: await visitorSalt(saltSecret),
      now: new Date(),
      ownerEmail: siteConfig.ownerEmail,
      productName: siteConfig.product,
      async sendEmail(message) {
        const { error } = await env.EMAIL.send(message);
        if (error) {
          console.warn(`[waitlist] owner email: ${error.code} ${error.message}`);
          return false;
        }
        return true;
      }
    });
  });
