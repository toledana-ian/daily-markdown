import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteCardDeleteDialog } from '@/features/notes/components/note-card-delete-dialog';

describe('NoteCardDeleteDialog', () => {
  it('confirms before deleting', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <NoteCardDeleteDialog onConfirm={onConfirm} onOpenChange={onOpenChange} open={true} />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/delete note/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this action cannot be undone and will permanently remove this note/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
