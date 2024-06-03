CREATE TABLE IF NOT EXISTS "flags" (
	"user_uid" uuid NOT NULL,
	"entry_uid" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "flags_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "entry_idx";--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "user_uid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "entry_uid" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flags" ADD CONSTRAINT "flags_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flags" ADD CONSTRAINT "flags_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flags_entry_uid_index" ON "flags" USING btree (entry_uid);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entry_idx" ON "votes" USING btree (entry_uid);