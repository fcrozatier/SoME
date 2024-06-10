DROP INDEX IF EXISTS "cache_entry_uid_index";--> statement-breakpoint
/*
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'cache'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually

    Hope to release this update as soon as possible
*/

ALTER TABLE "cache" DROP CONSTRAINT "cache_pkey";--> statement-breakpoint
ALTER TABLE "cache" ADD COLUMN "category" text NOT NULL;
ALTER TABLE "cache" ADD CONSTRAINT "cache_user_uid_category_pk" PRIMARY KEY("user_uid","category");--> statement-breakpoint