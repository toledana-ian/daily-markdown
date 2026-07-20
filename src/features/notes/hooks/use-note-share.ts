import { toast } from 'sonner';
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import {
  buildShareUrl,
  computeExpiresAt,
  type ShareDuration,
} from '@/features/notes/lib/note-share-expiry.ts';

type CreateNoteShareInput = {
  noteId: string;
  content: string;
  duration: ShareDuration;
};

type CreateNoteShareResult = {
  shareId: string;
  url: string;
};

export const useNoteShare = () => {
  const session = useAuthStore((state) => state.session);

  const createNoteShare = useCallback(
    async ({
      noteId,
      content,
      duration,
    }: CreateNoteShareInput): Promise<CreateNoteShareResult | null> => {
      const userId = session?.user?.id;
      if (!userId) {
        toast.error('You must be signed in to share a note');
        return null;
      }

      const expiresAt = computeExpiresAt(duration);

      const { data, error } = await supabase
        .from('shared_notes')
        .insert({
          user_id: userId,
          source_note_id: noteId,
          content,
          expires_at: expiresAt,
        })
        .select('id')
        .single();

      if (error || !data) {
        toast.error('Failed to create share link');
        return null;
      }

      const url = buildShareUrl(data.id, window.location.origin);

      try {
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied to clipboard');
      } catch {
        toast.error('Share link created, but copying to clipboard failed');
      }

      return { shareId: data.id, url };
    },
    [session?.user?.id],
  );

  return { createNoteShare };
};
