ALTER TABLE "users" ADD COLUMN "url_webhook" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "url_webhook_headers" json;