import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type NoteEditorDialogProps = {
  initialContent: string;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: string) => void;
  open: boolean;
};

export const NoteEditorDialog = ({
  initialContent,
  onOpenChange,
  onSave,
  open,
}: NoteEditorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <NoteEditorDialogContent initialContent={initialContent} onSave={onSave} />
    </Dialog>
  );
};

type NoteEditorDialogContentProps = {
  initialContent: string;
  onSave?: (data: string) => void;
};

const NoteEditorDialogContent = ({ initialContent, onSave }: NoteEditorDialogContentProps) => {
  const editorId = useId();
  const [content, setContent] = useState(initialContent);

  const saveData = useMemo(() => content, [content]);

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

  const handleSave = () => {
    if (!onSave) return;
    onSave(saveData);
  };

  return (
    <DialogContent className='max-w-5xl p-6 sm:max-w-5xl' showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Edit note</DialogTitle>
      </DialogHeader>
      <label className='sr-only' htmlFor={editorId}>
        Markdown editor
      </label>
      <textarea
        className='min-h-96 rounded-2xl border border-input bg-background px-4 py-3 text-md outline-none'
        id={editorId}
        onChange={(event) => setContent(event.target.value)}
        placeholder='Write your note in markdown...'
        value={content}
      />
      <DialogFooter>
        <Button onClick={handleSave} type='button'>
          Save note
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
