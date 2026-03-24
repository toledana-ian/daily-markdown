import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteCard } from '@/features/notes/components/note-card';

describe('NoteCard', () => {
  it('opens the view dialog on click and renders markdown preview', () => {
    render(<NoteCard content='# Daily note\n\nBody copy' />);

    fireEvent.click(screen.getByRole('button', { name: /open note/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      within(screen.getByRole('document', { name: /preview note/i })).getByRole('heading', {
        name: /daily note/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('document', { name: /preview note/i })).getByText(/body copy/i),
    ).toBeInTheDocument();
  });

  it('opens the editor dialog on double click from the note card', () => {
    render(<NoteCard content='Editable body' />);

    fireEvent.doubleClick(screen.getByRole('button', { name: /open note/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/markdown editor/i)).toHaveValue('Editable body');
    expect(screen.queryByText(/preview note/i)).not.toBeInTheDocument();
  });

  it('switches from the view dialog to the editor dialog on double click', () => {
    const onSave = vi.fn();

    render(<NoteCard content='Editable from preview' onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /open note/i }));
    fireEvent.doubleClick(screen.getByRole('document', { name: /preview note/i }));

    expect(screen.getByLabelText(/markdown editor/i)).toHaveValue('Editable from preview');
    expect(screen.queryByRole('document', { name: /preview note/i })).not.toBeInTheDocument();
  });
});
