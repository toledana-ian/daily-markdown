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
import { Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { cn } from '@/lib/utils.ts';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import {
  createUploadingFileMarkdown,
  getMaxFileUploadSizeBytes,
  replaceImagePlaceholder,
  uploadNoteFile,
  validateFileUploadSize,
} from '@/features/notes/lib/note-editor-file-upload.ts';
import { toggleMarkdownWrap, toggleMarkdownWrapAsymmetric } from '@/features/notes/lib/note-editor-markdown-shortcuts.ts';

type NoteEditorDialogProps = {
  initialContent: string;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: string) => void | Promise<void>;
  open: boolean;
};

export type NoteEditorDialogRef = {
  loadContent: (content: string) => void;
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
    template: `![Image](https://placehold.co/600x400${CURSOR_MARKER})`,
  }),
  createCommand({
    description: 'Insert markdown link',
    label: 'Link',
    value: 'link',
    template: `[link](https://google.com${CURSOR_MARKER})`,
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

export const NoteEditorDialog = forwardRef<NoteEditorDialogRef, NoteEditorDialogProps>(
  ({ initialContent, onOpenChange, onSave, open }, ref) => {
    const screen = useTailwindScreen();
    const session = useAuthStore((state) => state.session);
    const isDesktop = screen === 'md' || screen === 'lg' || screen === 'xl' || screen === '2xl';
    const [content, setContent] = useState(initialContent);
    const [view, setView] = useState<EditorView | null>(null);
    const contentRef = useRef(content);
    const lastSavedContentRef = useRef(initialContent);
    const [fileUploadCount, setFileUploadCount] = useState(0);
    const [fileUploadError, setFileUploadError] = useState<string | null>(null);

    const [slashOpen, setSlashOpen] = useState(false);
    const [slashFrom, setSlashFrom] = useState<number | null>(null);
    const [slashQuery, setSlashQuery] = useState('');
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const [slashPopupPosition, setSlashPopupPosition] = useState<{
      left: number;
      top: number;
    } | null>(null);

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

    const loadContent = useCallback(
      (content: string) => {
        setContent(content);
        contentRef.current = content;
        lastSavedContentRef.current = content;
        closeSlashCommands();
      },
      [closeSlashCommands],
    );

    useImperativeHandle(
      ref,
      () => ({
        loadContent,
      }),
      [loadContent],
    );

    const insertCommand = useCallback(
      (command: CommandItem, currentView?: EditorView | null) => {
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
      },
      [closeSlashCommands, slashFrom, view],
    );

    const replaceContent = useCallback((nextContent: string) => {
      setContent(nextContent);
      contentRef.current = nextContent;
    }, []);

    const applyMarkdownShortcut = useCallback(
      (currentView: EditorView, marker: string) => {
        const selection = currentView.state.selection.main;
        const currentContent = currentView.state.doc.toString();
        const nextState = toggleMarkdownWrap(
          currentContent,
          { from: selection.from, to: selection.to },
          marker,
        );

        if (!nextState) {
          return false;
        }

        currentView.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: nextState.content,
          },
          selection: {
            anchor: nextState.selection.from,
            head: nextState.selection.to,
          },
        });

        replaceContent(nextState.content);
        closeSlashCommands();
        return true;
      },
      [closeSlashCommands, replaceContent],
    );

    const applyMarkdownShortcutAsymmetric = useCallback(
      (currentView: EditorView, openMarker: string, closeMarker: string) => {
        const selection = currentView.state.selection.main;
        const currentContent = currentView.state.doc.toString();
        const nextState = toggleMarkdownWrapAsymmetric(
          currentContent,
          { from: selection.from, to: selection.to },
          openMarker,
          closeMarker,
        );

        if (!nextState) {
          return false;
        }

        currentView.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: nextState.content,
          },
          selection: {
            anchor: nextState.selection.from,
            head: nextState.selection.to,
          },
        });

        replaceContent(nextState.content);
        closeSlashCommands();
        return true;
      },
      [closeSlashCommands, replaceContent],
    );

    const markdownShortcutExtensions = useMemo(
      () => [
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-b',
              preventDefault: true,
              run: (currentView) => applyMarkdownShortcut(currentView, '**'),
            },
            {
              key: 'Mod-i',
              preventDefault: true,
              run: (currentView) => applyMarkdownShortcut(currentView, '_'),
            },
            {
              key: 'Mod-Shift-x',
              preventDefault: true,
              run: (currentView) => applyMarkdownShortcut(currentView, '~~'),
            },
            {
              key: 'Mod-Shift-m',
              preventDefault: true,
              run: (currentView) =>
                applyMarkdownShortcutAsymmetric(currentView, '<mark>', '</mark>'),
            },
          ]),
        ),
      ],
      [applyMarkdownShortcut, applyMarkdownShortcutAsymmetric],
    );

    const uploadEditorFile = useCallback(
      async (file: File, failureMessage: string) => {
        closeSlashCommands();
        setFileUploadError(null);

        const fileSizeError = validateFileUploadSize(file, getMaxFileUploadSizeBytes());

        if (fileSizeError) {
          setFileUploadError(fileSizeError);
          return;
        }

        if (!view) {
          setFileUploadError('The editor is not ready to upload files yet.');
          return;
        }

        const userId = session?.user?.id;

        if (!userId) {
          setFileUploadError('You must be signed in to upload files.');
          return;
        }

        const selection = view.state.selection.main;
        const currentContent = view.state.doc.toString();
        const label = file.name.replace(/\.[^.]+$/, '').trim() || 'File';
        const placeholder = createUploadingFileMarkdown(label, crypto.randomUUID(), file);
        const nextContent =
          currentContent.slice(0, selection.from) + placeholder + currentContent.slice(selection.to);
        const nextCursorPosition = selection.from + placeholder.length;

        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: placeholder,
          },
          selection: {
            anchor: nextCursorPosition,
          },
        });

        replaceContent(nextContent);
        setFileUploadCount((count) => count + 1);

        try {
          const result = await uploadNoteFile({
            file,
            supabase,
            userId,
          });
          const resolvedContent = contentRef.current.includes(placeholder)
            ? replaceImagePlaceholder(contentRef.current, placeholder, result.markdown)
            : `${contentRef.current}\n${result.markdown}`;

          replaceContent(resolvedContent);
        } catch (error) {
          const resolvedContent = contentRef.current.replace(placeholder, '');
          replaceContent(resolvedContent);
          setFileUploadError(error instanceof Error ? error.message : failureMessage);
        } finally {
          setFileUploadCount((count) => Math.max(0, count - 1));
        }
      },
      [closeSlashCommands, replaceContent, session?.user?.id, view],
    );

    const handleEditorPaste = useCallback(
      async (event: React.ClipboardEvent<HTMLDivElement>) => {
        const fileItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.kind === 'file');
        const file = fileItem?.getAsFile();

        if (!file) {
          return;
        }

        event.preventDefault();
        await uploadEditorFile(file, 'Failed to upload the pasted file.');
      },
      [uploadEditorFile],
    );

    const handleEditorDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      const hasFile = Array.from(event.dataTransfer?.items ?? []).some((item) => item.kind === 'file');

      if (!hasFile) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleEditorDrop = useCallback(
      async (event: React.DragEvent<HTMLDivElement>) => {
        const fileItem = Array.from(event.dataTransfer?.items ?? []).find((item) => item.kind === 'file');
        const file = fileItem?.getAsFile() ?? Array.from(event.dataTransfer?.files ?? [])[0];

        if (!file) {
          return;
        }

        event.preventDefault();
        await uploadEditorFile(file, 'Failed to upload the dropped file.');
      },
      [uploadEditorFile],
    );

    const handleEditorKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
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
            (currentIndex) =>
              (currentIndex - 1 + filteredCommands.length) % filteredCommands.length,
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
      },
      [closeSlashCommands, filteredCommands, insertCommand, selectedCommandIndex, slashOpen, view],
    );

    const handleEditorUpdate = useCallback(
      (viewUpdate: { selectionSet: boolean; docChanged: boolean }) => {
        if (viewUpdate.selectionSet && !viewUpdate.docChanged) {
          closeSlashCommands();
        }
      },
      [closeSlashCommands],
    );

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

    useEffect(() => {
      if (!fileUploadError) {
        return;
      }

      const fileUploadErrorTimer = window.setTimeout(() => {
        setFileUploadError(null);
      }, 3_000);

      return () => {
        window.clearTimeout(fileUploadErrorTimer);
      };
    }, [fileUploadError]);

    //trigger autosave when the dialog is closed
    useEffect(() => {
      if (!open) {
        handleSave();
      }
    }, [open, handleSave]);

    const editor = (
      <>
        <div
          onDragOverCapture={handleEditorDragOver}
          onDropCapture={handleEditorDrop}
          onKeyDownCapture={handleEditorKeyDown}
          onPasteCapture={handleEditorPaste}
        >
          <CodeMirror
            aria-label='Markdown editor'
            className='max-w-full h-full min-w-0 p-0 [&_.cm-editor]:max-w-full [&_.cm-scroller]:overflow-x-hidden [&_.cm-content]:whitespace-pre-wrap [&_.cm-line]:wrap-break-word'
            height='100%'
            basicSetup={{
              closeBrackets: false,
            }}
            onCreateEditor={(view) => setView(view)}
            onChange={handleChange}
            onUpdate={handleEditorUpdate}
            placeholder='Write your note in markdown...'
            value={content}
            theme={vscodeLight}
            extensions={[
              markdown({ base: markdownLanguage, codeLanguages: languages }),
              EditorView.lineWrapping,
              ...markdownShortcutExtensions,
            ]}
          />
        </div>

        {(fileUploadCount > 0 || fileUploadError) && (
          <div
            aria-live='polite'
            className='pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border bg-white px-3 py-2 text-sm shadow-lg'
          >
            {fileUploadCount > 0 && (
              <div className='text-gray-700'>
                Uploading {fileUploadCount} file{fileUploadCount === 1 ? '' : 's'}...
              </div>
            )}
            {fileUploadError && <div className='text-red-600'>{fileUploadError}</div>}
          </div>
        )}

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
        <DrawerContent className='gap-0 p-0 before:inset-0 before:rounded-t-[calc(var(--radius-4xl)-0.25rem)]'>
          <DrawerTitle className='sr-only'>Edit note</DrawerTitle>
          <DrawerDescription className='sr-only'>Edit the note markdown content.</DrawerDescription>
          <div className='relative h-full overflow-auto rounded-t-[calc(var(--radius-4xl)-0.25rem)] bg-background'>
            {editor}
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
);

NoteEditorDialog.displayName = 'NoteEditorDialog';
