ALTER TABLE "lead" ADD COLUMN "realtor_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_realtor_id_user_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."lead" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."lead_source";--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('listings', 'valuation', 'call', 'newsletter');--> statement-breakpoint
ALTER TABLE "public"."lead" ALTER COLUMN "source" SET DATA TYPE "public"."lead_source" USING "source"::"public"."lead_source";