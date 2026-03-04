ALTER TABLE "rsvps" ADD COLUMN "phone" varchar(32);--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "guest_names" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "dietary_restrictions" text;