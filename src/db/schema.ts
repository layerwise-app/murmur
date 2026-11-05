import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Starter authentication tables. This site has no accounts, so nothing reads
// or writes them; they stay so the existing migrations remain intact.

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  role: text('role'),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp' })
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp'
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp'
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  )
});

// Waitlist sign-ups from the home page form. View them in the project's
// Database panel in Layerwise.
export const waitlistSignups = sqliteTable(
  'waitlist_signups',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    platform: text('platform', { enum: ['iphone', 'android', 'web'] }).notNull(),
    listensTo: text('listens_to', {
      enum: ['articles', 'newsletters', 'pdfs', 'email']
    }).notNull(),
    ownerNotified: integer('owner_notified', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  (table) => [index('waitlist_signups_created_at_idx').on(table.createdAt)]
);

// One row per form submission, for the rate limit. `visitor` is a salted
// SHA-256 hash of the IP address; raw addresses are never stored. Rows older
// than a day are deleted as new ones arrive.
export const waitlistAttempts = sqliteTable(
  'waitlist_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    visitor: text('visitor').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
  },
  (table) => [
    index('waitlist_attempts_visitor_idx').on(table.visitor, table.createdAt)
  ]
);

// Secrets the site creates for itself, like the salt for visitor hashes.
export const siteSecrets = sqliteTable('site_secrets', {
  name: text('name').primaryKey(),
  value: text('value').notNull()
});
