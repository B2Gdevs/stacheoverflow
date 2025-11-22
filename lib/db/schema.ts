import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  supabaseAuthUserId: varchar('supabase_auth_user_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});


export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export const beats = pgTable('beats', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 50 }).notNull(),
  price: integer('price').notNull(), // Price in cents
  duration: varchar('duration', { length: 10 }),
  bpm: integer('bpm'),
  key: varchar('key', { length: 20 }),
  // Audio files - multiple versions
  audioFileMp3: text('audio_file_mp3'), // Full song MP3
  audioFileWav: text('audio_file_wav'), // Full song WAV
  audioFileStems: text('audio_file_stems'), // WAV stems
  imageFile: text('image_file'), // URL or path to cover image
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull().default('artist'), // 'artist', 'game', 'commercial', 'film'
  tags: text('tags').array(), // Array of tag strings
  isActive: integer('is_active').notNull().default(1), // 1 for active, 0 for inactive
  published: integer('published').notNull().default(0), // 1 for published, 0 for draft
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id),
  isPack: integer('is_pack').notNull().default(0), // 1 for pack, 0 for single beat
  packId: integer('pack_id').references(() => beatPacks.id), // Reference to pack if this is a pack item
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Beat = typeof beats.$inferSelect;
export type NewBeat = typeof beats.$inferInsert;

// Beat Packs
export const beatPacks = pgTable('beat_packs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 50 }).notNull(),
  price: integer('price').notNull(), // Price in cents
  description: text('description'),
  imageFile: text('image_file'), // URL or path to cover image
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id),
  isActive: integer('is_active').notNull().default(1), // 1 for active, 0 for inactive
  published: integer('published').notNull().default(0), // 1 for published, 0 for draft
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type BeatPack = typeof beatPacks.$inferSelect;
export type NewBeatPack = typeof beatPacks.$inferInsert;

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Price in cents per month
  monthlyDownloads: integer('monthly_downloads').notNull(),
  stripeProductId: text('stripe_product_id').unique(),
  stripePriceId: text('stripe_price_id').unique(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Subscriptions
export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  planId: integer('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  downloadsUsed: integer('downloads_used').notNull().default(0),
  downloadsResetAt: timestamp('downloads_reset_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Purchase History (for individual beat purchases)
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  beatId: integer('beat_id')
    .notNull()
    .references(() => beats.id),
  amount: integer('amount').notNull(), // Amount paid in cents
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  status: varchar('status', { length: 20 }).notNull().default('completed'), // completed, failed, refunded
  purchasedAt: timestamp('purchased_at').notNull().defaultNow(),
});

// Download History
export const downloads = pgTable('downloads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  beatId: integer('beat_id')
    .notNull()
    .references(() => beats.id),
  fileType: varchar('file_type', { length: 10 }).notNull(), // mp3, wav, stems
  downloadType: varchar('download_type', { length: 20 }).notNull(), // subscription, purchase
  subscriptionId: integer('subscription_id').references(() => userSubscriptions.id),
  purchaseId: integer('purchase_id').references(() => purchases.id),
  downloadedAt: timestamp('downloaded_at').notNull().defaultNow(),
});

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  UPLOAD_BEAT = 'UPLOAD_BEAT',
  UPDATE_BEAT = 'UPDATE_BEAT',
  DELETE_BEAT = 'DELETE_BEAT',
  PROMOTE_USER = 'PROMOTE_USER',
  DEMOTE_USER = 'DEMOTE_USER',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  PURCHASE_BEAT = 'PURCHASE_BEAT',
  DOWNLOAD_BEAT = 'DOWNLOAD_BEAT',
}

// API Request Logs
export const apiLogs = pgTable('api_logs', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 36 }), // UUID for tracing
  method: varchar('method', { length: 10 }).notNull(), // GET, POST, PUT, DELETE
  url: text('url').notNull(),
  endpoint: text('endpoint').notNull(), // The API endpoint path
  userId: integer('user_id').references(() => users.id),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestPayload: text('request_payload'), // JSON string of request body
  responseStatus: integer('response_status'),
  responsePayload: text('response_payload'), // JSON string of response body
  duration: integer('duration'), // Response time in milliseconds
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Stripe Request Logs
export const stripeLogs = pgTable('stripe_logs', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 36 }), // UUID for tracing
  apiLogId: integer('api_log_id').references(() => apiLogs.id),
  stripeRequestId: varchar('stripe_request_id', { length: 100 }),
  stripeEventType: varchar('stripe_event_type', { length: 50 }),
  stripeObjectType: varchar('stripe_object_type', { length: 50 }),
  stripeObjectId: varchar('stripe_object_id', { length: 100 }),
  requestType: varchar('request_type', { length: 50 }).notNull(), // checkout_session, subscription, webhook, etc.
  requestPayload: text('request_payload'), // JSON string of what we sent to Stripe
  responsePayload: text('response_payload'), // JSON string of what Stripe returned
  success: integer('success').notNull().default(1), // 1 for success, 0 for failure
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Type exports
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
export type ApiLog = typeof apiLogs.$inferSelect;
export type NewApiLog = typeof apiLogs.$inferInsert;
export type StripeLog = typeof stripeLogs.$inferSelect;
export type NewStripeLog = typeof stripeLogs.$inferInsert;

// Tags table for metadata and management
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Junction table for many-to-many relationship between beats and tags
export const beatTags = pgTable('beat_tags', {
  beatId: integer('beat_id').references(() => beats.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.beatId, table.tagId] }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type BeatTag = typeof beatTags.$inferSelect;
export type NewBeatTag = typeof beatTags.$inferInsert;

// Social connections table for OAuth providers (Spotify, Google, etc.)
export const socialConnections = pgTable('social_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(), // 'spotify', 'google', etc.
  platformUserId: varchar('platform_user_id', { length: 255 }), // Spotify user ID
  accessToken: text('access_token'), // Encrypted access token
  refreshToken: text('refresh_token'), // Encrypted refresh token
  expiresAt: timestamp('expires_at'), // Token expiration
  scope: text('scope'), // OAuth scopes
  profileData: text('profile_data'), // JSON string of user profile
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type SocialConnection = typeof socialConnections.$inferSelect;
export type NewSocialConnection = typeof socialConnections.$inferInsert;
