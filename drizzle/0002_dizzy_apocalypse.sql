ALTER TABLE "orders" ADD COLUMN "child_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(20);