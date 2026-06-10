ALTER TABLE "entries_history" DROP CONSTRAINT "entries_history_entry_uid_entries_uid_fk";
--> statement-breakpoint
ALTER TABLE "entries_history" ADD CONSTRAINT "entries_history_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE no action ON UPDATE no action;