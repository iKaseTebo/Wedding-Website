ALTER TABLE "party_members" DROP CONSTRAINT "party_members_email_unique";--> statement-breakpoint
ALTER TABLE "party_members" ALTER COLUMN "email" DROP NOT NULL;