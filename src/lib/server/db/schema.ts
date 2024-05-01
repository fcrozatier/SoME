import { relations } from 'drizzle-orm';
import { categories, userTypes } from '../../config';
import { pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	uid: uuid('uid').primaryKey(),
	email: varchar('email', { length: 128 }).unique().notNull(),
	createdAd: timestamp('created_at', { mode: 'string' }).defaultNow(),
	type: text('type', { enum: userTypes }).notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
	usersToEntries: many(usersToEntries)
}));

export const entries = pgTable('entries', {
	uid: uuid('uid').primaryKey(),
	title: varchar('title', { length: 128 }).notNull(),
	description: text('description'),
	category: text('category', { enum: categories }).notNull(),
	url: text('url').unique().notNull(),
	thumbnail: text('thumbnail')
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
