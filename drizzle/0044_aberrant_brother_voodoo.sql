DROP INDEX "strikes_entry_uid_index";--> statement-breakpoint
ALTER TABLE "strikes" DROP CONSTRAINT "strikes_user_uid_entry_uid_pk";--> statement-breakpoint
ALTER TABLE "strikes" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;