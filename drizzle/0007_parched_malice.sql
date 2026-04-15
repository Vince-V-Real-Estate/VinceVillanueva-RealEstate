CREATE TABLE "presale_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"address" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" double precision NOT NULL,
	"square_feet" integer NOT NULL,
	"image_urls" jsonb NOT NULL,
	"status" text,
	"completion" text NOT NULL,
	"developer" text NOT NULL,
	"amenities" jsonb NOT NULL,
	"realtor_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "presale_listing" ADD CONSTRAINT "presale_listing_realtor_id_user_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;