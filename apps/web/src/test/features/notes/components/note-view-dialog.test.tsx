import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

const setViewportWidth = (width: number) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

describe('NoteViewDialog', () => {
  it('renders a dialog on desktop', () => {
    setViewportWidth(1024);

    render(
      <NoteViewDialog content='Body copy' onEdit={vi.fn()} onOpenChange={vi.fn()} open={true} />,
    );

    expect(document.querySelector("[data-slot='dialog-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='drawer-content']")).not.toBeInTheDocument();
  });

  it('renders a drawer on mobile', () => {
    setViewportWidth(640);

    render(
      <NoteViewDialog content='Body copy' onEdit={vi.fn()} onOpenChange={vi.fn()} open={true} />,
    );

    expect(document.querySelector("[data-slot='drawer-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='dialog-content']")).not.toBeInTheDocument();
  });

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

  it('keeps viewport-aware spacing at every size', () => {
    setViewportWidth(1024);

    render(
      <NoteViewDialog content='Body copy' onEdit={vi.fn()} onOpenChange={vi.fn()} open={true} />,
    );

    expect(document.querySelector("[data-slot='dialog-content']")).toHaveClass(
      'w-[calc(100%-4rem)]',
      'max-w-5xl',
    );
  });

  it('renders empty-state copy when the note has no content', () => {
    render(<NoteViewDialog content='' onEdit={vi.fn()} onOpenChange={vi.fn()} open={true} />);

    expect(screen.getByText(/this note is empty/i)).toBeInTheDocument();
  });
});
