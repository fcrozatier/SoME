ALTER TABLE "entries_history" DROP CONSTRAINT "entries_history_entry_uid_entries_uid_fk";
--> statement-breakpoint
ALTER TABLE "entries_history" ALTER COLUMN "entry_uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "entries_history" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "entries_history" ADD CONSTRAINT "entries_history_deleted_by_users_uid_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries_history" ADD CONSTRAINT "entries_history_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE set null ON UPDATE no action;