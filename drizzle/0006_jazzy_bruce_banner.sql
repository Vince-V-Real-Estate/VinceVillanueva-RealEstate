ALTER TABLE "featured_listing" ADD COLUMN "description" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "featured_listing" ALTER COLUMN "description" DROP DEFAULT;
