CREATE TABLE "beats" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"genre" varchar(50) NOT NULL,
	"price" integer NOT NULL,
	"duration" varchar(10),
	"bpm" integer,
	"key" varchar(20),
	"audio_file" text,
	"image_file" text,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beats" ADD CONSTRAINT "beats_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;