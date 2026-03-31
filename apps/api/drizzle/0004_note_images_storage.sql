INSERT INTO "storage"."buckets" (
  "id",
  "name",
  "public",
  "file_size_limit",
  "allowed_mime_types"
)
VALUES (
  'note-images',
  'note-images',
  true,
  10485760, -- 10MB (10 * 1024 * 1024)
  NULL -- allow any file type
)
ON CONFLICT ("id") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "public" = EXCLUDED."public",
  "file_size_limit" = EXCLUDED."file_size_limit",
  "allowed_mime_types" = EXCLUDED."allowed_mime_types";
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_policies"
    WHERE "schemaname" = 'storage'
      AND "tablename" = 'objects'
      AND "policyname" = 'note_images_insert_own'
  ) THEN
    CREATE POLICY "note_images_insert_own"
      ON "storage"."objects"
      AS PERMISSIVE
      FOR INSERT
      TO "authenticated"
      WITH CHECK (
        "bucket_id" = 'note-images'
        AND (storage.foldername("name"))[1] = (SELECT auth.uid()::text)
      );
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_policies"
    WHERE "schemaname" = 'storage'
      AND "tablename" = 'objects'
      AND "policyname" = 'note_images_update_own'
  ) THEN
    CREATE POLICY "note_images_update_own"
      ON "storage"."objects"
      AS PERMISSIVE
      FOR UPDATE
      TO "authenticated"
      USING (
        "bucket_id" = 'note-images'
        AND (storage.foldername("name"))[1] = (SELECT auth.uid()::text)
      )
      WITH CHECK (
        "bucket_id" = 'note-images'
        AND (storage.foldername("name"))[1] = (SELECT auth.uid()::text)
      );
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_policies"
    WHERE "schemaname" = 'storage'
      AND "tablename" = 'objects'
      AND "policyname" = 'note_images_delete_own'
  ) THEN
    CREATE POLICY "note_images_delete_own"
      ON "storage"."objects"
      AS PERMISSIVE
      FOR DELETE
      TO "authenticated"
      USING (
        "bucket_id" = 'note-images'
        AND (storage.foldername("name"))[1] = (SELECT auth.uid()::text)
      );
  END IF;
END
$$;
