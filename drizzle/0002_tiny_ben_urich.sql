CREATE TABLE IF NOT EXISTS "votes" (
	"score" numeric(4, 2) NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_uid" uuid,
	"entry_uid" uuid,
	CONSTRAINT "votes_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entry_idx" ON "votes" ("entry_uid");