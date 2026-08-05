import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  NoteEditorDialog,
  type NoteEditorDialogRef,
} from '@/features/notes/components/note-editor-dialog';
import { NoteTemplateChooser } from '@/features/notes/components/note-template-chooser';
import {
  resolveNoteTemplate,
  type NoteTemplateId,
  NOTE_TEMPLATES,
} from '@/features/notes/lib/note-templates';
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
    const pendingTemplateRef = useRef<NoteTemplateId>('blank');

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

    const openEditorWithTemplate = useCallback((templateId: NoteTemplateId) => {
      pendingTemplateRef.current = templateId;
      setEditorOpen(true);
    }, []);

    const handleEditorOpenChange = useCallback((open: boolean) => {
      setEditorOpen(open);
      if(!open){
        pendingTemplateRef.current = NOTE_TEMPLATES[0].id;
      }
    }, []);

    const loadSelectedTemplate = useCallback(() => {
      const templateId = pendingTemplateRef.current;
      const { content, cursorOffset } = resolveNoteTemplate(templateId);
      editorRef.current?.loadContent(content, cursorOffset, {
        treatAsSaved: templateId === 'blank',
      });
    }, []);

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
