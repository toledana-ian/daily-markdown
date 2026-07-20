import { useAuthStore } from '@/features/auth/store/auth.ts';
import {
  buildNotesExport,
  downloadNotesExport,
  fetchAllNotesPaginated,
  type NoteExportRow,
} from '@/features/notes/lib/notes-export.ts';
import { supabase } from '@/lib/supabase/client.ts';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useExportNotes = () => {
  const session = useAuthStore((state) => state.session);
  const [isExporting, setIsExporting] = useState(false);

  const exportNotes = useCallback(async () => {
    const userId = session?.user?.id;

    if (!userId) {
      toast.error('You must be signed in to export notes.');
      return;
    }

    setIsExporting(true);

    try {
      const rows = await fetchAllNotesPaginated(
        async (rangeStart, rangeEnd): Promise<{
          data: NoteExportRow[] | null;
          error: { message: string } | null;
        }> => {
          const { data, error } = await supabase
            .from('notes')
            .select('id, content, is_pinned, created_at, updated_at')
            .order('created_at', { ascending: false })
            .range(rangeStart, rangeEnd);

          if (error) {
            return { data: null, error: { message: error.message } };
          }

          return { data: data as NoteExportRow[] | null, error: null };
        },
      );

      const exportedAt = new Date();
      const exportData = buildNotesExport(rows, exportedAt);
      downloadNotesExport(exportData, exportedAt);

      const noteCount = exportData.notes.length;
      toast.success(
        noteCount === 1 ? 'Exported 1 note successfully.' : `Exported ${noteCount} notes successfully.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export notes.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, [session?.user?.id]);

  return { exportNotes, isExporting };
};
