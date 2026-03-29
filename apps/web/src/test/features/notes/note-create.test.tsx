import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NoteEditorDialogRef } from '@/features/notes/components/note-editor-dialog.tsx';

const createNote = vi.fn();
const updateNote = vi.fn();

vi.mock('@/features/notes/hooks/use-notes.ts', () => ({
  useNotes: () => ({
    createNote,
    updateNote,
  }),
}));

vi.mock('@/features/notes/components/note-editor-dialog.tsx', () => {
  const MockNoteEditorDialog = React.forwardRef<
    NoteEditorDialogRef,
    {
      initialContent: string;
      onOpenChange: (open: boolean) => void;
      open: boolean;
    }
  >(({ initialContent, onOpenChange, open }, ref) => {
    const [content, setContent] = React.useState(initialContent);

    React.useImperativeHandle(
      ref,
      () => ({
        loadContent: () => setContent(''),
      }),
      [],
    );

    if (!open) {
      return null;
    }

    return (
      <div>
        <input
          aria-label='Mock note editor'
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
        <button onClick={() => onOpenChange(false)} type='button'>
          Close editor
        </button>
      </div>
    );
  });

  return {
    NoteEditorDialog: MockNoteEditorDialog,
  };
});

import { NoteCreateSection } from '@/features/notes/sections/note-create.tsx';

describe('NoteCreateSection', () => {
  beforeEach(() => {
    createNote.mockReset();
    updateNote.mockReset();
  });

  it('clears the editor content when the create dialog is reopened', () => {
    render(<NoteCreateSection />);

    fireEvent.click(screen.getByRole('button', { name: /take a note/i }));
    fireEvent.change(screen.getByLabelText('Mock note editor'), {
      target: { value: 'Draft note' },
    });

    fireEvent.click(screen.getByRole('button', { name: /close editor/i }));
    fireEvent.click(screen.getByRole('button', { name: /take a note/i }));

    expect(screen.getByLabelText('Mock note editor')).toHaveValue('');
  });
});
