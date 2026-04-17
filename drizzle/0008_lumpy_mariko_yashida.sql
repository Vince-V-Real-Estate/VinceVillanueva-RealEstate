CREATE TABLE "hero_image" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"image_url" text,
	"updated_by_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hero_image_singleton_id" CHECK ("hero_image"."id" = 'singleton')
);
--> statement-breakpoint
ALTER TABLE "hero_image" ADD CONSTRAINT "hero_image_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;