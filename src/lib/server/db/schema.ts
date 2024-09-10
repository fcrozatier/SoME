import {
	boolean,
	decimal,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
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
	rank: integer('rank'),
	final_score: decimal('final_score'),
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
		maybe_rude: boolean('maybe_rude').default(false),
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

export const surveys = pgTable(
	'surveys',
	{
		id: serial('id').primaryKey(),
		userUid: uuid('user_uid').references(() => users.uid, { onDelete: 'cascade' }),
		some: decimal('some', { precision: 4, scale: 2 }).notNull(),
		site: decimal('site', { precision: 4, scale: 2 }).notNull(),
		feedback: text('feedback'),
		offSeason: boolean('off_season'),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
	},
	({ userUid }) => ({
		userIdx: index().on(userUid),
	}),
);

export type NewUser = typeof users.$inferInsert;
export type SelectEntry = typeof entries.$inferSelect;
export type SelectVote = typeof votes.$inferSelect;
export type SelectFlag = typeof flags.$inferSelect;
export type SelectSurveys = typeof surveys.$inferSelect;
