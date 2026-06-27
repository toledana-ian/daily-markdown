ALTER TABLE "quick_search_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE POLICY "quick_search_items_update_own" ON "quick_search_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "quick_search_items"."user_id") WITH CHECK ((select auth.uid()) = "quick_search_items"."user_id");
