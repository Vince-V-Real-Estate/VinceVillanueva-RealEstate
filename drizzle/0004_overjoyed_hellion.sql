CREATE TABLE "featured_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"price" integer NOT NULL,
	"address" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" double precision NOT NULL,
	"square_feet" integer NOT NULL,
	"realtor_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featured_listing" ADD CONSTRAINT "featured_listing_realtor_id_user_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;