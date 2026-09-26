ALTER TYPE "public"."price_mode" ADD VALUE 'per_table';--> statement-breakpoint
ALTER TYPE "public"."price_mode" ADD VALUE 'per_8_children';--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "details" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "proposal_pdf" varchar(255) DEFAULT '' NOT NULL;