CREATE TABLE "entries_history" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_uid" uuid NOT NULL,
	"title" varchar(128) NOT NULL,
	"description_md" text NOT NULL,
	"category" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	"edited_at" timestamp DEFAULT now(),
	"edited_by" uuid,
	CONSTRAINT "entries_history_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "entries_history" ADD CONSTRAINT "entries_history_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries_history" ADD CONSTRAINT "entries_history_edited_by_users_uid_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entries_history_entry_uid_index" ON "entries_history" USING btree ("entry_uid");