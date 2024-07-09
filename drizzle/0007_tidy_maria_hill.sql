CREATE TABLE IF NOT EXISTS "surveys" (
	"user_uid" uuid PRIMARY KEY NOT NULL,
	"some" numeric(4, 2) NOT NULL,
	"site" numeric(4, 2) NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "surveys" ADD CONSTRAINT "surveys_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cache_entry_uid_index" ON "cache" USING btree ("entry_uid");