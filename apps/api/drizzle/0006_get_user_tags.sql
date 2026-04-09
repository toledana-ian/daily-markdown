CREATE OR REPLACE FUNCTION "public"."get_user_tags"()
RETURNS TABLE("name" text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT tags.name
  FROM "public"."tags"
  JOIN "public"."note_tags" ON note_tags.tag_id = tags.id
  ORDER BY tags.name;
$$;
