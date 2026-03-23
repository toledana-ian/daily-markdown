CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "notes_select_own" ON "notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "notes"."user_id");--> statement-breakpoint
CREATE POLICY "notes_insert_own" ON "notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "notes"."user_id");--> statement-breakpoint
CREATE POLICY "notes_update_own" ON "notes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "notes"."user_id") WITH CHECK ((select auth.uid()) = "notes"."user_id");--> statement-breakpoint
CREATE POLICY "notes_delete_own" ON "notes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "notes"."user_id");