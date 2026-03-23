import { useEffect, useId, useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export type NoteEditorSaveData = {
  content: string;
  html: string;
};

type NoteEditorDialogProps = {
  data?: Partial<NoteEditorSaveData>;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: NoteEditorSaveData) => void;
  open: boolean;
};

const markdown = new MarkdownIt();

export const NoteEditorDialog = ({ data, onOpenChange, onSave, open }: NoteEditorDialogProps) => {
  const contentKey = data?.content ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <NoteEditorDialogContent initialContent={contentKey} key={contentKey} onSave={onSave} />
    </Dialog>
  );
};

type NoteEditorDialogContentProps = {
  initialContent: string;
  onSave?: (data: NoteEditorSaveData) => void;
};

const NoteEditorDialogContent = ({ initialContent, onSave }: NoteEditorDialogContentProps) => {
  const editorId = useId();
  const [content, setContent] = useState(initialContent);

  const saveData = useMemo(
    () =>
      ({
        content,
        html: markdown.render(content),
      }) satisfies NoteEditorSaveData,
    [content],
  );

  useEffect(() => {
    if (!onSave) {
      return;
    }

    const autosaveTimer = window.setInterval(() => {
      onSave(saveData);
    }, 30_000);

    return () => {
      window.clearInterval(autosaveTimer);
    };
  }, [onSave, saveData]);

  return (
    <DialogContent className='max-w-5xl p-0' showCloseButton={false}>
      <textarea
        className='min-h-96  rounded-sm border border-input bg-background px-4 py-3 text-md outline-none'
        id={editorId}
        onChange={(event) => setContent(event.target.value)}
        placeholder='Write your note in markdown...'
        value={content}
      />
    </DialogContent>
  );
};
