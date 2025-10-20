-- Create subscription plans table
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"monthly_downloads" integer NOT NULL,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_stripe_product_id_unique" UNIQUE("stripe_product_id"),
	CONSTRAINT "subscription_plans_stripe_price_id_unique" UNIQUE("stripe_price_id")
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"stripe_subscription_id" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"downloads_used" integer DEFAULT 0 NOT NULL,
	"downloads_reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"beat_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);

-- Create downloads table
CREATE TABLE IF NOT EXISTS "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"beat_id" integer NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"download_type" varchar(20) NOT NULL,
	"subscription_id" integer,
	"purchase_id" integer,
	"downloaded_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "beats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "downloads" ADD CONSTRAINT "downloads_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "beats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "downloads" ADD CONSTRAINT "downloads_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "downloads" ADD CONSTRAINT "downloads_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert default subscription plans
INSERT INTO "subscription_plans" ("name", "description", "price", "monthly_downloads", "is_active") VALUES
('Basic', 'Perfect for casual producers', 999, 5, 1),
('Pro', 'For serious music creators', 1999, 15, 1),
('Unlimited', 'Unlimited downloads for professionals', 4999, 999, 1);
