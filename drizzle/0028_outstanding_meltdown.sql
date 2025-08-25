CREATE TABLE "user_to_tag" (
	"user_uid" uuid,
	"tag_id" integer,
	CONSTRAINT "user_to_tag_user_uid_tag_id_pk" PRIMARY KEY("user_uid","tag_id")
);
--> statement-breakpoint
ALTER TABLE "user_to_tag" ADD CONSTRAINT "user_to_tag_user_uid_entries_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."entries"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_tag" ADD CONSTRAINT "user_to_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;