CREATE TABLE "shared_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_note_id" uuid,
	"content" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "shared_notes_insert_own" ON "shared_notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "shared_notes"."user_id");--> statement-breakpoint
CREATE POLICY "shared_notes_select_own" ON "shared_notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "shared_notes"."user_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."get_shared_note_content"("share_token" uuid)
RETURNS TABLE("content" text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sn.content
  FROM public.shared_notes sn
  WHERE sn.id = share_token
    AND sn.expires_at > now();
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION "public"."get_shared_note_content"(uuid) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."get_shared_note_content"(uuid) TO "anon";--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."get_shared_note_content"(uuid) TO "authenticated";
