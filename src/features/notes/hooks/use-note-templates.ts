import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useNoteTemplatesStore } from '@/features/notes/store/note-templates.ts';
import {
  mapNoteTemplateRow,
  type NoteTemplate,
  type NoteTemplateInput,
  type NoteTemplateRow,
} from '@/features/notes/lib/note-templates';

export const useNoteTemplates = () => {
  const session = useAuthStore((state) => state.session);
  const templates = useNoteTemplatesStore((state) => state.templates);
  const isLoading = useNoteTemplatesStore((state) => state.isLoading);
  const error = useNoteTemplatesStore((state) => state.error);
  const setTemplates = useNoteTemplatesStore((state) => state.setTemplates);
  const setIsLoading = useNoteTemplatesStore((state) => state.setIsLoading);
  const setError = useNoteTemplatesStore((state) => state.setError);

  const loadTemplates = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('note_templates')
      .select('id, user_id, name, description, icon, content, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setTemplates((data ?? []).map((row: NoteTemplateRow) => mapNoteTemplateRow(row)));
    setIsLoading(false);
  }, [session?.user?.id, setError, setIsLoading, setTemplates]);

  const createTemplate = useCallback(
    async (input: NoteTemplateInput): Promise<NoteTemplate | null> => {
      const userId = session?.user?.id;
      if (!userId) return null;

      const previousTemplates = templates;
      const optimisticId = crypto.randomUUID();
      const optimisticTemplate: NoteTemplate = {
        id: optimisticId,
        ...input,
      };

      setTemplates([...templates, optimisticTemplate]);

      const { data, error: insertError } = await supabase
        .from('note_templates')
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description,
          icon: input.icon,
          content: input.content,
        })
        .select('id, user_id, name, description, icon, content, created_at, updated_at')
        .single();

      if (insertError || !data) {
        setTemplates(previousTemplates);
        toast.error('Failed to create note template');
        return null;
      }

      const createdTemplate = mapNoteTemplateRow(data as NoteTemplateRow);
      setTemplates(
        [...previousTemplates, optimisticTemplate].map((template) =>
          template.id === optimisticId ? createdTemplate : template,
        ),
      );
      return createdTemplate;
    },
    [session?.user?.id, setTemplates, templates],
  );

  const updateTemplate = useCallback(
    async (id: string, input: NoteTemplateInput): Promise<boolean> => {
      const userId = session?.user?.id;
      if (!userId) return false;

      const previousTemplates = templates;
      setTemplates(
        templates.map((template) =>
          template.id === id
            ? {
                ...template,
                ...input,
              }
            : template,
        ),
      );

      const { error: updateError } = await supabase
        .from('note_templates')
        .update({
          name: input.name,
          description: input.description,
          icon: input.icon,
          content: input.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) {
        setTemplates(previousTemplates);
        toast.error('Failed to update note template');
        return false;
      }

      return true;
    },
    [session?.user?.id, setTemplates, templates],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const userId = session?.user?.id;
      if (!userId) return;

      const previousTemplates = templates;
      setTemplates(templates.filter((template) => template.id !== id));

      const { error: deleteError } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        setTemplates(previousTemplates);
        toast.error('Failed to delete note template');
      }
    },
    [session?.user?.id, setTemplates, templates],
  );

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
