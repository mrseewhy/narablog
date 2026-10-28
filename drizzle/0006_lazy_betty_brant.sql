ALTER TABLE "posts" ADD COLUMN "published_at" timestamp;
--> statement-breakpoint
UPDATE "posts" SET "published_at" = "created_at" WHERE "status" = 'Published' AND "published_at" IS NULL;
