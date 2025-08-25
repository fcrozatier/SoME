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
} from "drizzle-orm/pg-core";
import { categories } from "../../config";

export const users = pgTable(
	"users",
	{
		uid: uuid("uid").primaryKey(),
		username: varchar("username", { length: 32 }),
		email: varchar("email", { length: 128 }).unique().notNull(),
		passwordHash: text("password_hash"),
		newPasswordHash: text("new_password_hash"),
		newPasswordValidationToken: uuid("new_password_validation_token"),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
		isAdmin: boolean("is_admin").default(false),
		isTeacher: boolean("is_teacher").default(false),
		bio: text("bio"),
	},
	({ username, newPasswordValidationToken }) => [
		index("username_idx").on(username),
		index("new_password_validation_token_idx").on(newPasswordValidationToken),
	],
);

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userUid: uuid("user_uid")
		.notNull()
		.references(() => users.uid, {
			onDelete: "cascade",
		}),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const entries = pgTable("entries", {
	uid: uuid("uid").primaryKey(),
	title: varchar("title", { length: 128 }).notNull(),
	description: text("description").notNull(),
	category: text("category", { enum: categories }).notNull(),
	url: text("url").unique().notNull(),
	thumbnail: text("thumbnail"),
	active: boolean("active").default(true),
	rank: integer("rank"),
	final_score: decimal("final_score"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const userToEntry = pgTable(
	"user_to_entry",
	{
		userUid: uuid("user_uid").references(() => users.uid, {
			onDelete: "cascade",
		}),
		entryUid: uuid("entry_uid").references(() => entries.uid, {
			onDelete: "cascade",
		}),
	},
	({ entryUid, userUid }) => [primaryKey({ columns: [userUid, entryUid] })],
);

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: text("name").unique().notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const nonTags = pgTable("non_tags", {
	id: serial("id").primaryKey(),
	name: text("name").unique().notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const entryToTag = pgTable(
	"entry_to_tag",
	{
		entryUid: uuid("entry_uid").references(() => entries.uid, {
			onDelete: "cascade",
		}),
		tagId: integer("tag_id").references(() => tags.id, {
			onDelete: "cascade",
		}),
	},
	({ tagId, entryUid }) => [primaryKey({ columns: [tagId, entryUid] })],
);

export const userToTag = pgTable(
	"user_to_tag",
	{
		userUid: uuid("user_uid").references(() => users.uid, {
			onDelete: "cascade",
		}),
		tagId: integer("tag_id").references(() => tags.id, {
			onDelete: "cascade",
		}),
	},
	({ userUid, tagId }) => [primaryKey({ columns: [userUid, tagId] })],
);

export const votes = pgTable(
	"votes",
	{
		score: decimal("score", { precision: 4, scale: 2 }).notNull(),
		feedback: text("feedback"),
		feedback_unsafe_md: text("feedback_unsafe_md"),
		maybe_rude: boolean("maybe_rude").default(false),
		reviewed: boolean("reviewed").default(false),
		created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
		userUid: uuid("user_uid")
			.references(() => users.uid, { onDelete: "cascade" })
			.notNull(),
		entryUid: uuid("entry_uid")
			.references(() => entries.uid, { onDelete: "cascade" })
			.notNull(),
	},
	({ userUid, entryUid }) => [
		primaryKey({ columns: [userUid, entryUid] }),
		index("entry_idx").on(entryUid),
	],
);

export const flags = pgTable(
	"flags",
	{
		userUid: uuid("user_uid")
			.references(() => users.uid, { onDelete: "cascade" })
			.notNull(),
		entryUid: uuid("entry_uid")
			.references(() => entries.uid, { onDelete: "cascade" })
			.notNull(),
		reason: text("reason").notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	},
	({ userUid, entryUid }) => [primaryKey({ columns: [userUid, entryUid] }), index().on(entryUid)],
);

export const skips = pgTable(
	"skips",
	{
		userUid: uuid("user_uid")
			.references(() => users.uid, { onDelete: "cascade" })
			.notNull(),
		entryUid: uuid("entry_uid")
			.references(() => entries.uid, { onDelete: "cascade" })
			.notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	},
	({ userUid, entryUid }) => [primaryKey({ columns: [userUid, entryUid] }), index().on(entryUid)],
);

export const cache = pgTable(
	"cache",
	{
		userUid: uuid("user_uid")
			.references(() => users.uid, { onDelete: "cascade" })
			.notNull(),
		category: text("category", { enum: categories }).notNull(),
		entryUid: uuid("entry_uid")
			.references(() => entries.uid, { onDelete: "cascade" })
			.notNull(),
		score: decimal("score", { precision: 4, scale: 2 }),
		feedback_unsafe_md: text("feedback_unsafe_md"),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	},
	({ userUid, category, entryUid }) => [
		primaryKey({ columns: [userUid, category] }),
		index().on(entryUid),
	],
);

export const surveys = pgTable(
	"surveys",
	{
		id: serial("id").primaryKey(),
		userUid: uuid("user_uid").references(() => users.uid, {
			onDelete: "cascade",
		}),
		some: decimal("some", { precision: 4, scale: 2 }).notNull(),
		site: decimal("site", { precision: 4, scale: 2 }).notNull(),
		feedback: text("feedback"),
		offSeason: boolean("off_season"),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	},
	({ userUid }) => [index().on(userUid)],
);

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type SelectEntry = typeof entries.$inferSelect;
export type SelectCache = typeof cache.$inferSelect;
export type SelectTag = typeof tags.$inferSelect;
export type SelectVote = typeof votes.$inferSelect;
export type SelectFlag = typeof flags.$inferSelect;
export type SelectSurveys = typeof surveys.$inferSelect;
