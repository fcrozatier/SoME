CREATE TABLE "user_to_watchlist" (
	"user_uid" uuid,
	"entry_uid" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_to_watchlist_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
ALTER TABLE "user_to_watchlist" ADD CONSTRAINT "user_to_watchlist_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_watchlist" ADD CONSTRAINT "user_to_watchlist_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;