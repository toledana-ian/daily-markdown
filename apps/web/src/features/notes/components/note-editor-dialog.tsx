import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type CommandItem = {
  label: string;
  value: string;
  template: string;
};

const COMMANDS: CommandItem[] = [
  {
    label: 'Table',
    value: 'table',
    template: `| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Value 1 | Value 2 | Value 3 |`,
  },
  {
    label: 'Checklist',
    value: 'checklist',
    template: `- [ ] Task 1
- [ ] Task 2
- [ ] Task 3`,
  },
  {
    label: 'Code Block',
    value: 'code',
    template: `\`\`\`ts
console.log('hello')
\`\`\``,
  },
];

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

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFrom, setSlashFrom] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState('');

  const filteredCommands = useMemo(() => {
    if (!slashQuery) return COMMANDS;
    return COMMANDS.filter((command) =>
      command.value.toLowerCase().includes(slashQuery.toLowerCase()),
    );
  }, [slashQuery]);

  const handleChange = (value: string, viewUpdate: { view: EditorView }) => {
    setContent(value);

    const currentView = viewUpdate.view;
    const { state } = currentView;
    const cursor = state.selection.main.head;
    const line = state.doc.lineAt(cursor);

    const textBeforeCursor = state.doc.sliceString(line.from, cursor);

    const match = textBeforeCursor.match(/\/([a-zA-Z0-9_-]*)$/);

    if (match) {
      setSlashOpen(true);
      setSlashQuery(match[1]);
      setSlashFrom(cursor - match[0].length);
    } else {
      setSlashOpen(false);
      setSlashQuery('');
      setSlashFrom(null);
    }
  };

  const insertCommand = (command: CommandItem) => {
    if (!view || slashFrom === null) return;

    const to = view.state.selection.main.head;

    view.dispatch({
      changes: {
        from: slashFrom,
        to,
        insert: command.template,
      },
      selection: {
        anchor: slashFrom + command.template.length,
      },
    });

    view.focus();
    setSlashOpen(false);
    setSlashQuery('');
    setSlashFrom(null);
  };

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
          onChange={handleChange}
          placeholder='Write your note in markdown...'
          value={content}
          theme={vscodeLight}
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
        />

        {slashOpen && filteredCommands.length > 0 && (
          <div className='absolute left-4 top-12 z-50 w-64 rounded-lg border bg-white shadow-lg'>
            {filteredCommands.map((command) => (
              <button
                key={command.value}
                type='button'
                className='block w-full px-3 py-2 text-left hover:bg-gray-100'
                onClick={() => insertCommand(command)}
              >
                /{command.value}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
