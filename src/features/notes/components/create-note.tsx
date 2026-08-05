import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  NoteEditorDialog,
  type NoteEditorDialogRef,
} from '@/features/notes/components/note-editor-dialog';
import { NoteTemplateChooser } from '@/features/notes/components/note-template-chooser';
import {
  BLANK_NOTE_TEMPLATE,
  resolveNoteTemplateContent,
  type NoteTemplateSelection,
} from '@/features/notes/lib/note-templates';
import { useNoteTemplates } from '@/features/notes/hooks/use-note-templates';
import { RiAddFill } from '@remixicon/react';

type CreateNoteProps = {
  onSave?: (data: string) => void | Promise<void>;
  onOpen?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
};

export const CreateNote = forwardRef<NoteEditorDialogRef, CreateNoteProps>(
  ({ onSave, onOpen, onClose }, ref) => {
    const [chooserOpen, setChooserOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const editorRef = useRef<NoteEditorDialogRef>(null);
    const pendingTemplateRef = useRef<NoteTemplateSelection>({ kind: 'blank' });
    const { templates, loadTemplates } = useNoteTemplates();

    useEffect(() => {
      loadTemplates().then();
    }, [loadTemplates]);

    useImperativeHandle(
      ref,
      () => ({
        loadContent: (content, cursorOffset, options) =>
          editorRef.current?.loadContent(content, cursorOffset, options),
      }),
      [],
    );

    useEffect(() => {
      if (editorOpen && onOpen) {
        onOpen();
      }

      if (!editorOpen && onClose) {
        onClose();
      }
    }, [editorOpen, onClose, onOpen]);

    const openEditorWithTemplate = useCallback((selection: NoteTemplateSelection) => {
      pendingTemplateRef.current = selection;
      setEditorOpen(true);
    }, []);

    const handleEditorOpenChange = useCallback((open: boolean) => {
      setEditorOpen(open);
      if (!open) {
        pendingTemplateRef.current = { kind: 'blank' };
      }
    }, []);

    const loadSelectedTemplate = useCallback(() => {
      const selection = pendingTemplateRef.current;

      if (selection.kind === 'blank') {
        const { content, cursorOffset } = resolveNoteTemplateContent(BLANK_NOTE_TEMPLATE.content);
        editorRef.current?.loadContent(content, cursorOffset, { treatAsSaved: true });
        return;
      }

      const template = templates.find((item) => item.id === selection.templateId);
      const { content, cursorOffset } = resolveNoteTemplateContent(template?.content ?? '');
      editorRef.current?.loadContent(content, cursorOffset, { treatAsSaved: false });
    }, [templates]);

    useEffect(() => {
      if (!editorOpen) {
        return;
      }

      loadSelectedTemplate();
    }, [editorOpen, loadSelectedTemplate]);

    return (
      <>
        <button
          className='w-full  flex flex-row justify-between max-w-md cursor-pointer rounded-sm bg-white text-left text-sm text-gray-400 outline-0 shadow-md'
          type='button'
        >
          <div
            className={'p-4 w-full content-center'}
            onClick={() => {
              setEditorOpen(true);
            }}
          >
            Take a note...
          </div>
          <div className={'p-4'} onClick={() => setChooserOpen(true)}>
            <RiAddFill />
          </div>
        </button>
        <NoteTemplateChooser
          onOpenChange={setChooserOpen}
          onSelect={openEditorWithTemplate}
          open={chooserOpen}
        />
        <NoteEditorDialog
          ref={editorRef}
          initialContent={''}
          onOpenChange={handleEditorOpenChange}
          onSave={onSave}
          open={editorOpen}
        />
      </>
    );
  },
);

CreateNote.displayName = 'CreateNote';
