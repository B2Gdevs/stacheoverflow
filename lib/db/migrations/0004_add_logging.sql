-- Create API logs table
CREATE TABLE IF NOT EXISTS "api_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"method" varchar(10) NOT NULL,
	"url" text NOT NULL,
	"endpoint" text NOT NULL,
	"user_id" integer,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_payload" text,
	"response_status" integer,
	"response_payload" text,
	"duration" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);

-- Create Stripe logs table
CREATE TABLE IF NOT EXISTS "stripe_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"api_log_id" integer,
	"stripe_request_id" varchar(100),
	"stripe_event_type" varchar(50),
	"stripe_object_type" varchar(50),
	"stripe_object_id" varchar(100),
	"request_type" varchar(50) NOT NULL,
	"request_payload" text,
	"response_payload" text,
	"success" integer DEFAULT 1 NOT NULL,
	"error_message" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "stripe_logs" ADD CONSTRAINT "stripe_logs_api_log_id_api_logs_id_fk" FOREIGN KEY ("api_log_id") REFERENCES "api_logs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
