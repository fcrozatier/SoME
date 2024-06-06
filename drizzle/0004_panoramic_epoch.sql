CREATE TABLE IF NOT EXISTS "skips" (
	"user_uid" uuid NOT NULL,
	"entry_uid" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "skips_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skips" ADD CONSTRAINT "skips_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skips" ADD CONSTRAINT "skips_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skips_entry_uid_index" ON "skips" USING btree (entry_uid);