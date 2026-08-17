ALTER TABLE "bans" RENAME COLUMN "until" TO "expires_at";--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "state" text DEFAULT 'active';