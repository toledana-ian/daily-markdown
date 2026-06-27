CREATE TABLE "quick_search_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quick_search_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "quick_search_items_user_id_value_idx" ON "quick_search_items" USING btree ("user_id","value");--> statement-breakpoint
CREATE POLICY "quick_search_items_select_own" ON "quick_search_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "quick_search_items"."user_id");--> statement-breakpoint
CREATE POLICY "quick_search_items_insert_own" ON "quick_search_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "quick_search_items"."user_id");--> statement-breakpoint
CREATE POLICY "quick_search_items_delete_own" ON "quick_search_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "quick_search_items"."user_id");