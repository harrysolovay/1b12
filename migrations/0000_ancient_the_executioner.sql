CREATE TABLE "github_oauth_tokens" (
	"id" integer NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"refreshToken" text NOT NULL,
	"refreshTokenExpiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mesh_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"userId" integer NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"refresh" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"userId" integer NOT NULL,
	"token_encoding" text NOT NULL,
	"expiry" timestamp with time zone DEFAULT now() + interval '1 month' NOT NULL,
	"loggedOut" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_oauth_tokens" ADD CONSTRAINT "github_oauth_tokens_id_entities_id_fk" FOREIGN KEY ("id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesh_access_tokens" ADD CONSTRAINT "mesh_access_tokens_userId_entities_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_entities_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;