ALTER TABLE "surveys" DROP CONSTRAINT "surveys_user_uid_users_uid_fk";
--> statement-breakpoint
ALTER TABLE "surveys" ADD COLUMN "json" json;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" DROP COLUMN "off_season";
