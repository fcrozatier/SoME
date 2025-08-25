ALTER TABLE "user_to_tag" DROP CONSTRAINT "user_to_tag_user_uid_entries_uid_fk";
--> statement-breakpoint
ALTER TABLE "user_to_tag" ADD CONSTRAINT "user_to_tag_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;