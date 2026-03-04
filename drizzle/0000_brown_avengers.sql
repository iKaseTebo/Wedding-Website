CREATE TYPE "public"."party_role" AS ENUM('bridesmaid', 'groomsman', 'other');--> statement-breakpoint
CREATE TABLE "clothing_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"party_role" "party_role" NOT NULL,
	"name" text NOT NULL,
	"link" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "party_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256) NOT NULL,
	"clerk_user_id" varchar(256),
	"party_role" "party_role" DEFAULT 'other' NOT NULL,
	"color_name" varchar(64) NOT NULL,
	"color_hex" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "party_members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256) NOT NULL,
	"attending" boolean DEFAULT true NOT NULL,
	"guests" integer DEFAULT 1 NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
