import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { cn } from '@/lib/utils.ts';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

type NoteEditorDialogProps = {
  initialContent: string;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: string) => void | Promise<void>;
  open: boolean;
};

export type NoteEditorDialogRef = {
  clearContent: () => void;
};

type CommandItem = {
  description: string;
  label: string;
  value: string;
  template: string;
  cursorOffset: number;
};

const CURSOR_MARKER = '{{cursor}}';

const createCommand = (
  definition: Omit<CommandItem, 'cursorOffset' | 'template'> & { template: string },
): CommandItem => {
  const cursorOffset = definition.template.indexOf(CURSOR_MARKER);
  const template = definition.template.replace(CURSOR_MARKER, '');

  if (cursorOffset === -1) {
    throw new Error(`Missing cursor marker for slash command "${definition.value}"`);
  }

  return {
    ...definition,
    cursorOffset,
    template,
  };
};

const COMMANDS: CommandItem[] = [
  createCommand({
    description: 'Insert markdown table',
    label: 'Table',
    value: 'table',
    template: `| Before | After |
| --- | --- |
| ${CURSOR_MARKER} |  |`,
  }),
  createCommand({
    description: 'Insert task list',
    label: 'Checklist',
    value: 'checklist',
    template: `- [ ] Task 1${CURSOR_MARKER}
- [ ] Task 2`,
  }),
  createCommand({
    description: 'Insert fenced code block',
    label: 'Code Block',
    value: 'code',
    template: `\`\`\`
${CURSOR_MARKER}
\`\`\``,
  }),
  createCommand({
    description: 'Insert horizontal divider',
    label: 'Divider',
    value: 'divider',
    template: `---
    
${CURSOR_MARKER}`,
  }),
  createCommand({
    description: 'Insert markdown image',
    label: 'Image',
    value: 'image',
    template: `![${CURSOR_MARKER}](https://placehold.co/600x400)`,
  }),
  createCommand({
    description: 'Insert markdown link',
    label: 'Link',
    value: 'link',
    template: `[link${CURSOR_MARKER}](https://google.com)`,
  }),
  createCommand({
    description: 'Highlights information that users should take into account, even when skimming.',
    label: 'Note',
    value: 'note',
    template: `> [!NOTE]
> ${CURSOR_MARKER}`,
  }),
  createCommand({
    description: 'Optional information to help a user be more successful.',
    label: 'Tip',
    value: 'tip',
    template: `> [!TIP]
> ${CURSOR_MARKER}`,
  }),
  createCommand({
    description: 'Crucial information necessary for users to succeed.',
    label: 'Important',
    value: 'important',
    template: `> [!IMPORTANT]
> ${CURSOR_MARKER}`,
  }),
  createCommand({
    description: 'Critical content demanding immediate user attention due to potential risks.',
    label: 'Warning',
    value: 'warning',
    template: `> [!WARNING]
> ${CURSOR_MARKER}`,
  }),
  createCommand({
    description: 'Negative potential consequences of an action.',
    label: 'Caution',
    value: 'caution',
    template: `> [!CAUTION]
> ${CURSOR_MARKER}`,
  }),
];

const getSlashCommandMatch = (textBeforeCursor: string) => {
  const match = /(^|\s)\/([a-zA-Z0-9_-]*)$/.exec(textBeforeCursor);

  if (!match) {
    return null;
  }

  return {
    from: textBeforeCursor.length - match[2].length - 1,
    query: match[2],
  };
};

