ALTER TABLE "news" ADD COLUMN "shortDescription" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "longDescription" text NOT NULL;--> statement-breakpoint
ALTER TABLE "news" DROP COLUMN "short_description";--> statement-breakpoint
ALTER TABLE "news" DROP COLUMN "long_description";