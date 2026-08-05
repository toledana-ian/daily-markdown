CREATE TABLE "note_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "note_templates_user_id_idx" ON "note_templates" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "note_templates_select_own" ON "note_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "note_templates"."user_id");--> statement-breakpoint
CREATE POLICY "note_templates_insert_own" ON "note_templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "note_templates"."user_id");--> statement-breakpoint
CREATE POLICY "note_templates_update_own" ON "note_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "note_templates"."user_id") WITH CHECK ((select auth.uid()) = "note_templates"."user_id");--> statement-breakpoint
CREATE POLICY "note_templates_delete_own" ON "note_templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "note_templates"."user_id");
