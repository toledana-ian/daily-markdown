CREATE OR REPLACE FUNCTION "public"."get_note_counts_by_date"(
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"search_query" text DEFAULT NULL,
	"client_timezone" text DEFAULT 'UTC'
)
RETURNS TABLE("date" date, "count" integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ("notes"."created_at" AT TIME ZONE "client_timezone")::date AS "date",
    COUNT(*)::integer AS "count"
  FROM "public"."notes"
  WHERE "notes"."created_at" >= "start_date"
    AND "notes"."created_at" <= "end_date"
    AND (
      "search_query" IS NULL
      OR btrim("search_query") = ''
      OR "notes"."search" @@ websearch_to_tsquery('english', btrim("search_query"))
    )
  GROUP BY 1
  ORDER BY 1;
$$;