export const NoteEditorDialog = forwardRef<NoteEditorDialogRef, NoteEditorDialogProps>(({
  initialContent,
  onOpenChange,
  onSave,
  open,
}, ref) => {
  const screen = useTailwindScreen();
  const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
  const [content, setContent] = useState(initialContent);
  const [view, setView] = useState<EditorView | null>(null);
  const contentRef = useRef(content);
  const lastSavedContentRef = useRef(initialContent);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFrom, setSlashFrom] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [slashPopupPosition, setSlashPopupPosition] = useState<{ left: number; top: number } | null>(
    null,
  );

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

    const match = getSlashCommandMatch(textBeforeCursor);

    if (match) {
      const coords = currentView.coordsAtPos(cursor);
      setSlashOpen(true);
      setSelectedCommandIndex(0);
      setSlashQuery(match.query);
      setSlashFrom(line.from + match.from);
      setSlashPopupPosition(coords ? { left: coords.left, top: coords.bottom } : null);
    } else {
      setSlashOpen(false);
      setSelectedCommandIndex(0);
      setSlashQuery('');
      setSlashFrom(null);
      setSlashPopupPosition(null);
    }
  };

  const closeSlashCommands = useCallback(() => {
    setSlashOpen(false);
    setSelectedCommandIndex(0);
    setSlashQuery('');
    setSlashFrom(null);
    setSlashPopupPosition(null);
  }, []);

  const clearContent = useCallback(() => {
    setContent('');
    contentRef.current = '';
    lastSavedContentRef.current = '';
    closeSlashCommands();
  }, [closeSlashCommands]);

  useImperativeHandle(
    ref,
    () => ({
      clearContent,
    }),
    [clearContent],
  );

  const insertCommand = useCallback((command: CommandItem, currentView?: EditorView | null) => {
    const activeView = currentView ?? view;

    if (!activeView || slashFrom === null) return;

    const to = activeView.state.selection.main.head;
    const nextContent =
      activeView.state.doc.toString().slice(0, slashFrom) +
      command.template +
      activeView.state.doc.toString().slice(to);
    const cursorPosition = slashFrom + command.cursorOffset;

    activeView.dispatch({
      changes: {
        from: slashFrom,
        to,
        insert: command.template,
      },
      selection: {
        anchor: cursorPosition,
      },
    });

    setContent(nextContent);
    activeView.focus();
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.setSelectionRange(cursorPosition, cursorPosition);
    }
    closeSlashCommands();
  }, [closeSlashCommands, slashFrom, view]);

  const handleEditorKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!slashOpen || filteredCommands.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedCommandIndex((currentIndex) => (currentIndex + 1) % filteredCommands.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedCommandIndex(
        (currentIndex) => (currentIndex - 1 + filteredCommands.length) % filteredCommands.length,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      insertCommand(filteredCommands[selectedCommandIndex], view);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSlashCommands();
    }
  }, [closeSlashCommands, filteredCommands, insertCommand, selectedCommandIndex, slashOpen, view]);

  const handleEditorUpdate = useCallback((viewUpdate: { selectionSet: boolean; docChanged: boolean }) => {
    if (viewUpdate.selectionSet && !viewUpdate.docChanged) {
      closeSlashCommands();
    }
  }, [closeSlashCommands]);

  const handleSave = useCallback(() => {
    if (!onSave || contentRef.current === lastSavedContentRef.current) return;

    lastSavedContentRef.current = contentRef.current;
    onSave(contentRef.current);
  }, [onSave]);


  //update the contentRef when the content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (selectedCommandIndex < filteredCommands.length) {
      return;
    }

    setSelectedCommandIndex(0);
  }, [filteredCommands, selectedCommandIndex]);

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

  const editor = (
    <>
      <div
        className={cn(
          'absolute h-full w-1 border-l border-[#ddd]',
          view && view.state.doc.lines >= 10 ? 'ml-[35.5px]' : 'ml-[30.5px]',
        )}
      ></div>
      <div onKeyDownCapture={handleEditorKeyDown}>
        <CodeMirror
          aria-label='Markdown editor'
          className='max-w-full p-0'
          onCreateEditor={(view) => setView(view)}
          onChange={handleChange}
          onUpdate={handleEditorUpdate}
          placeholder='Write your note in markdown...'
          value={content}
          theme={vscodeLight}
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
        />
      </div>

      {slashOpen && filteredCommands.length > 0 && slashPopupPosition && (
        <div
          aria-label='Slash commands'
          className='fixed z-50 w-72 rounded-lg border bg-white shadow-lg'
          role='listbox'
          style={{
            left: slashPopupPosition.left,
            top: slashPopupPosition.top,
          }}
        >
          {filteredCommands.map((command, index) => (
            <button
              aria-selected={index === selectedCommandIndex}
              className={cn(
                'block w-full px-3 py-2 text-left',
                index === selectedCommandIndex ? 'bg-gray-100' : 'hover:bg-gray-100',
              )}
              key={command.value}
              onMouseEnter={() => setSelectedCommandIndex(index)}
              type='button'
              onClick={() => insertCommand(command)}
              role='option'
            >
              <div className='font-medium'>/{command.value}</div>
              <div className='text-sm text-gray-500'>{command.description}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className='h-[80vh] max-h-[80vh] w-[calc(100%-4rem)] max-w-5xl overflow-auto rounded-sm p-0 sm:max-w-5xl'
          showCloseButton={false}
        >
          <DialogTitle className='sr-only'>Edit note</DialogTitle>
          <DialogDescription className='sr-only'>
            Edit the note markdown content.
          </DialogDescription>
          {editor}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='h-[80vh] max-h-[80vh] gap-0 p-0 before:inset-0 before:rounded-t-[calc(theme(borderRadius.4xl)-0.25rem)]'>
        <DrawerTitle className='sr-only'>Edit note</DrawerTitle>
        <DrawerDescription className='sr-only'>Edit the note markdown content.</DrawerDescription>
        <div className='relative h-full overflow-auto rounded-t-[calc(theme(borderRadius.4xl)-0.25rem)] bg-background'>
          {editor}
        </div>
      </DrawerContent>
    </Drawer>
  );
});

NoteEditorDialog.displayName = 'NoteEditorDialog';
