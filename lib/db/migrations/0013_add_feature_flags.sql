-- Create feature flags table
CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"flag_key" varchar(100) NOT NULL,
	"flag_value" integer DEFAULT 0 NOT NULL,
	"description" text,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_flag_key_unique" UNIQUE("flag_key")
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert default feature flags
INSERT INTO "feature_flags" ("flag_key", "flag_value", "description") VALUES
('SUBSCRIPTIONS_ENABLED', 0, 'Enable subscription system'),
('PROMO_CODES_ENABLED', 1, 'Enable promo code system'),
('NEWS_ENABLED', 0, 'Enable news/announcements'),
('NOTIFICATIONS_ENABLED', 0, 'Enable notifications system')
ON CONFLICT ("flag_key") DO NOTHING;

