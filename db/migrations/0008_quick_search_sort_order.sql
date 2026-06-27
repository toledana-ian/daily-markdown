ALTER TABLE "quick_search_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
WITH ordered_items AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "user_id"
      ORDER BY "created_at" ASC, "value" ASC
    ) - 1 AS "new_sort_order"
  FROM "quick_search_items"
)
UPDATE "quick_search_items"
SET "sort_order" = ordered_items."new_sort_order"
FROM ordered_items
WHERE "quick_search_items"."id" = ordered_items."id";
--> statement-breakpoint
CREATE POLICY "quick_search_items_update_own" ON "quick_search_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "quick_search_items"."user_id") WITH CHECK ((select auth.uid()) = "quick_search_items"."user_id");
