ALTER TABLE "users" ADD COLUMN "new_password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "new_password_validation_token" uuid;--> statement-breakpoint
CREATE INDEX "new_password_validation_token_idx" ON "users" USING btree ("new_password_validation_token");