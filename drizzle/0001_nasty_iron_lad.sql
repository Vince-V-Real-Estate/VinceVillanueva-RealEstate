CREATE TYPE "public"."lead_source" AS ENUM('listings', 'valuation', 'call', 'contact');--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text,
	"address" text,
	"source" "lead_source" NOT NULL,
	"created_at" timestamp NOT NULL
);
