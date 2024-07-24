import {
	boolean,
	decimal,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { categories } from '../../config';

export const users = pgTable('users', {
	uid: uuid('uid').primaryKey(),
	email: varchar('email', { length: 128 }).unique().notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
	isAdmin: boolean('is_admin').default(false),
});

export const entries = pgTable('entries', {
	uid: uuid('uid').primaryKey(),
	title: varchar('title', { length: 128 }).notNull(),
	description: text('description').notNull(),
	category: text('category', { enum: categories }).notNull(),
	url: text('url').unique().notNull(),
	thumbnail: text('thumbnail'),
	active: boolean('active').default(true),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const usersToEntries = pgTable(
	'user_to_entry',
	{
		userUid: uuid('user_uid').references(() => users.uid, { onDelete: 'cascade' }),
		entryUid: uuid('entry_uid').references(() => entries.uid, { onDelete: 'cascade' }),
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] }),
		};
	},
);

export const votes = pgTable(
	'votes',
	{
		score: decimal('score', { precision: 4, scale: 2 }).notNull(),
		feedback: text('feedback'),
		maybeRude: boolean('maybe_rude').default(false),
		reviewed: boolean('reviewed').default(false),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
		userUid: uuid('user_uid')
			.references(() => users.uid, { onDelete: 'cascade' })
			.notNull(),
		entryUid: uuid('entry_uid')
			.references(() => entries.uid, { onDelete: 'cascade' })
			.notNull(),
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] }),
			entryIdx: index('entry_idx').on(entryUid),
		};
	},
);

export const flags = pgTable(
	'flags',
	{
		userUid: uuid('user_uid')
			.references(() => users.uid, { onDelete: 'cascade' })
			.notNull(),
		entryUid: uuid('entry_uid')
			.references(() => entries.uid, { onDelete: 'cascade' })
			.notNull(),
		reason: text('reason').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] }),
			entryIdx: index().on(entryUid),
		};
	},
);

export const skips = pgTable(
	'skips',
	{
		userUid: uuid('user_uid')
			.references(() => users.uid, { onDelete: 'cascade' })
			.notNull(),
		entryUid: uuid('entry_uid')
			.references(() => entries.uid, { onDelete: 'cascade' })
			.notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] }),
			entryIdx: index().on(entryUid),
		};
	},
);

export const cache = pgTable(
	'cache',
	{
		userUid: uuid('user_uid')
			.references(() => users.uid, { onDelete: 'cascade' })
			.notNull(),
		category: text('category', { enum: categories }).notNull(),
		entryUid: uuid('entry_uid')
			.references(() => entries.uid, { onDelete: 'cascade' })
			.notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
	},
	({ userUid, category, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, category] }),
			entryIdx: index().on(entryUid),
		};
	},
);

export const surveys = pgTable('surveys', {
	userUid: uuid('user_uid')
		.references(() => users.uid, { onDelete: 'cascade' })
		.primaryKey(),
	some: decimal('some', { precision: 4, scale: 2 }).notNull(),
	site: decimal('site', { precision: 4, scale: 2 }).notNull(),
	feedback: text('feedback'),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export type NewUser = typeof users.$inferInsert;
export type SelectEntry = typeof entries.$inferSelect;
export type SelectFlag = typeof flags.$inferSelect;
