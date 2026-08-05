import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useTemplatesStore } from '@/features/templates/store/templates.ts';
import {
  mapTemplateRow,
  type Template,
  type TemplateInput,
  type TemplateRow,
} from '@/features/templates/lib/templates';

export const useTemplates = () => {
  const session = useAuthStore((state) => state.session);
  const templates = useTemplatesStore((state) => state.templates);
  const isLoading = useTemplatesStore((state) => state.isLoading);
  const error = useTemplatesStore((state) => state.error);
  const setTemplates = useTemplatesStore((state) => state.setTemplates);
  const setIsLoading = useTemplatesStore((state) => state.setIsLoading);
  const setError = useTemplatesStore((state) => state.setError);

  const loadTemplates = useCallback(
    async (options?: { silent?: boolean }) => {
      const userId = session?.user?.id;
      if (!userId) return;

      const silent = options?.silent ?? false;

      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('note_templates')
        .select('id, user_id, name, description, icon, content, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        if (!silent) {
          setIsLoading(false);
        }
        return;
      }

      setTemplates((data ?? []).map((row: TemplateRow) => mapTemplateRow(row)));
      if (!silent) {
        setIsLoading(false);
      }
    },
    [session?.user?.id, setError, setIsLoading, setTemplates],
  );

  const createTemplate = useCallback(
    async (input: TemplateInput): Promise<Template | null> => {
      const userId = session?.user?.id;
      if (!userId) return null;

      const previousTemplates = templates;
      const optimisticId = crypto.randomUUID();
      const optimisticTemplate: Template = {
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

      const createdTemplate = mapTemplateRow(data as TemplateRow);
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
    async (id: string, input: TemplateInput): Promise<boolean> => {
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
