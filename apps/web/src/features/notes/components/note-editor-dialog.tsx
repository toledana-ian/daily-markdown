import { useEffect, useId, useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
      {open ? (
        <NoteEditorDialogContent initialContent={contentKey} key={contentKey} onSave={onSave} />
      ) : null}
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
    <DialogContent className='max-w-5xl gap-4 p-0 sm:max-w-5xl' showCloseButton>
      <DialogHeader className='border-b px-6 pt-6'>
        <DialogTitle>Markdown note</DialogTitle>
        <DialogDescription>
          Draft in markdown and save the rendered HTML payload at the same time.
        </DialogDescription>
      </DialogHeader>
      <div className='grid gap-4 px-6 pb-6 lg:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-foreground' htmlFor={editorId}>
            Markdown editor
          </label>
          <textarea
            className='min-h-96 w-full rounded-3xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
            id={editorId}
            onChange={(event) => setContent(event.target.value)}
            placeholder='Write your note in markdown...'
            value={content}
          />
        </div>
      </div>
      <DialogFooter className='border-t px-6 pb-6'>
        <Button onClick={() => onSave?.(saveData)} type='button'>
          Save note
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
