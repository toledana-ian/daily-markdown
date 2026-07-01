CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE POLICY "api_keys_select_own" ON "api_keys" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "api_keys"."user_id");--> statement-breakpoint
CREATE POLICY "api_keys_insert_own" ON "api_keys" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "api_keys"."user_id");--> statement-breakpoint
CREATE POLICY "api_keys_update_own" ON "api_keys" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "api_keys"."user_id") WITH CHECK ((select auth.uid()) = "api_keys"."user_id");--> statement-breakpoint
CREATE POLICY "api_keys_delete_own" ON "api_keys" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "api_keys"."user_id");
