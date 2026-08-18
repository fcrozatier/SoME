CREATE TABLE "bans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_uid" uuid NOT NULL,
	"reason" text NOT NULL,
	"until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;