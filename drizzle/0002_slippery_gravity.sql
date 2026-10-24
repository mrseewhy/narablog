CREATE TABLE "rate_limits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rate_limits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"identifier" varchar(255) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"action" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("identifier","action");