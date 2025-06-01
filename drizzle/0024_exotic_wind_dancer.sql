CREATE TABLE "non_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "non_tags_name_unique" UNIQUE("name")
);
