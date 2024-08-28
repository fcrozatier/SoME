CREATE TABLE IF NOT EXISTS "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uid" uuid,
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
