import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { cn } from '@/lib/utils.ts';


type NoteEditorDialogProps = {
  initialContent: string;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: string) => void | Promise<void>;
  open: boolean;
};

export const NoteEditorDialog = ({
  initialContent,
  onOpenChange,
  onSave,
  open,
}: NoteEditorDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [view, setView] = useState<EditorView | null>(null);
  const contentRef = useRef(content);
  const lastSavedContentRef = useRef(initialContent);

  const handleSave = useCallback(() => {
    if (!onSave || contentRef.current === lastSavedContentRef.current) return;

    lastSavedContentRef.current = contentRef.current;
    onSave(contentRef.current);
  }, [onSave]);


  //update the contentRef when the content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  //autosave every 10 seconds if the dialog is open
  useEffect(() => {
    if (!open) {
      return;
    }

    const autosaveTimer = window.setInterval(() => {
      handleSave();
    }, 10_000);

    return () => {
      window.clearInterval(autosaveTimer);
    };
  }, [open, handleSave]);

  //trigger autosave when the dialog is closed
  useEffect(() => {
    if (!open) {
      handleSave();
    }
  }, [open, handleSave]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='h-[80vh] max-h-[80vh] w-[calc(100%-4rem)]  max-w-5xl sm:max-w-5xl rounded-sm p-0 overflow-auto'
        showCloseButton={false}
      >
        <div
          className={cn(
            'absolute h-full w-1 border-l border-[#ddd]  ',
            view && view.state.doc.lines >= 10 ? 'ml-[35.5px]' : 'ml-[30.5px]',
          )}
        ></div>
        <CodeMirror
          className={'p-0 max-w-full'}
          onCreateEditor={(view) => setView(view)}
          onChange={(event) => setContent(event)}
          placeholder='Write your note in markdown...'
          value={content}
          theme={vscodeLight}
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
        />
      </DialogContent>
    </Dialog>
  );
};
