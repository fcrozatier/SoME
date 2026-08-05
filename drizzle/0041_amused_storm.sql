CREATE TABLE "strikes" (
	"user_uid" uuid NOT NULL,
	"entry_uid" uuid NOT NULL,
	"reason" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "strikes_user_uid_entry_uid_pk" PRIMARY KEY("user_uid","entry_uid")
);
--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strikes_entry_uid_index" ON "strikes" USING btree ("entry_uid");