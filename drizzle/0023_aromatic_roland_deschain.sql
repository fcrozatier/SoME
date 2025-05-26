CREATE TABLE "entry_to_tag" (
	"entry_uid" uuid,
	"tag_id" integer,
	CONSTRAINT "entry_to_tag_tag_id_entry_uid_pk" PRIMARY KEY("tag_id","entry_uid")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "entry_to_tag" ADD CONSTRAINT "entry_to_tag_entry_uid_entries_uid_fk" FOREIGN KEY ("entry_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_to_tag" ADD CONSTRAINT "entry_to_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;