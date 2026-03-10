CREATE TYPE "public"."lead_source" AS ENUM('listings', 'valuation', 'call', 'newsletter');--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text,
	"address" text,
	"source" "lead_source" NOT NULL,
	"realtor_id" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_realtor_id_user_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
