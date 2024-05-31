import { relations } from 'drizzle-orm';
import {
	boolean,
	decimal,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';
import { categories } from '../../config';

export const users = pgTable('users', {
	uid: uuid('uid').primaryKey(),
	email: varchar('email', { length: 128 }).unique().notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
	usersToEntries: many(usersToEntries),
	votes: many(votes)
}));

export const entries = pgTable('entries', {
	uid: uuid('uid').primaryKey(),
	title: varchar('title', { length: 128 }).notNull(),
	description: text('description').notNull(),
	category: text('category', { enum: categories }).notNull(),
	url: text('url').unique().notNull(),
	thumbnail: text('thumbnail'),
	active: boolean('active').default(true),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
});

export const entriesRelations = relations(entries, ({ many }) => ({
	usersToEntries: many(usersToEntries)
}));

export const usersToEntries = pgTable(
	'user_to_entry',
	{
		userUid: uuid('user_uid').references(() => users.uid, { onDelete: 'cascade' }),
		entryUid: uuid('entry_uid').references(() => entries.uid, { onDelete: 'cascade' })
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] })
		};
	}
);

export const usersToEntriesRelations = relations(usersToEntries, ({ one }) => ({
	user: one(users, {
		fields: [usersToEntries.userUid],
		references: [users.uid]
	}),
	entry: one(entries, {
		fields: [usersToEntries.entryUid],
		references: [entries.uid]
	})
}));

export const votes = pgTable(
	'votes',
	{
		score: decimal('score', { precision: 4, scale: 2 }).notNull(),
		feedback: text('feedback').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
		userUid: uuid('user_uid')
			.references(() => users.uid, { onDelete: 'cascade' })
			.notNull(),
		entryUid: uuid('entry_uid')
			.references(() => entries.uid, { onDelete: 'cascade' })
			.notNull()
	},
	({ userUid, entryUid }) => {
		return {
			pk: primaryKey({ columns: [userUid, entryUid] }),
			entryIdx: index('entry_idx').on(entryUid)
		};
	}
);

export const votesRelations = relations(votes, ({ one }) => ({
	user: one(users, { fields: [votes.userUid], references: [users.uid] }),
	entry: one(entries, { fields: [votes.entryUid], references: [entries.uid] })
}));

export type NewUser = typeof users.$inferInsert;
export type SelectEntry = typeof entries.$inferSelect;
