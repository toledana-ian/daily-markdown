import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

describe('NoteViewDialog', () => {
  it('renders note markdown in the preview dialog', () => {
    render(
      <NoteViewDialog
        content={'# Daily note\n\nBody copy'}
        onEdit={vi.fn()}
        onOpenChange={vi.fn()}
        open={true}
      />,
    );

    expect(
      within(screen.getByRole('document', { name: /preview note/i })).getByRole('heading', {
        name: /daily note/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/body copy/i)).toBeInTheDocument();
  });

  it('renders empty-state copy when the note has no content', () => {
    render(<NoteViewDialog content='' onEdit={vi.fn()} onOpenChange={vi.fn()} open={true} />);

    expect(screen.getByText(/this note is empty/i)).toBeInTheDocument();
  });
});
