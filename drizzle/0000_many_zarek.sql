CREATE TABLE IF NOT EXISTS "entries" (
	"uid" uuid PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	CONSTRAINT "entries_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"uid" uuid PRIMARY KEY NOT NULL,
	"email" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"type" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_to_entry" (
	"user_uid" uuid,
	"entry_uid" uuid,
	CONSTRAINT "user_to_entry_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_entry" ADD CONSTRAINT "user_to_entry_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_entry" ADD CONSTRAINT "user_to_entry_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "entries"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
